'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zoneSchema, ZoneFormData } from '../schema';
import { createZone, updateZone } from '../actions';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

interface CreateZoneFormProps {
  projectId: string;
  parentId?: string;
  initialData?: ZoneFormData & { _id: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateZoneForm({ projectId, parentId, initialData, onSuccess, onCancel }: CreateZoneFormProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<any>({
    resolver: zodResolver(zoneSchema),
    defaultValues: initialData || {
      projectId,
      parentId,
      areaAllocation: { unit: 'absolute' },
      type: parentId ? 'SubZone' : 'Floor',
      isOverLapping: false,
    },
  });

  const onSubmit = async (data: ZoneFormData) => {
    setError(null);
    let result;
    
    if (initialData) {
        result = await updateZone(initialData._id, data);
    } else {
        result = await createZone(data);
    }
    
    if (result.success) {
      reset();
      onSuccess?.();
      router.refresh();
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
            {initialData ? 'Edit Zone' : (parentId ? 'Add Sub-Zone' : 'Add New Zone')}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <input type="hidden" {...register('projectId')} />
          <input type="hidden" {...register('parentId')} />

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Ground Floor, Master Bedroom" />
            {typeof (errors as any)?.name?.message === 'string' && <p className="text-sm text-red-500">{(errors as any).name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                {...register('type')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Floor">Floor</option>
                <option value="Zone">Zone</option>
                <option value="SubZone">SubZone</option>
                <option value="Landscape">Landscape</option>
                <option value="Podium">Podium</option>
                <option value="Basement">Basement</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="useType">Use Type</Label>
              <select
                id="useType"
                {...register('useType')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Retail">Retail</option>
                <option value="Office">Office</option>
                <option value="Mixed">Mixed</option>
                <option value="Parking">Parking</option>
                <option value="Circulation">Circulation</option>
                <option value="Service">Service</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input id="area" type="number" step="0.01" {...register('areaAllocation.value')} />
              {typeof (errors as any)?.areaAllocation?.value?.message === 'string' && <p className="text-sm text-red-500">{(errors as any).areaAllocation.value.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <select
                id="unit"
                {...register('areaAllocation.unit')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="absolute">Absolute (sqm)</option>
                <option value="percentage">% of Parent</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isOverLapping">Overlapping children (level-separated)</Label>
            <input
              id="isOverLapping"
              type="checkbox"
              {...register('isOverLapping')}
            />
            <p className="text-xs text-gray-500">
              When enabled, each child zone can use up to the container area. When disabled, all child zones must fit within the container area in total.
            </p>
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 pt-0">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {initialData ? 'Update Zone' : 'Add Zone'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
