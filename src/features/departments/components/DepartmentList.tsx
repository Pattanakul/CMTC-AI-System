'use client'

import { useState, useMemo } from 'react'
import { Department } from '../types'
import { formatDateTime } from '@/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, MoreHorizontal, Edit, Power, PowerOff, ArrowUpDown } from 'lucide-react'

interface Props {
  departments: Department[]
  loading: boolean
  onEdit: (department: Department) => void
  onToggleStatus: (code: string, currentStatus: boolean) => void
}

export function DepartmentList({ departments, loading, onEdit, onToggleStatus }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Department>('code')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  const [confirmStatus, setConfirmStatus] = useState<{ open: boolean; dept: Department | null }>({
    open: false,
    dept: null,
  })

  // Search & Sort logic
  const filteredAndSorted = useMemo(() => {
    let result = departments

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(
        (d) =>
          d.code.toLowerCase().includes(lower) ||
          d.name.toLowerCase().includes(lower) ||
          d.email?.toLowerCase().includes(lower)
      )
    }

    result.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      
      if (aVal === null) aVal = ''
      if (bVal === null) bVal = ''

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [departments, searchTerm, sortField, sortDirection])

  const handleSort = (field: keyof Department) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleConfirmToggle = () => {
    if (confirmStatus.dept) {
      onToggleStatus(confirmStatus.dept.code, confirmStatus.dept.status)
    }
    setConfirmStatus({ open: false, dept: null })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="ค้นหารหัส, ชื่อแผนก, อีเมล..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500">
          พบทั้งหมด {filteredAndSorted.length} รายการ
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort('code')}>
                <div className="flex items-center gap-1">
                  รหัส <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  ชื่อแผนก <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>ติดต่อ</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  สถานะ <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>วันที่เพิ่ม</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredAndSorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  ไม่พบข้อมูลแผนก
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSorted.map((dept) => (
                <TableRow key={dept.code} className={!dept.status ? 'bg-slate-50/50 opacity-75' : ''}>
                  <TableCell className="font-medium">{dept.code}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{dept.name}</span>
                      {dept.office && <span className="text-xs text-slate-500">ห้อง: {dept.office}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-slate-600">
                      {dept.email && <span>{dept.email}</span>}
                      {dept.phone && <span>{dept.phone}</span>}
                      {!dept.email && !dept.phone && <span className="text-slate-400">-</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dept.status ? 'default' : 'secondary'}
                           className={dept.status ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 text-slate-600 hover:bg-slate-400'}>
                      {dept.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {formatDateTime(dept.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => window.location.href = `/departments/${dept.code}`}>
                          <Search className="mr-2 h-4 w-4" /> ดูรายละเอียด
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(dept)}>
                          <Edit className="mr-2 h-4 w-4" /> แก้ไขข้อมูล
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setConfirmStatus({ open: true, dept })}
                          className={dept.status ? 'text-orange-600' : 'text-emerald-600'}
                        >
                          {dept.status ? (
                            <><PowerOff className="mr-2 h-4 w-4" /> ปิดใช้งานแผนก</>
                          ) : (
                            <><Power className="mr-2 h-4 w-4" /> เปิดใช้งานแผนก</>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={confirmStatus.open} onOpenChange={(val) => !val && setConfirmStatus({ open: false, dept: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการเปลี่ยนสถานะ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการ{confirmStatus.dept?.status ? 'ปิด' : 'เปิด'}ใช้งานแผนก {confirmStatus.dept?.name} ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmToggle}
              className={confirmStatus.dept?.status ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
