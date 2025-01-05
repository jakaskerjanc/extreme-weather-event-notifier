<template>
  <div>
    <div class="subtitle">
      List of all previous weather events in Slovenia
    </div>
    <div class="card-wrapper">
      <v-card
        v-for="(event, id) in data"
        :key="id"
        elevated
        class="card"
      >
        <v-card-title>
          <div class="card-title-wrapper">
            <span class="card-title">{{ event.title }}</span>
            <span class="card-subtitle">Severity: {{ event.severity }}</span>
          </div>
        </v-card-title>
        <v-card-text>
          <p> <b> Date and time: </b> {{ toFormattedDate(event.datetime) }} </p>
          <p> <b> Description:</b> {{ event.description }} </p>
          <p> <b> Instruction:</b> {{ event.instruction }} </p>
          <p> <b> Region:</b> {{ event.region }} </p>
          <p> <b> Source: </b>{{ event.source }} </p>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'main',
})

const { data } = await useAsyncData(
  'weatherEvents',
  () => $fetch('/api/weatherEvents'),
)

function toFormattedDate(unixtimestamp: string) {
  const date = new Date(parseInt(unixtimestamp))
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.subtitle {
  font-size: 30px;
  text-align: center;
  margin-top: 20px;
}

.card-wrapper {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.card {
  max-width: 500px;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
}

.card-subtitle {
  font-size: 15px;
  color: grey;
}

.card-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
