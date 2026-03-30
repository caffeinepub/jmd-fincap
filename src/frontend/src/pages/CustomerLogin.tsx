import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

export function CustomerLogin() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  // Signup form
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Please enter email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem("jmd_customers") || "[]");
      const user = users.find(
        (u: any) =>
          u.email === loginForm.email && u.password === loginForm.password,
      );
      if (user) {
        localStorage.setItem("customerUser", JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        window.location.href = "/dashboard";
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
    }, 1000);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !signupForm.name ||
      !signupForm.email ||
      !signupForm.mobile ||
      !signupForm.password
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (signupForm.password !== signupForm.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (signupForm.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const users = JSON.parse(localStorage.getItem("jmd_customers") || "[]");
      if (users.find((u: any) => u.email === signupForm.email)) {
        toast.error("Email already registered. Please login.");
        return;
      }
      const newUser = {
        id: Date.now(),
        name: signupForm.name,
        email: signupForm.email,
        mobile: signupForm.mobile,
        password: signupForm.password,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem("jmd_customers", JSON.stringify(users));
      localStorage.setItem("customerUser", JSON.stringify(newUser));
      toast.success("Account created successfully!");
      window.location.href = "/dashboard";
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src={LOGO}
              alt="JMD FinCap"
              className="h-16 w-auto mx-auto object-contain mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <h1 className="font-display text-2xl font-bold text-navy-900">
              Customer Portal
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Login or create an account to manage your loans
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <Tabs defaultValue="login">
              <TabsList className="w-full rounded-none border-b border-gray-100 bg-gray-50 h-12">
                <TabsTrigger
                  value="login"
                  data-ocid="login.tab"
                  className="flex-1 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-none"
                >
                  <LogIn className="h-4 w-4" /> Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  data-ocid="signup.tab"
                  className="flex-1 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-none"
                >
                  <UserPlus className="h-4 w-4" /> Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="p-8">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="l-email"
                      className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="l-email"
                      type="email"
                      data-ocid="login.email.input"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="you@example.com"
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="l-pwd"
                      className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="l-pwd"
                        type={showPwd ? "text" : "password"}
                        data-ocid="login.password.input"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm((p) => ({
                            ...p,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Enter password"
                        className="h-11 rounded-xl pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPwd ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    data-ocid="login.submit.button"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="p-8">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="s-name"
                      className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="s-name"
                      data-ocid="signup.name.input"
                      value={signupForm.name}
                      onChange={(e) =>
                        setSignupForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Ramesh Kumar"
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="s-email"
                      className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                    >
                      Email *
                    </Label>
                    <Input
                      id="s-email"
                      type="email"
                      data-ocid="signup.email.input"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="you@example.com"
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="s-mobile"
                      className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                    >
                      Mobile *
                    </Label>
                    <Input
                      id="s-mobile"
                      type="tel"
                      data-ocid="signup.mobile.input"
                      value={signupForm.mobile}
                      onChange={(e) =>
                        setSignupForm((p) => ({ ...p, mobile: e.target.value }))
                      }
                      placeholder="+91 98765 43210"
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="s-pwd"
                      className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                    >
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="s-pwd"
                        type={showPwd ? "text" : "password"}
                        data-ocid="signup.password.input"
                        value={signupForm.password}
                        onChange={(e) =>
                          setSignupForm((p) => ({
                            ...p,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Min 6 characters"
                        className="h-11 rounded-xl pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPwd ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="s-confirm"
                      className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block"
                    >
                      Confirm Password *
                    </Label>
                    <Input
                      id="s-confirm"
                      type="password"
                      data-ocid="signup.confirm.input"
                      value={signupForm.confirm}
                      onChange={(e) =>
                        setSignupForm((p) => ({
                          ...p,
                          confirm: e.target.value,
                        }))
                      }
                      placeholder="Repeat password"
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    data-ocid="signup.submit.button"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            Are you a staff member?{" "}
            <a
              href="/admin/login"
              className="text-navy-700 font-medium hover:text-gold-500"
            >
              Staff Login →
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
