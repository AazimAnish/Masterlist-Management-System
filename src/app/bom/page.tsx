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
import { BOMEntry } from '@/types/bom';
import { CSVError } from '@/types/csv';

export default function BOMPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, isLoading } = useItems();
  const { toast } = useToast();

  const handleCSVUpload = async (file: File) => {
    try {
      const data = await parseCSV<BOMEntry>(file);
      const errors = CSVValidationService.validateBOM(data, items);

      if (errors.length > 0) {
        throw { errors };
      }

      // Process valid data
      // API call to save BOM entries
      toast({
        title: 'Success',
        description: `${data.length} BOM entries uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload BOM entries',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        item_id: 'ITEM001',
        component_id: 'ITEM002',
        quantity: '1',
        uom: 'Nos',
        scrap_percentage: '0',
        notes: 'Optional notes',
        is_active: 'true',
      },
    ];
    downloadCSV(template, 'bom-template.csv');
  };

  const handleDownloadErrors = (errors: CSVError[]) => {
    const report = generateErrorReport(errors);
    downloadCSV(report, 'bom-errors.csv');
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
            onDownloadErrors={handleDownloadErrors}
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
