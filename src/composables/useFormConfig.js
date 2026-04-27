// --------------------------------------------- F O R M  R E F --------------------------------------------------------
export function useElFormRef(initialValue) {
  return ref(initialValue)
}
// --------------------------------------------- F O R M  M O D E L ----------------------------------------------------
export function useElFormModel(model) {
  return reactive(model)
}
// ------------------------------------------- F O R M  R U L E S ------------------------------------------------------
export function useElFormRules(model) {
  return ref(model)
}
export function useRequiredRule({ required = true } = {}) {
  return { required, message: 'Required field', trigger: 'change' }
}
export function useEmailRule() {
  return { type: 'email', message: 'Invalid email', trigger: ['change', 'blur'] }
}
export function useMinLenRule(min) {
  return { min, message: `Minimum ${min} characters`, trigger: 'change' }
}
export function useMaxLenRule(max) {
  return { max, message: `Maximum ${max} characters`, trigger: 'change' }
}
