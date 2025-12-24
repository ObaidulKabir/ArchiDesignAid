import { getProjects } from '@/modules/project/actions';
import ProjectList from '@/modules/project/components/ProjectList';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Link href="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>
      <ProjectList projects={projects} />
    </div>
  );
}
