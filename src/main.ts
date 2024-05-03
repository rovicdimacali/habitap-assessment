import "./assets/style.scss";

import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

import PrimeVue from "primevue/config";
import "primevue/resources/themes/aura-light-green/theme.css";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";

import draggable from "vuedraggable";

import Button from "primevue/button";
import Card from "primevue/card";
import Toast from "primevue/toast";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import ConfirmPopup from "primevue/confirmpopup";

const app = createApp(App);

app.use(router);
app.use(ToastService);
app.use(ConfirmationService);

app.use(PrimeVue, { ripple: true });

app.component("draggable", draggable);

app.component("Button", Button);
app.component("Card", Card);
app.component("Toast", Toast);
app.component("Dialog", Dialog);
app.component("InputText", InputText);
app.component("Message", Message);
app.component("Dropdown", Dropdown);
app.component("Calendar", Calendar);
app.component("ConfirmPopup", ConfirmPopup);

app.mount("#app");
