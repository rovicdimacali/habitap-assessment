<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { tasksService } from "@/services/tasksService";
import { useToast } from "primevue/usetoast";
import { required, helpers } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";

interface UpdateForm {
  title: string;
  description: string;
  due_date: Date; // Ensure this is a Date object
  status: string;
}

const toast = useToast();

const props = defineProps({
  task: Object,
  isVisible: Boolean,
});
const emit = defineEmits(["close", "update:isVisible", "submit"]);

const localVisible = ref(false);
const updateForm = ref<UpdateForm>({
  title: "",
  description: "",
  due_date: new Date(), // Initialize with a Date object
  status: "",
});
const errors = ref();
const isLoading = ref(false);
const statusOptions = ["Pending", "In Progress", "Completed", "Cancelled"];

const updateFormRules = {
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

const v$ = useVuelidate(updateFormRules, updateForm);

// Define validation rules

const updateTask = async (id: string, obj: object) => {
  const result = await v$.value.$validate();
  isLoading.value = true;
  if (!result) {
    errors.value = v$.value.$errors.map((error) => error.$message);
    isLoading.value = false;
    console.log(errors.value);
  } else {
    try {
      await tasksService.updateTask(id, obj);
      toast.add({
        severity: "info",
        summary: "Updated",
        detail: "Task Title Updated",
        life: 3000,
      });
      emit("submit");
    } catch (error) {
      console.error(error);
      errors.value = error;
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "An error has occured",
        life: 3000,
      });
    } finally {
      isLoading.value = false;
    }
  }
};

const hideDialog = () => {
  localVisible.value = false;
  // Emitting 'close' event directly, no need for `this.$emit`
  emit("close");
};

const formatDate = (date: Date) => {
  const dateToFormat = new Date(date);
  return dateToFormat;
};

watch(
  () => props.isVisible,
  (newVal) => {
    localVisible.value = newVal;
    console.log(localVisible.value);
  },
  { immediate: true }
);

watch(localVisible, (newVal) => {
  emit("update:isVisible", newVal);
});

watch(
  () => props.task,
  (newVal) => {
    // Do something with the new value of task
    updateForm.value.title = newVal?.title;
    updateForm.value.description = newVal?.description;
    updateForm.value.due_date = formatDate(newVal?.due_date);
    updateForm.value.status = newVal?.status;
  },
  { immediate: true }
);
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
        <InputText v-model="updateForm.title" placeholder="Enter Task Title" />
      </div>
      <div class="input-container col" style="width: 100%; gap: 5px">
        <label for="description">Description</label>
        <InputText
          v-model="updateForm.description"
          placeholder="Enter Task Description"
        />
      </div>
      <div
        class="input-container col"
        style="flex-grow: 1; flex-basis: 350px; gap: 5px"
      >
        <label for="status">Status</label>
        <Dropdown
          v-model="updateForm.status"
          :options="statusOptions"
          placeholder="Select Status"
        />
      </div>
      <div
        class="input-container col"
        style="flex-grow: 1; flex-basis: 350px; gap: 5px"
      >
        <label for="due_date">Due Date</label>
        <Calendar v-model="updateForm.due_date" dateFormat="yy/mm/dd" />
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
        <Button
          :loading="isLoading"
          icon="pi pi-check"
          label="Submit"
          @click="updateTask(task?.id, updateForm)"
        />
      </div>
    </template>
  </Dialog>
</template>
