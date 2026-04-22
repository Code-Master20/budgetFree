import { useState } from "react";
import { motion } from "framer-motion";
import API from "../api";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", form);
      alert(res.data.message);
      alert("Verify Link: " + res.data.verifyLink);

      setForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-80"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Register 🚀</h2>

        <input
          value={form.name}
          placeholder="Name"
          className="w-full p-2 mb-3 border rounded"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          value={form.email}
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div className="relative mb-4">
          <input
            value={form.password}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 cursor-pointer text-gray-500"
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        </div>

        <button className="w-full bg-blue-500 text-white p-2 rounded">
          Register
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account? <a href="/login">Login</a>
        </p>
      </motion.form>
    </div>
  );
}
