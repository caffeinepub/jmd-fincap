import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import {
  Award,
  BarChart3,
  Bot,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Home,
  Loader2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  PieChart,
  Send,
  Shield,
  Star,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import { useActor } from "./hooks/useActor";
import { router } from "./router";

// ─── Logo Helper ──────────────────────────────────────────────────────────────

const DEFAULT_LOGO_SRC = "/assets/generated/jmd-fincap-logo-real.png";
const LOGO_STORAGE_KEY = "jmd_custom_logo";

function getActiveLogo(): string {
  try {
    const stored = localStorage.getItem(LOGO_STORAGE_KEY);
    if (stored?.startsWith("data:")) return stored;
  } catch {
    // ignore
  }
  return DEFAULT_LOGO_SRC;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMode = "select" | "contact" | "loan_form";

type ChatStep =
  | "mode_select"
  | "greeting"
  | "ask_name"
  | "ask_phone"
  | "ask_email"
  | "ask_service"
  | "ask_message"
  | "confirm"
  | "done"
  // Loan form steps
  | "lf_full_name"
  | "lf_father_name"
  | "lf_dob"
  | "lf_mobile1"
  | "lf_mobile2"
  | "lf_email"
  | "lf_current_address"
  | "lf_permanent_address"
  | "lf_landmark"
  | "lf_house_type"
  | "lf_aadhaar"
  | "lf_pan"
  | "lf_occupation"
  | "lf_workplace"
  | "lf_monthly_income"
  | "lf_loan_amount"
  | "lf_loan_duration"
  | "lf_monthly_emi"
  | "lf_guarantor1_name"
  | "lf_guarantor1_mobile"
  | "lf_guarantor1_relation"
  | "lf_guarantor2_name"
  | "lf_summary"
  | "lf_done";

interface ChatMessage {
  id: string;
  from: "bot" | "user";
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface UserData {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}

interface LoanFormData {
  fullName: string;
  fatherHusbandName: string;
  dateOfBirth: string;
  mobile1: string;
  mobile2: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
  nearestLandmark: string;
  houseType: string;
  aadhaarNumber: string;
  panNumber: string;
  occupation: string;
  workplaceName: string;
  workAddress: string;
  monthlyIncome: string;
  loanAmount: string;
  loanDuration: string;
  monthlyEMI: string;
  guarantor1Name: string;
  guarantor1Mobile: string;
  guarantor1Relation: string;
  guarantor2Name: string;
}

const LOAN_FORM_TOTAL_STEPS = 23;

const LOAN_STEP_INDEX: Record<string, number> = {
  lf_full_name: 1,
  lf_father_name: 2,
  lf_dob: 3,
  lf_mobile1: 4,
  lf_mobile2: 5,
  lf_email: 6,
  lf_current_address: 7,
  lf_permanent_address: 8,
  lf_landmark: 9,
  lf_house_type: 10,
  lf_aadhaar: 11,
  lf_pan: 12,
  lf_occupation: 13,
  lf_workplace: 14,
  lf_monthly_income: 15,
  lf_loan_amount: 16,
  lf_loan_duration: 17,
  lf_monthly_emi: 18,
  lf_guarantor1_name: 19,
  lf_guarantor1_mobile: 20,
  lf_guarantor1_relation: 21,
  lf_guarantor2_name: 22,
  lf_summary: 23,
  lf_done: 23,
};

const SERVICES = [
  "Home Loans",
  "Business Loans",
  "Investment Planning",
  "Insurance",
  "Mutual Funds",
  "Tax Planning",
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrollFade() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        }
      },
      { threshold: 0.08 },
    );

    const elements = document.querySelectorAll(".section-fade");
    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);
}

// ─── NavBar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(getActiveLogo);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);

      const sections = ["home", "about", "services", "team", "contact"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for storage changes (logo updated in admin panel)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === LOGO_STORAGE_KEY) {
        setLogoSrc(getActiveLogo());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home", id: "home" },
    { label: "About", href: "#about", id: "about" },
    { label: "Services", href: "#services", id: "services" },
    { label: "Team", href: "#team", id: "team" },
    { label: "Contact", href: "#contact", id: "contact" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const isActive = (id: string) => activeSection === id;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 ${
        scrolled ? "navbar-scrolled" : "navbar-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => scrollTo("#home")}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
          aria-label="JMD FinCap — Go to top"
        >
          <img
            src={logoSrc}
            alt="JMD FinCap logo"
            className="h-14 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </button>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`relative text-sm font-body font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded px-1 pb-1 ${
                scrolled
                  ? isActive(link.id)
                    ? "text-navy-900"
                    : "text-navy-700 hover:text-gold-500"
                  : isActive(link.id)
                    ? "text-white"
                    : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
              {/* Active indicator */}
              {isActive(link.id) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-gold-500 rounded-full" />
              )}
            </button>
          ))}
          <a
            href="/apply"
            className={`text-sm font-body font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded px-1 ${
              scrolled
                ? "text-navy-700 hover:text-gold-500"
                : "text-white/80 hover:text-white"
            }`}
          >
            Apply Loan
          </a>
          <button
            type="button"
            onClick={() => scrollTo("#contact")}
            className="ml-4 px-6 py-2.5 rounded-full text-sm font-semibold btn-shimmer shadow-gold hover:shadow-gold-glow transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900"
          >
            Get Consultation
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={`md:hidden p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded transition-colors ${
            scrolled ? "text-navy-900" : "text-white"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-premium"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`text-left py-3 px-4 rounded font-body font-medium transition-colors duration-200 ${
                isActive(link.id)
                  ? "text-gold-500 bg-gold-100/50"
                  : "text-navy-900 hover:text-gold-500 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </button>
          ))}
          <a
            href="/apply"
            className="py-3 px-4 text-navy-900 hover:text-gold-500 hover:bg-gray-50 rounded font-body font-medium transition-colors duration-200"
            onClick={() => setMobileOpen(false)}
          >
            Apply Loan
          </a>
          <button
            type="button"
            onClick={() => scrollTo("#contact")}
            className="mt-3 mx-4 py-3 rounded-full text-sm font-semibold btn-shimmer shadow-gold transition-shadow"
          >
            Get Free Consultation
          </button>
        </nav>
      )}
    </header>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-navy-900"
      aria-label="Hero"
    >
      {/* Background hero image */}
      <img
        src="/assets/generated/hero-financial-bg.dim_1920x900.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 10% 60%, oklch(0.70 0.13 72 / 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 90% 20%, oklch(0.22 0.06 252 / 0.5) 0%, transparent 60%),
            linear-gradient(135deg, oklch(0.18 0.065 252 / 0.95) 0%, oklch(0.22 0.06 252 / 0.85) 100%)
          `,
        }}
      />

      {/* Subtle diagonal grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 60px,
            oklch(0.70 0.13 72 / 0.8) 60px,
            oklch(0.70 0.13 72 / 0.8) 61px
          )`,
        }}
      />

      <div className="container mx-auto px-4 pt-28 pb-20 relative z-10">
        <div className="max-w-3xl">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/40 bg-gold-500/10 mb-8 animate-fade-in">
            <Star
              className="h-4 w-4 text-gold-500 fill-gold-500"
              aria-hidden="true"
            />
            <span className="text-sm font-body font-semibold text-gold-400 tracking-wide">
              Trusted Financial Advisory Since 2018
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up"
            style={{ textShadow: "0 4px 32px rgba(0,0,0,0.3)" }}
          >
            Your Trusted{" "}
            <em
              className="not-italic text-gold-400"
              style={{ fontStyle: "italic" }}
            >
              Financial
            </em>
            <br />
            Partner
          </h1>

          {/* Subheadline */}
          <p className="font-body text-lg md:text-xl text-white/75 max-w-xl mb-10 leading-relaxed animate-slide-up">
            Expert guidance on home loans, business financing, investment
            planning, insurance & more. Serving families and businesses across
            Madhya Pradesh.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            <button
              type="button"
              onClick={scrollToContact}
              className="px-8 py-4 rounded-full font-body font-semibold btn-shimmer shadow-gold hover:shadow-gold-glow transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white text-center"
            >
              Get Free Consultation
            </button>
            <a
              href="/apply"
              className="px-8 py-4 rounded-full font-body font-semibold text-white border-2 border-gold-500/60 hover:border-gold-500 hover:bg-gold-500/10 transition-all duration-200 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              Apply for Loan
            </a>
            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#services")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 rounded-full font-body font-semibold text-white/80 border border-white/20 hover:border-white/40 hover:text-white transition-all duration-200 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Our Services
            </button>
          </div>

          {/* Stats row — glass cards */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg animate-fade-in">
            {[
              { icon: Users, value: "5,000+", label: "Happy Clients" },
              { icon: Award, value: "6+", label: "Years Experience" },
              { icon: BarChart3, value: "₹500Cr+", label: "Loans Processed" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="glass-card rounded-2xl px-4 py-4 text-center"
              >
                <Icon
                  className="h-5 w-5 text-gold-400 mx-auto mb-2"
                  aria-hidden="true"
                />
                <div className="font-display text-2xl font-bold text-white stat-glow">
                  {value}
                </div>
                <div className="font-body text-xs text-white/55 mt-1 tracking-wide">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-in">
            {["RBI Registered", "IRDAI Certified", "AMFI Partner"].map(
              (badge) => (
                <span key={badge} className="trust-badge">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                  {badge}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <ChevronDown className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────

function AboutSection() {
  const aboutFeatures = [
    {
      icon: CheckCircle2,
      title: "IRDAI-Registered Advisory",
      desc: "Certified insurance advisory, fully compliant with regulatory norms.",
    },
    {
      icon: TrendingUp,
      title: "AMFI-Certified Mutual Funds",
      desc: "Expert fund selection and portfolio tracking for your investment goals.",
    },
    {
      icon: Shield,
      title: "Transparent, Zero Hidden Charges",
      desc: "We believe in complete honesty — what you see is what you pay.",
    },
    {
      icon: Users,
      title: "Dedicated Relationship Managers",
      desc: "A personal advisor assigned to every client for ongoing support.",
    },
  ];

  return (
    <section
      id="about"
      className="py-24 bg-white"
      aria-label="About JMD FinCap"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual — navy card with gold shimmer border */}
          <div className="section-fade">
            <div className="gold-shimmer-border">
              <div className="relative rounded-2xl overflow-hidden bg-navy-900 p-10 text-white">
                {/* Decorative gold accents */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500 opacity-[0.06] rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-gold-500 opacity-[0.06] rounded-tr-full" />
                <div className="absolute top-1/2 right-6 w-px h-24 bg-gradient-to-b from-transparent via-gold-500/30 to-transparent" />

                <div className="relative z-10">
                  <div className="text-gold-500 font-body text-xs font-bold tracking-[0.2em] uppercase mb-4">
                    Est. 2018
                  </div>
                  <h3 className="font-display text-3xl font-bold mb-5 leading-tight">
                    JMD FinCap Pvt. Ltd.
                  </h3>
                  <p className="font-body text-white/65 leading-relaxed mb-6 text-sm">
                    Headquartered in Khargone, Madhya Pradesh, we have been
                    transforming financial futures since 2018 — bridging the gap
                    between clients and their goals with honesty and expertise.
                  </p>
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    {[
                      { label: "States Served", value: "3+" },
                      { label: "Service Types", value: "6" },
                      { label: "Team Members", value: "20+" },
                      { label: "Cities", value: "10+" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="font-display text-2xl font-bold text-gold-400">
                          {value}
                        </div>
                        <div className="font-body text-xs text-white/45 mt-1">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="section-fade">
            <div className="text-gold-500 font-body text-xs font-bold tracking-[0.2em] uppercase mb-4">
              About Us
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900 mb-6 gold-underline leading-tight">
              Empowering Your
              <br />
              <em className="not-italic text-gold-500">Financial Journey</em>
            </h2>
            <p className="font-body text-gray-600 leading-relaxed mb-4 text-sm">
              JMD FinCap is a premier financial advisory firm founded with a
              mission to make quality financial services accessible to every
              Indian household and business. We bridge the gap between clients
              and their financial goals with honesty, expertise, and
              personalized guidance.
            </p>
            <p className="font-body text-gray-500 leading-relaxed mb-10 text-sm">
              Based in Khargone, Madhya Pradesh, our certified professionals
              serve clients across the region — offering tailored solutions in
              loans, investments, insurance, and wealth management.
            </p>

            {/* Icon feature list */}
            <div className="flex flex-col gap-5">
              {aboutFeatures.map((feat, i) => (
                <div
                  key={feat.title}
                  className="section-fade flex items-start gap-4"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="h-10 w-10 rounded-xl bg-gold-100 flex items-center justify-center shrink-0">
                    <feat.icon
                      className="h-5 w-5 text-gold-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <div className="font-body font-semibold text-navy-900 text-sm mb-0.5">
                      {feat.title}
                    </div>
                    <div className="font-body text-gray-500 text-xs leading-relaxed">
                      {feat.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us Section ────────────────────────────────────────────────────

function WhyChooseUsSection() {
  const features = [
    {
      icon: Zap,
      title: "Fast Approval",
      desc: "Quick processing with minimal documentation. Loan decisions within 48 hours.",
    },
    {
      icon: Shield,
      title: "Trusted Experts",
      desc: "6+ years of proven experience. IRDAI and AMFI certified advisors by your side.",
    },
    {
      icon: Eye,
      title: "Transparent Process",
      desc: "No hidden fees, no surprises. Every step is clear and communicated upfront.",
    },
    {
      icon: MapPin,
      title: "Local Support",
      desc: "Deep roots in Khargone, Madhya Pradesh. We understand your local needs.",
    },
  ];

  return (
    <section
      className="py-24 bg-navy-900 relative overflow-hidden"
      aria-label="Why Choose JMD FinCap"
    >
      {/* Decorative background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.70 0.13 72) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, oklch(0.70 0.13 72) 0%, transparent 50%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, oklch(0.70 0.13 72 / 1) 0px, oklch(0.70 0.13 72 / 1) 1px, transparent 1px, transparent 60px),
          repeating-linear-gradient(90deg, oklch(0.70 0.13 72 / 1) 0px, oklch(0.70 0.13 72 / 1) 1px, transparent 1px, transparent 60px)`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 section-fade">
          <div className="text-gold-400 font-body text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Our Advantage
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Why Choose Us?
          </h2>
          <div className="mt-4 mx-auto h-0.5 w-16 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded" />
          <p className="mt-6 font-body text-white/60 max-w-lg mx-auto leading-relaxed text-sm">
            We combine local expertise with proven financial solutions to help
            you achieve your goals confidently.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className="section-fade glass-card rounded-2xl p-8 hover:bg-white/[0.08] transition-all duration-300 group"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="h-14 w-14 rounded-2xl bg-gold-500 flex items-center justify-center mb-6 group-hover:shadow-gold-glow transition-shadow duration-300">
                <feat.icon
                  className="h-7 w-7 text-navy-900"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                {feat.title}
              </h3>
              <p className="font-body text-white/55 text-sm leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trust Partners Band ──────────────────────────────────────────────────────

function TrustPartnersBand() {
  const partners = [
    { label: "RBI Compliant", detail: "" },
    { label: "IRDAI Registered", detail: "Reg. No. IMF-2018-KHG" },
    { label: "AMFI Certified", detail: "ARN-182756" },
  ];

  return (
    <section
      className="py-8 bg-white border-y border-gray-100"
      aria-label="Trust registrations"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
          <span className="font-body text-xs text-gray-400 uppercase tracking-[0.15em] font-semibold whitespace-nowrap">
            Trusted & Registered With
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {partners.map((p) => (
              <div
                key={p.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/30 bg-gold-100/50"
              >
                <CheckCircle2
                  className="h-3.5 w-3.5 text-gold-600 shrink-0"
                  aria-hidden="true"
                />
                <span className="font-body text-xs font-semibold text-navy-800">
                  {p.label}
                  {p.detail && (
                    <span className="text-navy-600/60 font-normal ml-1">
                      {p.detail}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────

interface ServiceCard {
  icon: React.ElementType;
  title: string;
  description: string;
  colorClass: string;
  accentColor: string;
}

const serviceCards: ServiceCard[] = [
  {
    icon: Home,
    title: "Home Loans",
    description:
      "Realize your dream of owning a home with competitive interest rates, minimal documentation, and quick disbursal.",
    colorClass: "bg-blue-50 text-blue-600",
    accentColor: "bg-blue-500",
  },
  {
    icon: Briefcase,
    title: "Business Loans",
    description:
      "Scale your business with tailored financing solutions — from working capital to expansion loans.",
    colorClass: "bg-purple-50 text-purple-600",
    accentColor: "bg-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Investment Planning",
    description:
      "Build lasting wealth through strategic investment portfolios aligned with your risk appetite and goals.",
    colorClass: "bg-emerald-50 text-emerald-600",
    accentColor: "bg-emerald-500",
  },
  {
    icon: Shield,
    title: "Insurance",
    description:
      "Protect what matters most. Life, health, motor and property insurance from India's leading providers.",
    colorClass: "bg-orange-50 text-orange-600",
    accentColor: "bg-orange-500",
  },
  {
    icon: PieChart,
    title: "Mutual Funds",
    description:
      "Start your SIP or lump sum investment journey with expert fund selection and portfolio tracking.",
    colorClass: "bg-teal-50 text-teal-600",
    accentColor: "bg-teal-500",
  },
  {
    icon: FileText,
    title: "Tax Planning",
    description:
      "Legally minimize your tax liability with smart ITR filing, 80C investments and tax-saving strategies.",
    colorClass: "bg-rose-50 text-rose-600",
    accentColor: "bg-rose-500",
  },
];

function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-white" aria-label="Our Services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 section-fade">
          <div className="text-gold-500 font-body text-xs font-bold tracking-[0.2em] uppercase mb-4">
            What We Offer
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900">
            Our Financial Services
          </h2>
          <div className="mt-4 mx-auto h-0.5 w-16 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded" />
          <p className="mt-6 font-body text-gray-500 max-w-xl mx-auto leading-relaxed text-sm">
            Comprehensive financial solutions designed to meet every milestone
            of your personal and professional life.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCards.map((svc, i) => (
            <div
              key={svc.title}
              className="service-card section-fade bg-white rounded-xl p-8 shadow-xs hover:shadow-premium transition-all duration-300 group border border-gray-100 hover:border-gold-500/40 relative overflow-hidden"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Top accent line on hover */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 ${svc.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div
                className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-6 ${svc.colorClass} group-hover:scale-105 transition-transform duration-300`}
              >
                <svc.icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy-900 mb-3">
                {svc.title}
              </h3>
              <p className="font-body text-gray-500 text-sm leading-relaxed">
                {svc.description}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="h-0.5 w-0 bg-gold-500 group-hover:w-3/4 transition-all duration-500 rounded" />
                <span className="service-card-arrow text-gold-500 text-lg font-bold">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Team Section ─────────────────────────────────────────────────────────────

function TeamSection() {
  const team = [
    {
      name: "CEO",
      role: "Chief Executive Officer",
      initials: "CEO",
      photo: "/assets/generated/team-ceo.dim_300x300.jpg",
      description:
        "A visionary leader with 10+ years in financial services. Founded JMD FinCap with the goal of democratizing access to quality financial guidance across Madhya Pradesh.",
      expertise: [
        "Strategic Planning",
        "Wealth Management",
        "Corporate Finance",
      ],
    },
    {
      name: "Co-Founder",
      role: "Co-Founder & Director",
      initials: "CF",
      photo: "/assets/generated/team-cio.dim_300x300.jpg",
      description:
        "An expert in loan structuring and insurance advisory. Co-founded JMD FinCap to create a client-first financial services firm rooted in transparency and trust.",
      expertise: ["Loan Advisory", "Insurance Planning", "Client Relations"],
    },
  ];

  return (
    <section id="team" className="py-24 bg-navy-50/60" aria-label="Our Team">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 section-fade">
          <div className="text-gold-500 font-body text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Leadership
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900">
            Meet Our Team
          </h2>
          <div className="mt-4 mx-auto h-0.5 w-16 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <div
              key={member.name}
              className="section-fade rounded-2xl overflow-hidden group hover:shadow-premium transition-all duration-300"
              style={{
                transitionDelay: `${i * 120}ms`,
                background:
                  "linear-gradient(to bottom, oklch(0.18 0.065 252), oklch(0.22 0.06 252))",
              }}
            >
              {/* Header */}
              <div className="px-8 py-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/[0.08] rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gold-500/[0.05] rounded-tr-full" />
                <div className="relative z-10 flex items-center gap-5">
                  {/* Avatar with gold ring */}
                  <div className="shrink-0">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-gold-500 ring-offset-2 ring-offset-navy-900 shadow-gold"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback =
                          target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div
                      className="h-20 w-20 rounded-full bg-gold-500 items-center justify-center shrink-0 text-navy-900 font-display text-2xl font-bold shadow-gold ring-4 ring-gold-500 ring-offset-2 ring-offset-navy-900 hidden"
                      aria-hidden="true"
                    >
                      {member.initials}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {member.name}
                    </h3>
                    <p className="font-body text-gold-400 text-sm font-semibold mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-6 bg-white/[0.03] border-t border-white/10">
                <p className="font-body text-white/65 text-sm leading-relaxed mb-6">
                  {member.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-body font-semibold rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────

function ContactSection() {
  const { actor, isFetching } = useActor();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!actor) throw new Error("Service unavailable. Please try again.");
      await actor.submitContactForm(
        data.name,
        data.phone,
        data.email,
        data.service,
        data.message,
      );
    },
    onSuccess: () => {
      toast.success("Thank you! We'll contact you within 24 hours.", {
        description: "Your enquiry has been submitted successfully.",
      });
      setFormData({ name: "", phone: "", email: "", service: "", message: "" });
    },
    onError: (err: Error) => {
      toast.error("Submission failed. Please try again.", {
        description: err.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.service
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <section id="contact" className="py-24 bg-gray-50" aria-label="Contact Us">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 section-fade">
          <div className="text-gold-500 font-body text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Get In Touch
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900">
            Start Your Financial{" "}
            <em className="not-italic text-gold-500">Journey Today</em>
          </h2>
          <div className="mt-4 mx-auto h-0.5 w-16 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div className="section-fade">
            <p className="font-body text-gray-500 leading-relaxed mb-10 text-sm max-w-md">
              Have questions? Ready to get started? Our team is here to guide
              you every step of the way. Reach out and we'll respond within 24
              hours.
            </p>

            <div className="flex flex-col gap-5">
              {[
                {
                  icon: Phone,
                  label: "WhatsApp / Call",
                  value: "+91 88899 56204",
                  href: "tel:+918889956204",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "contact.jmdfincap@gmail.com",
                  href: "mailto:contact.jmdfincap@gmail.com",
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-xs border border-gray-100"
                >
                  <div className="h-12 w-12 rounded-xl bg-navy-900 flex items-center justify-center shrink-0">
                    <Icon
                      className="h-5 w-5 text-gold-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">
                      {label}
                    </div>
                    {href ? (
                      <a
                        href={href}
                        className="font-body text-navy-900 font-medium hover:text-gold-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded text-sm"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-body text-navy-900 font-medium text-sm">
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-8">
              <a
                href="https://wa.me/918889956204?text=Hello%20JMD%20FinCap%2C%20I%20need%20financial%20advice"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#25D366] text-white font-body font-semibold hover:bg-[#1ebe5d] transition-colors duration-200 shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
              >
                <SiWhatsapp className="h-5 w-5" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="section-fade">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 shadow-premium border border-gray-100"
              noValidate
            >
              <h3 className="font-display text-2xl font-bold text-navy-900 mb-2">
                Request a Free Consultation
              </h3>
              <p className="font-body text-gray-400 text-sm mb-8">
                Fill out the form and we'll get back to you within 24 hours.
              </p>

              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <Label
                    htmlFor="cf-name"
                    className="font-body text-navy-800 text-xs font-semibold mb-2 block tracking-wide uppercase"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cf-name"
                    type="text"
                    placeholder="Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    autoComplete="name"
                    className="font-body h-12 border-gray-200 focus:border-gold-500 focus:ring-gold-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="cf-phone"
                    className="font-body text-navy-800 text-xs font-semibold mb-2 block tracking-wide uppercase"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cf-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    required
                    autoComplete="tel"
                    className="font-body h-12 border-gray-200 focus:border-gold-500 focus:ring-gold-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="mb-5">
                <Label
                  htmlFor="cf-email"
                  className="font-body text-navy-800 text-xs font-semibold mb-2 block tracking-wide uppercase"
                >
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cf-email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                  autoComplete="email"
                  className="font-body h-12 border-gray-200 focus:border-gold-500 focus:ring-gold-500 rounded-xl"
                />
              </div>

              <div className="mb-5">
                <Label
                  htmlFor="cf-service"
                  className="font-body text-navy-800 text-xs font-semibold mb-2 block tracking-wide uppercase"
                >
                  Service Interest <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.service}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, service: v }))
                  }
                >
                  <SelectTrigger
                    id="cf-service"
                    className="font-body h-12 border-gray-200 rounded-xl"
                  >
                    <SelectValue placeholder="Select a service..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((s) => (
                      <SelectItem key={s} value={s} className="font-body">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-8">
                <Label
                  htmlFor="cf-message"
                  className="font-body text-navy-800 text-xs font-semibold mb-2 block tracking-wide uppercase"
                >
                  Your Message
                </Label>
                <Textarea
                  id="cf-message"
                  placeholder="Tell us about your financial goals or questions..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, message: e.target.value }))
                  }
                  className="font-body border-gray-200 focus:border-gold-500 focus:ring-gold-500 resize-none rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || isFetching}
                className="w-full h-14 rounded-full font-body font-semibold btn-shimmer disabled:opacity-60 disabled:cursor-not-allowed transition-shadow duration-200 hover:shadow-gold-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 flex items-center justify-center gap-2 text-base"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Enquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const footerServices = [
    "Home Loans",
    "Business Loans",
    "Investment Planning",
    "Insurance",
    "Mutual Funds",
    "Tax Planning",
  ];

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="bg-navy-900 border-t-2 border-gold-500"
      aria-label="Footer"
    >
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <img
              src={getActiveLogo()}
              alt="JMD FinCap"
              className="h-14 w-auto mb-5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p className="font-body text-white/45 text-sm leading-relaxed mb-6 max-w-xs">
              Your trusted partner for comprehensive financial services in
              Madhya Pradesh. Transforming financial futures since 2018.
            </p>
            <div className="flex flex-col gap-3">
              {[
                {
                  icon: Phone,
                  text: "+91 88899 56204",
                  href: "tel:+918889956204",
                },
                {
                  icon: Mail,
                  text: "contact.jmdfincap@gmail.com",
                  href: "mailto:contact.jmdfincap@gmail.com",
                },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon
                    className="h-4 w-4 text-gold-400 shrink-0"
                    aria-hidden="true"
                  />
                  {href ? (
                    <a
                      href={href}
                      className="font-body text-white/55 text-sm hover:text-gold-400 transition-colors"
                    >
                      {text}
                    </a>
                  ) : (
                    <span className="font-body text-white/55 text-sm">
                      {text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white mb-6">
              Our Services
            </h4>
            <ul className="flex flex-col gap-3">
              {footerServices.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => scrollTo("#services")}
                    className="font-body text-white/45 text-sm hover:text-gold-400 transition-colors duration-200 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 rounded flex items-center gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold-500/40 shrink-0" />
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white mb-6">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3 mb-8">
              {[
                { label: "Home", href: "#home" },
                { label: "About Us", href: "#about" },
                { label: "Our Team", href: "#team" },
                { label: "Contact", href: "#contact" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => scrollTo(href)}
                    className="font-body text-white/45 text-sm hover:text-gold-400 transition-colors duration-200 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 rounded flex items-center gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold-500/40 shrink-0" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            {/* WhatsApp with pulse ring */}
            <div className="relative inline-block">
              <span
                className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25"
                aria-hidden="true"
              />
              <a
                href="https://wa.me/918889956204?text=Hello%20JMD%20FinCap%2C%20I%20need%20financial%20advice"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white font-body text-sm font-semibold hover:bg-[#1ebe5d] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <SiWhatsapp className="h-4 w-4" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-white/35 text-sm">
            © {year} JMD FinCap. All rights reserved.
          </p>
          <p className="font-body text-white/25 text-xs">
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/35 hover:text-white/50 transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── WhatsApp Floating Button ─────────────────────────────────────────────────

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/918889956204?text=Hello%20JMD%20FinCap%2C%20I%20need%20financial%20advice"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="relative">
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30"
          aria-hidden="true"
        />
        <div className="relative h-16 w-16 rounded-full bg-[#25D366] shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center text-white">
          <SiWhatsapp className="h-7 w-7" aria-hidden="true" />
        </div>
        {/* Tooltip */}
        <div className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 bg-navy-900 text-white text-xs font-body font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-navy opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Chat on WhatsApp
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-4 border-transparent border-l-navy-900" />
        </div>
      </div>
    </a>
  );
}

// ─── AI Chat Agent Widget ─────────────────────────────────────────────────────

function AIChatWidget() {
  const { actor } = useActor();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("select");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<ChatStep>("mode_select");
  const [userData, setUserData] = useState<UserData>({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [loanData, setLoanData] = useState<LoanFormData>({
    fullName: "",
    fatherHusbandName: "",
    dateOfBirth: "",
    mobile1: "",
    mobile2: "",
    email: "",
    currentAddress: "",
    permanentAddress: "",
    nearestLandmark: "",
    houseType: "",
    aadhaarNumber: "",
    panNumber: "",
    occupation: "",
    workplaceName: "",
    workAddress: "",
    monthlyIncome: "",
    loanAmount: "",
    loanDuration: "",
    monthlyEMI: "",
    guarantor1Name: "",
    guarantor1Mobile: "",
    guarantor1Relation: "",
    guarantor2Name: "",
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = useCallback(
    (from: "bot" | "user", text: string, quickReplies?: string[]) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          from,
          text,
          timestamp: new Date(),
          quickReplies,
        },
      ]);
    },
    [],
  );

  const simulateBotReply = useCallback(
    (text: string, delay = 800, quickReplies?: string[]) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage("bot", text, quickReplies);
      }, delay);
    },
    [addMessage],
  );

  // Auto-open in loan mode if triggered from loan page banner or URL param
  useEffect(() => {
    const flag = localStorage.getItem("jmd_chat_open_loan");
    const urlParams = new URLSearchParams(window.location.search);
    const urlFlag = urlParams.get("open_loan_agent");

    if (flag === "1" || urlFlag === "1") {
      if (flag === "1") localStorage.removeItem("jmd_chat_open_loan");
      if (urlFlag === "1") {
        window.history.replaceState({}, "", "/");
      }
      setIsOpen(true);
      setMode("loan_form");
      setStep("lf_full_name");
    }
  }, []);

  // Init greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (mode === "loan_form") {
        simulateBotReply(
          "🏦 Loan Form Assistant mein aapka swagat hai!\n\nMain aapka loan form step-by-step fill karne mein madad karunga.\n\nSabse pehle, aapka pura naam kya hai?",
          600,
        );
      } else {
        simulateBotReply(
          "👋 Namaste! Welcome to JMD FinCap. Please choose an option:",
          600,
          ["General Enquiry", "Fill Loan Form"],
        );
        setStep("mode_select");
      }
    }
  }, [isOpen, messages.length, mode, simulateBotReply]);

  // Auto-scroll
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── Loan Form Step Handler ──
  const handleLoanFormInput = useCallback(
    (value: string) => {
      const val = value.trim();
      const isSkip =
        val.toLowerCase() === "skip" ||
        val.toLowerCase() === "nahi hai" ||
        val.toLowerCase() === "nahi" ||
        val.toLowerCase() === "no" ||
        val.toLowerCase() === "n/a";

      switch (step) {
        case "lf_full_name":
          setLoanData((p) => ({ ...p, fullName: val }));
          simulateBotReply(
            `Accha, ${val}! 😊\n\nAapke pita / pati ka naam kya hai? (Father / Husband Name)`,
          );
          setStep("lf_father_name");
          break;

        case "lf_father_name":
          setLoanData((p) => ({ ...p, fatherHusbandName: val }));
          simulateBotReply(
            "Aapki janm tithi (Date of Birth) kya hai?\n\nFormat: DD/MM/YYYY ya '15 March 1990' — koi bhi format chalega.",
          );
          setStep("lf_dob");
          break;

        case "lf_dob":
          setLoanData((p) => ({ ...p, dateOfBirth: val }));
          simulateBotReply(
            "📱 Aapka primary mobile number kya hai? (10 digits)",
          );
          setStep("lf_mobile1");
          break;

        case "lf_mobile1":
          if (!/^[6-9]\d{9}$/.test(val.replace(/\s/g, ""))) {
            simulateBotReply(
              "⚠️ Ye valid mobile number nahi lag raha. Kripya 10-digit mobile number enter karein (jaise: 9876543210).",
            );
            return;
          }
          setLoanData((p) => ({ ...p, mobile1: val }));
          simulateBotReply(
            "📱 Kya aapke paas koi doosra mobile number hai? (Optional — 'skip' likhein agar nahi hai)",
          );
          setStep("lf_mobile2");
          break;

        case "lf_mobile2":
          setLoanData((p) => ({ ...p, mobile2: isSkip ? "" : val }));
          simulateBotReply(
            "✉️ Aapka email address kya hai? (Optional — 'skip' likhein agar nahi hai)",
          );
          setStep("lf_email");
          break;

        case "lf_email":
          setLoanData((p) => ({ ...p, email: isSkip ? "" : val }));
          simulateBotReply(
            "🏠 Aapka current (wartamaan) address kya hai?\n\nPura address likhein: Ghar no., Mohalla, Shahar, PIN.",
          );
          setStep("lf_current_address");
          break;

        case "lf_current_address":
          setLoanData((p) => ({ ...p, currentAddress: val }));
          simulateBotReply(
            "🏠 Aapka permanent (sthayi) address kya hai?\n\n'Same' likhein agar current address jaisa hi hai, ya naya address likhein.",
          );
          setStep("lf_permanent_address");
          break;

        case "lf_permanent_address": {
          const permAddr =
            val.toLowerCase() === "same" ||
            val.toLowerCase() === "same as current"
              ? loanData.currentAddress
              : val;
          setLoanData((p) => ({ ...p, permanentAddress: permAddr }));
          simulateBotReply(
            "📍 Nearest landmark kya hai aapke ghar ke paas? (Optional — 'skip' likhein)",
          );
          setStep("lf_landmark");
          break;
        }

        case "lf_landmark":
          setLoanData((p) => ({ ...p, nearestLandmark: isSkip ? "" : val }));
          simulateBotReply("🏡 Aapka ghar apna hai ya kiraye ka?", 800, [
            "Owned",
            "Rented",
          ]);
          setStep("lf_house_type");
          break;

        case "lf_house_type": {
          const lv = val.toLowerCase();
          let houseType = val;
          if (
            lv === "owned" ||
            lv === "apna" ||
            lv === "khud ka" ||
            lv.includes("apna") ||
            lv.includes("own")
          ) {
            houseType = "owned";
          } else if (
            lv === "rented" ||
            lv === "kiraye" ||
            lv === "rent" ||
            lv.includes("kira") ||
            lv.includes("rent")
          ) {
            houseType = "rented";
          }
          setLoanData((p) => ({ ...p, houseType }));
          simulateBotReply(
            "🪪 Aapka 12-digit Aadhaar card number kya hai?\n\n(Sirf numbers, koi space nahi)",
          );
          setStep("lf_aadhaar");
          break;
        }

        case "lf_aadhaar": {
          const digits = val.replace(/\s/g, "");
          if (!/^\d{12}$/.test(digits)) {
            simulateBotReply(
              "⚠️ Aadhaar number 12 digits ka hona chahiye. Kripya dobara enter karein.",
            );
            return;
          }
          setLoanData((p) => ({ ...p, aadhaarNumber: digits }));
          simulateBotReply(
            "💳 Aapka PAN card number kya hai? (Optional — 'skip' likhein agar nahi hai)\nFormat: ABCDE1234F",
          );
          setStep("lf_pan");
          break;
        }

        case "lf_pan":
          setLoanData((p) => ({
            ...p,
            panNumber: isSkip ? "" : val.toUpperCase(),
          }));
          simulateBotReply("💼 Aapka peshaa (occupation) kya hai?", 800, [
            "Job",
            "Business",
            "Labour",
            "Other",
          ]);
          setStep("lf_occupation");
          break;

        case "lf_occupation": {
          const lv = val.toLowerCase();
          let occ = val;
          if (lv === "job" || lv.includes("job") || lv.includes("naukri"))
            occ = "job";
          else if (
            lv === "business" ||
            lv.includes("business") ||
            lv.includes("dukaan")
          )
            occ = "business";
          else if (lv === "labour" || lv.includes("labour")) occ = "labour";
          else occ = "other";
          setLoanData((p) => ({ ...p, occupation: occ }));
          simulateBotReply(
            "🏢 Aapke kaam ki jagah / shop ka naam kya hai? (Optional — 'skip' likhein)",
          );
          setStep("lf_workplace");
          break;
        }

        case "lf_workplace":
          setLoanData((p) => ({ ...p, workplaceName: isSkip ? "" : val }));
          simulateBotReply(
            "💰 Aapki monthly income (mahine ki kamaai) kitni hai? (₹ mein)",
          );
          setStep("lf_monthly_income");
          break;

        case "lf_monthly_income":
          setLoanData((p) => ({ ...p, monthlyIncome: val }));
          simulateBotReply(
            "🏦 Aap kitne rupaye ka loan lena chahte hain? (₹ mein)",
          );
          setStep("lf_loan_amount");
          break;

        case "lf_loan_amount":
          setLoanData((p) => ({ ...p, loanAmount: val }));
          simulateBotReply(
            "📅 Loan kitne samay ke liye chahiye? (Duration)\nJaise: '12 months', '2 years'",
          );
          setStep("lf_loan_duration");
          break;

        case "lf_loan_duration":
          setLoanData((p) => ({ ...p, loanDuration: val }));
          simulateBotReply(
            "📊 Har mahine EMI kitni deni hogi? (Optional — 'skip' likhein agar pata nahi)",
          );
          setStep("lf_monthly_emi");
          break;

        case "lf_monthly_emi":
          setLoanData((p) => ({ ...p, monthlyEMI: isSkip ? "" : val }));
          simulateBotReply(
            "👥 Kya aapke paas koi guarantor (zamaanat dene wala) hai?\n\nGuarantor 1 ka naam likhein, ya 'skip' karein agar nahi hai.",
          );
          setStep("lf_guarantor1_name");
          break;

        case "lf_guarantor1_name":
          if (isSkip) {
            setLoanData((p) => ({
              ...p,
              guarantor1Name: "",
              guarantor1Mobile: "",
              guarantor1Relation: "",
              guarantor2Name: "",
            }));
            setStep("lf_summary");
            const d1 = { ...loanData };
            d1.guarantor1Name = "";
            d1.guarantor1Mobile = "";
            d1.guarantor1Relation = "";
            d1.guarantor2Name = "";
            const summary1 = buildLoanSummary(d1);
            simulateBotReply(
              `📋 Bahut badiya! Aapki saari details collect ho gayi hain. Yeh raha summary:\n\n${summary1}\n\nKya main yeh form fill kar doon?`,
              1000,
              ["✅ Haan, Fill Karo", "❌ Nahi"],
            );
          } else {
            setLoanData((p) => ({ ...p, guarantor1Name: val }));
            simulateBotReply("📱 Guarantor 1 ka mobile number kya hai?");
            setStep("lf_guarantor1_mobile");
          }
          break;

        case "lf_guarantor1_mobile":
          setLoanData((p) => ({ ...p, guarantor1Mobile: val }));
          simulateBotReply(
            "🤝 Guarantor 1 ka aapse kya rishta hai? (Relation)\nJaise: Bhai, Dost, Colleague",
          );
          setStep("lf_guarantor1_relation");
          break;

        case "lf_guarantor1_relation":
          setLoanData((p) => ({ ...p, guarantor1Relation: val }));
          simulateBotReply(
            "👥 Kya aapke paas doosra guarantor bhi hai?\n\nGuarantor 2 ka naam likhein, ya 'skip' karein.",
          );
          setStep("lf_guarantor2_name");
          break;

        case "lf_guarantor2_name": {
          setLoanData((p) => ({ ...p, guarantor2Name: isSkip ? "" : val }));
          setStep("lf_summary");
          const latestData: LoanFormData = {
            ...loanData,
            guarantor2Name: isSkip ? "" : val,
          };
          const summary2 = buildLoanSummary(latestData);
          simulateBotReply(
            `📋 Bahut badiya! Aapki saari details collect ho gayi hain. Yeh raha summary:\n\n${summary2}\n\nKya main yeh form fill kar doon?`,
            1000,
            ["✅ Haan, Fill Karo", "❌ Nahi"],
          );
          break;
        }

        case "lf_summary": {
          const lv2 = val.toLowerCase();
          const isConfirm =
            val === "✅ Haan, Fill Karo" ||
            lv2.includes("haan") ||
            lv2.includes("yes") ||
            lv2.includes("ha") ||
            lv2.includes("karo") ||
            lv2.includes("fill");

          if (isConfirm) {
            localStorage.setItem("jmd_loan_prefill", JSON.stringify(loanData));
            simulateBotReply(
              "✅ Shukriya! Ab main aapko Loan Application Form par le ja raha hoon. Wahan aapki saari details already filled hongi — bas check karein aur documents upload karein!",
              800,
            );
            setStep("lf_done");
            setTimeout(() => {
              window.location.href = "/apply?prefill=1";
            }, 1500);
          } else {
            simulateBotReply(
              "Theek hai! Koi baat nahi.\n\nAgar aap form dobara fill karna chahein to 'Reset' button dabayein aur doosra mode chunein.",
            );
            setStep("lf_done");
          }
          break;
        }

        case "lf_done":
          simulateBotReply(
            "Aapka form already submit ho raha hai! Agar koi aur madad chahiye to naya chat start karein.",
          );
          break;
      }
    },
    [step, loanData, simulateBotReply],
  );

  const handleUserInput = useCallback(
    async (value: string) => {
      if (!value.trim()) return;
      addMessage("user", value.trim());
      setInputValue("");

      // Mode selection
      if (step === "mode_select") {
        const lv = value.toLowerCase();
        const isLoan =
          value === "Fill Loan Form" ||
          lv.includes("loan") ||
          lv.includes("form") ||
          lv === "2";
        const isContact =
          value === "General Enquiry" ||
          lv.includes("enquiry") ||
          lv.includes("general") ||
          lv === "1";

        if (isLoan) {
          setMode("loan_form");
          setStep("lf_full_name");
          simulateBotReply(
            "🏦 Loan Form Assistant mein aapka swagat hai!\n\nMain aapka loan form step-by-step fill karne mein madad karunga.\n\nSabse pehle, aapka pura naam kya hai?",
          );
        } else if (isContact) {
          setMode("contact");
          setStep("ask_name");
          simulateBotReply(
            "Namaste! 😊 Main aapki general enquiry mein help karunga.\n\nSabse pehle, aapka shubh naam kya hai?",
          );
        } else {
          simulateBotReply("Kripya ek option chunein:", 400, [
            "General Enquiry",
            "Fill Loan Form",
          ]);
        }
        return;
      }

      // Loan form mode
      if (mode === "loan_form") {
        handleLoanFormInput(value);
        return;
      }

      // Contact enquiry mode
      switch (step) {
        case "ask_name":
          setUserData((p) => ({ ...p, name: value.trim() }));
          simulateBotReply(
            `Nice to meet you, ${value.trim()}! 📱 Please share your phone number so we can reach you.`,
          );
          setStep("ask_phone");
          break;

        case "ask_phone":
          setUserData((p) => ({ ...p, phone: value.trim() }));
          simulateBotReply(
            "Great! ✉️ What's your email address? (We'll send you a confirmation.)",
          );
          setStep("ask_email");
          break;

        case "ask_email":
          setUserData((p) => ({ ...p, email: value.trim() }));
          simulateBotReply(
            "Perfect! 🏦 Which service are you interested in? Please choose from the options below.",
          );
          setStep("ask_service");
          break;

        case "ask_service":
          setUserData((p) => ({ ...p, service: value }));
          simulateBotReply(
            `Excellent! You've selected *${value}*. 💬 Finally, please describe your requirements or any questions you have.`,
          );
          setStep("ask_message");
          break;

        case "ask_message": {
          const finalUserData = { ...userData, message: value.trim() };
          setUserData(finalUserData);
          simulateBotReply(
            `📋 Here's a summary:\n\n👤 Name: ${finalUserData.name}\n📱 Phone: ${finalUserData.phone}\n✉️ Email: ${finalUserData.email}\n🏦 Service: ${finalUserData.service}\n💬 Message: ${value.trim()}\n\nShall I submit this enquiry?`,
          );
          setStep("confirm");
          break;
        }

        case "confirm": {
          const lowerVal = value.toLowerCase();
          if (
            lowerVal.includes("yes") ||
            lowerVal.includes("submit") ||
            lowerVal.includes("ok") ||
            lowerVal.includes("haan") ||
            lowerVal.includes("ha") ||
            value === "✅ Yes, Submit"
          ) {
            setIsSubmitting(true);
            setIsTyping(true);
            try {
              if (actor) {
                await actor.submitContactForm(
                  userData.name,
                  userData.phone,
                  userData.email,
                  userData.service,
                  userData.message,
                );
              }
              setIsTyping(false);
              addMessage(
                "bot",
                "✅ Your enquiry has been submitted successfully! Our team will contact you within 24 hours. Thank you for choosing JMD FinCap! 🙏",
              );
              setStep("done");
            } catch {
              setIsTyping(false);
              addMessage(
                "bot",
                "Sorry, there was an error submitting your enquiry. Please call us directly at +91 88899 56204 or WhatsApp us.",
              );
            } finally {
              setIsSubmitting(false);
            }
          } else {
            simulateBotReply(
              "No problem! Please type 'Yes' to submit or feel free to contact us directly at +91 88899 56204.",
            );
          }
          break;
        }

        case "done":
          simulateBotReply(
            "We've already submitted your enquiry! Our team will reach out soon. Is there anything else I can help you with?",
          );
          break;
      }
    },
    [
      step,
      mode,
      userData,
      addMessage,
      simulateBotReply,
      actor,
      handleLoanFormInput,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(inputValue);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setMode("select");
    setStep("mode_select");
    setUserData({ name: "", phone: "", email: "", service: "", message: "" });
    setLoanData({
      fullName: "",
      fatherHusbandName: "",
      dateOfBirth: "",
      mobile1: "",
      mobile2: "",
      email: "",
      currentAddress: "",
      permanentAddress: "",
      nearestLandmark: "",
      houseType: "",
      aadhaarNumber: "",
      panNumber: "",
      occupation: "",
      workplaceName: "",
      workAddress: "",
      monthlyIncome: "",
      loanAmount: "",
      loanDuration: "",
      monthlyEMI: "",
      guarantor1Name: "",
      guarantor1Mobile: "",
      guarantor1Relation: "",
      guarantor2Name: "",
    });
    setInputValue("");
    setIsTyping(false);
    setIsSubmitting(false);
  };

  const lastBotMessage = [...messages].reverse().find((m) => m.from === "bot");
  const currentQuickReplies = !isTyping
    ? lastBotMessage?.quickReplies
    : undefined;

  const isLoanMode = mode === "loan_form";
  const headerTitle = isLoanMode
    ? "🏦 Loan Form Assistant"
    : "JMD FinCap Assistant";
  const loanStepNum = isLoanMode ? (LOAN_STEP_INDEX[step] ?? 0) : 0;
  const headerSubtitle = isLoanMode
    ? `Step ${loanStepNum}/${LOAN_FORM_TOTAL_STEPS}`
    : "Online";

  const quickReplyOnly =
    step === "mode_select" ||
    step === "lf_house_type" ||
    step === "lf_occupation" ||
    step === "lf_summary";
  const showInput =
    step !== "ask_service" &&
    step !== "confirm" &&
    step !== "lf_done" &&
    step !== "done" &&
    !(quickReplyOnly && currentQuickReplies && currentQuickReplies.length > 0);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-navy-900 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 group"
        aria-label={isOpen ? "Close assistant" : "Open JMD FinCap Assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        )}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-navy-700 animate-ping opacity-40" />
        )}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-navy-900 text-white text-xs font-body font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-navy opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {isLoanMode ? "Loan Agent" : "Ask our assistant"}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-4 border-transparent border-l-navy-900" />
        </div>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <dialog
          open
          className="fixed bottom-40 right-6 z-50 w-[22rem] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.2)] overflow-hidden animate-chat-slide-up flex flex-col p-0 m-0 border-0"
          style={{ height: "520px" }}
          aria-label="JMD FinCap Assistant"
        >
          {/* Header */}
          <div
            className={`px-5 py-4 flex items-center justify-between shrink-0 ${isLoanMode ? "bg-gradient-to-r from-navy-900 to-navy-800" : "bg-navy-900"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center ${isLoanMode ? "bg-gold-500 ring-2 ring-gold-300/40" : "bg-gold-500"}`}
              >
                <Bot className="h-5 w-5 text-navy-900" aria-hidden="true" />
              </div>
              <div>
                <div className="font-body text-sm font-semibold text-white">
                  {headerTitle}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isLoanMode ? (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                      <span className="font-body text-xs text-gold-300/80">
                        {headerSubtitle}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      <span className="font-body text-xs text-white/50">
                        Online
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={resetChat}
              className="text-white/40 hover:text-white transition-colors text-xs font-body focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 rounded px-1"
              aria-label="Reset conversation"
            >
              Reset
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll p-4 flex flex-col gap-3 bg-navy-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1.5">
                <div
                  className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.from === "bot" && (
                    <div className="h-7 w-7 rounded-full bg-gold-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot
                        className="h-4 w-4 text-navy-900"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-line ${
                      msg.from === "bot"
                        ? "bg-white text-navy-900 shadow-xs rounded-tl-none"
                        : "bg-navy-900 text-white rounded-tr-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                {msg.from === "bot" &&
                  msg.quickReplies &&
                  msg.id === lastBotMessage?.id &&
                  !isTyping && (
                    <div className="flex flex-wrap gap-1.5 pl-9">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          type="button"
                          onClick={() => handleUserInput(qr)}
                          className="px-3 py-1.5 text-xs font-body font-medium rounded-full border border-gold-500/60 bg-white text-navy-900 hover:bg-gold-500 hover:text-navy-900 hover:border-gold-500 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 shadow-xs"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="h-7 w-7 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-navy-900" aria-hidden="true" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-xs flex gap-1 items-center">
                  <span className="typing-dot h-2 w-2 rounded-full bg-navy-600 inline-block" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-navy-600 inline-block" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-navy-600 inline-block" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Service selection buttons */}
          {step === "ask_service" && !isTyping && (
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-2 shrink-0">
              {SERVICES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleUserInput(s)}
                  className="px-3 py-1.5 text-xs font-body font-medium rounded-full border border-navy-800/20 bg-navy-50 text-navy-800 hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Confirm buttons */}
          {step === "confirm" && !isTyping && (
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleUserInput("✅ Yes, Submit")}
                disabled={isSubmitting}
                className="flex-1 py-2 text-xs font-body font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-700 disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 flex items-center justify-center gap-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "✅ Yes, Submit"
                )}
              </button>
              <button
                type="button"
                onClick={() => handleUserInput("No")}
                disabled={isSubmitting}
                className="flex-1 py-2 text-xs font-body font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                ✏️ Edit
              </button>
            </div>
          )}

          {/* Text input area */}
          {showInput && (
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
              <input
                ref={inputRef}
                type={
                  step === "ask_phone" ||
                  step === "lf_mobile1" ||
                  step === "lf_mobile2" ||
                  step === "lf_guarantor1_mobile"
                    ? "tel"
                    : step === "ask_email" || step === "lf_email"
                      ? "email"
                      : "text"
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getLoanStepPlaceholder(step)}
                disabled={isTyping || isSubmitting}
                className="flex-1 text-sm font-body px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:opacity-50 bg-white"
                autoComplete={
                  step === "ask_name" || step === "lf_full_name"
                    ? "name"
                    : step === "ask_phone" || step === "lf_mobile1"
                      ? "tel"
                      : step === "ask_email" || step === "lf_email"
                        ? "email"
                        : "off"
                }
              />
              <button
                type="button"
                onClick={() => handleUserInput(inputValue)}
                disabled={!inputValue.trim() || isTyping || isSubmitting}
                className="h-10 w-10 rounded-lg bg-navy-900 text-white flex items-center justify-center hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {(step === "done" || step === "lf_done") && (
            <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0 text-center">
              <button
                type="button"
                onClick={resetChat}
                className="text-xs font-body text-gold-600 hover:text-gold-500 underline focus-visible:outline-none"
              >
                Start a new conversation
              </button>
            </div>
          )}
        </dialog>
      )}
    </>
  );
}

// ─── Loan Summary Builder ─────────────────────────────────────────────────────

function buildLoanSummary(d: LoanFormData): string {
  const lines: string[] = [
    `👤 Naam: ${d.fullName}`,
    `👨 Pita/Pati: ${d.fatherHusbandName}`,
    `🎂 DOB: ${d.dateOfBirth}`,
    `📱 Mobile: ${d.mobile1}${d.mobile2 ? ` / ${d.mobile2}` : ""}`,
    d.email ? `✉️ Email: ${d.email}` : "",
    `🏠 Current Address: ${d.currentAddress.slice(0, 40)}...`,
    `🏡 House Type: ${d.houseType}`,
    `🪪 Aadhaar: ****${d.aadhaarNumber.slice(-4)}`,
    d.panNumber ? `💳 PAN: ${d.panNumber}` : "",
    `💼 Occupation: ${d.occupation}`,
    `💰 Monthly Income: ₹${d.monthlyIncome}`,
    `🏦 Loan Amount: ₹${d.loanAmount}`,
    `📅 Duration: ${d.loanDuration}`,
    d.monthlyEMI ? `📊 EMI: ₹${d.monthlyEMI}` : "",
    d.guarantor1Name ? `👥 Guarantor 1: ${d.guarantor1Name}` : "",
    d.guarantor2Name ? `👥 Guarantor 2: ${d.guarantor2Name}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

// ─── Loan Step Placeholder ────────────────────────────────────────────────────

function getLoanStepPlaceholder(step: ChatStep): string {
  switch (step) {
    case "lf_full_name":
      return "Apna pura naam likhein...";
    case "lf_father_name":
      return "Pita / pati ka naam...";
    case "lf_dob":
      return "DD/MM/YYYY ya 15 March 1990...";
    case "lf_mobile1":
      return "10-digit mobile number...";
    case "lf_mobile2":
      return "Mobile number ya 'skip'...";
    case "lf_email":
      return "Email ya 'skip'...";
    case "lf_current_address":
      return "Pura address likhein...";
    case "lf_permanent_address":
      return "Address ya 'same'...";
    case "lf_landmark":
      return "Landmark ya 'skip'...";
    case "lf_aadhaar":
      return "12-digit Aadhaar number...";
    case "lf_pan":
      return "PAN number ya 'skip'...";
    case "lf_workplace":
      return "Workplace naam ya 'skip'...";
    case "lf_monthly_income":
      return "Monthly income ₹...";
    case "lf_loan_amount":
      return "Loan amount ₹...";
    case "lf_loan_duration":
      return "e.g. 12 months...";
    case "lf_monthly_emi":
      return "EMI amount ya 'skip'...";
    case "lf_guarantor1_name":
      return "Guarantor naam ya 'skip'...";
    case "lf_guarantor1_mobile":
      return "Mobile number...";
    case "lf_guarantor1_relation":
      return "Rishta (Bhai, Dost...)";
    case "lf_guarantor2_name":
      return "Guarantor naam ya 'skip'...";
    case "ask_name":
      return "Your name...";
    case "ask_phone":
      return "Phone number...";
    case "ask_email":
      return "Email address...";
    case "ask_message":
      return "Your message...";
    default:
      return "Type a message...";
  }
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export function HomePage() {
  useScrollFade();

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      <Navbar />

      <main>
        <HeroSection />
        <AboutSection />
        <WhyChooseUsSection />
        <TrustPartnersBand />
        <ServicesSection />
        <TeamSection />
        <ContactSection />
      </main>

      <Footer />

      {/* Floating buttons */}
      <AIChatWidget />
      <WhatsAppButton />
    </div>
  );
}

// ─── App Root (Router) ────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
