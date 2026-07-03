import { z } from 'zod'

export const departmentSchema = z.object({
  code: z.string().min(1, 'ระบุรหัสแผนก'),
  name: z.string().min(1, 'ระบุชื่อแผนก'),
  description: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')).nullable(),
  office: z.string().optional().nullable(),
  status: z.boolean(),
})

export type DepartmentFormValues = z.infer<typeof departmentSchema>

export const updateDepartmentSchema = departmentSchema.omit({ code: true })

export type UpdateDepartmentFormValues = z.infer<typeof updateDepartmentSchema>
