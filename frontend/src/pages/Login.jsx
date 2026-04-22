import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(loginUser(form));

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/dashboard");

      setForm({
        email: "",
        password: "",
      });
    } else {
      alert(result.payload || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-80"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Login 🔐</h2>

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
            className="w-full p-2 border rounded pr-10"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 cursor-pointer"
          >
            👁️
          </span>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        <button className="w-full bg-green-500 text-white p-2 rounded">
          Login
        </button>

        <p className="text-sm text-center mt-4">
          New user? <a href="/register">Register</a>
        </p>
      </motion.form>
    </div>
  );
}
