import axiosClient from "./axiosClient";

const tourApi = {
  getAll: () => axiosClient.get("/tours"),
  getById: (id) => axiosClient.get(`/tours/${id}`),
};

export default tourApi;
