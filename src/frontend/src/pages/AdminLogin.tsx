import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export function AdminLogin() {
  const { login, isLoggingIn, isLoginSuccess, isInitializing, identity } =
    useInternetIdentity();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isLoginSuccess && identity) {
      void navigate({ to: "/admin" });
    }
  }, [isLoginSuccess, identity, navigate]);

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
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

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-navy-700/30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex justify-center mb-8"
          >
            <img
              src="/assets/generated/jmd-fincap-logo-transparent.dim_400x200.png"
              alt="JMD FinCap"
              className="h-16 w-auto object-contain"
            />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gold-500/15 border border-gold-500/30 mb-4 mx-auto">
              <Shield className="h-6 w-6 text-gold-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              Admin Login
            </h1>
            <p className="font-body text-sm text-white/50 leading-relaxed">
              Only authorized administrators can access this panel
            </p>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-white/10 mb-8" />

          {/* Login button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full py-3 h-12 font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 transition-all duration-200 rounded-xl text-sm"
            >
              {isLoggingIn || isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-6 text-center font-body text-xs text-white/30"
          >
            Secured with Internet Computer Protocol
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
