'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2, Box, LayoutTemplate, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { Button, cn } from '@/components/ui';
import { deleteZone } from '../actions';
import CreateZoneForm from './CreateZoneForm';

interface ZoneNode {
  _id: string;
  name: string;
  type: string;
  useType: string;
  areaAllocation: {
    value: number;
    unit: string;
  };
  children: ZoneNode[];
  projectId: string;
  parentId?: string; // Ensure parentId is available
  isOverLapping?: boolean;
}

interface ZoneTreeProps {
  zones: ZoneNode[];
  projectId: string;
  projectLandArea?: number;
}

const ZoneItem = ({ zone, level = 0, containerAbsArea }: { zone: ZoneNode; level?: number; containerAbsArea: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const childrenAbs = zone.children.map((child) => {
    if (child.areaAllocation.unit === 'absolute') return child.areaAllocation.value;
    return containerAbsArea * (child.areaAllocation.value / 100);
  });
  const nonOverlapSum = zone.children.reduce((acc, child, idx) => (child as any).isOverLapping ? acc : acc + childrenAbs[idx], 0);
  const anyOverlapCovers = zone.children.some((child, idx) => (child as any).isOverLapping && childrenAbs[idx] >= containerAbsArea - 1e-6);
  const nonOverlapCovers = nonOverlapSum >= containerAbsArea - 1e-6;
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this zone?')) {
        await deleteZone(zone._id, zone.projectId);
    }
  };

  if (isEditing) {
    return (
        <div className={cn("mb-2 p-2 border rounded-md bg-gray-50", level > 0 && "ml-4")}>
            <CreateZoneForm 
                projectId={zone.projectId}
                parentId={zone.parentId}
                initialData={{
                    ...zone,
                    type: zone.type as any,
                    useType: zone.useType as any,
                    areaAllocation: {
                        value: zone.areaAllocation.value,
                        unit: zone.areaAllocation.unit as 'absolute' | 'percentage'
                    },
                    isOverLapping: (zone as any).isOverLapping ?? false
                }}
                onSuccess={() => setIsEditing(false)}
                onCancel={() => setIsEditing(false)}
            />
        </div>
    );
  }

  return (
    <div className="select-none">
      <div 
        className={cn(
            "flex items-center justify-between p-2 hover:bg-gray-100 rounded-md group",
            level > 0 && "ml-4 border-l border-gray-200"
        )}
      >
        <div className="flex items-center gap-2">
          {zone.children.length > 0 ? (
            <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-gray-200">
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <Box size={16} className="text-gray-400 ml-1" />
          )}
          
          <div className="flex flex-col">
            <span className="font-medium text-sm flex items-center gap-2">
                {zone.name}
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {zone.type}
                </span>
            </span>
            <span className="text-xs text-gray-500">
              {zone.useType} • {zone.areaAllocation.value} {zone.areaAllocation.unit === 'percentage' ? '%' : 'sqm'}
            </span>
            {zone.children.length > 0 && (
              <span className="text-[11px]">
                Non-overlap sum {nonOverlapCovers ? 'OK' : 'Under'} • Overlap any {anyOverlapCovers ? 'OK' : 'Under'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/projects/${zone.projectId}/planner/${zone._id}`}>
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                title="Plan Space"
            >
                <LayoutTemplate size={14} />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 text-gray-600 hover:text-gray-900" 
            onClick={() => setIsEditing(true)}
            title="Edit Zone"
          >
            <Edit2 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={() => setIsAdding(!isAdding)}
            title="Add Sub-Zone"
          >
            <Plus size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" 
            onClick={handleDelete}
            title="Delete Zone"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Add Sub-Zone Form */}
      {isAdding && (
        <div className="ml-8 mt-2 mb-4 border-l-2 border-blue-200 pl-4">
            <CreateZoneForm 
                projectId={zone.projectId} 
                parentId={zone._id} 
                onSuccess={() => setIsAdding(false)}
                onCancel={() => setIsAdding(false)}
            />
        </div>
      )}

      {/* Children */}
      {isOpen && zone.children.length > 0 && (
        <div className="ml-2">
          {zone.children.map((child) => (
            <ZoneItem 
              key={child._id} 
              zone={child} 
              level={level + 1} 
              containerAbsArea={
                zone.areaAllocation.unit === 'absolute' 
                  ? zone.areaAllocation.value 
                  : containerAbsArea * (zone.areaAllocation.value / 100)
              } 
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default function ZoneTree({ zones, projectId, projectLandArea = 0 }: ZoneTreeProps) {
    const [isAddingRoot, setIsAddingRoot] = useState(false);

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Zone Hierarchy</h3>
            <Button size="sm" onClick={() => setIsAddingRoot(!isAddingRoot)} variant="outline">
                {isAddingRoot ? 'Cancel' : 'Add Major Zone'}
            </Button>
        </div>

        {isAddingRoot && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <CreateZoneForm 
                    projectId={projectId} 
                    onSuccess={() => setIsAddingRoot(false)}
                    onCancel={() => setIsAddingRoot(false)}
                />
            </div>
        )}

      {zones.length === 0 && !isAddingRoot ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          No zones defined. Start by adding a Floor or Major Zone.
        </div>
      ) : (
        <div className="space-y-1">
          {zones.map((zone) => (
            <ZoneItem 
              key={zone._id} 
              zone={zone} 
              containerAbsArea={
                zone.areaAllocation.unit === 'absolute' 
                  ? zone.areaAllocation.value 
                  : projectLandArea * (zone.areaAllocation.value / 100)
              } 
            />
          ))}
        </div>
      )}
    </div>
  );
}
