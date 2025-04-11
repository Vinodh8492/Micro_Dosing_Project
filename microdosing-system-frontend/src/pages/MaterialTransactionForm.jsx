import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper
} from "@mui/material";

const MaterialTransactionForm = () => {
  const [materials, setMaterials] = useState([]);
  const [transaction, setTransaction] = useState({
    material_id: "",
    transaction_type: "addition",
    quantity: "",
    description: "",
  });

  const navigate = useNavigate();

  // Fetch materials for dropdown
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/materials")
      .then((response) => setMaterials(response.data))
      .catch((error) => console.error("Error fetching materials:", error));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction(prev => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:5000/api/material-transactions", transaction);
      alert("Transaction added successfully!");
      navigate("/material");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <Box className="flex justify-center items-center min-h-screen bg-gray-50">
      <Paper elevation={3} className="p-6 w-full max-w-lg">
        <Typography variant="h5" gutterBottom className="font-semibold text-gray-700">
          Add Material Transaction
        </Typography>

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="material-label">Material</InputLabel>
            <Select
              labelId="material-label"
              name="material_id"
              value={transaction.material_id}
              onChange={handleChange}
            >
              <MenuItem value=""><em>Select a material</em></MenuItem>
              {materials.map((mat) => (
                <MenuItem key={mat.material_id} value={mat.material_id}>
                  {mat.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
            <Select
              labelId="transaction-type-label"
              name="transaction_type"
              value={transaction.transaction_type}
              onChange={handleChange}
            >
              <MenuItem value="addition">Addition</MenuItem>
              <MenuItem value="removal">Removal</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Quantity"
            type="number"
            name="quantity"
            value={transaction.quantity}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ step: "0.01" }}
          />

          <TextField
            label="Description"
            name="description"
            value={transaction.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="mt-4"
          >
            Add Transaction
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default MaterialTransactionForm;
