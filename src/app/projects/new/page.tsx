import CreateProjectForm from '@/modules/project/components/CreateProjectForm';

export default function NewProjectPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">New Project</h1>
      <CreateProjectForm />
    </div>
  );
}
