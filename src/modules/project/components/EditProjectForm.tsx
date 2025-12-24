'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { projectSchema, ProjectFormData } from '../schema';
import { updateProject } from '../actions';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

interface EditProjectFormProps {
  projectId: string;
  initialData: ProjectFormData;
}

export default function EditProjectForm({ projectId, initialData }: EditProjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProjectFormData) => {
    setError(null);
    const result = await updateProject(projectId, data);
    if (result.success) {
      router.push(`/projects/${projectId}`);
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Project</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" {...register('name')} />
            {typeof (errors as any)?.name?.message === 'string' && <p className="text-sm text-red-500">{(errors as any).name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('location.address')} />
            {typeof (errors as any)?.location?.address?.message === 'string' && <p className="text-sm text-red-500">{(errors as any).location.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="landArea">Land Area</Label>
              <Input id="landArea" type="number" step="0.01" {...register('landArea.value')} />
              {typeof (errors as any)?.landArea?.value?.message === 'string' && <p className="text-sm text-red-500">{(errors as any).landArea.value.message}</p>}
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
            />
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push(`/projects/${projectId}`)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
