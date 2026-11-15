
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const getNotifications = async () => {
  const response = await API.get("/notifications");
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};
export const updateService = (id, data) =>
    API.put(`/services/${id}`, data);

export const deleteNotification = async (id) => {
  const response = await API.delete(`/notifications/${id}`);
  return response.data;
};

export const getServices = async () => {
  const response = await API.get("/services");
  return response.data;
};

export const addService = async (service) => {
  const response = await API.post("/services", service);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await API.delete(`/services/${id}`);
  return response.data;
};

export const getHistory = async (id) => {
  const response = await API.get(`/monitoring/${id}/history`);
  return response.data;
};

export const checkService = async (id) => {
  const response = await API.post(`/monitoring/${id}/check`);
  return response.data;
};

export default API;
