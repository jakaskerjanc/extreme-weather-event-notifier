<template>
  <div>
    <div class="subtitle">
      Get notified of extreme weather events in your area
    </div>
    <div class="description">
      This app will notify you of extreme weather events in your area. You can also see all weather events in your area.
    </div>
    <div class="button-wrapper">
      <v-btn
        color="blue"
        to="/events"
      >
        See previous weather events
      </v-btn>
      <v-btn
        color="red"
        to="/notificationRegister"
      >
        Register for weather notifications
      </v-btn>
    </div>
    <v-btn
      class="docs-button"
      to="/docs"
    >
      Open API Docs
    </v-btn>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'main',
})
</script>

<style scoped>
.title {
  font-size: 50px;
  text-align: center;
  margin-top: 50px;
}

.subtitle {
  font-size: 30px;
  text-align: center;
  margin-top: 20px;
}

.description {
  font-size: 20px;
  text-align: center;
  margin-top: 20px;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 20px;
}

.docs-button {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
