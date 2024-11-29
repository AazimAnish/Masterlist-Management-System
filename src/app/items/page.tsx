'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ItemForm } from '@/components/features/items/item-form';
import { ItemsTable } from '@/components/features/items/items-table';
import { ItemFormData } from '@/validations/item.schema';
import { useToast } from '@/components/ui/use-toast';
import { CSVUpload } from '@/components/features/csv/csv-upload';
import { parseCSV, downloadCSV, generateErrorReport } from '@/utils/csv';
import { CSVValidationService } from '@/services/csv-validation.service';
import { Item } from '@/types/item';
import { CSVError } from '@/types/csv';

export default function ItemsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCSVUpload = async (file: File) => {
    try {
      const data = await parseCSV<Item>(file);
      const errors = CSVValidationService.validateItems(data);

      if (errors.length > 0) {
        throw { errors };
      }

      // Process valid data
      // API call to save items
      toast({
        title: 'Success',
        description: `${data.length} items uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload items',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        internal_item_name: '',
        type: 'purchase/sell',
        uom: 'Nos/Kg/Ltr',
        description: '',
        scrap_type: 'yes/no',
      },
    ];
    downloadCSV(template, 'items-template.csv');
  };

  const handleDownloadErrors = (errors: CSVError[]) => {
    const report = generateErrorReport(errors);
    downloadCSV(report, 'items-errors.csv');
  };

  const handleSubmit = async (data: ItemFormData) => {
    try {
      setIsSubmitting(true);
      // Here you would typically make an API call to save the item
      console.log('Submitting:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Item has been created successfully.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Items" 
        description="Manage your inventory items and their properties."
      />
      
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Bulk Upload</h2>
          <CSVUpload
            onUpload={handleCSVUpload}
            onDownloadTemplate={handleDownloadTemplate}
            onDownloadErrors={handleDownloadErrors}
            templateName="items"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
          <ItemForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Items List</h2>
          <ItemsTable />
        </div>
      </div>
    </div>
  );
}
