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
import { Item, ItemFormData, ItemType, UoMType } from '@/types/item';
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

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

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => row.original.id,
    },
    {
      accessorKey: 'internal_item_name',
      header: 'Internal Name',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        return isEditing ? (
          <Input
            defaultValue={item.internal_item_name}
            onChange={(e) => handleEdit(item.id, { internal_item_name: e.target.value })}
          />
        ) : (
          item.internal_item_name
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        return isEditing ? (
          <Select
            defaultValue={item.type}
            onValueChange={(value) => handleEdit(item.id, { type: value as ItemType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          item.type.charAt(0).toUpperCase() + item.type.slice(1)
        );
      },
    },
    {
      accessorKey: 'uom',
      header: 'UoM',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        return isEditing ? (
          <Select
            defaultValue={item.uom}
            onValueChange={(value) => handleEdit(item.id, { uom: value as UoMType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UOM_TYPES.map((uom) => (
                <SelectItem key={uom} value={uom}>
                  {uom.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          item.uom.toUpperCase()
        );
      },
    },
    {
      accessorKey: 'additional_attributes.avg_weight_needed',
      header: 'Avg Weight Needed',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        return isEditing ? (
          <Checkbox
            checked={item.additional_attributes.avg_weight_needed}
            onCheckedChange={(checked) => {
              handleEdit(item.id, {
                additional_attributes: {
                  ...item.additional_attributes,
                  avg_weight_needed: checked === 'indeterminate' ? false : Boolean(checked)
                }
              });
            }}
          />
        ) : (
          item.additional_attributes.avg_weight_needed ? 'Yes' : 'No'
        );
      },
    },
    {
      accessorKey: 'additional_attributes.scrap_type',
      header: 'Scrap Type',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        return item.type === 'sell' && isEditing ? (
          <Input
            defaultValue={item.additional_attributes?.scrap_type || ''}
            onChange={(e) => handleEdit(item.id, {
              additional_attributes: {
                ...item.additional_attributes,
                scrap_type: e.target.value
              }
            })}
          />
        ) : (
          item.type === 'sell' ? (item.additional_attributes?.scrap_type || '-') : '-'
        );
      },
    },
    {
      accessorKey: 'min_buffer',
      header: 'Min Buffer',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        return isEditing ? (
          <Input
            type="number"
            defaultValue={item.min_buffer}
            onChange={(e) => handleEdit(item.id, { min_buffer: Number(e.target.value) })}
          />
        ) : (
          item.min_buffer
        );
      },
    },
    {
      accessorKey: 'max_buffer',
      header: 'Max Buffer',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        return isEditing ? (
          <Input
            type="number"
            defaultValue={item.max_buffer}
            onChange={(e) => handleEdit(item.id, { max_buffer: Number(e.target.value) })}
          />
        ) : (
          item.max_buffer
        );
      },
    },
    {
      accessorKey: 'tenant_id',
      header: 'Tenant ID',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        return isEditing ? (
          <Input
            type="number"
            defaultValue={item.tenant_id}
            onChange={(e) => handleEdit(item.id, { tenant_id: Number(e.target.value) })}
          />
        ) : (
          item.tenant_id
        );
      },
    },
    {
      accessorKey: 'created_by',
      header: 'Created By',
      cell: ({ row }) => row.original.created_by,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated At',
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        const isEditing = editingId === item.id;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (isEditing) {
                  setEditingId(null);
                } else {
                  setEditingId(item.id);
                }
              }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setItemToDelete(item)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const handleEdit = async (id: string, data: Partial<Item>) => {
    try {
      await onEdit(id, data as ItemFormData);
      setEditingId(null);
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update item',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (item: Item) => {
    try {
      await onDelete(item.id);
      setItemToDelete(null);
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

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