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
              eyebrow="Best laptops for coding"
              title="Best laptops for coding"
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
              eyebrow="Best laptops for gaming"
              title="Best laptops for gaming"
              subtitle="View gaming-oriented laptop matches for entry-level play, esports titles, and casual after-hours performance."
              requestParams={{ search: "laptop gaming", limit: 300 }}
              callout="This collection stays laptop-first and looks for gaming language, so it feels much closer to a real browsing flow."
              emptyStateTitle="No gaming laptops found yet"
              emptyStateCopy="Seed or add laptop products that mention gaming use cases to populate this collection."
            />
          }
        />
        <Route
          path="/products/best-laptops-under-15000-budget"
          element={
            <LaptopCollectionPage
              eyebrow="Budget laptop picks"
              title="Best laptops under Rs 15,000"
              subtitle="Browse the lowest-budget laptop shortlist for basic study work, browsing, and light day-to-day use."
              requestParams={{ category: "Laptops", maxPrice: 15000, limit: 300 }}
              callout="This route filters the laptop catalog down to the strict under-15000 budget range so you can test a real low-cost shortlist."
              emptyStateTitle="No laptops under Rs 15,000 found yet"
              emptyStateCopy="Seed or add lower-budget laptop products to populate this collection."
            />
          }
        />
        <Route
          path="/products/best-laptops-under-25000-budget"
          element={
            <LaptopCollectionPage
              eyebrow="Budget laptop picks"
              title="Best laptops under Rs 25,000"
              subtitle="Browse a wider budget-friendly laptop collection with more practical choices for study, coding, and light gaming."
              requestParams={{ category: "Laptops", maxPrice: 25000, limit: 300 }}
              callout="This route keeps the selection laptop-only while filtering to a common student-friendly budget ceiling."
              emptyStateTitle="No laptops under Rs 25,000 found yet"
              emptyStateCopy="Seed or add laptop products under Rs 25,000 to populate this collection."
            />
          }
        />
        <Route
          path="/products/best-computer-eye-glasses"
          element={
            <LaptopCollectionPage
              eyebrow="Computer eyewear picks"
              title="Best computer eye glasses"
              subtitle="Browse eye-tie products geared toward screen-heavy work, reading sessions, office setups, and day-long computer use."
              requestParams={{
                category: "Eye-tie",
                search: "computer glasses",
                limit: 300,
              }}
              callout="This collection narrows the eye-tie catalog toward computer and desk-use language so it feels closer to a real screen-care shortlist."
              emptyStateTitle="No computer eye glasses found yet"
              emptyStateCopy="Seed or add eye-tie products that mention computer use to populate this collection."
              staticBadge="Eyewear picks"
            />
          }
        />
        <Route
          path="/products/best-blue-light-glasses"
          element={
            <LaptopCollectionPage
              eyebrow="Blue light eyewear picks"
              title="Best blue light glasses"
              subtitle="Compare blue-light-focused eye-tie options for laptop work, classes, browsing, and extended evening screen time."
              requestParams={{
                category: "Eye-tie",
                search: "blue light glasses",
                limit: 300,
              }}
              callout="This route keeps the list eyewear-first while looking for blue-light wording in the product catalog."
              emptyStateTitle="No blue light glasses found yet"
              emptyStateCopy="Seed or add eye-tie products that mention blue light filtering to populate this collection."
              staticBadge="Eyewear picks"
            />
          }
        />
        <Route
          path="/products/best-uv-protection-glasses-under-400"
          element={
            <LaptopCollectionPage
              eyebrow="Budget UV eyewear picks"
              title="Best UV protection glasses under Rs 400"
              subtitle="Browse affordable eye-tie products that stay under Rs 400 while prioritizing outdoor use and UV-oriented descriptions."
              requestParams={{
                category: "Eye-tie",
                maxPrice: 400,
                search: "uv glasses",
                limit: 300,
              }}
              callout="This route mixes a strict budget cap with UV-focused search terms so cheaper sun-ready picks are easier to test."
              emptyStateTitle="No UV protection glasses under Rs 400 found yet"
              emptyStateCopy="Seed or add eye-tie products under Rs 400 with UV-focused descriptions to populate this collection."
              staticBadge="Eyewear picks"
            />
          }
        />
        <Route
          path="/products/best-fashion-glasses-under-500"
          element={
            <LaptopCollectionPage
              eyebrow="Budget fashion eyewear picks"
              title="Best fashion glasses under Rs 500"
              subtitle="Browse stylish eye-tie options under Rs 500 for budget-conscious fashion, casual looks, and everyday wear."
              requestParams={{
                category: "Eye-tie",
                maxPrice: 500,
                search: "fashion glasses",
                limit: 300,
              }}
              callout="This route keeps the budget tight while surfacing more style-oriented eyewear matches."
              emptyStateTitle="No fashion glasses under Rs 500 found yet"
              emptyStateCopy="Seed or add fashion-forward eye-tie products under Rs 500 to populate this collection."
              staticBadge="Eyewear picks"
            />
          }
        />
        <Route
          path="/products/best-anti-glare-glasses"
          element={
            <LaptopCollectionPage
              eyebrow="Anti glare eyewear picks"
              title="Best anti glare glasses"
              subtitle="Compare anti-glare eye-tie picks for reducing reflections during work, reading, commuting, and bright indoor lighting."
              requestParams={{
                category: "Eye-tie",
                search: "anti glare glasses",
                limit: 300,
              }}
              callout="This collection focuses on anti-glare language so reflection-reduction eyewear is easier to browse in one place."
              emptyStateTitle="No anti glare glasses found yet"
              emptyStateCopy="Seed or add anti-glare eye-tie products to populate this collection."
              staticBadge="Eyewear picks"
            />
          }
        />
        <Route
          path="/products/best-gaming-mobiles"
          element={
            <LaptopCollectionPage
              eyebrow="Best gaming mobiles"
              title="Best gaming mobiles"
              subtitle="Browse mobile picks focused on smoother gaming, faster graphics response, and better sustained performance."
              requestParams={{ search: "mobile gaming", category: "Mobiles", limit: 300 }}
              callout="This route narrows the mobile catalog to gaming-focused matches so you can compare stronger play-oriented options quickly."
              emptyStateTitle="No gaming mobiles found yet"
              emptyStateCopy="Seed or add gaming-focused mobile products to populate this collection."
              staticBadge="Mobile picks"
            />
          }
        />
        <Route
          path="/products/mobiles-with-best-camera"
          element={
            <LaptopCollectionPage
              eyebrow="Mobiles with best camera"
              title="Mobiles with best camera"
              subtitle="Compare mobile options that emphasize photography, sharper sensors, and more camera-focused features."
              requestParams={{ search: "mobile camera", category: "Mobiles", limit: 300 }}
              callout="This view stays focused on camera-oriented mobile language so it is easier to test photo-first recommendations."
              emptyStateTitle="No camera mobiles found yet"
              emptyStateCopy="Seed or add mobile products with camera-focused descriptions to populate this collection."
              staticBadge="Mobile picks"
            />
          }
        />
        <Route
          path="/products/all-features-packed-mobiles"
          element={
            <LaptopCollectionPage
              eyebrow="All features packed mobiles"
              title="All features packed mobiles"
              subtitle="Browse mobiles described as more complete all-rounders with balanced specs across camera, battery, display, and connectivity."
              requestParams={{ search: "mobile features", category: "Mobiles", limit: 300 }}
              callout="This collection is useful when you want all-round phones instead of one-feature-only picks."
              emptyStateTitle="No all-round mobiles found yet"
              emptyStateCopy="Seed or add all-feature mobile products to populate this collection."
              staticBadge="Mobile picks"
            />
          }
        />
        <Route
          path="/products/best-mobiles-under-12000-budget"
          element={
            <LaptopCollectionPage
              eyebrow="Budget mobile picks"
              title="Best mobiles under Rs 12,000"
              subtitle="Browse lower-budget mobiles for practical daily use without crossing the Rs 12,000 budget line."
              requestParams={{ category: "Mobiles", maxPrice: 12000, limit: 300 }}
              callout="This route filters straight to the strict under-12000 mobile shortlist."
              emptyStateTitle="No mobiles under Rs 12,000 found yet"
              emptyStateCopy="Seed or add lower-budget mobile products to populate this collection."
              staticBadge="Mobile picks"
            />
          }
        />
        <Route
          path="/products/best-mobiles-under-15000-budget"
          element={
            <LaptopCollectionPage
              eyebrow="Budget mobile picks"
              title="Best mobiles under Rs 15,000"
              subtitle="Browse the wider value-for-money mobile shortlist with more balanced options under a common budget cap."
              requestParams={{ category: "Mobiles", maxPrice: 15000, limit: 300 }}
              callout="This route keeps the list mobile-only while filtering to a stronger everyday budget range."
              emptyStateTitle="No mobiles under Rs 15,000 found yet"
              emptyStateCopy="Seed or add mobile products under Rs 15,000 to populate this collection."
              staticBadge="Mobile picks"
            />
          }
        />
        <Route
          path="/products/best-mobiles-with-high-speed-cpu"
          element={
            <LaptopCollectionPage
              eyebrow="High performance mobiles"
              title="Best mobiles with high speed CPU"
              subtitle="Compare mobiles that highlight faster chipsets, smoother multitasking, and stronger processing-oriented specs."
              requestParams={{ search: "mobile cpu", category: "Mobiles", limit: 300 }}
              callout="This route focuses on CPU and performance language so you can test a processor-first shortlist."
              emptyStateTitle="No high-speed CPU mobiles found yet"
              emptyStateCopy="Seed or add CPU-focused mobile products to populate this collection."
              staticBadge="Mobile picks"
            />
          }
        />
        <Route
          path="/products/best-battery-mobiles"
          element={
            <LaptopCollectionPage
              eyebrow="Battery mobile picks"
              title="Best battery mobiles"
              subtitle="View mobile choices with stronger battery life, longer playback, and all-day endurance messaging."
              requestParams={{ search: "mobile battery", category: "Mobiles", limit: 300 }}
              callout="This collection prioritizes long-lasting battery language for endurance-heavy users."
              emptyStateTitle="No battery mobiles found yet"
              emptyStateCopy="Seed or add battery-focused mobile products to populate this collection."
              staticBadge="Mobile picks"
            />
          }
        />
        <Route
          path="/products/best-5g-mobiles"
          element={
            <LaptopCollectionPage
              eyebrow="5G mobile picks"
              title="Best 5G mobiles"
              subtitle="Browse mobile options that emphasize 5G connectivity, better network support, and more future-ready specs."
              requestParams={{ search: "mobile 5g", category: "Mobiles", limit: 300 }}
              callout="This route filters toward 5G-focused mobile recommendations for modern network use."
              emptyStateTitle="No 5G mobiles found yet"
              emptyStateCopy="Seed or add 5G mobile products to populate this collection."
              staticBadge="Mobile picks"
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
