import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Tailwind Merge ─────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date Formatting ────────────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'เมื่อกี้'
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`
  return formatDate(date)
}

// ─── Text Utilities ─────────────────────────────────────────────────────────────

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// ─── Validation Utilities ────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ─── Array Utilities ─────────────────────────────────────────────────────────────

export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  return [...new Map(arr.map((item) => [item[key], item])).values()]
}
