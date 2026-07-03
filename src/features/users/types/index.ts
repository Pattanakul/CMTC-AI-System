export type UserRole = 'Super Admin' | 'Admin' | 'Department Admin' | 'Staff';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  department_id?: string | null;
  role_id?: string | null;
  status: UserStatus;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
  // Virtual fields when joined
  department?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    name: string;
  };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}
