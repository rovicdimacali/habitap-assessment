<script setup lang="ts">
import TaskManagement from "@/components/PageComponents/TaskManagement.vue";
import DialogToCreateTask from "@/components/Dialogs/DialogToCreateTask.vue";
import { ref } from "vue";

const isCreateDialogVisible = ref(false);
</script>

<template>
  <DialogToCreateTask
    v-if="isCreateDialogVisible"
    :isVisible="isCreateDialogVisible"
    @close="isCreateDialogVisible = false"
  />
  <div class="home-page page-1000">
    <div class="header wrap">
      <div class="col">
        <h2 style="margin: 0">My Tasks</h2>
        <small>Drag and Drop the tasks to update its status</small>
      </div>

      <Button
        icon="pi pi-plus"
        label="Add Task"
        @click="isCreateDialogVisible = true"
      />
    </div>
    <div class="tasks-container">
      <TaskManagement />
    </div>
  </div>
</template>
