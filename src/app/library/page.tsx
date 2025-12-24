import { getSystemLibrary, seedLibrary } from '@/modules/library/actions';
import { revalidatePath } from 'next/cache';
import LibraryManager from '@/modules/library/components/LibraryManager';

export default async function LibraryPage() {
  const elements = await getSystemLibrary();

  async function handleSeed() {
    'use server';
    await seedLibrary();
    revalidatePath('/library');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Design Library</h1>
      
      <LibraryManager 
        elements={elements} 
        onSeed={handleSeed}
      />
    </div>
  );
}
