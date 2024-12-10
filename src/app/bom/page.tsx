'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { BOMForm } from '@/components/features/bom/bom-form';
import { BOMTable } from '@/components/features/bom/bom-table';
import { BOMFormData } from '@/validations/bom.schema';
import { useToast } from '@/components/ui/use-toast';
import { CSVUpload } from '@/components/features/csv/csv-upload';
import { parseCSV, downloadCSV, generateErrorReport } from '@/utils/csv';
import { CSVValidationService } from '@/services/csv-validation.service';
import { useItems } from '@/hooks/use-items';

export default function BOMPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, isLoading, refetch } = useItems();
  const { toast } = useToast();

  const handleCSVUpload = async (file: File) => {
    try {
      const csvResult = await parseCSV<any>(file);
      const { validRows, errors } = CSVValidationService.validateBOMCSV(
        csvResult.data,
        items,
        [] // Pass empty array since boms is not available
      );

      if (errors.length > 0) {
        const errorReport = CSVValidationService.generateErrorReport(errors);
        toast({
          title: 'Validation Errors',
          description: `Found ${errors.length} error(s). Check the error report for details.`,
          variant: 'destructive',
        });
        
        // Generate error CSV content
        const errorCsv = errors.map(e => `${e.row},${e.message}`).join('\n');
        const csvContent = `Row,Error\n${errorCsv}`;
        downloadCSV('bom-validation-errors.csv', csvContent);
        return;
      }

      // Process valid rows
      await Promise.all(validRows.map(async (row) => {
        // Implement BOM creation logic here
        await fetch('/api/bom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row)
        });
      }));
      
      toast({
        title: 'Success',
        description: `Successfully uploaded ${validRows.length} BOM entries`,
      });
      
      // Refresh the BOM list
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process CSV file',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadTemplate = () => {
    const templateContent = 'item_id,component_id,quantity,uom,scrap_percentage,notes,is_active\nITEM001,ITEM002,1,Nos,0,Optional notes,true';
    downloadCSV('bom-template.csv', templateContent);
  };

  const handleSubmit = async (data: BOMFormData) => {
    try {
      setIsSubmitting(true);
      // Here you would typically make an API call to save the BOM
      console.log('Submitting:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "BOM has been created successfully.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create BOM. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Bill of Materials" 
        description="Manage your product compositions and material requirements."
      />
      
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Bulk Upload</h2>
          <CSVUpload
            onUpload={handleCSVUpload}
            onDownloadTemplate={handleDownloadTemplate}
            templateName="bom"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New BOM</h2>
          <BOMForm 
            items={items}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">BOM List</h2>
          <BOMTable data={[]} /> {/* Pass your BOM data here */}
        </div>
      </div>
    </div>
  );
}
