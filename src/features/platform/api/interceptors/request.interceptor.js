import { parseDynamicKeys } from '../helpers'
// TODO: the following code is just an example. Please write your own project specific interceptors
const requestInterceptor = (requestConfig) => {
  // if (requestConfig.headers) {
  //   requestConfig.headers.Authorization = `Bearer ${await authStore.getToken()}`
  // }
  if (requestConfig.url) {
    requestConfig.url = parseDynamicKeys(requestConfig.url, requestConfig.dynamicKeys)
  }
  return requestConfig
}
const requestErrorInterceptor = (error) => {
  return Promise.reject(error)
}
export { requestInterceptor, requestErrorInterceptor }
