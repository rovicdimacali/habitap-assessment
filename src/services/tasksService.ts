import axios from "axios";

export const tasksService = {
  getTasks: async () => {
    const response = await axios.get(`http://localhost:3000/tasks`);
    return response.data;
  },

  createTask: async (obj: object) => {
    const response = await axios.post(`http://localhost:3000/tasks`, obj);
    return response.data;
  },

  updateTask: async (id: string, obj: object) => {
    const response = await axios.patch(
      `http://localhost:3000/tasks/${id}/`,
      obj
    );
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await axios.delete(`http://localhost:3000/tasks/${id}/`);
    return response.data;
  },
};
