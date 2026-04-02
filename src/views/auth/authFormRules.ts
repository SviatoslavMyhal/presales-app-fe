import type { FormRules } from 'element-plus'

export const authEmailPasswordRules: FormRules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 8, message: 'At least 8 characters', trigger: 'blur' }
  ]
}
