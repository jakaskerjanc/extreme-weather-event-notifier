import { ref } from 'vue'

type DialogStore = {
  isDialogOpen: Ref<boolean>
  openDialog: () => void
  closeDialog: () => void
  title: Ref<string>
  message: Ref<string>
}

export default (function () {
  const isDialogOpen = ref(false)

  const title = ref('')
  const message = ref('')

  function openDialog() {
    isDialogOpen.value = true
  }

  function closeDialog() {
    isDialogOpen.value = false
  }

  const instance: DialogStore = { isDialogOpen, openDialog, closeDialog, title, message }

  return () => {
    return instance
  }
})()
