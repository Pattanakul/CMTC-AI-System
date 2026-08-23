import { z } from "zod";

export const UserRoleSchema = z.enum(["SUPER_ADMIN", "STAFF"]);
export const UserStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateUserSchema = CreateUserSchema.omit({ email: true }).partial();

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(1, "Department is required"),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type LoginCredentials = z.infer<typeof LoginSchema>;
export type RegisterCredentials = z.infer<typeof RegisterSchema>;
