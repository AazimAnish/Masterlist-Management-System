'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { BOMForm } from '@/components/features/bom/bom-form';
import { BOMTable } from '@/components/features/bom/bom-table';
import { BOMFormData } from '@/validations/bom.schema';
import { useToast } from '@/components/ui/use-toast';
import { CSVUpload } from '@/components/features/csv/csv-upload';
import { parseCSV, downloadCSV, generateErrorReport } from '@/utils/csv';
import { BOMCSVValidationService } from '@/services/bom-csv-validation.service';
import { useItems } from '@/hooks/use-items';
import { BOMService } from '@/services/api/bom.service';
import { BOMWithDetails } from '@/types/bom';
import { CSVError } from '@/types/csv';

export default function BOMPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bomData, setBomData] = useState<BOMWithDetails[]>([]);
  const { items, isLoading: itemsLoading } = useItems();
  const { toast } = useToast();

  // Fetch BOM data on component mount
  useEffect(() => {
    fetchBOMData();
  }, []);

  const fetchBOMData = async () => {
    try {
      const data = await BOMService.getBOMs();
      setBomData(data);
    } catch (error) {
      console.error('Error fetching BOM data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch BOM data',
        variant: 'destructive',
      });
    }
  };

  const handleCSVUpload = async (file: File): Promise<{ success: number; errors?: CSVError[] }> => {
    const result = await parseCSV(file);
    const validationResult = await BOMCSVValidationService.validateBOMCSV(result.data, items, bomData);
    
    return {
        success: validationResult.validRows.length,
        errors: validationResult.errors
    };
  };

  const handleSubmit = async (data: BOMFormData) => {
    try {
      setIsSubmitting(true);
      await BOMService.createBOM({
        ...data,
        created_by: 'system_user',
        last_updated_by: 'system_user',
      });
      
      toast({
        title: 'Success',
        description: 'BOM entry created successfully',
      });
      
      await fetchBOMData();
    } catch (error) {
      console.error('Error creating BOM:', error);
      toast({
        title: 'Error',
        description: 'Failed to create BOM. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = BOMCSVValidationService.generateTemplateCSV();
    downloadCSV('bom-template.csv', template);
  };

  if (itemsLoading) {
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
            type="bom"
            onUpload={handleCSVUpload}
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
          <BOMTable data={bomData} />
        </div>
      </div>
    </div>
  );
}
