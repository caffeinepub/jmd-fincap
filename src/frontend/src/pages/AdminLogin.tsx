import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

// ─── Role Config ──────────────────────────────────────────────────────────────

type RoleId = "admin" | "bm" | "crm" | "accounts" | "operations";

interface RoleConfig {
  id: RoleId;
  label: string;
  sublabel: string;
  loginId: string;
  password: string;
  icon: React.ElementType;
  badgeColor: string;
}

const ROLES: RoleConfig[] = [
  {
    id: "admin",
    label: "Admin",
    sublabel: "System Administrator",
    loginId: "admin@jmdfincap.com",
    password: "Admin@123",
    icon: Shield,
    badgeColor: "text-yellow-400",
  },
  {
    id: "bm",
    label: "Branch Manager",
    sublabel: "Branch Operations",
    loginId: "bm@jmdfincap.com",
    password: "BM@123",
    icon: Building2,
    badgeColor: "text-blue-400",
  },
  {
    id: "crm",
    label: "CRM",
    sublabel: "Customer Relations",
    loginId: "crm@jmdfincap.com",
    password: "CRM@123",
    icon: Users,
    badgeColor: "text-green-400",
  },
  {
    id: "accounts",
    label: "Accounts",
    sublabel: "Finance & EMI",
    loginId: "accounts@jmdfincap.com",
    password: "Accounts@123",
    icon: Wallet,
    badgeColor: "text-purple-400",
  },
  {
    id: "operations",
    label: "Operations",
    sublabel: "Loan Processing",
    loginId: "operations@jmdfincap.com",
    password: "Operations@123",
    icon: Settings,
    badgeColor: "text-orange-400",
  },
];

// ─── Role Label Map ───────────────────────────────────────────────────────────

const ROLE_DISPLAY_LABELS: Record<RoleId, string> = {
  admin: "Administrator",
  bm: "Branch Manager",
  crm: "CRM Executive",
  accounts: "Accounts",
  operations: "Operations",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminLogin() {
  const [selectedRole, setSelectedRole] = useState<RoleConfig>(ROLES[0]);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (session) {
      window.location.href = "/admin";
    }
  }, []);

  const handleRoleSelect = (role: RoleConfig) => {
    setSelectedRole(role);
    setLoginId("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) return;

    setIsLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 600));

    const trimmedId = loginId.trim().toLowerCase();
    const isValidId = trimmedId === selectedRole.loginId.toLowerCase();
    const isValidPassword = password === selectedRole.password;

    if (!isValidId || !isValidPassword) {
      setError("Galat Login ID ya password. Dobara try karein.");
      setIsLoading(false);
      return;
    }

    const session = {
      token: `jmd_${selectedRole.id}_${Date.now()}`,
      role: selectedRole.id,
      roleLabel: ROLE_DISPLAY_LABELS[selectedRole.id],
      username: trimmedId,
    };
    localStorage.setItem("adminSession", JSON.stringify(session));
    localStorage.setItem("jmd_admin_token", session.token);
    setIsLoading(false);
    window.location.href = "/admin";
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
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
        className="relative z-10 w-full max-w-xl"
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

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              Secure Portal Login
            </h1>
            <p className="font-body text-sm text-white/50">
              Select your role and enter credentials
            </p>
          </div>

          {/* Role Selector — 5 roles in a responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
            {ROLES.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  data-ocid={`login.${role.id}.toggle`}
                  className={`relative flex flex-col items-center gap-2 px-2 py-3 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-gold-500/15 border-gold-500/60 text-gold-500"
                      : "bg-white/5 border-white/10 text-white/50 hover:border-white/25 hover:text-white/70"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${isSelected ? "bg-gold-500/20" : "bg-white/10"}`}
                  >
                    <RoleIcon
                      className={`h-4 w-4 ${isSelected ? "" : role.badgeColor}`}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-body text-[11px] font-bold leading-tight">
                      {role.label}
                    </div>
                    <div
                      className={`font-body text-[9px] mt-0.5 leading-tight ${isSelected ? "text-gold-400/70" : "text-white/30"}`}
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

          {/* Selected role info pill */}
          <div className="flex items-center justify-center mb-5">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/10">
              <div className="h-2 w-2 rounded-full bg-gold-500" />
              <span className="font-body text-xs text-white/60">
                Login as:{" "}
                <span className="text-gold-400 font-semibold">
                  {selectedRole.label}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="font-body text-xs text-white/30 uppercase tracking-wider">
              Enter Credentials
            </span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <form onSubmit={(e) => void handleLogin(e)} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-body text-xs font-semibold text-white/60 uppercase tracking-wider">
                Login ID (Email)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-xs font-body">
                  @
                </span>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder={selectedRole.loginId}
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setError("");
                  }}
                  className="pl-7 bg-white/10 border-white/20 placeholder:text-white/30 font-body focus:border-gold-500 h-11 rounded-xl"
                  style={{
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                  disabled={isLoading}
                  data-ocid="login.input"
                />
              </div>
              <p className="font-body text-[11px] text-white/25 pl-1">
                e.g. {selectedRole.loginId}
              </p>
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
                  data-ocid="login.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
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

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30"
                data-ocid="login.error_state"
              >
                <span className="h-4 w-4 rounded-full bg-red-500/40 flex items-center justify-center shrink-0 text-red-300 text-xs font-bold">
                  !
                </span>
                <p className="font-body text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !loginId.trim() || !password.trim()}
              className="w-full py-3 h-12 font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 transition-all rounded-xl text-sm mt-2"
              data-ocid="login.submit_button"
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
          </form>

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
            data-ocid="login.link"
          >
            ← Back to JMD FinCap website
          </a>
        </div>
      </motion.div>
    </div>
  );
}
