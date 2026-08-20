export interface User {
  id: number
  name: string
  email: string
  role: string
  profile_photo?: string
  profile_completed?: boolean
  created_at: string
  updated_at: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}
