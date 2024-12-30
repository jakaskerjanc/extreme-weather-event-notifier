<template>
  <div>
    <div v-if="isLoading">
      Loading...
    </div>
    <div v-if="registerStatus">
      <p>Client ID: {{ registerStatus.clientId }}</p>
      <p>Registered: {{ registerStatus.isRegistered }}</p>
    </div>
    <button
      :disabled="isRegButtonDisabled"
      @click="registerNotification(true)"
    >
      Register Notification
    </button>
    <button
      :disabled="isUnregButtonDisabled"
      @click="registerNotification(false)"
    >
      Unregister Notification
    </button>
  </div>
</template>

<script setup lang="ts">
import { initFirebase, initMessagingAndRequestNotificationPermission } from '~/src/firebase'

const clientId = ref<string | null>(null)
const registerStatus = ref<{ clientId: string, isRegistered: boolean } | null>(null)
const isLoading = ref(true)

const isRegButtonDisabled = computed(() => {
  return isLoading.value || (!!registerStatus.value && registerStatus.value.isRegistered)
})

const isUnregButtonDisabled = computed(() => {
  return isLoading.value || !(!!registerStatus.value && registerStatus.value.isRegistered)
})

initFirebase()

onMounted(async () => {
  clientId.value = await initMessagingAndRequestNotificationPermission()
  if (clientId.value) {
    await getRegisterStatus()
  }
  isLoading.value = false
})

async function registerNotification(wantsToRegister: boolean) {
  if (!clientId.value) {
    return
  }

  const result = await $fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify({ clientId: clientId.value, isRegistered: wantsToRegister }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  console.log(result)
  getRegisterStatus()
}

async function getRegisterStatus() {
  registerStatus.value = await $fetch(`/api/status/${clientId.value}`)
}
</script>
