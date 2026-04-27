const responseInterceptor = (response) => {
  return response.data
}
const errorInterceptor = (error) => {
  return Promise.reject(error)
}
export { responseInterceptor, errorInterceptor }
