<template>
  <v-app>
    <v-main>
      <div class="title">
        Extreme Weather Event Notifier
      </div>
      <slot />
      <v-dialog
        v-model="isDialogOpen"
        width="auto"
      >
        <v-card
          max-width="400"
          prepend-icon="mdi-alert"
          :text="message"
          :title="title"
        >
          <template #actions>
            <v-btn
              class="ms-auto"
              text="Ok"
              @click="closeDialog"
            />
          </template>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import useStore from '~/src/store'

const { isDialogOpen, closeDialog, title, message } = useStore()
</script>

  <style scoped>
  .title {
      font-size: 50px;
      text-align: center;
      margin-top: 50px;
  }
  </style>
