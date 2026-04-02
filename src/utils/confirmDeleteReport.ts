import { ElMessageBox } from 'element-plus'

/**
 * Dark-themed confirmation for removing a saved report. Resolves if user confirms;
 * rejects with `'cancel'` if dismissed (same as ElMessageBox.confirm).
 */
export function confirmDeleteReport (title: string): Promise<void> {
  const label = title.trim() || 'Untitled report'
  return ElMessageBox.confirm(
    `“${label}” will be permanently removed from your workspace. This action cannot be undone.`,
    'Delete this report?',
    {
      confirmButtonText: 'Delete report',
      cancelButtonText: 'Cancel',
      type: 'warning',
      customClass: 'presales-msgbox presales-msgbox--danger',
      modalClass: 'presales-msgbox__backdrop',
      confirmButtonClass: 'presales-msgbox__btn-confirm',
      cancelButtonClass: 'presales-msgbox__btn-cancel',
      distinguishCancelAndClose: true,
      showClose: true,
      autofocus: false
    }
  ).then(() => {
    /* confirmed */
  })
}
