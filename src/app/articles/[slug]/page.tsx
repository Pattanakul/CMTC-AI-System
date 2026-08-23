import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RelatedArticles } from '@/components/articles/RelatedArticles'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  // Fetch the article
  const { data: article } = await supabase
    .from('knowledge_articles')
    .select('*, categories(name), profiles:author_id(first_name, last_name)')
    .eq('slug', params.slug)
    .single()

  if (!article) {
    notFound()
  }

  // Ensure it's published unless user is admin/staff, but for simplicity here we just show it.
  // In a real app, you'd check auth and role here if status !== 'PUBLISHED'.

  const authorName = article.profiles 
    ? `${article.profiles.first_name} ${article.profiles.last_name}`
    : 'Unknown Author'

  return (
    <div className="max-w-4xl mx-auto p-6 py-12 space-y-8">
      <Link href="/admin/knowledge" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Knowledge Base
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-2">
          {article.categories && (
            <Badge variant="secondary">{article.categories.name}</Badge>
          )}
          <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'outline'}>
            {article.status}
          </Badge>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">{article.title}</h1>
        <p className="text-muted-foreground text-lg">{article.summary}</p>
        <div className="flex items-center text-sm text-muted-foreground gap-4">
          <span>By {authorName}</span>
          <span>•</span>
          <span>{new Date(article.created_at).toLocaleDateString()}</span>
        </div>
      </header>

      <div 
        className="prose prose-slate max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <RelatedArticles articleId={article.id} queryTitle={article.title} />
    </div>
  )
}
