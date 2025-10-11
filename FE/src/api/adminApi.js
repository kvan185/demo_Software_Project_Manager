import axios from "axios";

const BASE_URL = "http://localhost:8088/api/admin";

const adminApi = {
  // Location
  addLocation: (data) => axios.post(`${BASE_URL}/locations/add-location`, data),
  getLocations: () => axios.get(`${BASE_URL}/locations`),  
  updateLocation: (id, data) => axios.put(`${BASE_URL}/locations/${id}`, data),
  deleteLocation: (id) => axios.delete(`${BASE_URL}/locations/${id}`),

  // Service
  addService: (data) => axios.post(`${BASE_URL}/services/add-service`, data),
  getServices: () => axios.get(`${BASE_URL}/services`),
  updateService: (id, data) => axios.put(`${BASE_URL}/services/${id}`, data),
  deleteService: (id) => axios.delete(`${BASE_URL}/services/${id}`),

  // Tour
  addTour: (data) => axios.post(`${BASE_URL}/tours/add-tour`, data),
  getTours: () => axios.get(`${BASE_URL}/tours`),
  updateTour: (id, data) => axios.put(`${BASE_URL}/tours/${id}`, data),
  deleteTour: (id) => axios.delete(`${BASE_URL}/tours/${id}`),
  
  // User
  addUser: (data) => axios.post(`${BASE_URL}/users/add-user`, data),
  getUsers: () => axios.get(`${BASE_URL}/users`),
  updateUser: (id, data) => axios.put(`${BASE_URL}/users/${id}`, data),
  deleteUser: (id) => axios.delete(`${BASE_URL}/users/${id}`),
};

export default adminApi;
