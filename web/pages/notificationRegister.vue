<template>
  <div>
    notificationRegister.vue
    <button @click="registerNotification">
      Register Notification
    </button>
  </div>
</template>

<script setup lang="ts">
async function registerNotification() {
  const { data } = await $fetch('/api/register')
  console.log(data)
}
</script>
