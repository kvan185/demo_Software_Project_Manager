import React, { useEffect, useState } from "react";
import tourApi from "../api/tourApi";
import TourCard from "../components/TourCard";
import { Container, Grid, Typography } from "@mui/material";

export default function HomePage() {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    tourApi.getAll().then(res => setTours(res.data));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Danh sách Tour</Typography>
      <Grid container spacing={2}>
        {tours.map(tour => (
          <Grid item xs={12} sm={6} md={4} key={tour.id}>
            <TourCard tour={tour} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
