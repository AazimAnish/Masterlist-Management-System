'use client';

import { useState } from 'react';
import { useItems } from '@/hooks/use-items';
import { PageHeader } from '@/components/layout/page-header';
import { ItemForm } from '@/components/features/items/item-form';
import { ItemTable } from '@/components/features/items/item-table';
import { CSVUpload } from '@/components/features/csv/csv-upload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ItemsService } from '@/services/api/items.service';
import { downloadCSV } from '@/utils/csv';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ItemFormData } from '@/types/item';

export default function ItemsPage() {
  const { items, isLoading, error, refetch } = useItems();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (data: ItemFormData) => {
    try {
      setIsSubmitting(true);
      await ItemsService.createItem(data);
      toast({
        title: 'Success',
        description: 'Item created successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      const items = await ItemsService.uploadItemsCSV(file);
      toast({
        title: 'Success',
        description: `${items.length} items uploaded successfully`,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload CSV',
        variant: 'destructive',
      });
    } finally {
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'internal_item_name',
      'type',
      'uom',
      'item_description',
      'customer_item_name',
      'max_buffer',
      'min_buffer',
    ];
    downloadCSV([], headers, 'items-template.csv');
  };

  const handleDownloadItems = () => {
    if (!items.length) return;
    const headers = [
      'internal_item_name',
      'type',
      'uom',
      'item_description',
      'customer_item_name',
      'max_buffer',
      'min_buffer',
    ];
    downloadCSV(items, headers, 'items.csv');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Items Management"
        description="Create and manage your items inventory"
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Bulk Upload</h2>
          <CSVUpload
            onUpload={handleCSVUpload}
            onDownloadTemplate={handleDownloadTemplate}
            templateName="Download Items Template"
          />
          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="w-full" />
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
          <ItemForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Items List</h2>
          <ItemTable
            data={items}
            isLoading={isLoading}
            onDelete={async (id) => {
              try {
                await ItemsService.deleteItem(id);
                toast({
                  title: 'Success',
                  description: 'Item deleted successfully',
                });
                refetch();
              } catch (error) {
                toast({
                  title: 'Error',
                  description: error instanceof Error
                    ? error.message
                    : 'Failed to delete item',
                  variant: 'destructive',
                });
              }
            }}
            onEdit={async (id, data) => {
              try {
                await ItemsService.updateItem(id, data);
                toast({
                  title: 'Success',
                  description: 'Item updated successfully',
                });
                refetch();
              } catch (error) {
                toast({
                  title: 'Error',
                  description: error instanceof Error ? error.message : 'Failed to update item',
                  variant: 'destructive',
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
