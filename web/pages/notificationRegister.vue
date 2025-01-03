<template>
  <div>
    <div class="status">
      <div v-if="isLoading">
        Loading...
      </div>
      <div v-else-if="error">
        Error: Notification permission not granted - alerts will not work
      </div>
      <v-card v-else-if="registerStatus">
        <v-card-title> Notification Status </v-card-title>
        <v-card-text>
          <p> Client ID: {{ registerStatus.clientId }} </p>
          <p> Notifications enabled: {{ registerStatus.registered }} </p>
        </v-card-text>
      </v-card>
    </div>
    <div class="button-wrapper">
      <v-btn
        :disabled="isRegButtonDisabled"
        @click="registerNotification(true)"
      >
        Enable Notifications
      </v-btn>
      <v-btn
        :disabled="isUnregButtonDisabled"
        @click="registerNotification(false)"
      >
        Disable Notifications
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initFirebase, initMessagingAndRequestNotificationPermission } from '~/src/firebase'

const clientId = ref<string | null>(null)
const registerStatus = ref<{ clientId: string, isRegistered: boolean } | null>(null)
const isLoading = ref(true)
const error = ref<boolean>(false)

const isRegButtonDisabled = computed(() => {
  return isLoading.value || (!!registerStatus.value && registerStatus.value.isRegistered)
})

const isUnregButtonDisabled = computed(() => {
  return isLoading.value || !(!!registerStatus.value && registerStatus.value.isRegistered)
})

initFirebase()

onMounted(async () => {
  try {
    clientId.value = await initMessagingAndRequestNotificationPermission()
  }
  catch (e) {
    console.error(e)
    error.value = true
  }

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

<style scoper>
.button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 20px;
}

.status {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
