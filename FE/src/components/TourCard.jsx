import { Card, CardContent, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function TourCard({ tour }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{tour.title}</Typography>
        <Typography variant="body2">{tour.short_description}</Typography>
        <Typography variant="subtitle1" color="primary">
          {tour.price.toLocaleString()} VND
        </Typography>
        <Button component={Link} to={`/tours/${tour.id}`} variant="contained" sx={{ mt: 1 }}>
          Xem chi tiết
        </Button>
      </CardContent>
    </Card>
  );
}
