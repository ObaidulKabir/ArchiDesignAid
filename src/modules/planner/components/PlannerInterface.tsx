'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { IDesignElement } from '@/modules/library/models/DesignElement';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { Save, RotateCw, Trash, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { saveZoneLayout, getZoneLayout } from '../actions';

interface PlacedElement {
  instanceId: string;
  elementId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  length: number;
  rotation: number;
  color: string;
}

interface PlannerInterfaceProps {
  zone: any; // Using any for now to avoid strict type mismatch during rapid prototyping
  libraryElements: any[];
  totalArea: number; // sqm
}

export default function PlannerInterface({ zone, libraryElements, totalArea }: PlannerInterfaceProps) {
  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<{ width: number; length: number } | null>(null);
  const [aspect, setAspect] = useState<number>(1); // width/length ratio
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [mouseStart, setMouseStart] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1); // view scale only
  const [lockArea, setLockArea] = useState<boolean>(true);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  
  // Canvas settings (1 meter = 40 pixels)
  const SCALE = 40;
  const PX = SCALE * zoom;

  // Load existing layout
  useEffect(() => {
    const loadLayout = async () => {
        setIsLoading(true);
        const layout = await getZoneLayout(zone._id);
        if (layout && layout.elements) {
            setElements(layout.elements);
        }
        const defaultSide = Math.sqrt(totalArea);
        if (layout && layout.container && layout.container.width && layout.container.length) {
            setContainer({ width: layout.container.width, length: layout.container.length });
            setAspect(layout.container.width / layout.container.length);
        } else {
            setContainer({ width: defaultSide, length: defaultSide });
            setAspect(1);
        }
        setIsLoading(false);
    };
    loadLayout();
  }, [zone._id]);
  
  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveZoneLayout(zone._id, elements, container || undefined);
    setIsSaving(false);
    if (result.success) {
        // Maybe show toast notification here
        console.log('Layout saved successfully');
    } else {
        alert('Failed to save layout');
    }
  };

  const handleDragStart = (e: React.DragEvent, element: any) => {
    e.dataTransfer.setData('elementId', element._id);
    e.dataTransfer.setData('elementName', element.name);
    e.dataTransfer.setData('width', element.dimensions.width.standard);
    e.dataTransfer.setData('length', element.dimensions.length.standard);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    // Calculate position relative to the canvas content, taking scroll into account
    // But our canvas area is absolutely positioned at top: 50, left: 50 inside the scrollable container
    // So we need to subtract that offset
    
    // Let's simplify: the drop target should be the inner div, but we dropped on the outer div potentially
    // If we drop on the outer div (canvasRef), we calculate relative to it
    
    // Better approach: Calculate drop position relative to the scrollable container, then adjust for the inner canvas offset (50, 50)
    
    const x = (e.clientX - rect.left + scrollLeft - 50) / PX;
    const y = (e.clientY - rect.top + scrollTop - 50) / PX;

    const elementId = e.dataTransfer.getData('elementId');
    const name = e.dataTransfer.getData('elementName');
    const width = parseFloat(e.dataTransfer.getData('width'));
    const length = parseFloat(e.dataTransfer.getData('length'));

    if (elementId) {
      const newElement: PlacedElement = {
        instanceId: Math.random().toString(36).substr(2, 9),
        elementId,
        name,
        x, // This is now in meters relative to the zone origin
        y,
        width,
        length,
        rotation: 0,
        color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color for viz
      };
      setElements([...elements, newElement]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateElement = (id: string, updates: Partial<PlacedElement>) => {
    setElements(elements.map(el => el.instanceId === id ? { ...el, ...updates } : el));
  };
  
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingId || !dragStart || !mouseStart) return;
      const dx = (e.clientX - mouseStart.x) / PX;
      const dy = (e.clientY - mouseStart.y) / PX;
      const boundsW = container?.width ?? Math.sqrt(totalArea);
      const boundsL = container?.length ?? Math.sqrt(totalArea);
      setElements(prev =>
        prev.map(el => {
          if (el.instanceId !== draggingId) return el;
          let x = dragStart.x + dx;
          let y = dragStart.y + dy;
          x = Math.max(0, Math.min(x, boundsW - el.width));
          y = Math.max(0, Math.min(y, boundsL - el.length));
          return { ...el, x, y };
        })
      );
    };
    const onMouseUp = () => {
      if (draggingId) {
        setDraggingId(null);
        setDragStart(null);
        setMouseStart(null);
      }
    };
    if (draggingId) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggingId, dragStart, mouseStart, container, totalArea, SCALE]);

  const deleteSelected = () => {
    if (selectedId) {
        setElements(elements.filter(el => el.instanceId !== selectedId));
        setSelectedId(null);
    }
  };

  const rotateSelected = () => {
    if (selectedId) {
        const el = elements.find(e => e.instanceId === selectedId);
        if (el) {
            updateElement(selectedId, { 
                rotation: (el.rotation + 90) % 360,
                // Swap dimensions visually if needed, but keeping simple for now
            });
        }
    }
  };
  
  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (selectedId) {
          if (e.key === 'Delete' || e.key === 'Backspace') {
              deleteSelected();
              return;
          }
          const displayStep = e.shiftKey ? 1 : 0.1;
          const step = unit === 'metric' ? displayStep : ftToM(displayStep);
          const boundsW = container?.width ?? Math.sqrt(totalArea);
          const boundsL = container?.length ?? Math.sqrt(totalArea);
          const el = elements.find(x => x.instanceId === selectedId);
          if (!el) return;
          if (e.key === 'ArrowLeft') {
            const x = Math.max(0, el.x - step);
            updateElement(selectedId, { x });
          } else if (e.key === 'ArrowRight') {
            const x = Math.min(boundsW - el.width, el.x + step);
            updateElement(selectedId, { x });
          } else if (e.key === 'ArrowUp') {
            const y = Math.max(0, el.y - step);
            updateElement(selectedId, { y });
          } else if (e.key === 'ArrowDown') {
            const y = Math.min(boundsL - el.length, el.y + step);
            updateElement(selectedId, { y });
          } else if (e.key === 'a') {
            updateSelectedDimensions(selectedId, el.width - step, undefined);
          } else if (e.key === 'd') {
            updateSelectedDimensions(selectedId, el.width + step, undefined);
          } else if (e.key === 'w') {
            updateSelectedDimensions(selectedId, undefined, el.length - step);
          } else if (e.key === 's') {
            updateSelectedDimensions(selectedId, undefined, el.length + step);
          }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements]); // Dependencies need to include elements for deleteSelected to work if not using functional update, but here we filter elements so we need it

  // Calculate Used Area
  const usedArea = elements.reduce((acc, el) => acc + (el.width * el.length), 0);
  const isOverflow = usedArea > totalArea;

  const recomputeContainerFromAspect = (a: number) => {
    const width = Math.sqrt(totalArea * a);
    const length = totalArea / width;
    return { width, length };
  };

  const fitChildrenToContainer = (nextContainer: { width: number; length: number }) => {
    const cur = container || { width: Math.sqrt(totalArea), length: Math.sqrt(totalArea) };
    const scaleX = nextContainer.width / cur.width;
    const scaleY = nextContainer.length / cur.length;
    const nextElements = elements.map(el => {
      let width = el.width * scaleX;
      let length = el.length * scaleY;
      let x = el.x * scaleX;
      let y = el.y * scaleY;
      const maxWidth = nextContainer.width;
      const maxLength = nextContainer.length;
      if (width > maxWidth) {
        const factor = maxWidth / width;
        width = width * factor;
        x = x * factor;
      }
      if (length > maxLength) {
        const factor = maxLength / length;
        length = length * factor;
        y = y * factor;
      }
      x = Math.max(0, Math.min(x, maxWidth - width));
      y = Math.max(0, Math.min(y, maxLength - length));
      return { ...el, width, length, x, y };
    });
    setElements(nextElements);
  };

  const handleAspectChange = (a: number) => {
    const next = recomputeContainerFromAspect(a);
    setAspect(a);
    setContainer(next);
    fitChildrenToContainer(next);
  };
  const zoomIn = () => setZoom((z) => Math.min(3, parseFloat((z + 0.1).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))));
  const getLibraryElement = (id: string) => libraryElements.find((e: any) => e._id === id);
  const clamp = (v: number, min?: number, max?: number) => {
    let x = v;
    if (typeof min === 'number') x = Math.max(min, x);
    if (typeof max === 'number') x = Math.min(max, x);
    return x;
  };
  const mToFt = (m: number) => m * 3.28084;
  const ftToM = (ft: number) => ft / 3.28084;
  const sqmToSqft = (sqm: number) => sqm * 10.7639;
  const sqftToSqm = (sqft: number) => sqft / 10.7639;
  const fmtLen = (m: number) => unit === 'metric' ? m : mToFt(m);
  const fmtArea = (sqm: number) => unit === 'metric' ? sqm : sqmToSqft(sqm);
  const parseLenToM = (val: number) => unit === 'metric' ? val : ftToM(val);
  const fmtImperial = (m: number) => {
    const totalInches = m * 39.37007874015748;
    let feet = Math.floor(totalInches / 12);
    let inchesFloat = totalInches - feet * 12;
    let halfInch = Math.round(inchesFloat * 2) / 2;
    if (halfInch >= 12) {
      feet += 1;
      halfInch = 0;
    }
    const inchesWhole = Math.floor(halfInch);
    const hasHalf = Math.abs(halfInch - inchesWhole - 0.5) < 1e-6;
    return `${feet}'-${inchesWhole}${hasHalf ? '-1/2' : ''}"`;
  };
  const applyBounds = (el: PlacedElement, next: { width?: number; length?: number }) => {
    const nextWidth = typeof next.width === 'number' ? next.width : el.width;
    const nextLength = typeof next.length === 'number' ? next.length : el.length;
    const boundsW = container?.width ?? Math.sqrt(totalArea);
    const boundsL = container?.length ?? Math.sqrt(totalArea);
    let x = Math.max(0, Math.min(el.x, boundsW - nextWidth));
    let y = Math.max(0, Math.min(el.y, boundsL - nextLength));
    return { width: nextWidth, length: nextLength, x, y };
  };
  const updateSelectedDimensions = (id: string, nextWidth?: number, nextLength?: number) => {
    const el = elements.find(e => e.instanceId === id);
    if (!el) return;
    const lib = getLibraryElement(el.elementId);
    let w = typeof nextWidth === 'number' ? nextWidth : el.width;
    let l = typeof nextLength === 'number' ? nextLength : el.length;
    const wMin = lib?.dimensions?.width?.min;
    const wMax = lib?.dimensions?.width?.max;
    const lMin = lib?.dimensions?.length?.min;
    const lMax = lib?.dimensions?.length?.max;
    w = clamp(w, wMin, wMax);
    l = clamp(l, lMin, lMax);
    if (lockArea && typeof nextWidth === 'number' && typeof nextLength !== 'number') {
      const area = el.width * el.length;
      l = area / w;
      l = clamp(l, lMin, lMax);
    } else if (lockArea && typeof nextLength === 'number' && typeof nextWidth !== 'number') {
      const area = el.width * el.length;
      w = area / l;
      w = clamp(w, wMin, wMax);
    }
    const areaMin = lib?.area?.min;
    if (typeof areaMin === 'number') {
      const a = w * l;
      if (a < areaMin) {
        if (typeof nextWidth === 'number' && typeof nextLength !== 'number') {
          l = areaMin / w;
          l = clamp(l, lMin, lMax);
        } else if (typeof nextLength === 'number' && typeof nextWidth !== 'number') {
          w = areaMin / l;
          w = clamp(w, wMin, wMax);
        }
      }
    }
    const bounded = applyBounds(el, { width: w, length: l });
    updateElement(id, bounded);
  };

  if (isLoading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /> Loading Planner...</div>;
  }

  const widthM = container?.width ?? Math.sqrt(totalArea);
  const lengthM = container?.length ?? Math.sqrt(totalArea);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4">
      {/* Sidebar Palette */}
      <div className="w-64 flex flex-col gap-4">
        <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="py-3 px-4 bg-gray-50 border-b">
                <CardTitle className="text-sm">Elements</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
                {libraryElements.map(el => (
                    <div 
                        key={el._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, el)}
                        className="p-3 bg-white border rounded cursor-move hover:border-blue-500 shadow-sm text-sm"
                    >
                        <div className="font-medium">{el.name}</div>
                        <div className="text-xs text-gray-500">
                          {unit === 'metric' ? `${el.dimensions.width.standard}m x ${el.dimensions.length.standard}m` : 
                          `${mToFt(el.dimensions.width.standard).toFixed(2)}ft x ${mToFt(el.dimensions.length.standard).toFixed(2)}ft`}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
        
        <Card>
            <CardContent className="p-4 space-y-2">
                <div className="text-sm font-medium">Zone Stats</div>
                <div className={`text-2xl font-bold ${isOverflow ? 'text-red-600' : 'text-green-600'}`}>
                    {fmtArea(usedArea).toFixed(2)} / {fmtArea(totalArea).toFixed(2)} <span className="text-sm font-normal text-gray-500">{unit === 'metric' ? 'sqm' : 'sqft'}</span>
                </div>
                {isOverflow && <div className="text-xs text-red-500">Area Limit Exceeded!</div>}
                {container && (
                  <div className="text-xs text-gray-600">
                    Shape: {fmtLen(container.width).toFixed(2)}{unit==='metric'?'m':'ft'} × {fmtLen(container.length).toFixed(2)}{unit==='metric'?'m':'ft'} (aspect {aspect.toFixed(2)})
                  </div>
                )}
                <div className="space-y-1 pt-2">
                  <label className="text-xs text-gray-700">Units</label>
                  <select 
                    className="flex h-8 w-full rounded-md border border-gray-300 bg-white px-2 text-xs"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'metric' | 'imperial')}
                  >
                    <option value="metric">Metric (m, sqm)</option>
                    <option value="imperial">Imperial (ft, sqft)</option>
                  </select>
                </div>
                <div className="space-y-1 pt-2">
                  <label className="text-xs text-gray-700">Aspect (W/L)</label>
                  <input 
                    type="range" 
                    min={0.5} 
                    max={2.0} 
                    step={0.01} 
                    value={aspect} 
                    onChange={(e) => handleAspectChange(parseFloat(e.target.value))}
                  />
                </div>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4 bg-gray-50 border-b">
            <CardTitle className="text-sm">Selected Element</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedId ? (
              <>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Lock Area</Label>
                  <input type="checkbox" checked={lockArea} onChange={(e) => setLockArea(e.target.checked)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Width ({unit==='metric'?'m':'ft'})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={fmtLen(elements.find(e => e.instanceId === selectedId)?.width ?? 0)}
                      onChange={(e) => updateSelectedDimensions(selectedId, parseLenToM(parseFloat(e.target.value)), undefined)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Length ({unit==='metric'?'m':'ft'})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={fmtLen(elements.find(e => e.instanceId === selectedId)?.length ?? 0)}
                      onChange={(e) => updateSelectedDimensions(selectedId, undefined, parseLenToM(parseFloat(e.target.value)))}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-500">Select an element to edit dimensions</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-white p-2 rounded border">
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={rotateSelected} disabled={!selectedId}><RotateCw size={16} /></Button>
                <Button variant="outline" size="sm" onClick={deleteSelected} disabled={!selectedId} className="text-red-600 hover:text-red-700"><Trash size={16} /></Button>
                <Button variant="outline" size="sm" onClick={zoomOut}><ZoomOut size={16} /></Button>
                <Button variant="outline" size="sm" onClick={zoomIn}><ZoomIn size={16} /></Button>
            </div>
            <div className="font-medium">{zone.name} Planner</div>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 animate-spin" size={16}/> : <Save size={16} className="mr-2"/>} 
                Save Layout
            </Button>
        </div>

        <div 
            className="flex-1 bg-gray-100 overflow-auto relative border-2 border-dashed border-gray-300 rounded-lg"
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => setSelectedId(null)}
        >
            <div 
                className="absolute bg-white shadow-sm border border-gray-200"
                style={{
                    width: widthM * PX, 
                    height: lengthM * PX,
                    top: 50,
                    left: 50,
                }}
            >
                <div 
                  className="absolute text-xs bg-white/80 px-1 rounded border"
                  style={{ top: -16, left: (widthM * PX) / 2 - 24 }}
                >
                  {fmtLen(widthM).toFixed(2)} {unit === 'metric' ? 'm' : 'ft'}
                </div>
                <div 
                  className="absolute text-xs bg-white/80 px-1 rounded border"
                  style={{ left: -16, top: (lengthM * PX) / 2 - 24, transform: 'rotate(-90deg)' }}
                >
                  {fmtLen(lengthM).toFixed(2)} {unit === 'metric' ? 'm' : 'ft'}
                </div>
                {/* Grid Lines */}
                <div className="w-full h-full opacity-10" 
                    style={{ 
                        backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                        backgroundSize: `${PX}px ${PX}px`
                    }} 
                />

                {elements.map(el => (
                    <div
                        key={el.instanceId}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(el.instanceId); }}
                        onMouseDown={(e) => { 
                          e.stopPropagation(); 
                          setSelectedId(el.instanceId); 
                          setDraggingId(el.instanceId); 
                          setDragStart({ x: el.x, y: el.y }); 
                          setMouseStart({ x: e.clientX, y: e.clientY }); 
                        }}
                        className={`absolute flex items-center justify-center text-xs text-white cursor-pointer transition-colors ${selectedId === el.instanceId ? 'ring-2 ring-blue-500 z-10' : ''}`}
                        style={{
                            left: el.x * PX,
                            top: el.y * PX,
                            width: el.width * PX,
                            height: el.length * PX,
                            backgroundColor: selectedId === el.instanceId ? '#2563eb' : (el.color || '#64748b'),
                            transform: `rotate(${el.rotation}deg)`,
                            opacity: 0.8
                        }}
                    >
                        <div className="flex flex-col items-center justify-center px-1 text-[11px] leading-tight">
                          <div className="font-semibold">{el.name}</div>
                          <div className="opacity-90">
                            {unit === 'metric' 
                              ? `${el.width.toFixed(2)}m x ${el.length.toFixed(2)}m`
                              : `${fmtImperial(el.width)} x ${fmtImperial(el.length)}`
                            }
                          </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
