import axiosClient from "./axiosClient";

const bookingApi = {
  create: (data) => axiosClient.post("/bookings", data),
  getByCustomer: (id) => axiosClient.get(`/bookings/customer/${id}`),
};

export default bookingApi;
