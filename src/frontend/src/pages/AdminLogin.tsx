import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Crown,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Lock,
  Shield,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

// ─── Role Config ──────────────────────────────────────────────────────────────

interface RoleConfig {
  id: "admin" | "ceo" | "cofounder";
  label: string;
  sublabel: string;
  username: string;
  password: string;
  icon: React.ElementType;
  hint: string;
}

const ROLES: RoleConfig[] = [
  {
    id: "admin",
    label: "Admin",
    sublabel: "System Administrator",
    username: "admin",
    password: "Admin@123",
    icon: Shield,
    hint: "Username: admin | Password: Admin@123",
  },
  {
    id: "ceo",
    label: "CEO",
    sublabel: "Sawan Solanki",
    username: "ceo",
    password: "CEO@123",
    icon: Crown,
    hint: "Username: ceo | Password: CEO@123",
  },
  {
    id: "cofounder",
    label: "Co-Founder",
    sublabel: "Sawan Chouhan",
    username: "cofounder",
    password: "CoFounder@123",
    icon: Building2,
    hint: "Username: cofounder | Password: CoFounder@123",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminLogin() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<RoleConfig>(ROLES[0]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (session) {
      void navigate({ to: "/admin" });
    }
  }, [navigate]);

  const handleRoleSelect = (role: RoleConfig) => {
    setSelectedRole(role);
    setUsername("");
    setPassword("");
    setError("");
    setShowForgotPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setError("");

    // Simulate slight delay for UX
    await new Promise((r) => setTimeout(r, 600));

    const trimmedUsername = username.trim().toLowerCase();
    const isValid =
      trimmedUsername === selectedRole.username.toLowerCase() &&
      password === selectedRole.password;

    if (!isValid) {
      setError(
        "Galat username ya password. Neeche 'Forgot Password' click karein.",
      );
      setIsLoading(false);
      return;
    }

    // Store session
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
    // Hard redirect to ensure session is read fresh on the dashboard
    window.location.href = "/admin";
  };

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
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <img
              src="/assets/generated/jmd-fincap-logo-main.png"
              alt="JMD FinCap"
              className="h-14 w-auto object-contain"
            />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-6"
          >
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              Secure Portal Login
            </h1>
            <p className="font-body text-sm text-white/50">
              Select your role and enter credentials
            </p>
          </motion.div>

          {/* Role Selector */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="grid grid-cols-3 gap-2 mb-6"
            aria-label="Select login role"
          >
            {ROLES.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleRoleSelect(role)}
                  className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                    isSelected
                      ? "bg-gold-500/15 border-gold-500/60 text-gold-500"
                      : "bg-white/5 border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? "bg-gold-500/20" : "bg-white/10"
                    }`}
                  >
                    <RoleIcon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="font-body text-xs font-bold leading-tight">
                      {role.label}
                    </div>
                    <div
                      className={`font-body text-[10px] leading-tight mt-0.5 ${isSelected ? "text-gold-400/70" : "text-white/30"}`}
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
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="font-body text-xs text-white/30 uppercase tracking-wider">
              Enter Credentials
            </span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Login form */}
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            onSubmit={(e) => void handleLogin(e)}
            className="space-y-5"
          >
            {/* Username field */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="font-body text-xs font-semibold text-white/60 uppercase tracking-wider"
              >
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder={`e.g. ${selectedRole.username}`}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  className="pl-10 bg-white/10 border-white/20 placeholder:text-white/40 font-body focus:border-gold-500 focus:ring-gold-500/20 h-11 rounded-xl"
                  style={{
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-body text-xs font-semibold text-white/60 uppercase tracking-wider"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="pl-10 pr-11 bg-white/10 border-white/20 placeholder:text-white/40 font-body focus:border-gold-500 focus:ring-gold-500/20 h-11 rounded-xl"
                  style={{
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30"
                role="alert"
              >
                <div className="h-4 w-4 rounded-full bg-red-500/40 flex items-center justify-center shrink-0">
                  <span className="text-red-300 text-xs font-bold leading-none">
                    !
                  </span>
                </div>
                <p className="font-body text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full py-3 h-12 font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 transition-all duration-200 rounded-xl text-sm mt-2"
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

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword((v) => !v)}
                className="font-body text-xs text-gold-500/70 hover:text-gold-400 transition-colors flex items-center gap-1.5 mx-auto"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Forgot Password?
              </button>
            </div>
          </motion.form>

          {/* Forgot Password Panel */}
          <AnimatePresence>
            {showForgotPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-body text-sm font-bold text-gold-400">
                      Login Credentials
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-white/30 hover:text-white/70 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {ROLES.map((role) => {
                      const RoleIcon = role.icon;
                      const isCurrentRole = role.id === selectedRole.id;
                      return (
                        <div
                          key={role.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                            isCurrentRole
                              ? "bg-gold-500/15 border-gold-500/40"
                              : "bg-white/5 border-white/10"
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            <RoleIcon className="h-3.5 w-3.5 text-white/60" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-body text-xs font-bold text-white/80 mb-1">
                              {role.label} — {role.sublabel}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-body text-[10px] text-white/40 w-16 shrink-0">
                                  Username:
                                </span>
                                <code className="font-mono text-xs text-gold-300 bg-black/30 px-2 py-0.5 rounded select-all">
                                  {role.username}
                                </code>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-body text-[10px] text-white/40 w-16 shrink-0">
                                  Password:
                                </span>
                                <code className="font-mono text-xs text-gold-300 bg-black/30 px-2 py-0.5 rounded select-all">
                                  {role.password}
                                </code>
                              </div>
                            </div>
                          </div>
                          {isCurrentRole && (
                            <button
                              type="button"
                              onClick={() => {
                                setUsername(role.username);
                                setPassword(role.password);
                                setShowForgotPassword(false);
                                setError("");
                              }}
                              className="shrink-0 px-2.5 py-1 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 font-body text-[10px] font-semibold text-gold-400 transition-colors"
                            >
                              Use
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="font-body text-[10px] text-white/30 mt-3 text-center">
                    "Use" button click karein to auto-fill credentials
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-6 text-center font-body text-xs text-white/30"
          >
            Secured with JMD FinCap Admin System
          </motion.p>
        </div>

        {/* Back to site link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <a
            href="/"
            className="font-body text-xs text-white/40 hover:text-gold-500 transition-colors duration-200"
          >
            ← Back to JMD FinCap website
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
