'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Item, ItemFormData } from '@/types/item';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ITEM_TYPES, UOM_TYPES } from '@/constants/items';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ItemTableProps {
  data: Item[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, data: ItemFormData) => Promise<void>;
}

export function ItemTable({ data = [], isLoading, onDelete, onEdit }: ItemTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const { toast } = useToast();

  const handleEdit = async (id: string, updatedData: Partial<ItemFormData>) => {
    try {
      const item = data.find(item => item.id === id);
      if (!item) return;

      await onEdit(id, { ...item, ...updatedData });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async (item: Item) => {
    try {
      setDeletingId(item.id);
      await onDelete(item.id);
      toast({
        title: 'Success',
        description: `Item ${item.internal_item_name} deleted successfully`,
      });
      setItemToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete item',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: 'internal_item_name',
      header: 'Internal Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;

        if (isEditing) {
          return (
            <Select
              defaultValue={item.type}
              onValueChange={(value) => {
                handleEdit(item.id, { type: value as Item['type'] });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ITEM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }

        return item.type.charAt(0).toUpperCase() + item.type.slice(1);
      },
    },
    {
      accessorKey: 'uom',
      header: 'UoM',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;

        if (isEditing) {
          return (
            <Select
              defaultValue={item.uom}
              onValueChange={(value) => {
                handleEdit(item.id, { uom: value as Item['uom'] });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  {item.uom.toUpperCase()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {UOM_TYPES.map((uom) => (
                  <SelectItem key={uom} value={uom}>
                    {uom.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }

        return item.uom.toUpperCase();
      },
    },
    {
      accessorKey: 'item_description',
      header: 'Description',
    },
    {
      accessorKey: 'customer_item_name',
      header: 'Customer Name',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        const isDeleting = deletingId === item.id;

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing) {
                  setEditingId(null);
                } else {
                  setEditingId(item.id);
                }
              }}
              disabled={isDeleting}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setItemToDelete(item)}
              disabled={isDeleting || isEditing}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-semibold">{itemToDelete?.internal_item_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 