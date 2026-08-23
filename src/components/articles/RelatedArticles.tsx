'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function RelatedArticles({ articleId, queryTitle }: { articleId: string; queryTitle: string }) {
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryTitle, limit: 4 }), // Fetch 4, we'll filter out the current one
        })
        if (!res.ok) throw new Error('Failed to fetch related')
        const data = await res.json()
        
        // Filter out the current article
        const filtered = (data.results || []).filter((a: any) => a.id !== articleId).slice(0, 3)
        setRelated(filtered)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (queryTitle) {
      fetchRelated()
    }
  }, [articleId, queryTitle])

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading related articles...</div>
  }

  if (related.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 mt-8 pt-8 border-t">
      <h3 className="text-xl font-bold">Related Articles</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((article) => (
          <Card key={article.id}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base leading-tight">
                <Link href={`/articles/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                {article.summary}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
