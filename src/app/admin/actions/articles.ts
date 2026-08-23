'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createArticle(formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const summary = formData.get('summary') as string
  const content = formData.get('content') as string
  const category_id = formData.get('category_id') as string
  const status = formData.get('status') as string

  if (!title || !slug || !content) {
    return { error: 'Title, slug, and content are required' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const articleData: any = {
    title,
    slug,
    summary,
    content,
    status,
    author_id: user.id,
  }

  if (category_id && category_id !== 'none') {
    articleData.category_id = category_id
  }
  
  if (status === 'PUBLISHED') {
    articleData.published_date = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('knowledge_articles')
    .insert(articleData)
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/articles')
  redirect('/admin/articles')
}
