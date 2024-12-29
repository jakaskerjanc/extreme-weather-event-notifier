<template>
  <div>
    <div v-if="registerStatus">
      <p>Client ID: {{ registerStatus.clientId }}</p>
      <p>Registered: {{ registerStatus.isRegistered }}</p>
    </div>
    <button @click="registerNotification">
      Register Notification
    </button>
  </div>
</template>

<script setup lang="ts">
const clientId = 'test-client-id'

const registerStatus = ref<{ clientId: string, isRegistered: boolean } | null>(null)

async function getRegisterStatus() {
  registerStatus.value = await $fetch(`/api/status/${clientId}`)
}

onMounted(() => {
  getRegisterStatus()
})

async function registerNotification() {
  const result = await $fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify({ clientId }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  console.log(result)
  getRegisterStatus()
}
</script>
