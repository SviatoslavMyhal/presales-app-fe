import { callLiveAssistStream } from '@/api/deal.api'
import { formatApiError } from '@/utils/api-error'
import { ref, shallowRef } from 'vue'

export function useLiveAssistStream() {
  const streaming = ref(false)
  const streamedText = ref('')
  const error = ref<string | null>(null)
  const abort = shallowRef<AbortController | null>(null)

  async function start(body: { transcript: string, job_post?: string }) {
    abort.value?.abort()
    const ctrl = new AbortController()
    abort.value = ctrl
    streaming.value = true
    streamedText.value = ''
    error.value = null
    try {
      await callLiveAssistStream(
        body,
        {
          onToken: (t) => {
            streamedText.value += t
          },
          onDone: () => {
            streaming.value = false
          },
          onError: (e) => {
            error.value = e.message
            streaming.value = false
          },
        },
        ctrl.signal,
      )
    }
    catch (e) {
      error.value = formatApiError(e)
      streaming.value = false
    }
    finally {
      if (abort.value === ctrl) {
        abort.value = null
      }
    }
  }

  function stop() {
    abort.value?.abort()
    streaming.value = false
  }

  return {
    streaming,
    streamedText,
    error,
    start,
    stop,
  }
}
