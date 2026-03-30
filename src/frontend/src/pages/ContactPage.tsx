import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
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
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";

export function ContactPage() {
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
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      toast.error("Please fill all required fields.");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-gold-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Reach Out
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Contact <span className="text-gold-400">Us</span>
            </h1>
            <p className="text-white/70 max-w-lg mx-auto">
              Have a question or need financial guidance? We're here to help.
            </p>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Info */}
              <div>
                <h2 className="font-display text-2xl font-bold text-navy-900 mb-8">
                  Get in Touch
                </h2>
                <div className="flex flex-col gap-5 mb-8">
                  {[
                    {
                      icon: Phone,
                      label: "Call / WhatsApp",
                      value: "+91 88899 56204",
                      href: "tel:+918889956204",
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      value: "contact.jmdfincap@gmail.com",
                      href: "mailto:contact.jmdfincap@gmail.com",
                    },
                    {
                      icon: MapPin,
                      label: "Address",
                      value: "Khargone, Madhya Pradesh, India",
                      href: undefined,
                    },
                  ].map(({ icon: Icon, label, value, href }) => (
                    <div
                      key={label}
                      className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-xs"
                    >
                      <div className="h-12 w-12 rounded-xl bg-navy-900 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-gold-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">
                          {label}
                        </div>
                        {href ? (
                          <a
                            href={href}
                            className="text-navy-900 font-medium text-sm hover:text-gold-500 transition-colors"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-navy-900 font-medium text-sm">
                            {value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
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

                {/* Map placeholder */}
                <div className="mt-8 bg-navy-100 rounded-2xl h-48 flex items-center justify-center border border-navy-200">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-gold-500 mx-auto mb-2" />
                    <p className="text-navy-700 font-medium">
                      Khargone, Madhya Pradesh
                    </p>
                    <p className="text-navy-500 text-sm">India 451001</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg"
                data-ocid="contact.modal"
              >
                <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  We'll respond within 24 hours.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label
                      htmlFor="cnt-name"
                      className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="cnt-name"
                      data-ocid="contact.name.input"
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
                      htmlFor="cnt-phone"
                      className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                    >
                      Mobile *
                    </Label>
                    <Input
                      id="cnt-phone"
                      type="tel"
                      data-ocid="contact.phone.input"
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
                    htmlFor="cnt-email"
                    className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                  >
                    Email *
                  </Label>
                  <Input
                    id="cnt-email"
                    type="email"
                    data-ocid="contact.email.input"
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
                    Service Interest
                  </Label>
                  <Select
                    value={form.service}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, service: v }))
                    }
                  >
                    <SelectTrigger
                      className="h-11 rounded-xl"
                      data-ocid="contact.service.select"
                    >
                      <SelectValue placeholder="Select service..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Personal Loan",
                        "Business Loan",
                        "Gold Loan",
                        "Home Loan",
                        "Investment Planning",
                        "Insurance",
                        "Mutual Funds",
                        "Tax Planning",
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
                    htmlFor="cnt-msg"
                    className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="cnt-msg"
                    data-ocid="contact.message.textarea"
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    placeholder="Tell us about your requirements..."
                    rows={4}
                    className="rounded-xl resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  data-ocid="contact.submit.button"
                  disabled={mutation.isPending || isFetching}
                  className="w-full h-12 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
