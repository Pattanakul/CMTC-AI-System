import { useState, useCallback } from 'react'
import { departmentService } from '../services'
import { Department } from '../types'
import { DepartmentFormValues, UpdateDepartmentFormValues } from '../schemas'
import { toast } from 'sonner'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await departmentService.getDepartments()
      setDepartments(data)
    } catch (err: unknown) {
      toast.error((err as Error).message || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoading(false)
    }
  }, [])

  const createDepartment = async (data: DepartmentFormValues) => {
    try {
      const newDept = await departmentService.createDepartment(data)
      setDepartments(prev => [...prev, newDept])
      toast.success('เพิ่มแผนกสำเร็จ')
      return true
    } catch (err: unknown) {
      toast.error((err as Error).message || 'เกิดข้อผิดพลาดในการเพิ่มแผนก')
      return false
    }
  }

  const updateDepartment = async (code: string, data: UpdateDepartmentFormValues) => {
    try {
      const updatedDept = await departmentService.updateDepartment(code, data)
      setDepartments(prev => prev.map(d => d.code === code ? updatedDept : d))
      toast.success('อัปเดตข้อมูลแผนกสำเร็จ')
      return true
    } catch (err: unknown) {
      toast.error((err as Error).message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
      return false
    }
  }

  const toggleStatus = async (code: string, currentStatus: boolean) => {
    try {
      let updatedDept
      if (currentStatus) {
        updatedDept = await departmentService.disableDepartment(code)
      } else {
        updatedDept = await departmentService.enableDepartment(code)
      }
      setDepartments(prev => prev.map(d => d.code === code ? updatedDept : d))
      toast.success(`เปลี่ยนสถานะเป็น ${!currentStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} สำเร็จ`)
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
    }
  }

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    toggleStatus
  }
}
