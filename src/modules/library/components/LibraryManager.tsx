'use client';

import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Plus, Search, Ruler, Box, Edit } from 'lucide-react';
import CreateElementForm from './CreateElementForm';
import { DesignElementFormData } from '../schema';

interface DesignElement extends DesignElementFormData {
  _id: string;
}

interface LibraryManagerProps {
  elements: DesignElement[];
  onSeed?: () => void;
}

export default function LibraryManager({ elements, onSeed }: LibraryManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingElement, setEditingElement] = useState<DesignElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const mToFt = (m: number) => m * 3.28084;
  const sqmToSqft = (sqm: number) => sqm * 10.7639;

  const categories = ['All', ...Array.from(new Set(elements.map(e => e.category)))];

  const filteredElements = elements.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || element.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search elements..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
           {elements.length === 0 && onSeed && (
             <Button variant="outline" onClick={onSeed}>Seed Defaults</Button>
           )}
           <Button onClick={() => {
             setIsAdding(!isAdding);
             setEditingElement(null);
           }}>
             {isAdding || editingElement ? 'Cancel' : 'Add Element'}
           </Button>
           <select
             className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
             value={unit}
             onChange={(e) => setUnit(e.target.value as 'metric' | 'imperial')}
           >
             <option value="metric">Metric (m, sqm)</option>
             <option value="imperial">Imperial (ft, sqft)</option>
           </select>
        </div>
      </div>

      {(isAdding || editingElement) && (
        <div className="max-w-2xl mx-auto mb-8 border rounded-lg p-6 bg-gray-50">
          <CreateElementForm 
            onSuccess={() => {
              setIsAdding(false);
              setEditingElement(null);
            }} 
            onCancel={() => {
              setIsAdding(false);
              setEditingElement(null);
            }}
            initialData={editingElement || undefined}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredElements.map((element) => (
          <Card key={element._id} className="hover:shadow-md transition-shadow relative group">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start text-base pr-8">
                <span>{element.name}</span>
                <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {element.category}
                </span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                onClick={() => {
                  setEditingElement(element);
                  setIsAdding(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Dimensions</span>
                  <span className="font-medium">
                    {unit === 'metric' ? `${Number(element.dimensions.width.standard).toFixed(2)}m x ${Number(element.dimensions.length.standard).toFixed(2)}m` : `${mToFt(Number(element.dimensions.width.standard)).toFixed(2)}ft x ${mToFt(Number(element.dimensions.length.standard)).toFixed(2)}ft`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Box size={16} className="text-gray-400" />
                 <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Area</span>
                  <span className="font-medium">{unit === 'metric' ? `${Number(element.area.standard).toFixed(2)} sqm` : `${sqmToSqft(Number(element.area.standard)).toFixed(2)} sqft`}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredElements.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                No elements found matching your criteria.
            </div>
        )}
      </div>
    </div>
  );
}
