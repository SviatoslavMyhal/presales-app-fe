import { Modals } from '../modals-registry'
const modals = ref(new Map())
export function useModals() {
  const openModal = (name, props) => {
    modals.value.set(name, { component: markRaw(Modals[name]()), props, isOpen: true })
  }
  const closeModal = (name) => {
    const modal = modals.value.get(name)
    if (modal) {
      modal.isOpen = false
    }
  }
  const isOpen = computed(() => [...modals.value.entries()].reduce((acc, [name, { isOpen }]) => {
    acc[name] = isOpen
    return acc
  }, {}))
  return {
    modals,
    isOpen,
    openModal,
    closeModal,
  }
}
