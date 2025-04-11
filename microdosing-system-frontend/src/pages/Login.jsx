import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) =>
        u.username === formData.username && u.password === formData.password
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard", {
        state: { message: `Login successful as ${user.role}` },
      });
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">Login</h2>
        {error && <p className="text-red-600 dark:text-red-400 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.username}
            onChange={handleInputChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.password}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
