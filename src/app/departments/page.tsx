'use client'

import { useEffect, useState } from 'react'
import { useDepartments } from '@/features/departments/hooks/useDepartments'
import { DepartmentList } from '@/features/departments/components/DepartmentList'
import { CreateDepartmentDialog } from '@/features/departments/components/CreateDepartmentDialog'
import { EditDepartmentDialog } from '@/features/departments/components/EditDepartmentDialog'
import { Department } from '@/features/departments/types'
import { Building2 } from 'lucide-react'

export default function DepartmentsPage() {
  const { 
    departments, 
    loading, 
    fetchDepartments, 
    createDepartment, 
    updateDepartment, 
    toggleStatus 
  } = useDepartments()

  const [editDept, setEditDept] = useState<Department | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const handleEdit = (dept: Department) => {
    setEditDept(dept)
    setEditOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-500" />
            จัดการแผนก
          </h1>
          <p className="text-slate-500 mt-1">
            จัดการข้อมูลแผนกในองค์กร เพิ่ม แก้ไข หรือเปิด/ปิดการใช้งาน
          </p>
        </div>
        <CreateDepartmentDialog onCreate={createDepartment} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <DepartmentList 
          departments={departments}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={toggleStatus}
        />
      </div>

      <EditDepartmentDialog
        department={editDept}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={updateDepartment}
      />
    </div>
  )
}
