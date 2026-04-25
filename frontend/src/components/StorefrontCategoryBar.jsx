import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

const CATEGORY_LINKS = [
  { label: "Mobiles", to: "/products?category=Mobiles" },
  { label: "Electronics", to: "/products?category=Electronics" },
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

export default function StorefrontCategoryBar() {
  const [isLaptopMenuOpen, setIsLaptopMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const activeCategory = searchParams.get("category") || "All";
  const isLaptopRouteActive =
    activeCategory === "Laptops" ||
    location.pathname === "/products/laptops-for-students" ||
    location.pathname === "/products/laptops-for-coding" ||
    location.pathname === "/products/laptops-for-gaming" ||
    location.pathname === "/products/best-laptops-under-15000-budget" ||
    location.pathname === "/products/best-laptops-under-25000-budget";

  useEffect(() => {
    setIsLaptopMenuOpen(false);
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
            <span className={`text-[10px] transition ${isLaptopMenuOpen ? "rotate-180" : ""}`}>
              v
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
