/**
 * useAbortController helps to abort API calls when a component is unmounted or when needed
 * @returns call - function to call an API with an abort signal
 * @returns abort - function to abort a single API call
 * @returns abortAll - function to abort all API calls
 */
export function useAbortController() {
  const abortControllers = new Map()
  function call(key, callback) {
    abort(key)
    const controller = new AbortController()
    abortControllers.set(key, controller)
    return callback(controller.signal)
  }
  function abort(key) {
    abortControllers.get(key)?.abort()
  }
  function abortAll() {
    abortControllers.forEach(controller => controller.abort())
  }
  onUnmounted(abortAll)
  return {
    call,
    abort,
    abortAll,
  }
}
