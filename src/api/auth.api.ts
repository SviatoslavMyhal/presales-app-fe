import type {
  AuthMeResponse,
  SignupLoginResponse
} from './backend-types'
import { backendApi } from './backend-client'

export async function authSignup (body: { email: string, password: string }): Promise<SignupLoginResponse> {
  const data = await backendApi.post('auth/signup', body)
  return data as SignupLoginResponse
}

export async function authLogin (body: { email: string, password: string }): Promise<SignupLoginResponse> {
  const data = await backendApi.post('auth/login', body)
  return data as SignupLoginResponse
}

export async function authMe (): Promise<AuthMeResponse> {
  const data = await backendApi.get('auth/me')
  return data as AuthMeResponse
}
