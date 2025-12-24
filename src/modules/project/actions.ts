'use server';

import connectDB from '@/lib/db';
import Project, { IProject } from './models/Project';
import { projectSchema, ProjectFormData } from './schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Utility to serialize Mongoose document to plain object
function serializeProject(doc: any) {
  const { _id, createdAt, updatedAt, ...rest } = doc.toObject ? doc.toObject() : doc;
  return {
    _id: _id.toString(),
    createdAt: createdAt?.toISOString(),
    updatedAt: updatedAt?.toISOString(),
    ...rest,
  };
}

export async function createProject(data: ProjectFormData) {
  try {
    await connectDB();
    
    const validatedData = projectSchema.parse(data);
    
    const project = await Project.create({
      ...validatedData,
      images: [], // Placeholder
      documents: [], // Placeholder
      maps: [], // Placeholder
    });
    
    revalidatePath('/projects');
    return { success: true, id: project._id.toString() };
  } catch (error) {
    console.error('Failed to create project:', error);
    return { success: false, error: 'Failed to create project' };
  }
}

export async function getProjects() {
  try {
    await connectDB();
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
    return projects.map(p => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function getProjectById(id: string) {
  try {
    await connectDB();
    const project = await Project.findById(id).lean();
    if (!project) return null;
    
    return {
      ...project,
      _id: project._id.toString(),
      createdAt: project.createdAt?.toISOString(),
      updatedAt: project.updatedAt?.toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}

export async function deleteProject(id: string) {
    try {
        await connectDB();
        await Project.findByIdAndDelete(id);
        revalidatePath('/projects');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete project:', error);
        return { success: false, error: 'Failed to delete project' };
    }
}

export async function updateProject(id: string, data: ProjectFormData) {
  try {
    await connectDB();
    const validatedData = projectSchema.parse(data);
    const updated = await Project.findByIdAndUpdate(id, validatedData, { new: true, runValidators: true });
    if (!updated) {
      return { success: false, error: 'Project not found' };
    }
    revalidatePath(`/projects/${id}`);
    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    console.error('Failed to update project:', error);
    return { success: false, error: 'Failed to update project' };
  }
}
