import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Typography,
  Paper,
} from "@mui/material";

const RecipeEditForm = () => {
  const { recipe_id } = useParams();
  const [recipe, setRecipe] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    status: "draft",
  });

const navigate = useNavigate()

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5000/api/recipes/${recipe_id}`)
      .then((response) => {
        setRecipe(response.data);
      })
      .catch((error) => {
        console.error("Error fetching recipe:", error);
      });
  }, [recipe_id]);

  const handleChange = (e) => {
    setRecipe({ ...recipe, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://127.0.0.1:5000/api/recipes/${recipe_id}`, recipe)
      .then(() => {
        alert("Recipe updated successfully");
        navigate('/recipes')
      })
      .catch((error) => {
        console.error("Error updating recipe:", error);
      });
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, margin: "auto", mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>
        Edit Recipe
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={recipe.name}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Code"
          name="code"
          value={recipe.code}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          name="description"
          value={recipe.description}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Version"
          name="version"
          value={recipe.version}
          onChange={handleChange}
          required
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={recipe.status}
            onChange={handleChange}
            label="Status"
          >
            <MenuItem value="released">Released</MenuItem>
            <MenuItem value="unreleased">Unreleased</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Update Recipe
        </Button>
      </Box>
    </Paper>
  );
};

export default RecipeEditForm;
