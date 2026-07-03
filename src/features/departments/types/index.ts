export interface Department {
  id: string
  code: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  office: string | null
  status: boolean
  created_at: string
  updated_at: string
}
