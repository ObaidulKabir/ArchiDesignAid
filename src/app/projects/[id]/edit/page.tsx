import { getProjectById } from '@/modules/project/actions';
import EditProjectForm from '@/modules/project/components/EditProjectForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    notFound();
  }

  const initialData = {
    name: project.name,
    location: { address: project.location.address },
    landArea: { value: project.landArea.value, unit: project.landArea.unit },
    description: project.description || '',
    notes: project.notes || '',
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/projects/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Back to Project
          </Button>
        </Link>
      </div>
      <EditProjectForm projectId={id} initialData={initialData as any} />
    </div>
  );
}
