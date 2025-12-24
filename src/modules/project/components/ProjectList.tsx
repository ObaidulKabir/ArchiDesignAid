import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui';
import { IProject } from '../models/Project';

// Define a simplified interface for the plain object we get from server actions
interface ProjectSummary {
    _id: string;
    name: string;
    location: {
        address: string;
    };
    landArea: {
        value: number;
        unit: string;
    };
    description?: string;
    createdAt?: string;
}

interface ProjectListProps {
  projects: ProjectSummary[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
        <p className="mt-1 text-gray-500">Get started by creating a new project.</p>
        <div className="mt-6">
          <Link href="/projects/new">
            <Button>Create Project</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project._id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">{project.location.address}</p>
            <p className="text-sm font-medium">
              Area: {project.landArea.value} {project.landArea.unit}
            </p>
            {project.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
            )}
          </CardContent>
          <CardFooter>
            <Link href={`/projects/${project._id}`} className="w-full">
              <Button variant="outline" className="w-full">View Project</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
