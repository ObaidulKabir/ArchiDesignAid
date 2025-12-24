import { getProjectById } from '@/modules/project/actions';
import { getZonesByProject } from '@/modules/zoning/actions';
import ZoneTree from '@/modules/zoning/components/ZoneTree';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Ruler } from 'lucide-react';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params; // Await params in Next.js 15
  const project = await getProjectById(id);
  
  if (!project) {
    notFound();
  }

  const zones = await getZonesByProject(id);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Back to Projects
          </Button>
        </Link>
      </div>

      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-500">
                <span className="flex items-center gap-1">
                    <MapPin size={16} /> {project.location.address}
                </span>
                <span className="flex items-center gap-1">
                    <Ruler size={16} /> {project.landArea.value} {project.landArea.unit}
                </span>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">Edit Project</Button>
            <Button>Launch Planner</Button>
        </div>
      </div>

      {project.description && (
        <p className="text-gray-600 max-w-3xl">{project.description}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column: Zoning Structure */}
        <div className="lg:col-span-1">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Structure & Zoning</CardTitle>
                </CardHeader>
                <CardContent>
                    <ZoneTree zones={zones} projectId={id} projectLandArea={project.landArea.value} />
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Content / Stats (Placeholder for now) */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Space Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        Chart Placeholder
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">Project created on {new Date(project.createdAt).toLocaleDateString()}</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
