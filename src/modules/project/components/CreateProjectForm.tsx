'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { projectSchema, ProjectFormData } from '../schema';
import { createProject } from '../actions';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

export default function CreateProjectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      landArea: { unit: 'sqm' },
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setError(null);
    const result = await createProject(data);
    
    if (result.success) {
      router.push('/projects');
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Riverside Apartments" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('location.address')} placeholder="e.g. 123 Main St, New York" />
            {errors.location?.address && <p className="text-sm text-red-500">{errors.location.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="landArea">Land Area</Label>
              <Input id="landArea" type="number" step="0.01" {...register('landArea.value')} />
              {errors.landArea?.value && <p className="text-sm text-red-500">{errors.landArea.value.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <select
                id="unit"
                {...register('landArea.unit')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sqm">Square Meters</option>
                <option value="sqft">Square Feet</option>
                <option value="acre">Acres</option>
                <option value="hectare">Hectares</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project description..."
            />
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
