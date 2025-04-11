import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", role: "Operator" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  const saveUsersToStorage = (updated) => {
    localStorage.setItem("users", JSON.stringify(updated));
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();

    if (!newUser.username.trim()) {
      setMessage("⚠️ Username is required.");
      return;
    }

    const userWithPassword = {
      ...newUser,
      password: generatePassword(),
      id: Date.now(),
    };

    const updatedUsers = [...users, userWithPassword];
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    setNewUser({ username: "", role: "Operator" });
    setMessage("✅ User created successfully!");

    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <h1 className="text-3xl font-bold mb-4">Admin User Management</h1>

      {message && <p className="mb-4">{message}</p>}

      <form
        onSubmit={handleCreateUser}
        className="mb-6 flex gap-4 flex-wrap items-center"
      >
        <input
          type="text"
          placeholder="Username"
          className="border p-2 rounded w-48 bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={newUser.username}
          onChange={(e) =>
            setNewUser({ ...newUser, username: e.target.value })
          }
        />

        <select
          className="appearance-none border p-2 rounded w-48 bg-gray-100 text-black dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={newUser.role}
          onChange={(e) =>
            setNewUser({ ...newUser, role: e.target.value })
          }
        >
          <option value="Operator">Operator</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Administrator">Administrator</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Create User
        </button>
      </form>

      <table className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded">
        <thead className="bg-gray-200 dark:bg-gray-700 text-left">
          <tr>
            <th className="border p-2 dark:border-gray-600">Username</th>
            <th className="border p-2 dark:border-gray-600">Role</th>
            <th className="border p-2 dark:border-gray-600">Password</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id} className="border-t dark:border-gray-700">
                <td className="border p-2 dark:border-gray-700">{u.username}</td>
                <td className="border p-2 dark:border-gray-700">{u.role}</td>
                <td className="border p-2 dark:border-gray-700">{u.password}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center p-4">
                No users available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
