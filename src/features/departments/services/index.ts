import { createClient } from '@/lib/supabase/client'
import { Department } from '../types'
import { DepartmentFormValues, UpdateDepartmentFormValues } from '../schemas'

export const departmentService = {
  async getDepartments(): Promise<Department[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('code', { ascending: true })

    if (error) throw new Error(error.message)
    return data as Department[]
  },

  async getDepartment(code: string): Promise<Department> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('code', code)
      .single()

    if (error) throw new Error(error.message)
    return data as Department
  },

  async createDepartment(data: DepartmentFormValues): Promise<Department> {
    const supabase = createClient()
    
    // Check for duplicate code
    const { data: existing } = await supabase
      .from('departments')
      .select('code')
      .eq('code', data.code)
      .single()
      
    if (existing) {
      throw new Error('รหัสแผนกนี้มีอยู่ในระบบแล้ว')
    }

    const { data: newDept, error } = await supabase
      .from('departments')
      .insert([{
        ...data,
        status: data.status ?? true,
      }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return newDept as Department
  },

  async updateDepartment(code: string, data: UpdateDepartmentFormValues): Promise<Department> {
    const supabase = createClient()
    const { data: updated, error } = await supabase
      .from('departments')
      .update(data)
      .eq('code', code)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return updated as Department
  },

  async disableDepartment(code: string): Promise<Department> {
    return this.updateDepartment(code, { status: false } as Partial<Department> as UpdateDepartmentFormValues)
  },

  async enableDepartment(code: string): Promise<Department> {
    return this.updateDepartment(code, { status: true } as Partial<Department> as UpdateDepartmentFormValues)
  }
}
