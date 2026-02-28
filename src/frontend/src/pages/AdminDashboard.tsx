import type { ContactFormSubmission } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

// ─── Timestamp Utility ────────────────────────────────────────────────────────

function formatTimestamp(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isToday(ns: bigint): boolean {
  const ms = Number(ns / BigInt(1_000_000));
  const date = new Date(ms);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportToCSV(submissions: ContactFormSubmission[]) {
  const headers = [
    "#",
    "Name",
    "Phone",
    "Email",
    "Service",
    "Message",
    "Date/Time",
  ];
  const rows = submissions.map((s, i) => [
    i + 1,
    `"${s.name}"`,
    `"${s.phone}"`,
    `"${s.email}"`,
    `"${s.serviceInterest}"`,
    `"${s.message.replace(/"/g, '""')}"`,
    `"${formatTimestamp(s.timestamp)}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jmd-fincap-enquiries-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Count-Up Animation ───────────────────────────────────────────────────────

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const duration = 1000;
    const steps = 40;
    const stepSize = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + stepSize, target);
      setCount(Math.round(current));
      if (current >= target) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target]);

  return <span>{count}</span>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  animate?: boolean;
  numericValue?: number;
  delay?: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  animate,
  numericValue,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 hover:shadow-card-hover transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="h-11 w-11 rounded-xl bg-navy-900 flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-300">
          <Icon className="h-5 w-5 text-gold-500 group-hover:text-navy-900 transition-colors duration-300" />
        </div>
        <div className="h-2 w-2 rounded-full bg-green-400 mt-1" />
      </div>
      <div className="font-display text-3xl font-bold text-navy-900 mb-1">
        {animate && typeof numericValue === "number" ? (
          <CountUp target={numericValue} />
        ) : (
          value
        )}
      </div>
      <div className="font-body text-sm text-gray-500">{label}</div>
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
        <div
          key={sk}
          className="flex gap-4 items-center px-4 py-3 bg-gray-50 rounded-lg"
        >
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

// ─── Message Cell ─────────────────────────────────────────────────────────────

function MessageCell({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false);
  const truncated = message.length > 60;

  return (
    <div className="max-w-[200px]">
      <p className="font-body text-sm text-gray-700 leading-relaxed">
        {expanded || !truncated ? message : `${message.slice(0, 60)}...`}
      </p>
      {truncated && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs text-gold-600 hover:text-gold-500 font-body font-medium flex items-center gap-0.5 focus-visible:outline-none"
        >
          {expanded ? (
            <>
              Less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              More <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Service Badge ────────────────────────────────────────────────────────────

const SERVICE_COLORS: Record<string, string> = {
  "Home Loans": "bg-blue-50 text-blue-700 border-blue-200",
  "Business Loans": "bg-purple-50 text-purple-700 border-purple-200",
  "Investment Planning": "bg-green-50 text-green-700 border-green-200",
  Insurance: "bg-orange-50 text-orange-700 border-orange-200",
  "Mutual Funds": "bg-teal-50 text-teal-700 border-teal-200",
  "Tax Planning": "bg-rose-50 text-rose-700 border-rose-200",
};

function ServiceBadge({ service }: { service: string }) {
  const cls =
    SERVICE_COLORS[service] || "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-body font-semibold border ${cls}`}
    >
      {service}
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { actor, isFetching: actorFetching } = useActor();
  const { clear, identity, isLoginSuccess, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!isInitializing && !isLoginSuccess && !identity) {
      void navigate({ to: "/admin/login" });
    }
  }, [isLoginSuccess, identity, isInitializing, navigate]);

  // Check admin status
  useEffect(() => {
    if (!actor || actorFetching) return;
    setAdminCheckLoading(true);
    actor
      .isCallerAdmin()
      .then((result) => {
        setIsAdmin(result);
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setAdminCheckLoading(false);
      });
  }, [actor, actorFetching]);

  // Fetch submissions
  const {
    data: submissions = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery<ContactFormSubmission[]>({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissions();
    },
    enabled: !!actor && !actorFetching && isAdmin === true,
    staleTime: 30_000,
  });

  // Derived stats
  const stats = useMemo(() => {
    const total = submissions.length;
    const today = submissions.filter((s) => isToday(s.timestamp)).length;

    const serviceCounts: Record<string, number> = {};
    for (const s of submissions) {
      serviceCounts[s.serviceInterest] =
        (serviceCounts[s.serviceInterest] || 0) + 1;
    }
    const topService =
      Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return { total, today, topService };
  }, [submissions]);

  // All unique services
  const allServices = useMemo(() => {
    const set = new Set(submissions.map((s) => s.serviceInterest));
    return Array.from(set).sort();
  }, [submissions]);

  // Filtered + sorted submissions
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return submissions
      .filter((s) => {
        const matchSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.serviceInterest.toLowerCase().includes(q);
        const matchService =
          serviceFilter === "all" || s.serviceInterest === serviceFilter;
        return matchSearch && matchService;
      })
      .sort((a, b) => {
        const diff = Number(a.timestamp - b.timestamp);
        return sortOrder === "desc" ? -diff : diff;
      });
  }, [submissions, search, serviceFilter, sortOrder]);

  const handleLogout = useCallback(() => {
    clear();
    void navigate({ to: "/" });
  }, [clear, navigate]);

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const truncatedPrincipal =
    principalStr.length > 20
      ? `${principalStr.slice(0, 10)}...${principalStr.slice(-6)}`
      : principalStr;

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Loading states
  if (isInitializing || adminCheckLoading) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gold-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-body text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="h-16 w-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-3">
            Access Denied
          </h1>
          <p className="font-body text-white/60 mb-8 text-sm leading-relaxed">
            Your account does not have administrator privileges. Please contact
            the system administrator to get access.
          </p>
          <div className="text-xs font-body text-white/30 mb-6 font-mono">
            {principalStr}
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 font-body"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Sidebar ─── */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            initial={false}
            className={`
              fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 flex flex-col
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 lg:static lg:block
            `}
          >
            {/* Sidebar header */}
            <div className="p-6 border-b border-white/10">
              <img
                src="/assets/generated/jmd-fincap-logo-transparent.dim_400x200.png"
                alt="JMD FinCap"
                className="h-10 w-auto object-contain mb-4"
              />
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center shrink-0">
                  <Shield className="h-3.5 w-3.5 text-gold-500" />
                </div>
                <div className="min-w-0">
                  <div className="font-body text-xs text-white/40 uppercase tracking-wider">
                    Administrator
                  </div>
                  <div className="font-body text-xs text-white/70 truncate font-mono">
                    {truncatedPrincipal}
                  </div>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-4" aria-label="Admin navigation">
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gold-500/15 text-gold-500 font-body text-sm font-medium">
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  Dashboard
                </div>
              </div>
            </nav>

            {/* Sidebar footer */}
            <div className="p-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 font-body text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
              <a
                href="/"
                className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 font-body text-xs transition-colors duration-200"
              >
                ← Back to Website
              </a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay is aria-hidden, keyboard users use the Close button
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-navy-900 hover:bg-gray-100 transition-colors"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div>
              <h1 className="font-display text-xl font-bold text-navy-900">
                Admin Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="font-body text-xs text-gray-400">
                  {formattedDate} &nbsp;·&nbsp; {formattedTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="font-body text-xs border-gray-200 text-gray-600 hover:text-navy-900 hover:border-navy-900"
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(submissions)}
              disabled={submissions.length === 0}
              className="font-body text-xs border-gray-200 text-gray-600 hover:text-navy-900 hover:border-navy-900"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={handleLogout}
              className="font-body text-xs bg-navy-900 hover:bg-navy-700 text-white hidden sm:flex"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* ─── Stats Cards ─── */}
          <section
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8"
            aria-label="Summary stats"
          >
            <StatCard
              icon={Users}
              label="Total Enquiries"
              value={stats.total}
              animate
              numericValue={stats.total}
              delay={0.1}
            />
            <StatCard
              icon={Calendar}
              label="Today's Enquiries"
              value={stats.today}
              animate
              numericValue={stats.today}
              delay={0.2}
            />
            <StatCard
              icon={TrendingUp}
              label="Top Service"
              value={stats.topService}
              delay={0.3}
            />
          </section>

          {/* ─── Table Section ─── */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden"
            aria-label="Enquiries table"
          >
            {/* Table header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-navy-900">
                    All Enquiries
                  </h2>
                  <p className="font-body text-xs text-gray-500 mt-0.5">
                    {filtered.length} of {submissions.length} submissions
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="Search by name, email, phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 font-body text-sm border-gray-200 w-full sm:w-64 focus:border-gold-500"
                    />
                  </div>

                  {/* Service filter */}
                  <Select
                    value={serviceFilter}
                    onValueChange={setServiceFilter}
                  >
                    <SelectTrigger className="font-body text-sm border-gray-200 w-full sm:w-44 focus:ring-gold-500">
                      <SelectValue placeholder="Filter by service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-body">
                        All Services
                      </SelectItem>
                      {allServices.map((s) => (
                        <SelectItem key={s} value={s} className="font-body">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortOrder((p) => (p === "desc" ? "asc" : "desc"))
                    }
                    className="font-body text-xs border-gray-200 text-gray-600 hover:text-navy-900 shrink-0"
                  >
                    {sortOrder === "desc" ? (
                      <>
                        <ChevronDown className="mr-1 h-3.5 w-3.5" /> Newest
                      </>
                    ) : (
                      <>
                        <ChevronUp className="mr-1 h-3.5 w-3.5" /> Oldest
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Table body */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6">
                  <TableSkeleton />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Inbox className="h-7 w-7 text-gray-400" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-gray-700 mb-1">
                    No enquiries found
                  </h3>
                  <p className="font-body text-sm text-gray-500">
                    {search || serviceFilter !== "all"
                      ? "Try adjusting your search or filter."
                      : "Enquiries will appear here once customers submit the contact form."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                        #
                      </TableHead>
                      <TableHead className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Name
                      </TableHead>
                      <TableHead className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Phone
                      </TableHead>
                      <TableHead className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </TableHead>
                      <TableHead className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Service
                      </TableHead>
                      <TableHead className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Message
                      </TableHead>
                      <TableHead className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((sub, idx) => (
                      <TableRow
                        key={`${sub.name}-${String(sub.timestamp)}`}
                        className="hover:bg-navy-50/70 transition-colors duration-150 border-b border-gray-50"
                      >
                        <TableCell className="font-body text-sm text-gray-400 font-mono">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-navy-900 flex items-center justify-center shrink-0">
                              <span className="font-body text-xs font-bold text-gold-500">
                                {sub.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-body text-sm font-medium text-navy-900">
                              {sub.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`tel:${sub.phone}`}
                            className="font-body text-sm text-gray-700 hover:text-gold-600 transition-colors font-mono"
                          >
                            {sub.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${sub.email}`}
                            className="font-body text-sm text-gray-700 hover:text-gold-600 transition-colors truncate block max-w-[180px]"
                          >
                            {sub.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <ServiceBadge service={sub.serviceInterest} />
                        </TableCell>
                        <TableCell>
                          <MessageCell message={sub.message || "—"} />
                        </TableCell>
                        <TableCell>
                          <div className="font-body text-xs text-gray-500 whitespace-nowrap">
                            {formatTimestamp(sub.timestamp)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Table footer */}
            {!isLoading && filtered.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <p className="font-body text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-navy-900">
                    {filtered.length}
                  </span>{" "}
                  enquiries
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportToCSV(filtered)}
                  className="font-body text-xs text-gray-500 hover:text-navy-900"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Export filtered
                </Button>
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </div>
  );
}
