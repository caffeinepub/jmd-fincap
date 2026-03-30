import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Award, CheckCircle2, Shield, TrendingUp, Users } from "lucide-react";

export function AboutPage() {
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
                "radial-gradient(circle at 70% 50%, oklch(0.70 0.13 72), transparent 60%)",
            }}
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-gold-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Our Story
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-gold-400">JMD FinCap</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
              A premier financial advisory firm dedicated to making quality
              financial services accessible to every Indian household and
              business.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-navy-50 rounded-2xl p-8">
                <div className="h-12 w-12 rounded-xl bg-gold-500 flex items-center justify-center mb-5">
                  <TrendingUp className="h-6 w-6 text-navy-900" />
                </div>
                <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  To empower individuals and businesses by providing
                  transparent, ethical, and expert financial guidance. We
                  believe everyone deserves access to professional financial
                  advisory services, regardless of their background.
                </p>
              </div>
              <div className="bg-navy-50 rounded-2xl p-8">
                <div className="h-12 w-12 rounded-xl bg-gold-500 flex items-center justify-center mb-5">
                  <Award className="h-6 w-6 text-navy-900" />
                </div>
                <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">
                  Our Vision
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  To become the most trusted financial advisory firm across
                  Central India, known for integrity, expertise, and
                  client-first approach. We aspire to serve 50,000+ clients and
                  ₹2,000 Cr in loan disbursals by 2030.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                Our Journey
              </div>
              <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">
                6+ Years of Trust & Excellence
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                JMD FinCap was founded in 2018 in Khargone, Madhya Pradesh, with
                a simple yet powerful mission — to bridge the financial
                knowledge gap and provide every client with the guidance they
                deserve.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Starting with a small team of 3, we have grown to 20+ certified
                financial advisors serving clients across multiple cities. Our
                journey is defined by the trust our clients place in us and the
                lives we've helped transform.
              </p>
            </div>

            <div className="grid sm:grid-cols-4 gap-6 mt-16">
              {[
                { value: "5,000+", label: "Happy Clients" },
                { value: "₹500Cr+", label: "Loans Processed" },
                { value: "6+", label: "Years Experience" },
                { value: "98%", label: "Customer Satisfaction" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="text-center p-6 bg-white rounded-xl border border-gray-100"
                >
                  <div className="font-display text-3xl font-bold text-gold-500 mb-2">
                    {value}
                  </div>
                  <div className="text-gray-600 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-navy-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="text-gold-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                Core Values
              </div>
              <h2 className="font-display text-4xl font-bold">
                What We Stand For
              </h2>
              <div className="mt-4 mx-auto h-0.5 w-16 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Integrity",
                  desc: "We maintain the highest standards of honesty in every client interaction.",
                },
                {
                  icon: Users,
                  title: "Client First",
                  desc: "Every decision we make is guided by what's best for our clients.",
                },
                {
                  icon: CheckCircle2,
                  title: "Excellence",
                  desc: "We continuously upskill and stay updated to deliver the best outcomes.",
                },
                {
                  icon: Award,
                  title: "Accountability",
                  desc: "We take ownership of our recommendations and stand by them.",
                },
                {
                  icon: TrendingUp,
                  title: "Growth",
                  desc: "We grow alongside our clients, celebrating every financial milestone.",
                },
                {
                  icon: Shield,
                  title: "Compliance",
                  desc: "Fully registered with IRDAI and AMFI, operating within regulatory frameworks.",
                },
              ].map((v) => (
                <div
                  key={v.title}
                  className="bg-white/[0.06] border border-white/10 rounded-xl p-6"
                >
                  <div className="h-12 w-12 rounded-xl bg-gold-500/20 flex items-center justify-center mb-4">
                    <v.icon className="h-5 w-5 text-gold-400" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">
                    {v.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                Leadership
              </div>
              <h2 className="font-display text-4xl font-bold text-navy-900">
                Our Leadership Team
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  name: "CEO",
                  role: "Chief Executive Officer",
                  photo: "/assets/generated/team-ceo.dim_300x300.jpg",
                  desc: "A visionary leader with 10+ years in financial services. Founded JMD FinCap to democratize access to quality financial guidance.",
                },
                {
                  name: "Co-Founder",
                  role: "Co-Founder & Director",
                  photo: "/assets/generated/team-cio.dim_300x300.jpg",
                  desc: "Expert in loan structuring and insurance advisory. Co-founded JMD FinCap to create a client-first financial services firm.",
                },
              ].map((m) => (
                <div
                  key={m.name}
                  className="flex items-start gap-5 bg-gray-50 rounded-2xl p-6 border border-gray-100"
                >
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-gold-400 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div>
                    <h3 className="font-display text-xl font-bold text-navy-900">
                      {m.name}
                    </h3>
                    <p className="text-gold-500 text-sm font-semibold mb-3">
                      {m.role}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gold-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold text-navy-900 mb-4">
              Ready to Start Your Financial Journey?
            </h2>
            <p className="text-navy-800 mb-8">
              Join 5,000+ clients who trust JMD FinCap for their financial
              needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apply"
                className="px-8 py-4 rounded-full bg-navy-900 text-white font-semibold hover:bg-navy-800 transition-colors"
              >
                Apply for Loan
              </a>
              <a
                href="/contact"
                className="px-8 py-4 rounded-full bg-white text-navy-900 font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
