'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateDepartmentSchema, UpdateDepartmentFormValues } from '../schemas'
import { Department } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  department: Department | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (code: string, data: UpdateDepartmentFormValues) => Promise<boolean>
}

export function EditDepartmentDialog({ department, open, onOpenChange, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)

  const form = useForm<UpdateDepartmentFormValues>({
    resolver: zodResolver(updateDepartmentSchema),
    defaultValues: {
      name: '',
      description: '',
      phone: '',
      email: '',
      office: '',
      status: true,
    },
  })

  useEffect(() => {
    if (department && open) {
      form.reset({
        name: department.name,
        description: department.description || '',
        phone: department.phone || '',
        email: department.email || '',
        office: department.office || '',
        status: department.status,
      })
    }
  }, [department, open, form])

  const onSubmit = async (data: UpdateDepartmentFormValues) => {
    if (!department) return
    setLoading(true)
    const success = await onUpdate(department.code, data)
    setLoading(false)
    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลแผนก</DialogTitle>
          <DialogDescription>
            แก้ไขรายละเอียดของแผนก {department?.code}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>รหัสแผนก</FormLabel>
                <FormControl>
                  <Input value={department?.code || ''} disabled />
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อแผนก <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น ทรัพยากรบุคคล" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียด</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="คำอธิบายหน้าที่หรือรายละเอียดแผนก"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมลติดต่อ</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทรศัพท์</FormLabel>
                    <FormControl>
                      <Input placeholder="02-xxx-xxxx" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="office"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สถานที่ / ห้องทำงาน</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น อาคาร 1 ชั้น 2" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
