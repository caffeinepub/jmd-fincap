import type { ContactFormSubmission, LoanApplication } from "@/backend.d";
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
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MinusCircle,
  RefreshCw,
  Search,
  Shield,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
  Wallet,
  X,
  ZoomIn,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Timestamp Utility ────────────────────────────────────────────────────────

function safeTimestampToBigInt(ts: unknown): bigint {
  if (typeof ts === "bigint") return ts;
  if (typeof ts === "number" && !Number.isNaN(ts))
    return BigInt(Math.floor(ts));
  if (typeof ts === "string") {
    const cleaned = ts.replace(/n$/, "").trim();
    if (cleaned && !Number.isNaN(Number(cleaned))) return BigInt(cleaned);
  }
  return BigInt(0);
}

function formatTimestamp(ns: unknown): string {
  try {
    const nsBig = safeTimestampToBigInt(ns);
    const ms =
      nsBig > BigInt(1e15)
        ? Number(nsBig / BigInt(1_000_000)) // nanoseconds → ms
        : nsBig > BigInt(1e12)
          ? Number(nsBig / BigInt(1_000)) // microseconds → ms
          : Number(nsBig); // already ms
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function isToday(ns: unknown): boolean {
  try {
    const nsBig = safeTimestampToBigInt(ns);
    const ms =
      nsBig > BigInt(1e15)
        ? Number(nsBig / BigInt(1_000_000))
        : nsBig > BigInt(1e12)
          ? Number(nsBig / BigInt(1_000))
          : Number(nsBig);
    const date = new Date(ms);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportEnquiriesToCSV(submissions: ContactFormSubmission[]) {
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

function exportLoanApplicationsToCSV(apps: LoanApplication[]) {
  const headers = [
    "#",
    "First Name",
    "Last Name",
    "DOB",
    "Mother Name",
    "Father Name",
    "Aadhar",
    "PAN",
    "Loan Type",
    "Loan Purpose",
    "Loan Amount",
    "Tenure",
    "Employee Type",
    "Monthly Income",
    "Date/Time",
  ];
  const rows = apps.map((a, i) => [
    i + 1,
    `"${a.firstName}"`,
    `"${a.lastName}"`,
    `"${a.dateOfBirth}"`,
    `"${a.motherName}"`,
    `"${a.fatherName}"`,
    `"${a.aadharNumber}"`,
    `"${a.panNumber}"`,
    `"${a.loanType}"`,
    `"${a.loanPurpose}"`,
    `"${a.loanAmount}"`,
    `"${a.tenure}"`,
    `"${a.employeeType}"`,
    `"${a.monthlyIncome}"`,
    `"${formatTimestamp(a.timestamp)}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jmd-fincap-loans-${new Date().toISOString().split("T")[0]}.csv`;
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
  accent?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  animate,
  numericValue,
  delay = 0,
  accent = false,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 hover:shadow-card-hover transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`h-11 w-11 rounded-xl flex items-center justify-center group-hover:bg-gold-500 transition-colors duration-300 ${
            accent ? "bg-gold-500" : "bg-navy-900"
          }`}
        >
          <Icon
            className={`h-5 w-5 transition-colors duration-300 group-hover:text-navy-900 ${
              accent
                ? "text-navy-900 group-hover:text-navy-900"
                : "text-gold-500"
            }`}
          />
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

function CardSkeleton() {
  return (
    <div className="space-y-4">
      {["sk1", "sk2", "sk3"].map((sk) => (
        <div
          key={sk}
          className="bg-white rounded-xl p-6 border border-gray-100 space-y-3"
        >
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
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

// ─── Employee Type Badge ──────────────────────────────────────────────────────

const EMP_LABELS: Record<string, string> = {
  job: "Job",
  salaried: "Salaried",
  "self-employed": "Self Employed",
};

function EmployeeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-body font-semibold border bg-navy-50 text-navy-800 border-navy-200">
      {EMP_LABELS[type] ?? type}
    </span>
  );
}

// ─── Document Viewer Modal ────────────────────────────────────────────────────

function DocumentViewerModal({
  isOpen,
  onClose,
  title,
  dataUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dataUrl: string;
}) {
  if (!isOpen) return null;

  const isPdf = dataUrl.startsWith("data:application/pdf");
  const isImage = dataUrl.startsWith("data:image");

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = title.replace(/\s+/g, "_").toLowerCase();
    a.click();
  };

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-0 max-w-none w-full h-full m-0"
      aria-label={title}
    >
      {/* Backdrop */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click closes modal */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-navy-900 flex items-center justify-center">
              <FileText className="h-4 w-4 text-gold-500" />
            </div>
            <div>
              <div className="font-body text-sm font-semibold text-navy-900">
                {title}
              </div>
              <div className="font-body text-xs text-gray-400">
                {isPdf ? "PDF Document" : "Image"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold bg-navy-900 text-gold-500 hover:bg-navy-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy-900 hover:bg-gray-100 transition-colors"
              aria-label="Close viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center min-h-0">
          {isImage ? (
            <img
              src={dataUrl}
              alt={title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            />
          ) : isPdf ? (
            <iframe
              src={dataUrl}
              title={title}
              className="w-full h-[500px] rounded-lg border border-gray-200"
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="font-body text-sm text-gray-500">
                Preview not available for this file type.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="mt-3 font-body text-sm text-gold-600 hover:text-gold-500 underline"
              >
                Download to view
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </dialog>
  );
}

// ─── Document Indicator ───────────────────────────────────────────────────────

function DocIndicator({
  label,
  uploaded,
  dataUrl,
  onView,
}: {
  label: string;
  uploaded: boolean;
  dataUrl?: string;
  onView?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {uploaded ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
        ) : (
          <MinusCircle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
        )}
        <span
          className={`font-body text-xs ${uploaded ? "text-green-600" : "text-gray-400"}`}
        >
          {label}
        </span>
      </div>
      {uploaded && dataUrl && onView && (
        <button
          type="button"
          onClick={onView}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md font-body text-xs font-semibold bg-navy-900 text-gold-500 hover:bg-navy-700 transition-colors w-fit"
        >
          <Eye className="h-3 w-3" />
          View
        </button>
      )}
    </div>
  );
}

// ─── Loan Application Card ────────────────────────────────────────────────────

function LoanApplicationCard({
  app,
  idx,
  onApprove,
  onReject,
  actionLoading,
  localStatus,
}: {
  app: LoanApplication;
  idx: number;
  onApprove: (app: LoanApplication) => void;
  onReject: (app: LoanApplication) => void;
  actionLoading: string | null;
  localStatus?: "pending" | "approved" | "rejected";
}) {
  const [expanded, setExpanded] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<{
    title: string;
    dataUrl: string;
  } | null>(null);

  // Get document data from localStorage (stored during loan approval or submission)
  const appId =
    ((app as unknown as Record<string, unknown>).id as string) ??
    `${app.firstName}-${String(app.timestamp)}`;

  // Try to read full app data (with base64 files) from localStorage
  const storedAppData = (() => {
    try {
      const raw = localStorage.getItem(`jmd_approved_loan_${appId}`);
      if (raw) return JSON.parse(raw) as Record<string, string>;
      // Also check the general loan applications store
      const allApps = JSON.parse(
        localStorage.getItem("jmd_loan_applications") ?? "[]",
      ) as Record<string, string>[];
      return allApps.find((a) => a.id === appId) ?? null;
    } catch {
      return null;
    }
  })();

  const maskedAadhar =
    app.aadharNumber.length >= 8
      ? `${app.aadharNumber.slice(0, 4)} •••• ${app.aadharNumber.slice(-4)}`
      : app.aadharNumber;

  const formattedAmount = Number.isNaN(Number(app.loanAmount))
    ? app.loanAmount
    : `₹${Number(app.loanAmount).toLocaleString("en-IN")}`;

  const formattedIncome = Number.isNaN(Number(app.monthlyIncome))
    ? app.monthlyIncome
    : `₹${Number(app.monthlyIncome).toLocaleString("en-IN")}`;

  const isThisLoading = actionLoading === appId;

  // Determine status: prefer backend status field, then local override
  const backendStatus = (app as unknown as Record<string, unknown>).status as
    | string
    | undefined;
  const effectiveStatus: "pending" | "approved" | "rejected" =
    localStatus ??
    (backendStatus === "approved"
      ? "approved"
      : backendStatus === "rejected"
        ? "rejected"
        : "pending");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.35 }}
      className="bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      {/* Card Header */}
      <div className="px-6 py-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-navy-900 flex items-center justify-center shrink-0">
            <span className="font-body text-sm font-bold text-gold-500">
              {app.firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-body text-base font-semibold text-navy-900">
              {app.firstName} {app.lastName}
            </div>
            <div className="font-body text-xs text-gray-400 mt-0.5">
              DOB: {app.dateOfBirth} &nbsp;·&nbsp;{" "}
              {formatTimestamp(app.timestamp)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <LoanStatusBadge status={effectiveStatus} />
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-body font-semibold border bg-gold-50 text-gold-700 border-gold-200">
            {app.loanType || "Personal Loan"}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-navy-900 transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="px-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-50">
        <div>
          <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
            Loan Amount
          </div>
          <div className="font-body text-sm font-semibold text-navy-900">
            {formattedAmount}
          </div>
        </div>
        <div>
          <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
            Tenure
          </div>
          <div className="font-body text-sm font-semibold text-navy-900">
            {app.tenure} months
          </div>
        </div>
        <div>
          <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
            Monthly Income
          </div>
          <div className="font-body text-sm font-semibold text-navy-900">
            {formattedIncome}
          </div>
        </div>
        <div>
          <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
            Employment
          </div>
          <EmployeeBadge type={app.employeeType} />
        </div>
      </div>

      {/* Action Row */}
      <div className="px-6 pb-4 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3">
        {effectiveStatus === "pending" && (
          <>
            <Button
              size="sm"
              onClick={() => onApprove(app)}
              disabled={isThisLoading}
              className="font-body text-xs bg-green-600 hover:bg-green-700 text-white font-semibold gap-1.5"
            >
              {isThisLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ThumbsUp className="h-3.5 w-3.5" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(app)}
              disabled={isThisLoading}
              className="font-body text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold gap-1.5"
            >
              {isThisLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ThumbsDown className="h-3.5 w-3.5" />
              )}
              Reject
            </Button>
          </>
        )}
        {effectiveStatus === "approved" && (
          <a
            href={`/sanction-letter?id=${encodeURIComponent(appId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-body font-semibold bg-navy-900 text-gold-500 hover:bg-navy-800 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            View Sanction Letter
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        )}
        {effectiveStatus === "rejected" && (
          <span className="font-body text-xs text-gray-400 italic">
            Application has been rejected
          </span>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50 space-y-5">
          {/* Document numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                Aadhar Number
              </div>
              <div className="font-body text-sm font-mono text-navy-900">
                {maskedAadhar}
              </div>
            </div>
            <div>
              <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                PAN Number
              </div>
              <div className="font-body text-sm font-mono text-navy-900">
                {app.panNumber}
              </div>
            </div>
          </div>

          {/* Family info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                Mother's Name
              </div>
              <div className="font-body text-sm text-navy-900">
                {app.motherName}
              </div>
            </div>
            <div>
              <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                Father's Name
              </div>
              <div className="font-body text-sm text-navy-900">
                {app.fatherName}
              </div>
            </div>
          </div>

          {/* Loan purpose */}
          <div>
            <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
              Loan Purpose
            </div>
            <div className="font-body text-sm text-navy-900">
              {app.loanPurpose}
            </div>
          </div>

          {/* Documents uploaded */}
          <div>
            <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-3">
              Documents Uploaded
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <DocIndicator
                label="Aadhar Card"
                uploaded={
                  !!(app.aadharCardFile || storedAppData?.aadhaarCardFile)
                }
                dataUrl={app.aadharCardFile || storedAppData?.aadhaarCardFile}
                onView={() =>
                  setViewerDoc({
                    title: `Aadhaar Card — ${app.firstName} ${app.lastName}`,
                    dataUrl:
                      (app.aadharCardFile || storedAppData?.aadhaarCardFile) ??
                      "",
                  })
                }
              />
              <DocIndicator
                label="PAN Card"
                uploaded={!!(app.panCardFile || storedAppData?.panCardFile)}
                dataUrl={app.panCardFile || storedAppData?.panCardFile}
                onView={() =>
                  setViewerDoc({
                    title: `PAN Card — ${app.firstName} ${app.lastName}`,
                    dataUrl:
                      (app.panCardFile || storedAppData?.panCardFile) ?? "",
                  })
                }
              />
              <DocIndicator
                label="Photo"
                uploaded={!!(app.photoFile || storedAppData?.customerPhoto)}
                dataUrl={app.photoFile || storedAppData?.customerPhoto}
                onView={() =>
                  setViewerDoc({
                    title: `Customer Photo — ${app.firstName} ${app.lastName}`,
                    dataUrl:
                      (app.photoFile || storedAppData?.customerPhoto) ?? "",
                  })
                }
              />
              <DocIndicator
                label="Signature"
                uploaded={
                  !!(app.signatureFile || storedAppData?.customerSignature)
                }
                dataUrl={app.signatureFile || storedAppData?.customerSignature}
                onView={() =>
                  setViewerDoc({
                    title: `Signature — ${app.firstName} ${app.lastName}`,
                    dataUrl:
                      (app.signatureFile || storedAppData?.customerSignature) ??
                      "",
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewerDoc && (
          <DocumentViewerModal
            isOpen={!!viewerDoc}
            onClose={() => setViewerDoc(null)}
            title={viewerDoc.title}
            dataUrl={viewerDoc.dataUrl}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Role Info Helper ─────────────────────────────────────────────────────────

interface SessionData {
  token: string;
  role: string;
  roleLabel: string;
  username: string;
}

function getSession(): SessionData | null {
  try {
    const raw = localStorage.getItem("adminSession");
    if (raw) return JSON.parse(raw) as SessionData;
    // backward compat: old token only
    const token = localStorage.getItem("jmd_admin_token");
    if (token)
      return {
        token,
        role: "admin",
        roleLabel: "Administrator",
        username: "admin",
      };
    return null;
  } catch {
    return null;
  }
}

function RoleIcon({ role }: { role: string }) {
  if (role === "ceo") return <Crown className="h-3.5 w-3.5 text-gold-500" />;
  if (role === "cofounder")
    return <Building2 className="h-3.5 w-3.5 text-gold-500" />;
  return <Shield className="h-3.5 w-3.5 text-gold-500" />;
}

// ─── Loan Status Badge ────────────────────────────────────────────────────────

interface LoanStatus {
  status: "pending" | "approved" | "rejected";
}

function LoanStatusBadge({ status }: LoanStatus) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="h-3 w-3" />
        Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-red-50 text-red-700 border border-red-200">
        <Ban className="h-3 w-3" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("enquiries");

  // Enquiries state
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Loan apps state
  const [loanSearch, setLoanSearch] = useState("");
  const [loanSortOrder, setLoanSortOrder] = useState<"asc" | "desc">("desc");

  // Loan action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [localLoanStatuses, setLocalLoanStatuses] = useState<
    Record<string, "pending" | "approved" | "rejected">
  >({});

  const [currentTime, setCurrentTime] = useState(new Date());

  // Session data
  const session = getSession();
  const sessionToken = session?.token ?? "";

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check session validity on mount — local-only, no backend call
  useEffect(() => {
    const stored = localStorage.getItem("adminSession");
    if (!stored) {
      void navigate({ to: "/admin/login" });
      setSessionChecking(false);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as SessionData;
      if (!parsed.token || !parsed.role) {
        localStorage.removeItem("adminSession");
        localStorage.removeItem("jmd_admin_token");
        void navigate({ to: "/admin/login" });
      } else {
        setSessionValid(true);
      }
    } catch {
      localStorage.removeItem("adminSession");
      localStorage.removeItem("jmd_admin_token");
      void navigate({ to: "/admin/login" });
    }
    setSessionChecking(false);
  }, [navigate]);

  // Fetch contact submissions
  const {
    data: submissions = [],
    isLoading: submissionsLoading,
    refetch: refetchSubmissions,
    isFetching: submissionsFetching,
  } = useQuery<ContactFormSubmission[]>({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      if (!actor || !sessionToken) return [];
      return actor.getAllSubmissions(sessionToken);
    },
    enabled: !!actor && !actorFetching && sessionValid === true,
    staleTime: 30_000,
  });

  // Fetch loan applications (backend + localStorage merged)
  const {
    data: loanApplications = [],
    isLoading: loansLoading,
    refetch: refetchLoans,
    isFetching: loansFetching,
  } = useQuery<LoanApplication[]>({
    queryKey: ["admin-loan-applications"],
    queryFn: async () => {
      // Always load from localStorage first
      const localApps: LoanApplication[] = (() => {
        try {
          const raw = localStorage.getItem("jmd_loan_applications");
          if (!raw) return [];
          const parsed = JSON.parse(raw) as Record<string, unknown>[];
          return parsed.map(
            (app) =>
              ({
                firstName:
                  (app.firstName as string) ||
                  (app.fullName as string)?.split(" ")[0] ||
                  "",
                lastName:
                  (app.lastName as string) ||
                  (app.fullName as string)?.split(" ").slice(1).join(" ") ||
                  "",
                dateOfBirth: (app.dateOfBirth as string) || "",
                motherName: (app.motherName as string) || "",
                fatherName:
                  (app.fatherName as string) ||
                  (app.fatherHusbandName as string) ||
                  "",
                aadharNumber:
                  (app.aadharNumber as string) ||
                  (app.aadhaarNumber as string) ||
                  "",
                panNumber: (app.panNumber as string) || "",
                loanPurpose:
                  (app.loanPurpose as string) ||
                  `Occupation: ${app.occupation || ""}`,
                loanType: (app.loanType as string) || "Personal Loan",
                tenure:
                  (app.tenure as string) || (app.loanDuration as string) || "",
                loanAmount: (app.loanAmount as string) || "",
                monthlyIncome: (app.monthlyIncome as string) || "",
                employeeType:
                  (app.employeeType as string) ||
                  (app.occupation as string) ||
                  "",
                aadharCardFile:
                  (app.aadharCardFile as string) ||
                  (app.aadhaarCardFile as string) ||
                  "",
                panCardFile: (app.panCardFile as string) || "",
                photoFile:
                  (app.photoFile as string) ||
                  (app.customerPhoto as string) ||
                  "",
                signatureFile:
                  (app.signatureFile as string) ||
                  (app.customerSignature as string) ||
                  "",
                timestamp: (() => {
                  const ts = app.timestamp;
                  if (typeof ts === "bigint") return ts;
                  if (typeof ts === "number" && ts > 0) {
                    // Date.now() returns milliseconds — convert to nanoseconds
                    return BigInt(Math.floor(ts)) * BigInt(1_000_000);
                  }
                  return BigInt(Date.now()) * BigInt(1_000_000);
                })(),
                // Extra fields preserved
                ...(app as object),
              }) as unknown as LoanApplication,
          );
        } catch {
          return [];
        }
      })();

      // Also try backend
      let backendApps: LoanApplication[] = [];
      if (actor && sessionToken) {
        try {
          backendApps = await actor.getAllLoanApplications(sessionToken);
        } catch {
          // backend failed, use localStorage only
        }
      }

      // Merge: prefer localStorage data (has full details), deduplicate by unique id or timestamp
      const seen = new Set<string>();
      const merged: LoanApplication[] = [];

      for (const app of [...localApps, ...backendApps]) {
        const rawApp = app as unknown as Record<string, unknown>;
        // Use unique id if available, otherwise use timestamp string (each app has unique Date.now() id)
        const key =
          (rawApp.id as string) ||
          String(app.timestamp) ||
          `${app.firstName || ""}-${(rawApp.aadhaarNumber as string) || app.aadharNumber || ""}-${app.dateOfBirth || ""}-${(rawApp.mobile1 as string) || ""}`;
        if (key && !seen.has(key)) {
          seen.add(key);
          merged.push(app);
        }
      }

      // Sort by timestamp descending (safe BigInt comparison)
      return merged.sort((a, b) => {
        const ta =
          typeof a.timestamp === "bigint"
            ? a.timestamp
            : BigInt(String(a.timestamp).replace(/n$/, "") || "0");
        const tb =
          typeof b.timestamp === "bigint"
            ? b.timestamp
            : BigInt(String(b.timestamp).replace(/n$/, "") || "0");
        if (tb > ta) return 1;
        if (tb < ta) return -1;
        return 0;
      });
    },
    enabled: sessionValid === true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const isFetching = submissionsFetching || loansFetching;

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["admin-loan-applications"],
    });
    void queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
    void refetchSubmissions();
    void refetchLoans();
  }, [refetchSubmissions, refetchLoans, queryClient]);

  // Enquiries — derived stats & filtered
  const enquiryStats = useMemo(() => {
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

  const allServices = useMemo(() => {
    const set = new Set(submissions.map((s) => s.serviceInterest));
    return Array.from(set).sort();
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
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
        const ta =
          typeof a.timestamp === "bigint"
            ? a.timestamp
            : BigInt(String(a.timestamp).replace(/n$/, "") || "0");
        const tb =
          typeof b.timestamp === "bigint"
            ? b.timestamp
            : BigInt(String(b.timestamp).replace(/n$/, "") || "0");
        const cmp = ta > tb ? 1 : ta < tb ? -1 : 0;
        return sortOrder === "desc" ? -cmp : cmp;
      });
  }, [submissions, search, serviceFilter, sortOrder]);

  // Loan apps — derived stats & filtered
  const loanStats = useMemo(() => {
    const total = loanApplications.length;
    const today = loanApplications.filter((a) => isToday(a.timestamp)).length;
    return { total, today };
  }, [loanApplications]);

  const filteredLoans = useMemo(() => {
    const q = loanSearch.toLowerCase();
    return loanApplications
      .filter((a) => {
        if (!q) return true;
        return (
          a.firstName.toLowerCase().includes(q) ||
          a.lastName.toLowerCase().includes(q) ||
          a.aadharNumber.includes(q) ||
          a.panNumber.toLowerCase().includes(q) ||
          a.loanPurpose.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ta =
          typeof a.timestamp === "bigint"
            ? a.timestamp
            : BigInt(String(a.timestamp).replace(/n$/, "") || "0");
        const tb =
          typeof b.timestamp === "bigint"
            ? b.timestamp
            : BigInt(String(b.timestamp).replace(/n$/, "") || "0");
        const cmp = ta > tb ? 1 : ta < tb ? -1 : 0;
        return loanSortOrder === "desc" ? -cmp : cmp;
      });
  }, [loanApplications, loanSearch, loanSortOrder]);

  const handleLogout = useCallback(async () => {
    if (actor && sessionToken) {
      try {
        await actor.adminLogout(sessionToken);
      } catch {
        // Ignore errors on logout
      }
    }
    localStorage.removeItem("adminSession");
    localStorage.removeItem("jmd_admin_token");
    window.location.href = "/";
  }, [actor, sessionToken]);

  // ─── Approve / Reject Loan ───────────────────────────────────────────────────

  const handleApproveLoan = useCallback(
    async (app: LoanApplication & { id?: string }) => {
      const id =
        ((app as unknown as Record<string, unknown>).id as string) ??
        `${app.firstName}-${String(app.timestamp)}`;
      setActionLoading(id);
      try {
        const actorAny = actor as unknown as Record<
          string,
          ((...args: unknown[]) => Promise<unknown>) | undefined
        >;
        await actorAny.approveLoan?.(id, sessionToken);
        setLocalLoanStatuses((prev) => ({ ...prev, [id]: "approved" }));
        // Store full app data for sanction letter
        localStorage.setItem(
          `jmd_approved_loan_${id}`,
          JSON.stringify({
            ...app,
            id,
            status: "approved",
            sanctionDate: new Date().toISOString(),
            fullName: `${app.firstName} ${app.lastName}`.trim(),
            fatherHusbandName: app.fatherName,
            mobile1: "",
            aadhaarNumber: app.aadharNumber,
            loanDuration: app.tenure,
          }),
        );
        await queryClient.invalidateQueries({
          queryKey: ["admin-loan-applications"],
        });
        toast.success("Loan application approved!", {
          description: `Sanction letter is now available for ${app.firstName} ${app.lastName}`,
        });
      } catch {
        // Backend may not have approveLoan yet — store locally
        setLocalLoanStatuses((prev) => ({ ...prev, [id]: "approved" }));
        localStorage.setItem(
          `jmd_approved_loan_${id}`,
          JSON.stringify({
            ...app,
            id,
            status: "approved",
            sanctionDate: new Date().toISOString(),
            fullName: `${app.firstName} ${app.lastName}`.trim(),
            fatherHusbandName: app.fatherName,
            mobile1: "",
            aadhaarNumber: app.aadharNumber,
            loanDuration: app.tenure,
          }),
        );
        toast.success("Loan approved (locally)!", {
          description: "Sanction letter is now available.",
        });
      } finally {
        setActionLoading(null);
      }
    },
    [actor, sessionToken, queryClient],
  );

  const handleRejectLoan = useCallback(
    async (app: LoanApplication & { id?: string }) => {
      const id =
        ((app as unknown as Record<string, unknown>).id as string) ??
        `${app.firstName}-${String(app.timestamp)}`;
      setActionLoading(id);
      try {
        const actorAny2 = actor as unknown as Record<
          string,
          ((...args: unknown[]) => Promise<unknown>) | undefined
        >;
        await actorAny2.rejectLoan?.(id, sessionToken);
        setLocalLoanStatuses((prev) => ({ ...prev, [id]: "rejected" }));
        await queryClient.invalidateQueries({
          queryKey: ["admin-loan-applications"],
        });
        toast.success("Loan application rejected.");
      } catch {
        setLocalLoanStatuses((prev) => ({ ...prev, [id]: "rejected" }));
        toast.success("Loan rejected (locally).");
      } finally {
        setActionLoading(null);
      }
    },
    [actor, sessionToken, queryClient],
  );

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

  // Loading state while checking session
  if (sessionChecking || actorFetching) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-gold-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-body text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-right" richColors />
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
                src="/assets/uploads/WhatsApp-Image-2026-02-28-at-21.00.20-1.png"
                alt="JMD FinCap"
                className="h-12 w-auto object-contain mb-4"
              />
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center shrink-0">
                  <RoleIcon role={session?.role ?? "admin"} />
                </div>
                <div className="min-w-0">
                  <div className="font-body text-xs text-white/40 uppercase tracking-wider">
                    {session?.role === "ceo"
                      ? "CEO"
                      : session?.role === "cofounder"
                        ? "Co-Founder"
                        : "Administrator"}
                  </div>
                  <div className="font-body text-xs text-white/70 truncate font-semibold">
                    {session?.roleLabel ?? "Admin"}
                  </div>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-4" aria-label="Admin navigation">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("enquiries")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
                    activeTab === "enquiries"
                      ? "bg-gold-500/15 text-gold-500"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  Contact Enquiries
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("loans")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
                    activeTab === "loans"
                      ? "bg-gold-500/15 text-gold-500"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Wallet className="h-4 w-4 shrink-0" />
                  Loan Applications
                  {loanStats.total > 0 && (
                    <span className="ml-auto bg-gold-500 text-navy-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {loanStats.total > 99 ? "99+" : loanStats.total}
                    </span>
                  )}
                </button>
              </div>
            </nav>

            {/* Sidebar footer */}
            <div className="p-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => void handleLogout()}
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
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-navy-900">
                  Admin Dashboard
                </h1>
                {session?.role && session.role !== "admin" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-semibold bg-gold-100 text-gold-700 border border-gold-200">
                    <RoleIcon role={session.role} />
                    {session.role === "ceo" ? "CEO" : "Co-Founder"}
                  </span>
                )}
              </div>
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
              onClick={handleRefresh}
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
              onClick={() => {
                if (activeTab === "enquiries") {
                  exportEnquiriesToCSV(submissions);
                } else {
                  exportLoanApplicationsToCSV(loanApplications);
                }
              }}
              disabled={
                activeTab === "enquiries"
                  ? submissions.length === 0
                  : loanApplications.length === 0
              }
              className="font-body text-xs border-gray-200 text-gray-600 hover:text-navy-900 hover:border-navy-900"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => void handleLogout()}
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
            className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8"
            aria-label="Summary stats"
          >
            <StatCard
              icon={Users}
              label="Contact Enquiries"
              value={enquiryStats.total}
              animate
              numericValue={enquiryStats.total}
              delay={0.1}
            />
            <StatCard
              icon={Calendar}
              label="Enquiries Today"
              value={enquiryStats.today}
              animate
              numericValue={enquiryStats.today}
              delay={0.15}
            />
            <StatCard
              icon={CreditCard}
              label="Loan Applications"
              value={loanStats.total}
              animate
              numericValue={loanStats.total}
              delay={0.2}
              accent
            />
            <StatCard
              icon={TrendingUp}
              label="Top Service"
              value={enquiryStats.topService}
              delay={0.25}
            />
          </section>

          {/* ─── Tabs ─── */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-auto">
              <TabsTrigger
                value="enquiries"
                className="font-body text-sm rounded-lg data-[state=active]:bg-navy-900 data-[state=active]:text-white px-5 py-2"
              >
                <FileText className="mr-2 h-4 w-4" />
                Contact Enquiries
                <span className="ml-2 bg-gray-100 text-gray-600 data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {submissions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="loans"
                className="font-body text-sm rounded-lg data-[state=active]:bg-navy-900 data-[state=active]:text-white px-5 py-2"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Loan Applications
                <span className="ml-2 bg-gray-100 text-gray-600 data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {loanApplications.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* ── Contact Enquiries Tab ── */}
            <TabsContent value="enquiries" className="space-y-0">
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden"
                aria-label="Enquiries table"
              >
                {/* Table toolbar */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-lg font-bold text-navy-900">
                        All Enquiries
                      </h2>
                      <p className="font-body text-xs text-gray-500 mt-0.5">
                        {filteredSubmissions.length} of {submissions.length}{" "}
                        submissions
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                          placeholder="Search by name, email, phone..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-9 font-body text-sm border-gray-200 w-full sm:w-64 focus:border-gold-500"
                        />
                      </div>

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
                  {submissionsLoading ? (
                    <div className="p-6">
                      <TableSkeleton />
                    </div>
                  ) : filteredSubmissions.length === 0 ? (
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
                        {filteredSubmissions.map((sub, idx) => (
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
                {!submissionsLoading && filteredSubmissions.length > 0 && (
                  <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <p className="font-body text-xs text-gray-500">
                      Showing{" "}
                      <span className="font-semibold text-navy-900">
                        {filteredSubmissions.length}
                      </span>{" "}
                      enquiries
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportEnquiriesToCSV(filteredSubmissions)}
                      className="font-body text-xs text-gray-500 hover:text-navy-900"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Export filtered
                    </Button>
                  </div>
                )}
              </motion.section>
            </TabsContent>

            {/* ── Loan Applications Tab ── */}
            <TabsContent value="loans" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {/* Toolbar */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 mb-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-lg font-bold text-navy-900">
                        Loan Applications
                      </h2>
                      <p className="font-body text-xs text-gray-500 mt-0.5">
                        {filteredLoans.length} of {loanApplications.length}{" "}
                        applications
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                          placeholder="Search by name or Aadhar..."
                          value={loanSearch}
                          onChange={(e) => setLoanSearch(e.target.value)}
                          className="pl-9 font-body text-sm border-gray-200 w-full sm:w-64 focus:border-gold-500"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setLoanSortOrder((p) =>
                            p === "desc" ? "asc" : "desc",
                          )
                        }
                        className="font-body text-xs border-gray-200 text-gray-600 hover:text-navy-900 shrink-0"
                      >
                        {loanSortOrder === "desc" ? (
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

                {/* Cards */}
                {loansLoading ? (
                  <CardSkeleton />
                ) : filteredLoans.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-xs py-20 text-center">
                    <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-7 w-7 text-gray-400" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-gray-700 mb-1">
                      No loan applications
                    </h3>
                    <p className="font-body text-sm text-gray-500">
                      {loanSearch
                        ? "Try adjusting your search."
                        : "Loan applications will appear here once customers apply."}
                    </p>
                    <a
                      href="/apply"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-gold-500 text-navy-900 font-body text-sm font-semibold hover:bg-gold-400 transition-colors"
                    >
                      View Application Form
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLoans.map((app, idx) => {
                      const id =
                        ((app as unknown as Record<string, unknown>)
                          .id as string) ??
                        `${app.firstName}-${String(app.timestamp)}`;
                      return (
                        <LoanApplicationCard
                          key={`${app.firstName}-${String(app.timestamp)}`}
                          app={app}
                          idx={idx}
                          onApprove={handleApproveLoan}
                          onReject={handleRejectLoan}
                          actionLoading={actionLoading}
                          localStatus={localLoanStatuses[id]}
                        />
                      );
                    })}
                  </div>
                )}

                {!loansLoading && filteredLoans.length > 0 && (
                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportLoanApplicationsToCSV(filteredLoans)}
                      className="font-body text-xs text-gray-500 hover:text-navy-900"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Export filtered to CSV
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
