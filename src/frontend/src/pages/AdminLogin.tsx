import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";

const _DEFAULT_LOGO = "/assets/generated/jmd-fincap-logo-real.dim_500x500.jpg";
function getActiveLogo(): string {
  try {
    const s = localStorage.getItem("jmd_custom_logo");
    if (s?.startsWith("data:")) return s;
  } catch {
    /* ignore */
  }
  return _DEFAULT_LOGO;
}
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─── Role Config ──────────────────────────────────────────────────────────────

interface RoleConfig {
  id: "admin" | "ceo" | "cofounder";
  label: string;
  sublabel: string;
  username: string;
  password: string;
  icon: React.ElementType;
}

const ROLES: RoleConfig[] = [
  {
    id: "admin",
    label: "Admin",
    sublabel: "System Administrator",
    username: "admin",
    password: "Admin@123",
    icon: Shield,
  },
  {
    id: "ceo",
    label: "CEO",
    sublabel: "Sawan Solanki",
    username: "ceo",
    password: "CEO@123",
    icon: Crown,
  },
  {
    id: "cofounder",
    label: "Co-Founder",
    sublabel: "Sawan Chouhan",
    username: "cofounder",
    password: "CoFounder@123",
    icon: Building2,
  },
];

// Password storage key
const PASS_KEY = "jmd_custom_passwords";

function getSavedPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, string>;
  } catch {
    /* ignore */
  }
  return {};
}

function getPasswordForRole(roleId: string): string {
  const saved = getSavedPasswords();
  const role = ROLES.find((r) => r.id === roleId);
  return saved[roleId] ?? role?.password ?? "";
}

function savePasswordForRole(roleId: string, newPassword: string) {
  const saved = getSavedPasswords();
  saved[roleId] = newPassword;
  localStorage.setItem(PASS_KEY, JSON.stringify(saved));
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── View States ──────────────────────────────────────────────────────────────
type View = "login" | "forgot-role" | "otp-sent" | "reset-password" | "success";

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminLogin() {
  const navigate = useNavigate();

  // Login state
  const [selectedRole, setSelectedRole] = useState<RoleConfig>(ROLES[0]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password state
  const [view, setView] = useState<View>("login");
  const [forgotRole, setForgotRole] = useState<RoleConfig>(ROLES[0]);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (session) {
      void navigate({ to: "/admin" });
    }
  }, [navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [resendCooldown]);

  const handleRoleSelect = (role: RoleConfig) => {
    setSelectedRole(role);
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 600));

    const trimmedUsername = username.trim().toLowerCase();
    const currentPassword = getPasswordForRole(selectedRole.id);
    const isValid =
      trimmedUsername === selectedRole.username.toLowerCase() &&
      password === currentPassword;

    if (!isValid) {
      setError("Galat username ya password. 'Forgot Password?' click karein.");
      setIsLoading(false);
      return;
    }

    const session = {
      token: `jmd_${selectedRole.id}_${Date.now()}`,
      role: selectedRole.id,
      roleLabel:
        selectedRole.id === "admin"
          ? "Administrator"
          : selectedRole.id === "ceo"
            ? "CEO — Sawan Solanki"
            : "Co-Founder — Sawan Chouhan",
      username: trimmedUsername,
    };
    localStorage.setItem("adminSession", JSON.stringify(session));
    localStorage.setItem("jmd_admin_token", session.token);
    setIsLoading(false);
    window.location.href = "/admin";
  };

  // Send OTP
  const handleSendOTP = async () => {
    setOtpLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const otp = generateOTP();
    setGeneratedOTP(otp);
    setOtpInput("");
    setOtpError("");
    // Store OTP with expiry (5 minutes)
    localStorage.setItem(
      "jmd_otp_data",
      JSON.stringify({
        otp,
        role: forgotRole.id,
        expiry: Date.now() + 5 * 60 * 1000,
      }),
    );
    setOtpLoading(false);
    setView("otp-sent");
    setResendCooldown(60);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const otp = generateOTP();
    setGeneratedOTP(otp);
    setOtpInput("");
    setOtpError("");
    localStorage.setItem(
      "jmd_otp_data",
      JSON.stringify({
        otp,
        role: forgotRole.id,
        expiry: Date.now() + 5 * 60 * 1000,
      }),
    );
    setOtpLoading(false);
    setResendCooldown(60);
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (otpInput.length !== 6) {
      setOtpError("Please 6-digit OTP enter karein.");
      return;
    }
    setOtpLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const raw = localStorage.getItem("jmd_otp_data");
    if (!raw) {
      setOtpError("OTP expired. Please dobara request karein.");
      setOtpLoading(false);
      return;
    }
    const data = JSON.parse(raw) as {
      otp: string;
      role: string;
      expiry: number;
    };
    if (Date.now() > data.expiry) {
      setOtpError("OTP expire ho gaya. Please dobara request karein.");
      setOtpLoading(false);
      return;
    }
    if (otpInput !== data.otp) {
      setOtpError("Galat OTP. Dobara check karein.");
      setOtpLoading(false);
      return;
    }

    setOtpLoading(false);
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setView("reset-password");
  };

  // Set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetError("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords match nahi kar rahe hain.");
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    savePasswordForRole(forgotRole.id, newPassword);
    localStorage.removeItem("jmd_otp_data");
    setIsLoading(false);
    setView("success");

    setTimeout(() => {
      setView("login");
      setSelectedRole(forgotRole);
      setUsername(forgotRole.username);
      setPassword(newPassword);
    }, 3000);
  };

  const resetForgotFlow = () => {
    setView("login");
    setOtpInput("");
    setOtpError("");
    setGeneratedOTP("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, oklch(0.70 0.13 72 / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, oklch(0.28 0.055 252 / 0.3) 0%, transparent 50%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 60px,
            oklch(0.70 0.13 72 / 0.4) 60px,
            oklch(0.70 0.13 72 / 0.4) 61px
          )`,
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-navy-700/30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={getActiveLogo()}
              alt="JMD FinCap"
              className="h-14 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = _DEFAULT_LOGO;
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            {/* ── LOGIN VIEW ── */}
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h1 className="font-display text-2xl font-bold text-white mb-1">
                    Secure Portal Login
                  </h1>
                  <p className="font-body text-sm text-white/50">
                    Select your role and enter credentials
                  </p>
                </div>

                {/* Role Selector */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {ROLES.map((role) => {
                    const RoleIcon = role.icon;
                    const isSelected = selectedRole.id === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "bg-gold-500/15 border-gold-500/60 text-gold-500"
                            : "bg-white/5 border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
                        }`}
                      >
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center ${isSelected ? "bg-gold-500/20" : "bg-white/10"}`}
                        >
                          <RoleIcon className="h-4 w-4" />
                        </div>
                        <div className="text-center">
                          <div className="font-body text-xs font-bold">
                            {role.label}
                          </div>
                          <div
                            className={`font-body text-[10px] mt-0.5 ${isSelected ? "text-gold-400/70" : "text-white/30"}`}
                          >
                            {role.sublabel}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gold-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="font-body text-xs text-white/30 uppercase tracking-wider">
                    Enter Credentials
                  </span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                <form
                  onSubmit={(e) => void handleLogin(e)}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label className="font-body text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                      <Input
                        type="text"
                        autoComplete="username"
                        placeholder={`e.g. ${selectedRole.username}`}
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setError("");
                        }}
                        className="pl-10 bg-white/10 border-white/20 placeholder:text-white/40 font-body focus:border-gold-500 h-11 rounded-xl"
                        style={{
                          color: "white",
                          backgroundColor: "rgba(255,255,255,0.1)",
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="pl-10 pr-11 bg-white/10 border-white/20 placeholder:text-white/40 font-body focus:border-gold-500 h-11 rounded-xl"
                        style={{
                          color: "white",
                          backgroundColor: "rgba(255,255,255,0.1)",
                        }}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30"
                    >
                      <span className="h-4 w-4 rounded-full bg-red-500/40 flex items-center justify-center shrink-0 text-red-300 text-xs font-bold">
                        !
                      </span>
                      <p className="font-body text-sm text-red-300">{error}</p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !username.trim() || !password.trim()}
                    className="w-full py-3 h-12 font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 transition-all rounded-xl text-sm mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Login as {selectedRole.label}
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotRole(selectedRole);
                        setView("forgot-role");
                      }}
                      className="font-body text-xs text-gold-500/70 hover:text-gold-400 transition-colors flex items-center gap-1.5 mx-auto"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Forgot Password?
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── FORGOT ROLE SELECT VIEW ── */}
            {view === "forgot-role" && (
              <motion.div
                key="forgot-role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={resetForgotFlow}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white/70 font-body text-xs mb-5 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </button>

                <div className="text-center mb-6">
                  <div className="h-14 w-14 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-gold-400" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-white mb-1">
                    Forgot Password
                  </h2>
                  <p className="font-body text-sm text-white/50">
                    Apna role select karein -- OTP email{" "}
                    <span className="text-gold-400">
                      contact.jmdfincap@gmail.com
                    </span>{" "}
                    par bheja jaayega
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  {ROLES.map((role) => {
                    const RoleIcon = role.icon;
                    const isSelected = forgotRole.id === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setForgotRole(role)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-gold-500/15 border-gold-500/50 text-gold-400"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/25"
                        }`}
                      >
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-gold-500/20" : "bg-white/10"}`}
                        >
                          <RoleIcon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-body text-sm font-bold">
                            {role.label}
                          </div>
                          <div className="font-body text-xs text-white/40">
                            {role.sublabel}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="ml-auto h-5 w-5 rounded-full bg-gold-500 flex items-center justify-center">
                            <span className="text-navy-900 text-xs font-bold">
                              ✓
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => void handleSendOTP()}
                  disabled={otpLoading}
                  className="w-full h-12 font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 rounded-xl"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      OTP bhej raha hai...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      OTP Email Karein
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* ── OTP VERIFY VIEW ── */}
            {view === "otp-sent" && (
              <motion.div
                key="otp-sent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => setView("forgot-role")}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white/70 font-body text-xs mb-5 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                <div className="text-center mb-6">
                  <div className="h-14 w-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-green-400" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-white mb-1">
                    OTP Verify Karein
                  </h2>
                  <p className="font-body text-sm text-white/50">
                    6-digit OTP{" "}
                    <span className="text-gold-400">
                      contact.jmdfincap@gmail.com
                    </span>{" "}
                    par bheja gaya hai
                  </p>
                </div>

                {/* OTP Display for testing (since real email not available) */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="font-body text-xs font-semibold text-amber-400">
                      Demo OTP (Testing ke liye)
                    </span>
                  </div>
                  <p className="font-body text-xs text-white/50 mb-2">
                    Real email service setup hone ke baad automatic email
                    aayega. Abhi neeche OTP use karein:
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="font-mono text-2xl font-bold text-amber-300 tracking-widest bg-black/30 px-4 py-2 rounded-lg select-all">
                      {generatedOTP}
                    </code>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <Label className="font-body text-xs font-semibold text-white/60 uppercase tracking-wider">
                    6-Digit OTP Enter Karein
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="_ _ _ _ _ _"
                    value={otpInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtpInput(val);
                      setOtpError("");
                    }}
                    className="text-center font-mono text-xl tracking-widest bg-white/10 border-white/20 placeholder:text-white/30 focus:border-gold-500 h-14 rounded-xl"
                    style={{
                      color: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                    disabled={otpLoading}
                  />
                  {otpError && (
                    <p className="font-body text-xs text-red-400 text-center">
                      {otpError}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => void handleVerifyOTP()}
                  disabled={otpLoading || otpInput.length !== 6}
                  className="w-full h-12 font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 rounded-xl mb-3"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verify ho raha hai...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      OTP Verify Karein
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => void handleResendOTP()}
                    disabled={resendCooldown > 0 || otpLoading}
                    className="font-body text-xs text-white/40 hover:text-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 mx-auto"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resendCooldown > 0
                      ? `Resend OTP (${resendCooldown}s)`
                      : "OTP Dobara Bhejein"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── RESET PASSWORD VIEW ── */}
            {view === "reset-password" && (
              <motion.div
                key="reset-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="h-14 w-14 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center mx-auto mb-3">
                    <Lock className="h-6 w-6 text-gold-400" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-white mb-1">
                    Naya Password Set Karein
                  </h2>
                  <p className="font-body text-sm text-white/50">
                    <span className="text-gold-400">{forgotRole.label}</span> ke
                    liye naya password banayein
                  </p>
                </div>

                <form
                  onSubmit={(e) => void handleResetPassword(e)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="font-body text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Naya Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setResetError("");
                        }}
                        className="pl-10 pr-11 bg-white/10 border-white/20 placeholder:text-white/40 font-body focus:border-gold-500 h-11 rounded-xl"
                        style={{
                          color: "white",
                          backgroundColor: "rgba(255,255,255,0.1)",
                        }}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Password Confirm Karein
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                      <Input
                        type="password"
                        placeholder="Same password dobara likhein"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setResetError("");
                        }}
                        className="pl-10 bg-white/10 border-white/20 placeholder:text-white/40 font-body focus:border-gold-500 h-11 rounded-xl"
                        style={{
                          color: "white",
                          backgroundColor: "rgba(255,255,255,0.1)",
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {resetError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30"
                    >
                      <span className="text-red-300 text-xs font-bold">!</span>
                      <p className="font-body text-sm text-red-300">
                        {resetError}
                      </p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="w-full h-12 font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Password Save Karein
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── SUCCESS VIEW ── */}
            {view === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="h-20 w-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  Password Reset Ho Gaya!
                </h2>
                <p className="font-body text-sm text-white/60 mb-1">
                  <span className="text-gold-400">{forgotRole.label}</span> ka
                  password successfully change ho gaya.
                </p>
                <p className="font-body text-xs text-white/40">
                  3 seconds mein login page par redirect ho rahe hain...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="mt-6 text-center font-body text-xs text-white/30">
            Secured with JMD FinCap Admin System
          </p>
        </div>

        {/* Back to site */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="font-body text-xs text-white/40 hover:text-gold-500 transition-colors"
          >
            ← Back to JMD FinCap website
          </a>
        </div>
      </motion.div>
    </div>
  );
}
