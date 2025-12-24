'use client';

import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Plus, Search, Ruler, Box } from 'lucide-react';
import CreateElementForm from './CreateElementForm';

interface DesignElement {
  _id: string;
  name: string;
  category: string;
  dimensions: {
    width: { standard: number; min?: number };
    length: { standard: number; min?: number };
  };
  area: {
    standard: number;
    min?: number;
  };
}

interface LibraryManagerProps {
  elements: DesignElement[];
  onSeed?: () => void;
}

export default function LibraryManager({ elements, onSeed }: LibraryManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
           <Button onClick={() => setIsAdding(!isAdding)}>
             {isAdding ? 'Cancel' : 'Add Element'}
           </Button>
        </div>
      </div>

      {isAdding && (
        <div className="max-w-2xl mx-auto mb-8 border rounded-lg p-6 bg-gray-50">
          <CreateElementForm 
            onSuccess={() => setIsAdding(false)} 
            onCancel={() => setIsAdding(false)} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredElements.map((element) => (
          <Card key={element._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start text-base">
                <span>{element.name}</span>
                <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {element.category}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Dimensions</span>
                  <span className="font-medium">
                    {element.dimensions.width.standard}m x {element.dimensions.length.standard}m
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Box size={16} className="text-gray-400" />
                 <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Area</span>
                  <span className="font-medium">{element.area.standard} sqm</span>
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
