import { Mail, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-navy-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={LOGO}
                alt="JMD FinCap"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div>
                <div className="font-display font-bold text-white text-lg">
                  JMD FinCap
                </div>
                <div className="text-gold-400 text-xs">
                  Financial Solutions for a Brighter Future
                </div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Trusted financial advisory since 2018. Serving families and
              businesses across Madhya Pradesh.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="https://wa.me/918889956204"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-[#25D366] flex items-center justify-center hover:bg-[#1ebe5d] transition-colors"
                aria-label="WhatsApp"
              >
                <SiWhatsapp className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-2">
              {[
                "Personal Loan",
                "Business Loan",
                "Gold Loan",
                "Home Loan",
                "Mutual Funds",
                "Insurance",
              ].map((s) => (
                <li key={s}>
                  <a
                    href="/services"
                    className="text-white/55 text-sm hover:text-gold-400 transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/55 text-sm">
                <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                <a href="tel:+918889956204" className="hover:text-gold-400">
                  +91 88899 56204
                </a>
              </div>
              <div className="flex items-center gap-2 text-white/55 text-sm">
                <Mail className="h-4 w-4 text-gold-400 shrink-0" />
                <a
                  href="mailto:contact.jmdfincap@gmail.com"
                  className="hover:text-gold-400"
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
