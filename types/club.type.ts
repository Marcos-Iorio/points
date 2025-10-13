export interface IClub {
  id: string
  auth_user_id: string
  name: string
  email: string
  phone?: string
  address?: string
  status?: 'pending' | 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface IClubFormData {
  name: string
  email: string
  phone?: string
  address?: string
}
