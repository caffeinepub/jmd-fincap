import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  CheckCircle2,
  Coins,
  FileText,
  Home,
  PieChart,
  Shield,
  TrendingUp,
} from "lucide-react";

const services = [
  {
    icon: Home,
    title: "Personal Loan",
    subtitle: "Quick unsecured loans for personal needs",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    badge: "Popular",
    badgeColor: "bg-blue-100 text-blue-700",
    features: [
      "Loan amount: ₹50,000 – ₹50 Lakhs",
      "Interest rate: 10.5% – 18% p.a.",
      "Tenure: 12 – 60 months",
      "Minimal documentation",
      "No collateral required",
    ],
    eligibility: [
      "Age: 21–65 years",
      "Minimum income: ₹15,000/month",
      "Credit score: 650+",
      "Employment: Salaried or Self-employed",
    ],
  },
  {
    icon: Briefcase,
    title: "Business Loan",
    subtitle: "Finance your business growth",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    badge: "Best Value",
    badgeColor: "bg-purple-100 text-purple-700",
    features: [
      "Loan amount: ₹1 Lakh – ₹2 Crore",
      "Interest rate: 11% – 20% p.a.",
      "Tenure: 12 – 84 months",
      "Working capital & expansion",
      "Flexible repayment options",
    ],
    eligibility: [
      "Business vintage: 2+ years",
      "Annual turnover: ₹5 Lakhs+",
      "Profit-making business",
      "Good credit history",
    ],
  },
  {
    icon: Coins,
    title: "Gold Loan",
    subtitle: "Instant loan against gold jewelry",
    color: "bg-yellow-50",
    iconColor: "text-yellow-600",
    badge: "Instant",
    badgeColor: "bg-yellow-100 text-yellow-700",
    features: [
      "Loan amount: ₹10,000 – ₹50 Lakhs",
      "Interest rate: 7% – 12% p.a.",
      "Tenure: 3 – 24 months",
      "90% LTV on gold value",
      "Loan in 30 minutes",
    ],
    eligibility: [
      "Age: 18 years+",
      "Gold purity: 18-22 karat",
      "Valid KYC documents",
      "No income proof required",
    ],
  },
  {
    icon: TrendingUp,
    title: "Investment Planning",
    subtitle: "Grow your wealth strategically",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badge: "Advisory",
    badgeColor: "bg-emerald-100 text-emerald-700",
    features: [
      "Personalized investment plan",
      "Goal-based planning",
      "Risk assessment & profiling",
      "Regular portfolio review",
      "Tax-efficient strategies",
    ],
    eligibility: [
      "Any individual or HUF",
      "Minimum investment: ₹500 SIP",
      "KYC compliance required",
      "Any income bracket",
    ],
  },
  {
    icon: Shield,
    title: "Insurance",
    subtitle: "Protect your family and assets",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
    badge: "Protection",
    badgeColor: "bg-orange-100 text-orange-700",
    features: [
      "Life insurance",
      "Health insurance",
      "Motor insurance",
      "Property insurance",
      "IRDAI registered advisory",
    ],
    eligibility: [
      "Age: 18–80 years (varies)",
      "Medical checkup may be required",
      "Valid KYC documents",
      "Premium payment capacity",
    ],
  },
  {
    icon: PieChart,
    title: "Mutual Funds",
    subtitle: "AMFI certified fund advisory",
    color: "bg-teal-50",
    iconColor: "text-teal-600",
    badge: "AMFI Certified",
    badgeColor: "bg-teal-100 text-teal-700",
    features: [
      "SIP starting ₹500/month",
      "Direct & regular plans",
      "Equity, debt & hybrid funds",
      "ELSS tax saving funds",
      "Online portfolio tracking",
    ],
    eligibility: [
      "Any individual",
      "KYC compliance required",
      "Bank account needed",
      "PAN card mandatory",
    ],
  },
  {
    icon: FileText,
    title: "Tax Planning",
    subtitle: "Maximize savings, minimize tax",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
    badge: "Tax Saving",
    badgeColor: "bg-rose-100 text-rose-700",
    features: [
      "ITR filing (all categories)",
      "80C investment planning",
      "HRA & home loan benefits",
      "Capital gains tax planning",
      "GST advisory",
    ],
    eligibility: [
      "Any individual or company",
      "All income brackets",
      "Self-employed & salaried",
      "Business owners",
    ],
  },
];

export function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy-900 text-white py-24 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, oklch(0.70 0.13 72), transparent 60%)",
            }}
          />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="text-gold-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              What We Offer
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Our <span className="text-gold-400">Financial Services</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Comprehensive financial solutions designed to meet every milestone
              of your personal and professional life.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              {services.map((svc) => (
                <div
                  key={svc.title}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gold-400 hover:shadow-lg transition-all duration-300"
                  data-ocid={`service.${svc.title.toLowerCase().replace(/ /g, "_")}.card`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center ${svc.color}`}
                      >
                        <svc.icon className={`h-7 w-7 ${svc.iconColor}`} />
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold text-navy-900">
                          {svc.title}
                        </h2>
                        <p className="text-gray-500 text-sm">{svc.subtitle}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${svc.badgeColor} border-0`}>
                      {svc.badge}
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-navy-700 mb-3">
                        Features
                      </h3>
                      <ul className="space-y-2">
                        {svc.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-navy-700 mb-3">
                        Eligibility
                      </h3>
                      <ul className="space-y-2">
                        {svc.eligibility.map((e) => (
                          <li
                            key={e}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-gold-500 shrink-0" />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <a
                      href="/apply"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors"
                    >
                      Apply Now →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-navy-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Not Sure Which Service Is Right For You?
            </h2>
            <p className="text-white/60 mb-8">
              Our experts will guide you to the best financial solution.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gold-500 text-navy-900 font-semibold hover:bg-gold-400 transition-colors"
            >
              Get Free Consultation
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
