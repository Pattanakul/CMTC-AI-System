'use client'

import { useState, useEffect } from 'react'
import { createArticle } from '@/app/admin/actions/articles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { createClient } from '@/lib/supabase/client'

export default function NewArticlePage() {
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [isCategorizing, setIsCategorizing] = useState(false)
  const [isQueueing, setIsQueueing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('none')
  const [summaryText, setSummaryText] = useState('')

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleAutoCategorize = async () => {
    if (!content || content === '<p></p>') {
      alert('Please write some content first.')
      return
    }

    setIsCategorizing(true)
    try {
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content.replace(/<[^>]*>?/gm, ''), // strip html tags
          existingCategories: categories,
        }),
      })

      if (!response.ok) throw new Error('Failed to auto categorize')
      
      const data = await response.json()
      
      if (data.suggestedSummary) {
        setSummaryText(data.suggestedSummary)
      }
      
      if (data.suggestedCategory) {
        // Find existing category that matches
        const matched = categories.find(
          c => c.name.toLowerCase() === data.suggestedCategory.toLowerCase()
        )
        if (matched) {
          setSelectedCategory(matched.id)
        } else {
          alert(`AI Suggested Category: ${data.suggestedCategory} (Not found in list)`)
        }
      }
    } catch (error) {
      console.error(error)
      alert('Auto categorize failed.')
    } finally {
      setIsCategorizing(false)
    }
  }

  const handleQueueForProcessing = async () => {
    if (!content || content === '<p></p>') {
      alert('Please write some content first.')
      return
    }

    // We can fetch a new API endpoint that calls the n8n service
    // Or just submit it normally with a special status.
    // To keep it simple, we'll hit a new custom route or just set status to DRAFT and let the user know.
    // Let's create an API route for it.
    setIsQueueing(true)
    try {
      const response = await fetch('/api/ai/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: (document.getElementById('title') as HTMLInputElement)?.value || 'Untitled',
          text: content.replace(/<[^>]*>?/gm, ''), // strip html tags
        }),
      })

      if (!response.ok) throw new Error('Failed to queue')
      
      alert('Successfully sent to AI Processing Queue! The article will be analyzed in the background.')
    } catch (error) {
      console.error(error)
      alert('Failed to send to queue.')
    } finally {
      setIsQueueing(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Write New Article</h1>

      <form action={createArticle as unknown as (payload: FormData) => void} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Enter article title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" required placeholder="url-friendly-slug" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category_id">Category</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAutoCategorize}
                disabled={isCategorizing}
              >
                {isCategorizing ? 'Categorizing...' : '✨ Auto Categorize'}
              </Button>
            </div>
            <Select name="category_id" value={selectedCategory} onValueChange={(v) => setSelectedCategory(v || 'none')}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="DRAFT">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea 
            id="summary" 
            name="summary" 
            placeholder="Brief summary of the article..." 
            className="h-20"
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          {/* Hidden input to pass rich text content to FormData */}
          <input type="hidden" name="content" value={content} />
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleQueueForProcessing}
            disabled={isQueueing}
          >
            {isQueueing ? 'Queueing...' : '⏳ Send to AI Processing Queue'}
          </Button>
          <div className="flex space-x-4">
            <Button variant="outline" type="button" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit">
              Save Article
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
