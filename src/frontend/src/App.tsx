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
  ChevronDown,
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
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import { useActor } from "./hooks/useActor";
import { router } from "./router";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatStep =
  | "greeting"
  | "ask_name"
  | "ask_phone"
  | "ask_email"
  | "ask_service"
  | "ask_message"
  | "confirm"
  | "done";

interface ChatMessage {
  id: string;
  from: "bot" | "user";
  text: string;
  timestamp: Date;
}

interface UserData {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}

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
      { threshold: 0.1 },
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Team", href: "#team" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-navy-900 shadow-navy py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo + Name */}
        <button
          type="button"
          onClick={() => scrollTo("#home")}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
          aria-label="JMD FinCap — Go to top"
        >
          <img
            src="/assets/generated/jmd-fincap-logo-transparent.dim_400x200.png"
            alt="JMD FinCap logo"
            className="h-10 w-auto object-contain"
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
              className="text-sm font-body font-medium text-white/80 hover:text-gold-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded px-1"
            >
              {link.label}
            </button>
          ))}
          <a
            href="/admin"
            className="text-xs font-body font-medium text-white/30 hover:text-white/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded px-1"
            aria-label="Admin panel"
          >
            Admin
          </a>
          <button
            type="button"
            onClick={() => scrollTo("#contact")}
            className="ml-4 px-5 py-2 rounded text-sm font-semibold bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Get Consultation
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden text-white p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
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
          className="md:hidden bg-navy-900 border-t border-white/10 px-4 py-4 flex flex-col gap-1"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-left py-3 px-4 text-white/80 hover:text-gold-500 hover:bg-white/5 rounded font-body font-medium transition-colors duration-200"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => scrollTo("#contact")}
            className="mt-3 mx-4 py-3 rounded text-sm font-semibold bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors"
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
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.70 0.13 72 / 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, oklch(0.22 0.06 252 / 0.6) 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 60px,
              oklch(0.70 0.13 72 / 0.3) 60px,
              oklch(0.70 0.13 72 / 0.3) 61px
            )`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/40 bg-gold-500/10 mb-6 animate-fade-in">
            <Star
              className="h-4 w-4 text-gold-500 fill-gold-500"
              aria-hidden="true"
            />
            <span className="text-sm font-body font-medium text-gold-500">
              Trusted Financial Advisory Since 2018
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
            Your Trusted <span className="text-gold-500 italic">Financial</span>
            <br />
            Partner
          </h1>

          {/* Subheadline */}
          <p className="font-body text-lg md:text-xl text-white/70 max-w-xl mb-10 leading-relaxed animate-slide-up">
            Expert guidance on home loans, business financing, investment
            planning, insurance & more. Serving families and businesses across
            Madhya Pradesh.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            <button
              type="button"
              onClick={scrollToContact}
              className="px-8 py-4 rounded font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 transition-all duration-200 shadow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Get Free Consultation
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#services")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 rounded font-body font-semibold text-white border border-white/30 hover:border-gold-500 hover:text-gold-500 transition-all duration-200 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              Our Services
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg animate-fade-in">
            {[
              { icon: Users, value: "5,000+", label: "Happy Clients" },
              { icon: Award, value: "6+", label: "Years Experience" },
              { icon: BarChart3, value: "₹500Cr+", label: "Loans Processed" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon
                  className="h-6 w-6 text-gold-500 mx-auto mb-2"
                  aria-hidden="true"
                />
                <div className="font-display text-2xl font-bold text-white">
                  {value}
                </div>
                <div className="font-body text-xs text-white/50 mt-1">
                  {label}
                </div>
              </div>
            ))}
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
  return (
    <section
      id="about"
      className="py-24 bg-white"
      aria-label="About JMD FinCap"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="section-fade relative">
            <div className="relative rounded-2xl overflow-hidden bg-navy-900 p-12 text-white">
              {/* Decorative gold accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500 opacity-10 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-500 opacity-10 rounded-tr-full" />

              <div className="relative z-10">
                <div className="text-gold-500 font-body text-sm font-semibold tracking-widest uppercase mb-4">
                  Est. 2018
                </div>
                <h3 className="font-display text-3xl font-bold mb-6">
                  JMD FinCap Pvt. Ltd.
                </h3>
                <p className="font-body text-white/70 leading-relaxed mb-6">
                  Headquartered in Khargone, Madhya Pradesh, we have been
                  transforming financial futures since 2018.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                  {[
                    { label: "States Served", value: "3+" },
                    { label: "Service Types", value: "6" },
                    { label: "Team Members", value: "20+" },
                    { label: "Cities", value: "10+" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="font-display text-2xl font-bold text-gold-500">
                        {value}
                      </div>
                      <div className="font-body text-xs text-white/50 mt-1">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="section-fade">
            <div className="text-gold-500 font-body text-sm font-semibold tracking-widest uppercase mb-4">
              About Us
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900 mb-6 gold-underline">
              Empowering Your
              <br />
              <em className="not-italic text-gold-500">Financial Journey</em>
            </h2>
            <p className="font-body text-gray-600 leading-relaxed mb-6">
              JMD FinCap is a premier financial advisory firm founded with a
              mission to make quality financial services accessible to every
              Indian household and business. We bridge the gap between clients
              and their financial goals with honesty, expertise, and
              personalized guidance.
            </p>
            <p className="font-body text-gray-600 leading-relaxed mb-8">
              Based in Khargone, Madhya Pradesh, our team of certified financial
              professionals serves clients across the region — offering tailored
              solutions in loans, investments, insurance, and wealth management.
            </p>

            <div className="flex flex-col gap-4">
              {[
                "IRDAI-registered insurance advisory",
                "AMFI-certified mutual fund distribution",
                "Transparent processes, zero hidden charges",
                "Dedicated relationship managers",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-gold-500 shrink-0" />
                  <span className="font-body text-gray-700 text-sm">
                    {point}
                  </span>
                </div>
              ))}
            </div>
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
  color: string;
}

const serviceCards: ServiceCard[] = [
  {
    icon: Home,
    title: "Home Loans",
    description:
      "Realize your dream of owning a home with competitive interest rates, minimal documentation, and quick disbursal.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Briefcase,
    title: "Business Loans",
    description:
      "Scale your business with tailored financing solutions — from working capital to expansion loans.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Investment Planning",
    description:
      "Build lasting wealth through strategic investment portfolios aligned with your risk appetite and goals.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Shield,
    title: "Insurance",
    description:
      "Protect what matters most. Life, health, motor and property insurance from India's leading providers.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: PieChart,
    title: "Mutual Funds",
    description:
      "Start your SIP or lump sum investment journey with expert fund selection and portfolio tracking.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: FileText,
    title: "Tax Planning",
    description:
      "Legally minimize your tax liability with smart ITR filing, 80C investments and tax-saving strategies.",
    color: "bg-rose-50 text-rose-600",
  },
];

function ServicesSection() {
  return (
    <section
      id="services"
      className="py-24 bg-navy-50"
      aria-label="Our Services"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 section-fade">
          <div className="text-gold-500 font-body text-sm font-semibold tracking-widest uppercase mb-4">
            What We Offer
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900">
            Our Financial Services
          </h2>
          <div className="mt-4 mx-auto h-1 w-16 bg-gold-500 rounded" />
          <p className="mt-6 font-body text-gray-600 max-w-xl mx-auto leading-relaxed">
            Comprehensive financial solutions designed to meet every milestone
            of your personal and professional life.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCards.map((svc, i) => (
            <div
              key={svc.title}
              className="section-fade bg-white rounded-xl p-8 shadow-xs hover:shadow-card-hover transition-all duration-300 group border border-transparent hover:border-gold-500/30"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div
                className={`inline-flex items-center justify-center h-14 w-14 rounded-xl mb-6 ${svc.color}`}
              >
                <svc.icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy-900 mb-3">
                {svc.title}
              </h3>
              <p className="font-body text-gray-600 text-sm leading-relaxed">
                {svc.description}
              </p>
              <div className="mt-6 h-0.5 w-0 bg-gold-500 group-hover:w-full transition-all duration-500 rounded" />
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
      name: "Sawan Solanki",
      role: "CEO & Founder",
      initials: "SS",
      description:
        "A visionary leader with 10+ years in financial services. Sawan founded JMD FinCap with the goal of democratizing access to quality financial guidance across Madhya Pradesh.",
      expertise: [
        "Strategic Planning",
        "Wealth Management",
        "Corporate Finance",
      ],
    },
    {
      name: "Sawan Chouhan",
      role: "Co-Founder",
      initials: "SC",
      description:
        "An expert in loan structuring and insurance advisory, Sawan Chouhan co-founded JMD FinCap to create a client-first financial services firm rooted in transparency and trust.",
      expertise: ["Loan Advisory", "Insurance Planning", "Client Relations"],
    },
  ];

  return (
    <section id="team" className="py-24 bg-white" aria-label="Our Team">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 section-fade">
          <div className="text-gold-500 font-body text-sm font-semibold tracking-widest uppercase mb-4">
            Leadership
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900">
            Meet Our Team
          </h2>
          <div className="mt-4 mx-auto h-1 w-16 bg-gold-500 rounded" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <div
              key={member.name}
              className="section-fade bg-navy-50 rounded-2xl overflow-hidden group hover:shadow-card-hover transition-all duration-300"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Header */}
              <div className="bg-navy-900 px-8 py-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full" />
                <div className="relative z-10 flex items-center gap-5">
                  <div className="h-20 w-20 rounded-full bg-gold-500 flex items-center justify-center shrink-0 text-navy-900 font-display text-2xl font-bold shadow-gold">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {member.name}
                    </h3>
                    <p className="font-body text-gold-500 text-sm font-medium mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-6">
                <p className="font-body text-gray-600 text-sm leading-relaxed mb-6">
                  {member.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-body font-medium rounded-full bg-gold-100 text-navy-800 border border-gold-500/20"
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
    <section id="contact" className="py-24 bg-navy-900" aria-label="Contact Us">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Info */}
          <div className="section-fade">
            <div className="text-gold-500 font-body text-sm font-semibold tracking-widest uppercase mb-4">
              Get In Touch
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Start Your Financial
              <br />
              <em className="not-italic text-gold-500">Journey Today</em>
            </h2>
            <p className="font-body text-white/60 leading-relaxed mb-10">
              Have questions? Ready to get started? Our team is here to guide
              you every step of the way. Reach out and we'll respond within 24
              hours.
            </p>

            <div className="flex flex-col gap-6">
              {[
                {
                  icon: Phone,
                  label: "WhatsApp / Call",
                  value: "+91 73546 96765",
                  href: "tel:+917354696765",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "contact.jmdfincap@gmail.com",
                  href: "mailto:contact.jmdfincap@gmail.com",
                },
                {
                  icon: MapPin,
                  label: "Office Address",
                  value: "Bistan Road, Khargone, Madhya Pradesh",
                  href: null,
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0">
                    <Icon
                      className="h-5 w-5 text-gold-500"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <div className="font-body text-xs text-white/40 uppercase tracking-wider mb-1">
                      {label}
                    </div>
                    {href ? (
                      <a
                        href={href}
                        className="font-body text-white hover:text-gold-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-body text-white">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="section-fade">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 shadow-navy"
              noValidate
            >
              <h3 className="font-display text-2xl font-bold text-navy-900 mb-6">
                Request a Free Consultation
              </h3>

              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <Label
                    htmlFor="cf-name"
                    className="font-body text-navy-800 text-sm font-medium mb-2 block"
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
                    className="font-body border-gray-200 focus:border-gold-500 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="cf-phone"
                    className="font-body text-navy-800 text-sm font-medium mb-2 block"
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
                    className="font-body border-gray-200 focus:border-gold-500 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="mb-5">
                <Label
                  htmlFor="cf-email"
                  className="font-body text-navy-800 text-sm font-medium mb-2 block"
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
                  className="font-body border-gray-200 focus:border-gold-500 focus:ring-gold-500"
                />
              </div>

              <div className="mb-5">
                <Label
                  htmlFor="cf-service"
                  className="font-body text-navy-800 text-sm font-medium mb-2 block"
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
                    className="font-body border-gray-200"
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

              <div className="mb-6">
                <Label
                  htmlFor="cf-message"
                  className="font-body text-navy-800 text-sm font-medium mb-2 block"
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
                  className="font-body border-gray-200 focus:border-gold-500 focus:ring-gold-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || isFetching}
                className="w-full py-3.5 rounded font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Enquiry"
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
      className="bg-navy-900 border-t border-white/10"
      aria-label="Footer"
    >
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <img
              src="/assets/generated/jmd-fincap-logo-transparent.dim_400x200.png"
              alt="JMD FinCap"
              className="h-12 w-auto mb-4"
            />
            <p className="font-body text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Your trusted partner for comprehensive financial services in
              Madhya Pradesh.
            </p>
            <div className="flex flex-col gap-3">
              {[
                {
                  icon: Phone,
                  text: "+91 73546 96765",
                  href: "tel:+917354696765",
                },
                {
                  icon: Mail,
                  text: "contact.jmdfincap@gmail.com",
                  href: "mailto:contact.jmdfincap@gmail.com",
                },
                { icon: MapPin, text: "Bistan Road, Khargone, MP", href: null },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon
                    className="h-4 w-4 text-gold-500 shrink-0"
                    aria-hidden="true"
                  />
                  {href ? (
                    <a
                      href={href}
                      className="font-body text-white/60 text-sm hover:text-gold-500 transition-colors"
                    >
                      {text}
                    </a>
                  ) : (
                    <span className="font-body text-white/60 text-sm">
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
                    className="font-body text-white/50 text-sm hover:text-gold-500 transition-colors duration-200 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 rounded"
                  >
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
                    className="font-body text-white/50 text-sm hover:text-gold-500 transition-colors duration-200 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 rounded"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/917354696765?text=Hello%20JMD%20FinCap%2C%20I%20need%20financial%20advice"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#25D366] text-white font-body text-sm font-semibold hover:bg-[#1ebe5d] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <SiWhatsapp className="h-4 w-4" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-white/40 text-sm">
            © {year} JMD FinCap. All rights reserved.
          </p>
          <p className="font-body text-white/30 text-xs">
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white/60 transition-colors underline"
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
      href="https://wa.me/917354696765?text=Hello%20JMD%20FinCap%2C%20I%20need%20financial%20advice"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="relative">
        <div className="h-14 w-14 rounded-full bg-[#25D366] shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center text-white">
          <SiWhatsapp className="h-7 w-7" aria-hidden="true" />
        </div>
        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-navy-900 text-white text-xs font-body font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-navy opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<ChatStep>("greeting");
  const [userData, setUserData] = useState<UserData>({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = useCallback((from: "bot" | "user", text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        from,
        text,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const simulateBotReply = useCallback(
    (text: string, delay = 800) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage("bot", text);
      }, delay);
    },
    [addMessage],
  );

  // Init greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      simulateBotReply(
        "👋 Namaste! Welcome to JMD FinCap. I'm your financial assistant. May I know your good name?",
        600,
      );
      setStep("ask_name");
    }
  }, [isOpen, messages.length, simulateBotReply]);

  // Auto-scroll — we intentionally list messages/isTyping as deps to scroll on new content
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

  const handleUserInput = useCallback(
    async (value: string) => {
      if (!value.trim()) return;
      addMessage("user", value.trim());
      setInputValue("");

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
                "Sorry, there was an error submitting your enquiry. Please call us directly at +91 73546 96765 or WhatsApp us.",
              );
            } finally {
              setIsSubmitting(false);
            }
          } else {
            simulateBotReply(
              "No problem! Please type 'Yes' to submit or feel free to contact us directly at +91 73546 96765.",
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
    [step, userData, addMessage, simulateBotReply, actor],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(inputValue);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setStep("greeting");
    setUserData({ name: "", phone: "", email: "", service: "", message: "" });
    setInputValue("");
    setIsTyping(false);
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Chat Toggle Button — bottom-right above WhatsApp */}
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
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-navy-700 animate-ping opacity-40" />
        )}
        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-navy-900 text-white text-xs font-body font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-navy opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Ask our assistant
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-4 border-transparent border-l-navy-900" />
        </div>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <dialog
          open
          className="fixed bottom-40 right-6 z-50 w-[22rem] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.2)] overflow-hidden animate-chat-slide-up flex flex-col p-0 m-0 border-0"
          style={{ height: "480px" }}
          aria-label="JMD FinCap Assistant"
        >
          {/* Header */}
          <div className="bg-navy-900 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gold-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-navy-900" aria-hidden="true" />
              </div>
              <div>
                <div className="font-body text-sm font-semibold text-white">
                  JMD FinCap Assistant
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span className="font-body text-xs text-white/50">
                    Online
                  </span>
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
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.from === "bot" && (
                  <div className="h-7 w-7 rounded-full bg-gold-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-navy-900" aria-hidden="true" />
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
            ))}

            {/* Typing indicator */}
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

          {/* Input area */}
          {step !== "ask_service" && step !== "confirm" && (
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
              <input
                ref={inputRef}
                type={
                  step === "ask_phone"
                    ? "tel"
                    : step === "ask_email"
                      ? "email"
                      : "text"
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  step === "ask_name"
                    ? "Your name..."
                    : step === "ask_phone"
                      ? "Phone number..."
                      : step === "ask_email"
                        ? "Email address..."
                        : step === "ask_message"
                          ? "Your message..."
                          : "Type a message..."
                }
                disabled={isTyping || isSubmitting || step === "done"}
                className="flex-1 text-sm font-body px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:opacity-50 bg-white"
                autoComplete={
                  step === "ask_name"
                    ? "name"
                    : step === "ask_phone"
                      ? "tel"
                      : step === "ask_email"
                        ? "email"
                        : "off"
                }
              />
              <button
                type="button"
                onClick={() => handleUserInput(inputValue)}
                disabled={
                  !inputValue.trim() ||
                  isTyping ||
                  isSubmitting ||
                  step === "done"
                }
                className="h-10 w-10 rounded-lg bg-navy-900 text-white flex items-center justify-center hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </dialog>
      )}
    </>
  );
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
