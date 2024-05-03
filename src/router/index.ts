import { createRouter, createWebHistory } from "vue-router";
import generalRoutes from "./generalRoutes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...generalRoutes],
});

export default router;
