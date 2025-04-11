import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";
import axios from "axios";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Paper,
  FormHelperText,
} from "@mui/material";

const StorageForm = () => {
  const navigate = useNavigate();
  const [material, setMaterial] = useState({
    title: "",
    description: "",
    unit_of_measure: "",
    current_quantity: 0,
    minimum_quantity: 0,
    maximum_quantity: 0,
    plant_area_location: "",
    barcode_id: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [barcodeImage, setBarcodeImage] = useState("");

  const generateBarcodeId = () => {
    if (!material.title) {
      setErrors({
        ...errors,
        title: "Material name is required to generate barcode",
      });
      return;
    }

    const randomNum = Math.floor(Math.random() * 9000000000000) + 1000000000000;
    const barcodeId = randomNum.toString();

    const canvas = document.createElement("canvas");
    try {
      JsBarcode(canvas, barcodeId, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12,
        background: "#2D3748",
        lineColor: "#FFFFFF",
        margin: 10,
        font: "monospace",
      });
      const barcodeUrl = canvas.toDataURL();
      setBarcodeImage(barcodeUrl);
      setMaterial({ ...material, barcode_id: barcodeId });
    } catch (error) {
      setErrors({
        ...errors,
        barcode_id: "Error generating barcode. Please try again.",
      });
    }
  };

  const handleChange = (e) => {
    setMaterial({ ...material, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/materials",
        material
      );
      console.log("Material added:", response.data);
      navigate(-1);
    } catch (error) {
      console.error("Error adding material:", error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add Storage
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Storage Name"
                name="title"
                value={material.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                required
                rows={3}
                label=" Storage Description"
                name="description"
                value={material.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required sx={{ minWidth: "200px" }}>
                <InputLabel>Unit of Measure</InputLabel>
                <Select
                  name="unit_of_measure"
                  value={material.unit_of_measure}
                  onChange={handleChange}
                >
                  <MenuItem value="Kilogram (kg)">Kilogram (kg)</MenuItem>
                  <MenuItem value="Gram (g)">Gram (g)</MenuItem>
                  <MenuItem value="Milligram (mg)">Milligram (mg)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Location"
                name="plant_area_location"
                value={material.plant_area_location}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Quantity Information */}
          <Typography variant="h6" mt={4} gutterBottom>
            Quantity Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="Current Quantity"
                name="current_quantity"
                value={material.current_quantity}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="Minimum Quantity"
                name="minimum_quantity"
                value={material.minimum_quantity}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="Maximum Quantity"
                name="maximum_quantity"
                value={material.maximum_quantity}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Barcode */}
          <Typography variant="h6" mt={4} gutterBottom>
            Barcode Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {barcodeImage ? (
                  <Box
                    component="img"
                    src={barcodeImage}
                    alt="Barcode"
                    sx={{ height: 60 }}
                  />
                ) : (
                  <Typography>No barcode generated</Typography>
                )}
                <Button variant="contained" onClick={generateBarcodeId}>
                  Generate Barcode
                </Button>
              </Box>
              {errors.barcode_id && (
                <FormHelperText error>{errors.barcode_id}</FormHelperText>
              )}
            </Grid>
          </Grid>

          {/* Status */}
          <Typography variant="h6" mt={4} gutterBottom>
            Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl sx={{ minWidth: "200px" }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={material.status}
                  onChange={handleChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Create Storage
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default StorageForm;
