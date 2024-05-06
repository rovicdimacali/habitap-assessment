<script setup lang="ts">
import { tasksService } from "@/services/tasksService";
import { onMounted, ref } from "vue";
import DialogToUpdateTask from "../Dialogs/DialogToUpdateTask.vue";
import { EventBus } from "@/services/EventBus";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();
interface Task {
  id: string;
  title: string;
  description: string;
  due_date: Date;
  priority: string;
  status: string;
}

interface DraggableChangeEvent {
  added?: {
    newIndex: number;
    element: {
      id: string;
      title: string;
      description: string;
      due_date: string;
      priority: string;
      status: string;
    };
  };
  removed?: {
    oldIndex: number;
    element: {
      id: string;
      title: string;
      description: string;
      due_date: string;
      priority: string;
      status: string;
    };
  };
}

const tasks = ref<Task[]>([]);
const pendingTasks = ref<Task[]>([]);
const inProgressTasks = ref<Task[]>([]);
const completedTasks = ref<Task[]>([]);
const cancelledTasks = ref<Task[]>([]);
const selectedTask = ref({});
const isUpdateDialogVisible = ref(false);

const fetchTasks = async () => {
  try {
    const response = await tasksService.getTasks();
    tasks.value = response || [];
    pendingTasks.value = tasks.value.filter(
      (task) => task.status === "Pending"
    );
    inProgressTasks.value = tasks.value.filter(
      (task) => task.status === "In Progress"
    );
    completedTasks.value = tasks.value.filter(
      (task) => task.status === "Completed"
    );
    cancelledTasks.value = tasks.value.filter(
      (task) => task.status === "Cancelled"
    );
  } catch (error) {
    console.error(error);
  }
};

const updateTask = async (id: string, obj: object) => {
  try {
    await tasksService.updateTask(id, obj);
    toast.add({
      severity: "info",
      summary: "Updated",
      detail: "Task Status Updated",
      life: 3000,
    });
    fetchTasks();
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "An error has occured",
      life: 3000,
    });
  }
};

const update = async (event: DraggableChangeEvent, status: string) => {
  try {
    const addedTask = event.added?.element;

    if (addedTask) {
      // If a task is added to a container, update its status
      await updateTask(addedTask.id, { status: status });
    }
  } catch (error) {
    console.error(error);
  }
};

const deletetTask = async (id: string) => {
  try {
    await tasksService.deleteTask(id);
    toast.add({
      severity: "info",
      summary: "Confirmed",
      detail: "Task deleted",
      life: 3000,
    });
    fetchTasks();
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "An error has occured",
      life: 3000,
    });
  }
};

const handleAddDialogVisible = (element: object) => {
  console.log("hello", element);
  selectedTask.value = element;
  isUpdateDialogVisible.value = true;
  console.log(isUpdateDialogVisible.value);
};

const handleDelete = (event: Event, element: Task) => {
  console.log(element);

  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Do you want to delete this task?",
    icon: "pi pi-info-circle",
    rejectClass: "p-button-secondary p-button-outlined p-button-sm",
    acceptClass: "p-button-danger p-button-sm",
    rejectLabel: "Cancel",
    acceptLabel: "Delete",
    accept: () => {
      deletetTask(element?.id);
    },
    reject: () => {},
  });
};

const formatDate = (date: Date) => {
  const dateToFormat = new Date(date);
  return dateToFormat.toLocaleDateString();
};

onMounted(async () => {
  fetchTasks();
  EventBus.on("task created", () => {
    fetchTasks();
  });
});
</script>

<template>
  <!-- eslint-disable -->
  <Toast />
  <ConfirmPopup />
  <DialogToUpdateTask
    v-if="isUpdateDialogVisible"
    :isVisible="isUpdateDialogVisible"
    :task="selectedTask"
    @close="isUpdateDialogVisible = false"
    @submit="
      () => {
        fetchTasks();
        isUpdateDialogVisible = false;
      }
    "
  />
  <div class="task-management-container wrap" style="align-items: stretch">
    <div class="pending tasks-col col">
      <h3>Pending Tasks</h3>
      <draggable
        class="list-group"
        :list="pendingTasks"
        group="people"
        itemKey="id"
        @change="(event: DraggableChangeEvent) => update(event, 'Pending')"
      >
        <template #item="{ element }">
          <Card class="pending-card card">
            <template #content>
              <p style="margin: 0 0 10px 0; font-weight: 700">
                {{ element.title }}
              </p>
              <small>{{ element.description }}</small>
              <div
                class="row"
                style="
                  justify-content: end;
                  align-items: center;
                  padding: 20px 0 0 0;
                "
              >
                <small
                  >Due Date:
                  <span style="font-weight: 700">{{
                    formatDate(element.due_date)
                  }}</span></small
                >
              </div>
              <div class="action-btns row">
                <Button
                  icon="pi pi-pencil"
                  class="edit-btn"
                  rounded
                  @click="handleAddDialogVisible(element)"
                ></Button>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  class="delete-btn"
                  rounded
                  @click="handleDelete($event, element)"
                ></Button>
              </div>
            </template>
          </Card>
        </template>
      </draggable>
    </div>
    <div class="in-progress tasks-col col">
      <h3>In Progress Tasks</h3>
      <draggable
        class="list-group"
        :list="inProgressTasks"
        group="people"
        itemKey="id"
        @change="(event: DraggableChangeEvent) => update(event, 'In Progress')"
      >
        <template #item="{ element }">
          <Card class="in-progress-card card">
            <template #content>
              <p style="margin: 0 0 10px 0; font-weight: 700">
                {{ element.title }}
              </p>
              <small>{{ element.description }}</small>
              <div
                class="row"
                style="
                  justify-content: end;
                  align-items: center;
                  padding: 20px 0 0 0;
                "
              >
                <small
                  >Due Date:
                  <span style="font-weight: 700">{{
                    formatDate(element.due_date)
                  }}</span></small
                >
              </div>
              <div class="action-btns row">
                <Button
                  icon="pi pi-pencil"
                  class="edit-btn"
                  rounded
                  @click="handleAddDialogVisible(element)"
                ></Button>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  class="delete-btn"
                  rounded
                  @click="handleDelete($event, element)"
                ></Button>
              </div>
            </template>
          </Card>
        </template>
      </draggable>
    </div>
    <div class="completed tasks-col col">
      <h3>Completed Tasks</h3>
      <draggable
        class="list-group"
        :list="completedTasks"
        group="people"
        itemKey="id"
        @change="(event: DraggableChangeEvent) => update(event, 'Completed')"
      >
        <template #item="{ element }">
          <Card class="completed-card card">
            <template #content>
              <p style="margin: 0 0 10px 0; font-weight: 700">
                {{ element.title }}
              </p>
              <small>{{ element.description }}</small>
              <div
                class="row"
                style="
                  justify-content: end;
                  align-items: center;
                  padding: 20px 0 0 0;
                "
              >
                <small
                  >Due Date:
                  <span style="font-weight: 700">{{
                    formatDate(element.due_date)
                  }}</span></small
                >
              </div>
              <div class="action-btns row">
                <Button
                  icon="pi pi-pencil"
                  class="edit-btn"
                  rounded
                  @click="handleAddDialogVisible(element)"
                ></Button>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  class="delete-btn"
                  rounded
                  @click="handleDelete($event, element)"
                ></Button>
              </div>
            </template>
          </Card>
        </template>
      </draggable>
    </div>
    <div class="cancelled tasks-col col">
      <h3>Cancelled Tasks</h3>
      <draggable
        class="list-group"
        :list="cancelledTasks"
        group="people"
        itemKey="id"
        @change="(event: DraggableChangeEvent) => update(event, 'Cancelled')"
      >
        <template #item="{ element }">
          <Card class="cancelled-card card">
            <template #content>
              <p style="margin: 0 0 10px 0; font-weight: 700">
                {{ element.title }}
              </p>
              <small>{{ element.description }}</small>
              <div
                class="row"
                style="
                  justify-content: end;
                  align-items: center;
                  padding: 20px 0 0 0;
                "
              >
                <small
                  >Due Date:
                  <span style="font-weight: 700">{{
                    formatDate(element.due_date)
                  }}</span></small
                >
              </div>
              <div class="action-btns row">
                <Button
                  icon="pi pi-pencil"
                  class="edit-btn"
                  rounded
                  @click="handleAddDialogVisible(element)"
                ></Button>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  class="delete-btn"
                  rounded
                  @click="handleDelete($event, element)"
                ></Button>
              </div>
            </template>
          </Card>
        </template>
      </draggable>
    </div>
  </div>
</template>
