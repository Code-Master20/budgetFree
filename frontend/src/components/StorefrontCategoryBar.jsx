import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

const CATEGORY_LINKS = [
  { label: "Eye-tie", to: "/products?category=Eye-tie" },
  { label: "Clothes", to: "/products?category=Clothes" },
];

const LAPTOP_LINKS = [
  {
    label: "All",
    to: "/products?category=Laptops",
  },
  {
    label: "Best Laptops for Students",
    to: "/products/laptops-for-students",
  },
  {
    label: "Best Laptops for Coding",
    to: "/products/laptops-for-coding",
  },
  {
    label: "Best Laptops for Gaming",
    to: "/products/laptops-for-gaming",
  },
  {
    label: "Best Laptops Under 15000 Budgets",
    to: "/products/best-laptops-under-15000-budget",
  },
  {
    label: "Best Laptops Under 25000 Budgets",
    to: "/products/best-laptops-under-25000-budget",
  },
];

const MOBILE_LINKS = [
  {
    label: "All",
    to: "/products?category=Mobiles",
  },
  {
    label: "Best Gaming Mobiles",
    to: "/products/best-gaming-mobiles",
  },
  {
    label: "Mobiles with Best Camera",
    to: "/products/mobiles-with-best-camera",
  },
  {
    label: "All Features Packed Mobiles",
    to: "/products/all-features-packed-mobiles",
  },
  {
    label: "Best Mobiles Under 12000 Budgets",
    to: "/products/best-mobiles-under-12000-budget",
  },
  {
    label: "Best Mobiles Under 15000 Budgets",
    to: "/products/best-mobiles-under-15000-budget",
  },
  {
    label: "Best Mobiles with High Speed CPU",
    to: "/products/best-mobiles-with-high-speed-cpu",
  },
  {
    label: "Best Battery Mobiles",
    to: "/products/best-battery-mobiles",
  },
  {
    label: "Best 5G Mobiles",
    to: "/products/best-5g-mobiles",
  },
];

export default function StorefrontCategoryBar() {
  const [isLaptopMenuOpen, setIsLaptopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const activeCategory = searchParams.get("category") || "All";
  const mobileRoutes = new Set([
    "/products/best-gaming-mobiles",
    "/products/mobiles-with-best-camera",
    "/products/all-features-packed-mobiles",
    "/products/best-mobiles-under-12000-budget",
    "/products/best-mobiles-under-15000-budget",
    "/products/best-mobiles-with-high-speed-cpu",
    "/products/best-battery-mobiles",
    "/products/best-5g-mobiles",
  ]);
  const isLaptopRouteActive =
    activeCategory === "Laptops" ||
    location.pathname === "/products/laptops-for-students" ||
    location.pathname === "/products/laptops-for-coding" ||
    location.pathname === "/products/laptops-for-gaming" ||
    location.pathname === "/products/best-laptops-under-15000-budget" ||
    location.pathname === "/products/best-laptops-under-25000-budget";
  const isMobileRouteActive =
    activeCategory === "Mobiles" || mobileRoutes.has(location.pathname);

  useEffect(() => {
    setIsLaptopMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsLaptopMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const linkClassName = (isActive) =>
    isActive
      ? "primary-button px-4 py-2 text-xs"
      : "secondary-button px-4 py-2 text-xs";

  return (
    <div className="flex flex-wrap gap-2">
      <Link to="/products" className={linkClassName(activeCategory === "All")}>
        All
      </Link>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsLaptopMenuOpen((current) => !current)}
          aria-expanded={isLaptopMenuOpen}
          className={linkClassName(isLaptopRouteActive)}
        >
          <span className="flex items-center gap-2">
            <span>Laptops</span>
            <span
              aria-hidden="true"
              className={`inline-block text-[10px] leading-none transition ${isLaptopMenuOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </span>
        </button>

        {isLaptopMenuOpen ? (
          <div className="glass-panel-strong absolute left-0 top-full z-20 mt-3 min-w-[280px] rounded-[24px] p-3 shadow-[0_18px_42px_rgba(16,24,31,0.16)]">
            <div className="grid gap-2">
              {LAPTOP_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="secondary-button rounded-[18px] px-4 py-3 text-left text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsLaptopMenuOpen(false);
            setIsMobileMenuOpen((current) => !current);
          }}
          aria-expanded={isMobileMenuOpen}
          className={linkClassName(isMobileRouteActive)}
        >
          <span className="flex items-center gap-2">
            <span>Mobiles</span>
            <span
              aria-hidden="true"
              className={`inline-block text-[10px] leading-none transition ${isMobileMenuOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </span>
        </button>

        {isMobileMenuOpen ? (
          <div className="glass-panel-strong absolute left-0 top-full z-20 mt-3 min-w-[300px] rounded-[24px] p-3 shadow-[0_18px_42px_rgba(16,24,31,0.16)]">
            <div className="grid gap-2">
              {MOBILE_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="secondary-button rounded-[18px] px-4 py-3 text-left text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {CATEGORY_LINKS.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className={linkClassName(activeCategory === item.label)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
