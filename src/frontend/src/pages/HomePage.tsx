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
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useMutation } from "@tanstack/react-query";
import {
  Award,
  BarChart3,
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
import { useEffect, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

function getActiveLogo(): string {
  try {
    const stored = localStorage.getItem("jmd_custom_logo");
    if (stored?.startsWith("data:")) return stored;
  } catch {
    /* ignore */
  }
  return LOGO;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function HomeNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(getActiveLogo);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      const sections = ["home", "about", "services", "team", "contact"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 100) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "jmd_custom_logo") setLogoSrc(getActiveLogo());
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
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => scrollTo("#home")}
          className="flex items-center gap-2"
        >
          <img
            src={logoSrc}
            alt="JMD FinCap"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </button>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? activeSection === link.id
                    ? "text-gold-600"
                    : "text-navy-700 hover:text-gold-500"
                  : activeSection === link.id
                    ? "text-white"
                    : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
            </button>
          ))}
          <a
            href="/login"
            className={`text-sm font-medium transition-colors ${
              scrolled
                ? "text-navy-700 hover:text-gold-500"
                : "text-white/80 hover:text-white"
            }`}
          >
            Customer Login
          </a>
          <a
            href="/apply"
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors shadow"
          >
            Apply Now
          </a>
        </nav>

        <button
          type="button"
          className={`md:hidden p-2 ${scrolled ? "text-navy-900" : "text-white"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-lg">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-left py-3 px-4 rounded text-navy-800 hover:text-gold-500 hover:bg-gray-50 font-medium"
            >
              {link.label}
            </button>
          ))}
          <a
            href="/login"
            className="py-3 px-4 text-navy-800 hover:text-gold-500 font-medium"
          >
            Customer Login
          </a>
          <a
            href="/apply"
            className="mt-2 mx-4 py-3 text-center rounded-full font-semibold bg-gold-500 text-navy-900"
          >
            Apply Now
          </a>
        </nav>
      )}
    </header>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-navy-900 overflow-hidden"
    >
      <img
        src="/assets/generated/hero-financial-bg.dim_1920x900.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.065 252 / 0.95), oklch(0.22 0.06 252 / 0.85))",
        }}
      />
      <div className="container mx-auto px-4 pt-28 pb-20 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/40 bg-gold-500/10 mb-8">
            <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
            <span className="text-sm font-semibold text-gold-400 tracking-wide">
              Trusted Financial Advisory Since 2018
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Financial Solutions
            <br />
            <span className="text-gold-400">for a Brighter Future</span>
          </h1>

          <p className="text-lg md:text-xl text-white/75 max-w-xl mb-10 leading-relaxed">
            Expert guidance on loans, investments, insurance and more. Serving
            families and businesses across Madhya Pradesh.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="/apply"
              data-ocid="hero.apply.button"
              className="px-8 py-4 rounded-full font-semibold bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-lg text-center transition-colors"
            >
              Apply for Loan
            </a>
            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 rounded-full font-semibold text-white border-2 border-white/30 hover:border-white/60 transition-colors text-center"
            >
              Get Free Consultation
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {[
              { icon: Users, value: "5,000+", label: "Happy Clients" },
              { icon: Award, value: "6+", label: "Years Experience" },
              { icon: BarChart3, value: "₹500Cr+", label: "Loans Processed" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center"
              >
                <Icon className="h-5 w-5 text-gold-400 mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-white">
                  {value}
                </div>
                <div className="text-xs text-white/55 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <ChevronDown className="h-6 w-6" />
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

const services = [
  {
    icon: Home,
    title: "Home Loans",
    desc: "Competitive rates, minimal documentation, and quick disbursal to realize your dream home.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Briefcase,
    title: "Business Loans",
    desc: "Scale your business with tailored financing — from working capital to expansion loans.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Investment Planning",
    desc: "Build lasting wealth through strategic portfolios aligned with your risk appetite.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Shield,
    title: "Insurance",
    desc: "Protect what matters most. Life, health, motor and property from leading providers.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: PieChart,
    title: "Mutual Funds",
    desc: "Start your SIP or lump sum journey with expert fund selection and portfolio tracking.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: FileText,
    title: "Tax Planning",
    desc: "Legally minimize your tax liability with smart ITR filing and 80C investments.",
    color: "bg-rose-50 text-rose-600",
  },
];

function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">
            What We Offer
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900">
            Our Financial Services
          </h2>
          <div className="mt-4 mx-auto h-0.5 w-16 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.title}
              className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gold-500/40 hover:shadow-lg transition-all duration-300 group"
            >
              <div
                className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-6 ${svc.color}`}
              >
                <svc.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy-900 mb-3">
                {svc.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gold-500 text-navy-900 font-semibold hover:bg-gold-400 transition-colors"
          >
            View All Services
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ─────────────────────────────────────────────────────────────

function WhySection() {
  const features = [
    {
      icon: Zap,
      title: "Fast Approval",
      desc: "Loan decisions within 48 hours with minimal documentation.",
    },
    {
      icon: Shield,
      title: "Trusted Experts",
      desc: "6+ years of proven experience with IRDAI & AMFI certified advisors.",
    },
    {
      icon: Eye,
      title: "Transparent Process",
      desc: "No hidden fees, no surprises. Every step is clear upfront.",
    },
    {
      icon: MapPin,
      title: "Local Support",
      desc: "Deep roots in Khargone, MP. We understand your local needs.",
    },
  ];
  return (
    <section className="py-24 bg-navy-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="text-gold-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Our Advantage
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Why Choose Us?
          </h2>
          <div className="mt-4 mx-auto h-0.5 w-16 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="bg-white/[0.06] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.09] transition-all duration-300 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-gold-500 flex items-center justify-center mb-6">
                <feat.icon className="h-7 w-7 text-navy-900" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                {feat.title}
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About Section ─────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="bg-navy-900 rounded-2xl p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/[0.07] rounded-bl-full" />
            <div className="text-gold-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Est. 2018
            </div>
            <h3 className="font-display text-3xl font-bold mb-5">
              JMD FinCap Pvt. Ltd.
            </h3>
            <p className="text-white/65 text-sm leading-relaxed mb-6">
              Headquartered in Khargone, Madhya Pradesh — transforming financial
              futures since 2018. Bridging the gap between clients and their
              goals with honesty and expertise.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
              {[
                { l: "States Served", v: "3+" },
                { l: "Service Types", v: "6" },
                { l: "Team Members", v: "20+" },
                { l: "Cities", v: "10+" },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div className="font-display text-2xl font-bold text-gold-400">
                    {v}
                  </div>
                  <div className="text-xs text-white/45 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              About Us
            </div>
            <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">
              Empowering Your{" "}
              <span className="text-gold-500">Financial Journey</span>
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              JMD FinCap is a premier financial advisory firm founded with a
              mission to make quality financial services accessible to every
              Indian household and business.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Based in Khargone, our certified professionals serve clients
              across the region — offering tailored solutions in loans,
              investments, insurance, and wealth management.
            </p>
            <div className="flex flex-col gap-4">
              {[
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
                  desc: "Complete honesty — what you see is what you pay.",
                },
              ].map((feat) => (
                <div key={feat.title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gold-100 flex items-center justify-center shrink-0">
                    <feat.icon className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm mb-0.5">
                      {feat.title}
                    </div>
                    <div className="text-gray-500 text-xs leading-relaxed">
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

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamSection() {
  const team = [
    {
      name: "CEO",
      role: "Chief Executive Officer",
      photo: "/assets/generated/team-ceo.dim_300x300.jpg",
      initials: "CEO",
      expertise: [
        "Strategic Planning",
        "Wealth Management",
        "Corporate Finance",
      ],
    },
    {
      name: "Co-Founder",
      role: "Co-Founder & Director",
      photo: "/assets/generated/team-cio.dim_300x300.jpg",
      initials: "CF",
      expertise: ["Loan Advisory", "Insurance Planning", "Client Relations"],
    },
  ];
  return (
    <section id="team" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Leadership
          </div>
          <h2 className="font-display text-4xl font-bold text-navy-900">
            Meet Our Team
          </h2>
          <div className="mt-4 mx-auto h-0.5 w-16 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((m) => (
            <div
              key={m.name}
              className="rounded-2xl overflow-hidden bg-navy-900 text-white"
            >
              <div className="px-8 py-8 flex items-center gap-5 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/[0.06] rounded-bl-full" />
                <img
                  src={m.photo}
                  alt={m.name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-gold-500 ring-offset-2 ring-offset-navy-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <h3 className="font-display text-xl font-bold">{m.name}</h3>
                  <p className="text-gold-400 text-sm font-semibold mt-1">
                    {m.role}
                  </p>
                </div>
              </div>
              <div className="px-8 py-5 bg-white/[0.03] border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {m.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-semibold rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20"
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

// ─── Contact ──────────────────────────────────────────────────────────────────

function ContactSection() {
  const { actor, isFetching } = useActor();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (!actor) throw new Error("Service unavailable.");
      await actor.submitContactForm(
        data.name,
        data.phone,
        data.email,
        data.service,
        data.message,
      );
    },
    onSuccess: () => {
      toast.success("Thank you! We'll contact you within 24 hours.");
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.service) {
      toast.error("Please fill all required fields.");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Get In Touch
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900">
            Start Your Financial{" "}
            <span className="text-gold-500">Journey Today</span>
          </h2>
          <div className="mt-4 mx-auto h-0.5 w-16 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded" />
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Have questions? Our team is here to guide you every step of the
              way. We'll respond within 24 hours.
            </p>
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100">
                <div className="h-12 w-12 rounded-xl bg-navy-900 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">
                    Call / WhatsApp
                  </div>
                  <a
                    href="tel:+918889956204"
                    className="text-navy-900 font-medium text-sm hover:text-gold-500"
                  >
                    +91 88899 56204
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100">
                <div className="h-12 w-12 rounded-xl bg-navy-900 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">
                    Email
                  </div>
                  <a
                    href="mailto:contact.jmdfincap@gmail.com"
                    className="text-navy-900 font-medium text-sm hover:text-gold-500"
                  >
                    contact.jmdfincap@gmail.com
                  </a>
                </div>
              </div>
            </div>
            <a
              href="https://wa.me/918889956204?text=Hello%20JMD%20FinCap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#25D366] text-white font-semibold hover:bg-[#1ebe5d] transition-colors shadow-lg"
            >
              <SiWhatsapp className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <h3 className="font-display text-2xl font-bold text-navy-900 mb-6">
              Request a Free Consultation
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                >
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Ramesh Kumar"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                >
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
              >
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="you@example.com"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="mb-4">
              <Label className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block">
                Service Interest *
              </Label>
              <Select
                value={form.service}
                onValueChange={(v) => setForm((p) => ({ ...p, service: v }))}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select service..." />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Home Loans",
                    "Business Loans",
                    "Personal Loans",
                    "Investment Planning",
                    "Insurance",
                    "Mutual Funds",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-6">
              <Label
                htmlFor="message"
                className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
              >
                Message
              </Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                placeholder="Tell us about your financial goals..."
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={mutation.isPending || isFetching}
              className="w-full h-12 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Submit Enquiry
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function HomeFooter() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  return (
    <footer className="bg-navy-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={getActiveLogo()}
                alt="JMD FinCap"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Trusted financial advisory since 2018. Serving families and
              businesses across Madhya Pradesh.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["Home", "About", "Services", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href={l === "Home" ? "/" : `/${l.toLowerCase()}`}
                    className="text-white/55 text-sm hover:text-gold-400 transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <a
                  href="tel:+918889956204"
                  className="text-white/55 hover:text-gold-400"
                >
                  +91 88899 56204
                </a>
              </div>
              <div>
                <a
                  href="mailto:contact.jmdfincap@gmail.com"
                  className="text-white/55 hover:text-gold-400"
                >
                  contact.jmdfincap@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {year} JMD FinCap. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <HeroSection />
        <WhySection />
        <AboutSection />
        <ServicesSection />
        <TeamSection />
        <ContactSection />
      </main>
      <HomeFooter />
    </>
  );
}
