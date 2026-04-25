import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import { fetchUser } from "./redux/authSlice";
import AdminPanel from "./pages/AdminPanel";
import BestStudentLaptops from "./pages/BestStudentLaptops";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import LaptopCollectionPage from "./pages/LaptopCollectionPage";
import Login from "./pages/Login";
import Participants from "./pages/Participants";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/products/laptops-for-students"
          element={<BestStudentLaptops />}
        />
        <Route
          path="/products/best-student-laptops-under-16000-25000"
          element={<BestStudentLaptops />}
        />
        <Route
          path="/products/laptops-for-coding"
          element={
            <LaptopCollectionPage
              eyebrow="Laptop for coding"
              title="Laptop for coding"
              subtitle="Open a coding-focused laptop list with matches geared toward VS Code, browser tabs, terminal work, and lightweight development setups."
              requestParams={{ search: "laptop coding", limit: 300 }}
              callout="This route narrows the catalog to laptops that mention coding-oriented use so you can test a more relevant shortlist."
              emptyStateTitle="No coding laptops found yet"
              emptyStateCopy="Seed or add laptop products that mention coding use cases to populate this collection."
            />
          }
        />
        <Route
          path="/products/laptops-for-gaming"
          element={
            <LaptopCollectionPage
              eyebrow="Laptop for gaming"
              title="Laptop for gaming"
              subtitle="View gaming-oriented laptop matches for entry-level play, esports titles, and casual after-hours performance."
              requestParams={{ search: "laptop gaming", limit: 300 }}
              callout="This collection stays laptop-first and looks for gaming language, so it feels much closer to a real browsing flow."
              emptyStateTitle="No gaming laptops found yet"
              emptyStateCopy="Seed or add laptop products that mention gaming use cases to populate this collection."
            />
          }
        />
        <Route path="/participants" element={<Participants />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
