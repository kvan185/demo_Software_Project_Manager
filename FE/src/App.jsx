import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppHome from "./pages/HomePage";
import AddLocation from "./pages/admin/AddLocation";
import AddService from "./pages/admin/AddService";
import AddTour from "./pages/admin/AddTour";
import AddUser from "./pages/admin/AddUser";
import HomePage from "./pages/HomePage";
import LocationList from "./pages/admin/LocationList";
import ServiceList from "./pages/admin/ServiceList";
import TourList from "./pages/admin/TourList";
import UserList from "./pages/admin/UserList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/admin" element={<Dashboard />} /> */}
        <Route path="/admin/locations" element={<LocationList />} />
        <Route path="/admin/add-location" element={<AddLocation />} />
        <Route path="/admin/services" element={<ServiceList />} />
        <Route path="/admin/add-service" element={<AddService />} />
        <Route path="/admin/tours" element={<TourList />} />
        <Route path="/admin/add-tour" element={<AddTour />} />
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/admin/add-user" element={<AddUser />} />
      </Routes>      
    </Router>
  );
}

export default App;
