'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { designElementSchema, DesignElementFormData } from '../schema';
import { createDesignElement, updateDesignElement } from '../actions';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter, Textarea } from '@/components/ui';

interface CreateElementFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: DesignElementFormData & { _id?: string };
}

export default function CreateElementForm({ onSuccess, onCancel, initialData }: CreateElementFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const isEditing = !!initialData?._id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(designElementSchema),
    defaultValues: initialData || {
      isSystem: true,
      dimensions: {
        width: { standard: 0 },
        length: { standard: 0 },
      },
      area: { standard: 0 },
    },
  });

  // Auto-calculate area when dimensions change
  const widthStd = watch('dimensions.width.standard');
  const lengthStd = watch('dimensions.length.standard');
  const minWidth = watch('dimensions.width.min');
  const minLength = watch('dimensions.length.min');
  const areaStd = watch('area.standard');
  const minArea = watch('area.min');
  const maxArea = watch('area.max');

  const mToFt = (m: number) => m * 3.28084;
  const ftToM = (ft: number) => ft / 3.28084;
  const sqmToSqft = (sqm: number) => sqm * 10.7639;
  const sqftToSqm = (sqft: number) => sqft / 10.7639;

  const handleCalculateArea = () => {
      const w = Number(widthStd);
      const l = Number(lengthStd);
      if (w > 0 && l > 0) {
          const area = parseFloat((w * l).toFixed(2));
          setValue('area.standard', area);
          
          // Default max area logic: 100% higher than standard (double)
          // Only set if not already manually set or if it was previously auto-set
          if (!watch('area.max')) {
              setValue('area.max', parseFloat((area * 2).toFixed(2)));
          }
      }
  };

  const onSubmit = async (data: DesignElementFormData) => {
    setError(null);
    
    let result;
    if (isEditing && initialData?._id) {
        result = await updateDesignElement(initialData._id, data);
    } else {
        result = await createDesignElement(data);
    }
    
    if (result.success) {
      reset();
      onSuccess?.();
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Design Element' : 'Add New Design Element'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unit">Units</Label>
            <select
              id="unit"
              className="flex h-10 w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'metric' | 'imperial')}
            >
              <option value="metric">Metric (m, sqm)</option>
              <option value="imperial">Imperial (ft, sqft)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} placeholder="e.g. Master Bedroom" />
              {typeof errors.name?.message === 'string' && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                {...register('category')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Living Room">Living Room</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Balcony">Balcony</option>
                <option value="Staircase">Staircase</option>
                <option value="Lift">Lift</option>
                <option value="Corridor">Corridor</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
              {typeof errors.category?.message === 'string' && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="Optional description..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
               <Label>Standard Width ({unit==='metric'?'m':'ft'})</Label>
               <Input 
                 type="number" 
                 step="0.01"
                 value={unit==='metric' ? (widthStd ?? 0) : (widthStd ? mToFt(widthStd) : 0)}
                 onChange={(e) => {
                   const v = parseFloat(e.target.value || '0');
                   setValue('dimensions.width.standard', unit==='metric' ? v : ftToM(v), { shouldDirty: true });
                 }}
                 onBlur={handleCalculateArea}
               />
               {typeof (errors as any)?.dimensions?.width?.standard?.message === 'string' && <p className="text-sm text-red-500">{(errors as any).dimensions.width.standard.message}</p>}
            </div>
            <div className="space-y-2">
               <Label>Standard Length ({unit==='metric'?'m':'ft'})</Label>
               <Input 
                 type="number" 
                 step="0.01"
                 value={unit==='metric' ? (lengthStd ?? 0) : (lengthStd ? mToFt(lengthStd) : 0)}
                 onChange={(e) => {
                   const v = parseFloat(e.target.value || '0');
                   setValue('dimensions.length.standard', unit==='metric' ? v : ftToM(v), { shouldDirty: true });
                 }}
                 onBlur={handleCalculateArea}
               />
               {typeof (errors as any)?.dimensions?.length?.standard?.message === 'string' && <p className="text-sm text-red-500">{(errors as any).dimensions.length.standard.message}</p>}
            </div>
             <div className="space-y-2">
               <Label>Standard Area ({unit==='metric'?'sqm':'sqft'})</Label>
               <Input 
                 type="number" 
                 step="0.01" 
                 value={unit==='metric' ? (areaStd ?? 0) : (areaStd ? sqmToSqft(areaStd) : 0)}
                 onChange={(e) => {
                   const v = parseFloat(e.target.value || '0');
                   setValue('area.standard', unit==='metric' ? v : sqftToSqm(v), { shouldDirty: true });
                 }}
               />
               {typeof (errors as any)?.area?.standard?.message === 'string' && <p className="text-sm text-red-500">{(errors as any).area.standard.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
               <Label className="text-gray-500">Min Width ({unit==='metric'?'m':'ft'})</Label>
               <Input 
                 type="number" 
                 step="0.01" 
                 value={unit==='metric' ? (minWidth ?? 0) : (minWidth ? mToFt(minWidth) : 0)}
                 onChange={(e) => {
                   const v = parseFloat(e.target.value || '0');
                   setValue('dimensions.width.min', unit==='metric' ? v : ftToM(v), { shouldDirty: true });
                 }}
               />
            </div>
            <div className="space-y-2">
               <Label className="text-gray-500">Min Length ({unit==='metric'?'m':'ft'})</Label>
               <Input 
                 type="number" 
                 step="0.01" 
                 value={unit==='metric' ? (minLength ?? 0) : (minLength ? mToFt(minLength) : 0)}
                 onChange={(e) => {
                   const v = parseFloat(e.target.value || '0');
                   setValue('dimensions.length.min', unit==='metric' ? v : ftToM(v), { shouldDirty: true });
                 }}
               />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
             <div className="space-y-2">
               <Label className="text-gray-500">Min Area ({unit==='metric'?'sqm':'sqft'})</Label>
               <Input 
                 type="number" 
                 step="0.01" 
                 value={unit==='metric' ? (minArea ?? 0) : (minArea ? sqmToSqft(minArea) : 0)}
                 onChange={(e) => {
                   const v = parseFloat(e.target.value || '0');
                   setValue('area.min', unit==='metric' ? v : sqftToSqm(v), { shouldDirty: true });
                 }}
               />
            </div>
             <div className="space-y-2">
             <Label className="text-gray-500">Max Area ({unit==='metric'?'sqm':'sqft'})</Label>
             <Input 
               type="text" 
               value={
                 unit==='metric' 
                   ? (typeof maxArea === 'number' ? String(maxArea) : '') 
                   : (typeof maxArea === 'number' ? String(sqmToSqft(maxArea)) : '')
               }
               onChange={(e) => {
                 const raw = e.target.value;
                 if (raw.trim() === '') {
                   setValue('area.max', undefined, { shouldDirty: true });
                   return;
                 }
                 const v = parseFloat(raw);
                 if (!isNaN(v)) {
                   setValue('area.max', unit==='metric' ? v : sqftToSqm(v), { shouldDirty: true });
                 }
               }}
             />
            </div>
          </div>

          <div className="flex items-center space-x-2">
             <input 
                type="checkbox" 
                id="isSystem" 
                {...register('isSystem')} 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
             />
             <Label htmlFor="isSystem">Add to System Library (Global)</Label>
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isEditing ? 'Update Element' : 'Create Element'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
