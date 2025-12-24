'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { designElementSchema, DesignElementFormData } from '../schema';
import { createDesignElement } from '../actions';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter, Textarea } from '@/components/ui';

interface CreateElementFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateElementForm({ onSuccess, onCancel }: CreateElementFormProps) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<DesignElementFormData>({
    resolver: zodResolver(designElementSchema),
    defaultValues: {
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

  const handleCalculateArea = () => {
      const w = Number(widthStd);
      const l = Number(lengthStd);
      if (w > 0 && l > 0) {
          setValue('area.standard', parseFloat((w * l).toFixed(2)));
      }
  };

  const onSubmit = async (data: DesignElementFormData) => {
    setError(null);
    const result = await createDesignElement(data);
    
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
        <CardTitle>Add New Design Element</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} placeholder="e.g. Master Bedroom" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="Optional description..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
               <Label>Standard Width (m)</Label>
               <Input 
                 type="number" 
                 step="0.01" 
                 {...register('dimensions.width.standard')} 
                 onBlur={handleCalculateArea}
               />
               {errors.dimensions?.width?.standard && <p className="text-sm text-red-500">{errors.dimensions.width.standard.message}</p>}
            </div>
            <div className="space-y-2">
               <Label>Standard Length (m)</Label>
               <Input 
                 type="number" 
                 step="0.01" 
                 {...register('dimensions.length.standard')} 
                 onBlur={handleCalculateArea}
               />
               {errors.dimensions?.length?.standard && <p className="text-sm text-red-500">{errors.dimensions.length.standard.message}</p>}
            </div>
             <div className="space-y-2">
               <Label>Standard Area (sqm)</Label>
               <Input type="number" step="0.01" {...register('area.standard')} />
               {errors.area?.standard && <p className="text-sm text-red-500">{errors.area.standard.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
               <Label className="text-gray-500">Min Width (Optional)</Label>
               <Input type="number" step="0.01" {...register('dimensions.width.min')} />
            </div>
            <div className="space-y-2">
               <Label className="text-gray-500">Min Length (Optional)</Label>
               <Input type="number" step="0.01" {...register('dimensions.length.min')} />
            </div>
             <div className="space-y-2">
               <Label className="text-gray-500">Min Area (Optional)</Label>
               <Input type="number" step="0.01" {...register('area.min')} />
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
            Create Element
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
