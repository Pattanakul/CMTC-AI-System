'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Categories

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  if (!name || !slug) return { error: 'Name and slug are required' }

  const supabase = await createClient()
  const { error } = await supabase.from('categories').insert({ name, slug })

  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

// Tags

export async function createTag(formData: FormData) {
  const name = formData.get('name') as string

  if (!name) return { error: 'Name is required' }

  const supabase = await createClient()
  const { error } = await supabase.from('tags').insert({ name })

  if (error) return { error: error.message }
  revalidatePath('/admin/tags')
  return { success: true }
}

export async function deleteTag(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/tags')
  return { success: true }
}
