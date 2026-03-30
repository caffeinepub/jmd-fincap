import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

export function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ];

  const active = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <img
            src={LOGO}
            alt="JMD FinCap"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="font-display font-bold text-navy-900 text-lg hidden sm:block">
            JMD FinCap
          </span>
        </a>

        <nav
          className="hidden md:flex items-center gap-6"
          aria-label="Main navigation"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-ocid={`nav.${l.label.toLowerCase()}.link`}
              className={`text-sm font-medium transition-colors ${
                active === l.href
                  ? "text-gold-600 border-b-2 border-gold-500 pb-0.5"
                  : "text-navy-700 hover:text-gold-500"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="/login">
            <Button
              variant="outline"
              size="sm"
              data-ocid="nav.login.button"
              className="border-navy-700 text-navy-700 hover:bg-navy-50"
            >
              Customer Login
            </Button>
          </a>
          <a href="/apply">
            <Button
              size="sm"
              data-ocid="nav.apply.button"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
            >
              Apply Now
            </Button>
          </a>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-navy-900"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="py-2 px-3 text-navy-800 hover:text-gold-500 hover:bg-gray-50 rounded font-medium text-sm"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 mt-2">
            <a
              href="/login"
              className="py-2 px-3 text-center text-sm font-semibold text-navy-800 border border-navy-300 rounded-lg"
            >
              Customer Login
            </a>
            <a
              href="/apply"
              className="py-2 px-3 text-center text-sm font-semibold text-navy-900 bg-gold-500 rounded-lg"
            >
              Apply Now
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
