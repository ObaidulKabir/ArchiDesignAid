import { getZoneById } from '@/modules/zoning/actions';
import { getSystemLibrary } from '@/modules/library/actions';
import PlannerInterface from '@/modules/planner/components/PlannerInterface';
import { getProjectById } from '@/modules/project/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

export default async function PlannerPage({ params }: { params: { id: string; zoneId: string } }) {
  const { id, zoneId } = await params;
  
  const zone = await getZoneById(zoneId);
  if (!zone) {
    notFound();
  }
  const [libraryElements, project] = await Promise.all([
    getSystemLibrary(),
    getProjectById(zone.projectId),
  ]);

  if (!project) {
    notFound();
  }

  // Compute absolute area for the zone to use in planner
  const getAbsArea = async (z: any): Promise<number> => {
    if (z.areaAllocation.unit === 'absolute') return z.areaAllocation.value;
    if (z.parentId) {
      const parent = await getZoneById(z.parentId);
      const parentAbs = parent ? await getAbsArea(parent) : project.landArea.value;
      return parentAbs * (z.areaAllocation.value / 100);
    }
    return project.landArea.value * (z.areaAllocation.value / 100);
  };
  const totalArea = await getAbsArea(zone);

  return (
    <div className="container mx-auto py-4 px-4 h-screen flex flex-col">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <Link href={`/projects/${zone.projectId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Back to Project
          </Button>
        </Link>
        <h1 className="text-xl font-bold">{zone.name} <span className="text-gray-400 font-normal">| Space Planner</span></h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <PlannerInterface zone={zone} libraryElements={libraryElements} totalArea={totalArea} />
      </div>
    </div>
  );
}
