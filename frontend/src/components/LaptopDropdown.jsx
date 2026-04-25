import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const LAPTOP_LINKS = [
  {
    to: "/products/laptops-for-students",
    label: "Laptops for Students",
  },
  {
    to: "/products/laptops-for-coding",
    label: "Laptop for Coding",
  },
  {
    to: "/products/laptops-for-gaming",
    label: "Laptop for Gaming",
  },
];

export default function LaptopDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="primary-button flex items-center gap-2 px-5 py-3"
      >
        <span>Laptop</span>
        <span className={`text-xs transition ${isOpen ? "rotate-180" : ""}`}>
          v
        </span>
      </button>

      {isOpen ? (
        <div className="glass-panel-strong absolute right-0 top-full z-20 mt-3 min-w-[240px] rounded-[24px] p-3 shadow-[0_18px_42px_rgba(16,24,31,0.16)]">
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
  );
}
