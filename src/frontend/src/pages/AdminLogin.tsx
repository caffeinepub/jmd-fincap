import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
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
import { useState } from "react";
import { toast } from "sonner";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

type RoleId = "admin" | "bm" | "crm" | "accounts" | "operations";

const ROLES = [
  {
    id: "admin" as RoleId,
    label: "Admin",
    sublabel: "System Administrator",
    loginId: "admin@jmdfincap.com",
    password: "Admin@123",
    icon: Shield,
    color: "text-yellow-400",
  },
  {
    id: "bm" as RoleId,
    label: "Branch Manager",
    sublabel: "Branch Operations",
    loginId: "bm@jmdfincap.com",
    password: "BM@123",
    icon: Building2,
    color: "text-blue-400",
  },
  {
    id: "crm" as RoleId,
    label: "CRM",
    sublabel: "Customer Relations",
    loginId: "crm@jmdfincap.com",
    password: "CRM@123",
    icon: Users,
    color: "text-green-400",
  },
  {
    id: "accounts" as RoleId,
    label: "Accounts",
    sublabel: "Finance & EMI",
    loginId: "accounts@jmdfincap.com",
    password: "Accounts@123",
    icon: Wallet,
    color: "text-purple-400",
  },
  {
    id: "operations" as RoleId,
    label: "Operations",
    sublabel: "Loan Processing",
    loginId: "operations@jmdfincap.com",
    password: "Operations@123",
    icon: Settings,
    color: "text-orange-400",
  },
];

export function AdminLogin() {
  const { actor, isFetching } = useActor();
  const [selectedRole, setSelectedRole] = useState<RoleId>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const role = ROLES.find((r) => r.id === selectedRole);
      if (!role || email !== role.loginId || password !== role.password) {
        toast.error(
          "Invalid credentials. Please check your email and password.",
        );
        setLoading(false);
        return;
      }

      // Try backend login
      let token = `local_${selectedRole}_${Date.now()}`;
      if (actor && !isFetching) {
        try {
          const result = await actor.adminLogin(email, password);
          if (typeof result === "string" && result) token = result;
        } catch {
          /* use local token */
        }
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminRole", selectedRole);
      localStorage.setItem("adminEmail", email);

      toast.success(`Welcome, ${role.label}!`);
      window.location.href = "/admin";
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleConfig = ROLES.find((r) => r.id === selectedRole)!;

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <img
            src={LOGO}
            alt="JMD FinCap"
            className="h-16 w-auto mx-auto object-contain mb-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <h1 className="font-display text-3xl font-bold text-white">
            Staff Login
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Select your role and enter credentials
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-3 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRole(role.id);
                  setEmail(role.loginId);
                }}
                data-ocid={`admin_login.${role.id}.select`}
                className={`p-4 rounded-xl text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-gold-500/20 border-2 border-gold-500"
                    : "bg-white/[0.06] border-2 border-white/10 hover:bg-white/[0.1]"
                }`}
              >
                <Icon
                  className={`h-6 w-6 mb-2 ${isSelected ? "text-gold-400" : role.color}`}
                />
                <div
                  className={`font-semibold text-sm ${isSelected ? "text-white" : "text-white/70"}`}
                >
                  {role.label}
                </div>
                <div className="text-white/40 text-xs mt-0.5">
                  {role.sublabel}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <selectedRoleConfig.icon className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <div className="font-semibold text-white">
                {selectedRoleConfig.label} Login
              </div>
              <div className="text-white/50 text-xs">
                {selectedRoleConfig.sublabel}
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2 block">
                Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRoleConfig.loginId}
                data-ocid="admin_login.email.input"
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-gold-500"
                required
              />
            </div>
            <div>
              <Label className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  data-ocid="admin_login.password.input"
                  className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-10 focus:border-gold-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
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
              disabled={loading || isFetching}
              data-ocid="admin_login.submit.button"
              className="w-full h-12 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                `Login as ${selectedRoleConfig.label}`
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          Customer?{" "}
          <a href="/login" className="text-gold-400 hover:underline">
            Customer Login →
          </a>
        </p>
      </div>
    </div>
  );
}
