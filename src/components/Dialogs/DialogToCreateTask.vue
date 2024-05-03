<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { tasksService } from "@/services/tasksService";
import { useToast } from "primevue/usetoast";
import { required, helpers } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { EventBus } from "@/services/EventBus";
import { v4 as uuidv4 } from "uuid";

interface TaskForm {
  id: string;
  title: string;
  description: string;
  due_date: Date; // Ensure this is a Date object
  status: string;
}

const toast = useToast();

const props = defineProps({
  isVisible: Boolean,
});
const emit = defineEmits(["close", "update:isVisible"]);

const localVisible = ref(false);
const taskForm = ref<TaskForm>({
  id: "",
  title: "",
  description: "",
  due_date: new Date(),
  status: "",
});
const errors = ref();
const isLoading = ref(false);
const statusOptions = ["Pending", "In Progress", "Completed", "Cancelled"];

const taskFormRules = {
  title: {
    required: helpers.withMessage("Title is required", required),
  },
  description: {
    required: helpers.withMessage("Description is required", required),
  },
  due_date: {
    required: helpers.withMessage("Due Date is required", required),
  },
  status: {
    required: helpers.withMessage("Status is required", required),
  },
};

const v$ = useVuelidate(taskFormRules, taskForm);

// Define validation rules

const createTask = async () => {
  taskForm.value.id = uuidv4();
  const result = await v$.value.$validate();
  if (!result) {
    errors.value = v$.value.$errors.map((error) => error.$message);
    isLoading.value = false;
    console.log(errors.value);
  } else {
    try {
      await tasksService.createTask(taskForm.value);
      toast.add({
        severity: "success",
        summary: "Created",
        detail: "Task Created",
        life: 3000,
      });
      EventBus.emit("task created");
      emit("close");
    } catch (error) {
      console.error(error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "An error has occured",
        life: 3000,
      });
    }
  }
};

const hideDialog = () => {
  localVisible.value = false;
  // Emitting 'close' event directly, no need for `this.$emit`
  emit("close");
};

watch(
  () => props.isVisible,
  (newVal) => {
    localVisible.value = newVal;
    taskForm.value.status = "Pending";
  },
  { immediate: true }
);

watch(localVisible, (newVal) => {
  emit("update:isVisible", newVal);
});
</script>
<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    header="Update Task"
    :style="{ width: '70vw' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    @hide="hideDialog"
    class="dialog-add-task"
  >
    <Message v-if="errors" severity="error">
      <ul v-if="Array.isArray(errors)" class="error-container">
        <li v-for="error in errors" :key="error" class="error">
          {{ error }}
        </li>
      </ul>
      <small v-else class="error">{{ errors }}</small>
    </Message>
    <form class="wrap" style="gap: 10px">
      <div class="input-container col" style="width: 100%; gap: 5px">
        <label for="title">Title</label>
        <InputText v-model="taskForm.title" placeholder="Enter Task Title" />
      </div>
      <div class="input-container col" style="width: 100%; gap: 5px">
        <label for="description">Description</label>
        <InputText
          v-model="taskForm.description"
          placeholder="Enter Task Description"
        />
      </div>
      <div
        class="input-container col"
        style="flex-grow: 1; flex-basis: 350px; gap: 5px"
      >
        <label for="status">Status</label>
        <Dropdown
          v-model="taskForm.status"
          :options="statusOptions"
          placeholder="Select Status"
        />
      </div>
      <div
        class="input-container col"
        style="flex-grow: 1; flex-basis: 350px; gap: 5px"
      >
        <label for="due_date">Due Date</label>
        <Calendar v-model="taskForm.due_date" dateFormat="yy/mm/dd" />
      </div>
    </form>
    <template #footer>
      <div
        class="action row"
        style="align-items: center; justify-content: end; gap: 5px"
      >
        <Button
          icon="pi pi-times"
          label="Close"
          severity="secondary"
          @click="emit('close')"
        />
        <Button icon="pi pi-check" label="Submit" @click="createTask" />
      </div>
    </template>
  </Dialog>
</template>
