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
  AlertTriangle,
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
  Image,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MinusCircle,
  Phone,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  X,
  ZoomIn,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// ─── Loan Review Modal ───────────────────────────────────────────────────────

function LoanReviewModal({
  app,
  rawApp,
  onConfirm,
  onCancel,
  isLoading,
}: {
  app: LoanApplication;
  rawApp: Record<string, unknown>;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const name =
    (rawApp.fullName as string) || `${app.firstName} ${app.lastName}`.trim();
  const mobile1 = (rawApp.mobile1 as string) || "";
  const mobile2 = (rawApp.mobile2 as string) || "";
  const currentAddress = (rawApp.currentAddress as string) || "";
  const occupation = (rawApp.occupation as string) || app.employeeType || "";
  const loanAmt = app.loanAmount
    ? `₹${Number(app.loanAmount).toLocaleString("en-IN")}`
    : "—";
  const income = app.monthlyIncome
    ? `₹${Number(app.monthlyIncome).toLocaleString("en-IN")}`
    : "—";
  const aadhaar = (rawApp.aadhaarNumber as string) || app.aadharNumber || "";
  const masked =
    aadhaar.length >= 8
      ? `${aadhaar.slice(0, 4)} •••• ${aadhaar.slice(-4)}`
      : aadhaar;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-0 max-w-none w-full h-full m-0"
      aria-label="Review before approve"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click closes modal, keyboard users use the Close button */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-navy-900">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gold-500/20 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-gold-400" />
            </div>
            <div>
              <div className="font-body text-sm font-semibold text-white">
                Review Before Approving
              </div>
              <div className="font-body text-xs text-white/50">
                Please verify all details carefully
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Personal */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Personal Details
            </div>
            <DetailRow label="Full Name" value={name} />
            <DetailRow
              label="Father / Husband"
              value={
                (rawApp.fatherHusbandName as string) || app.fatherName || "—"
              }
            />
            <DetailRow label="Date of Birth" value={app.dateOfBirth || "—"} />
            {mobile1 && (
              <DetailRow
                label="Mobile 1"
                value={mobile1}
                icon={<Phone className="h-3 w-3" />}
              />
            )}
            {mobile2 && (
              <DetailRow
                label="Mobile 2"
                value={mobile2}
                icon={<Phone className="h-3 w-3" />}
              />
            )}
            {currentAddress && (
              <DetailRow label="Address" value={currentAddress} />
            )}
          </div>

          {/* Identity */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Identity & Work
            </div>
            <DetailRow label="Aadhaar" value={masked} mono />
            <DetailRow label="PAN" value={app.panNumber || "N/A"} mono />
            <DetailRow label="Occupation" value={occupation} />
            <DetailRow label="Monthly Income" value={income} />
          </div>

          {/* Loan */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 space-y-3">
            <div className="font-body text-xs font-semibold text-green-700 uppercase tracking-wider">
              Loan Details
            </div>
            <DetailRow label="Loan Amount" value={loanAmt} highlight />
            <DetailRow
              label="Duration"
              value={(rawApp.loanDuration as string) || app.tenure || "—"}
            />
            <DetailRow
              label="Interest Rate"
              value={(rawApp.interestRate as string) || "N/A"}
            />
            <DetailRow
              label="Monthly EMI"
              value={
                (rawApp.monthlyEMI as string)
                  ? `₹${Number(rawApp.monthlyEMI).toLocaleString("en-IN")}`
                  : "—"
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="font-body text-xs border-gray-200 text-gray-600"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="font-body text-xs bg-green-600 hover:bg-green-700 text-white font-semibold gap-1.5"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ThumbsUp className="h-3.5 w-3.5" />
            )}
            Confirm Approve
          </Button>
        </div>
      </motion.div>
    </dialog>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  highlight = false,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-body text-xs text-gray-500 shrink-0 w-28">
        {label}
      </span>
      <span
        className={`font-body text-xs text-right ${mono ? "font-mono" : "font-medium"} ${highlight ? "text-green-700 font-bold" : "text-navy-900"} flex items-center gap-1`}
      >
        {icon}
        {value || "—"}
      </span>
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
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Get raw app data (includes all fields including mobile, documents etc.)
  const rawApp = app as unknown as Record<string, unknown>;

  const appId =
    (rawApp.id as string) ?? `${app.firstName}-${String(app.timestamp)}`;

  // Try to read full app data (with base64 files) from localStorage
  // Documents are stored separately under jmd_docs_<id> to avoid quota issues
  const storedDocs = (() => {
    try {
      // New format: documents stored together per application ID
      const separateDocs = localStorage.getItem(`jmd_docs_${appId}`);
      if (separateDocs)
        return JSON.parse(separateDocs) as Record<string, string>;

      // Individual document keys fallback (when combined save failed due to quota)
      const aadhaar = localStorage.getItem(`jmd_doc_aadhaar_${appId}`);
      const pan = localStorage.getItem(`jmd_doc_pan_${appId}`);
      const photo = localStorage.getItem(`jmd_doc_photo_${appId}`);
      const signature = localStorage.getItem(`jmd_doc_signature_${appId}`);
      if (aadhaar ?? pan ?? photo ?? signature) {
        const individualDocs: Record<string, string> = {};
        if (aadhaar) individualDocs.aadhaarCardFile = aadhaar;
        if (pan) individualDocs.panCardFile = pan;
        if (photo) individualDocs.customerPhoto = photo;
        if (signature) individualDocs.customerSignature = signature;
        return individualDocs;
      }

      // Legacy format: documents embedded in the application object
      const raw = localStorage.getItem(`jmd_approved_loan_${appId}`);
      if (raw) return JSON.parse(raw) as Record<string, string>;
      // Also check the general loan applications store (legacy)
      const allApps = JSON.parse(
        localStorage.getItem("jmd_loan_applications") ?? "[]",
      ) as Record<string, string>[];
      return allApps.find((a) => a.id === appId) ?? null;
    } catch {
      return null;
    }
  })();

  // Resolve document URLs -- check backend fields first, then localStorage fallback
  const resolveDoc = (...keys: string[]): string => {
    for (const key of keys) {
      // 1. Check rawApp (backend data has actual base64 files)
      const fromRaw = rawApp[key] as string;
      if (fromRaw?.startsWith("data:")) return fromRaw;
      // 2. Check separate localStorage docs storage (per application ID)
      const fromDocs = storedDocs?.[key] as string;
      if (fromDocs?.startsWith("data:")) return fromDocs;
    }
    return "";
  };

  const aadhaarDocUrl = resolveDoc(
    "aadhaarCardFile",
    "aadharCardFile",
    "aadhaar_card",
  );
  const panDocUrl = resolveDoc("panCardFile", "pan_card");
  const photoUrl = resolveDoc("customerPhoto", "photoFile", "photo");
  const signatureUrl = resolveDoc(
    "customerSignature",
    "signatureFile",
    "signature",
  );

  // Mobile numbers
  const mobile1 = (rawApp.mobile1 as string) || "";
  const mobile2 = (rawApp.mobile2 as string) || "";

  const maskedAadhar = (() => {
    const num = (rawApp.aadhaarNumber as string) || app.aadharNumber || "";
    return num.length >= 8 ? `${num.slice(0, 4)} •••• ${num.slice(-4)}` : num;
  })();

  const formattedAmount = Number.isNaN(Number(app.loanAmount))
    ? app.loanAmount
    : `₹${Number(app.loanAmount).toLocaleString("en-IN")}`;

  const formattedIncome = Number.isNaN(Number(app.monthlyIncome))
    ? app.monthlyIncome
    : `₹${Number(app.monthlyIncome).toLocaleString("en-IN")}`;

  const isThisLoading = actionLoading === appId;

  // Determine status: prefer backend status field, then local override
  const backendStatus = rawApp.status as string | undefined;
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
              {(rawApp.fullName as string) ||
                `${app.firstName} ${app.lastName}`}
            </div>
            <div className="font-body text-xs text-gray-400 mt-0.5">
              DOB: {app.dateOfBirth} &nbsp;·&nbsp;{" "}
              {formatTimestamp(app.timestamp)}
            </div>
            {mobile1 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3 text-gray-400" />
                <a
                  href={`tel:${mobile1}`}
                  className="font-body text-xs text-gold-600 hover:text-gold-500 font-mono"
                >
                  {mobile1}
                </a>
                {mobile2 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <a
                      href={`tel:${mobile2}`}
                      className="font-body text-xs text-gold-600 hover:text-gold-500 font-mono"
                    >
                      {mobile2}
                    </a>
                  </>
                )}
              </div>
            )}
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
            Duration
          </div>
          <div className="font-body text-sm font-semibold text-navy-900">
            {(rawApp.loanDuration as string) || app.tenure || "—"}
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
            Occupation
          </div>
          <EmployeeBadge
            type={(rawApp.occupation as string) || app.employeeType}
          />
        </div>
      </div>

      {/* Action Row */}
      <div className="px-6 pb-4 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3">
        {effectiveStatus === "pending" && (
          <>
            <Button
              size="sm"
              onClick={() => setShowReviewModal(true)}
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
                Aadhaar Number
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
                {app.panNumber || "—"}
              </div>
            </div>
          </div>

          {/* Mobile numbers */}
          {(mobile1 || mobile2) && (
            <div className="grid grid-cols-2 gap-4">
              {mobile1 && (
                <div>
                  <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Mobile 1
                  </div>
                  <div className="font-body text-sm font-mono text-navy-900">
                    {mobile1}
                  </div>
                </div>
              )}
              {mobile2 && (
                <div>
                  <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Mobile 2
                  </div>
                  <div className="font-body text-sm font-mono text-navy-900">
                    {mobile2}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Address */}
          {(rawApp.currentAddress as string) && (
            <div>
              <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                Current Address
              </div>
              <div className="font-body text-sm text-navy-900">
                {rawApp.currentAddress as string}
              </div>
            </div>
          )}

          {/* Family info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                Father / Husband
              </div>
              <div className="font-body text-sm text-navy-900">
                {(rawApp.fatherHusbandName as string) || app.fatherName || "—"}
              </div>
            </div>
            <div>
              <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-1">
                Loan Purpose / Occupation
              </div>
              <div className="font-body text-sm text-navy-900">
                {app.loanPurpose}
              </div>
            </div>
          </div>

          {/* Documents uploaded */}
          <div>
            <div className="font-body text-xs text-gray-400 uppercase tracking-wider mb-3">
              Documents Uploaded
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <DocIndicator
                label="Aadhaar Card"
                uploaded={!!aadhaarDocUrl}
                dataUrl={aadhaarDocUrl}
                onView={
                  aadhaarDocUrl
                    ? () =>
                        setViewerDoc({
                          title: `Aadhaar Card — ${(rawApp.fullName as string) || `${app.firstName} ${app.lastName}`}`,
                          dataUrl: aadhaarDocUrl,
                        })
                    : undefined
                }
              />
              <DocIndicator
                label="PAN Card"
                uploaded={!!panDocUrl}
                dataUrl={panDocUrl}
                onView={
                  panDocUrl
                    ? () =>
                        setViewerDoc({
                          title: `PAN Card — ${(rawApp.fullName as string) || `${app.firstName} ${app.lastName}`}`,
                          dataUrl: panDocUrl,
                        })
                    : undefined
                }
              />
              <DocIndicator
                label="Photo"
                uploaded={!!photoUrl}
                dataUrl={photoUrl}
                onView={
                  photoUrl
                    ? () =>
                        setViewerDoc({
                          title: `Customer Photo — ${(rawApp.fullName as string) || `${app.firstName} ${app.lastName}`}`,
                          dataUrl: photoUrl,
                        })
                    : undefined
                }
              />
              <DocIndicator
                label="Signature"
                uploaded={!!signatureUrl}
                dataUrl={signatureUrl}
                onView={
                  signatureUrl
                    ? () =>
                        setViewerDoc({
                          title: `Signature — ${(rawApp.fullName as string) || `${app.firstName} ${app.lastName}`}`,
                          dataUrl: signatureUrl,
                        })
                    : undefined
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

      {/* Review Modal before Approve */}
      <AnimatePresence>
        {showReviewModal && (
          <LoanReviewModal
            app={app}
            rawApp={rawApp}
            onConfirm={() => {
              setShowReviewModal(false);
              onApprove(app);
            }}
            onCancel={() => setShowReviewModal(false)}
            isLoading={isThisLoading}
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

      // Merge: prefer backend data (has documents), fill in extra fields from localStorage
      // Backend apps have documents (base64 files), localStorage apps have extra metadata (mobile, address, etc.)
      const seen = new Set<string>();
      const merged: LoanApplication[] = [];

      // Build a map of localStorage apps by their ID for quick lookup
      const localAppMap = new Map<string, Record<string, unknown>>();
      for (const app of localApps) {
        const rawApp = app as unknown as Record<string, unknown>;
        const key = (rawApp.id as string) || String(app.timestamp) || "";
        if (key) localAppMap.set(key, rawApp);
      }

      // Backend apps take priority (they have documents now)
      for (const backendApp of backendApps) {
        const rawBackend = backendApp as unknown as Record<string, unknown>;
        // Backend timestamp is nanoseconds BigInt -- convert to ms-based ID
        const tsNs = backendApp.timestamp;
        const tsMs =
          typeof tsNs === "bigint"
            ? Number(tsNs / BigInt(1_000_000))
            : typeof tsNs === "number"
              ? tsNs
              : 0;
        // Try to find matching local app (same firstName + approximate timestamp)
        let matchedLocalKey: string | null = null;
        for (const [key, localRaw] of localAppMap.entries()) {
          const localFirstName =
            (localRaw.firstName as string) ||
            (localRaw.fullName as string)?.split(" ")[0] ||
            "";
          const backendFirstName = backendApp.firstName;
          const localTs =
            typeof localRaw.timestamp === "number" ? localRaw.timestamp : 0;
          // Match if same firstName and timestamps within 10 seconds
          if (
            localFirstName === backendFirstName &&
            Math.abs(localTs - tsMs) < 10_000
          ) {
            matchedLocalKey = key;
            break;
          }
        }
        // Merge extra fields from localStorage into backend app
        const localExtra = matchedLocalKey
          ? localAppMap.get(matchedLocalKey)
          : null;
        const mergedApp = localExtra
          ? ({
              ...localExtra,
              ...rawBackend,
              // Keep backend's document fields (they have the actual base64 data)
              aadharCardFile:
                (rawBackend.aadharCardFile as string) ||
                (localExtra.aadharCardFile as string) ||
                "",
              panCardFile:
                (rawBackend.panCardFile as string) ||
                (localExtra.panCardFile as string) ||
                "",
              photoFile:
                (rawBackend.photoFile as string) ||
                (localExtra.photoFile as string) ||
                "",
              signatureFile:
                (rawBackend.signatureFile as string) ||
                (localExtra.signatureFile as string) ||
                "",
              // Also keep extra localStorage-only fields
              mobile1: (localExtra.mobile1 as string) || "",
              mobile2: (localExtra.mobile2 as string) || "",
              currentAddress: (localExtra.currentAddress as string) || "",
              aadhaarNumber:
                (localExtra.aadhaarNumber as string) ||
                backendApp.aadharNumber ||
                "",
              fullName:
                (localExtra.fullName as string) ||
                `${backendApp.firstName} ${backendApp.lastName}`.trim(),
              fatherHusbandName:
                (localExtra.fatherHusbandName as string) ||
                backendApp.fatherName ||
                "",
              loanDuration:
                (localExtra.loanDuration as string) || backendApp.tenure || "",
              occupation:
                (localExtra.occupation as string) ||
                backendApp.employeeType ||
                "",
              interestRate: (localExtra.interestRate as string) || "",
              monthlyEMI: (localExtra.monthlyEMI as string) || "",
              id:
                (localExtra.id as string) ||
                (rawBackend.id as string) ||
                String(tsMs),
            } as unknown as LoanApplication)
          : backendApp;

        const key =
          ((mergedApp as unknown as Record<string, unknown>).id as string) ||
          String(backendApp.timestamp);
        if (key && !seen.has(key)) {
          seen.add(key);
          merged.push(mergedApp);
        }
        if (matchedLocalKey) localAppMap.delete(matchedLocalKey); // Remove matched so it's not duplicated below
      }

      // Add any remaining localStorage-only apps (not in backend yet)
      for (const app of localApps) {
        const rawApp = app as unknown as Record<string, unknown>;
        const key = (rawApp.id as string) || String(app.timestamp) || "";
        if (!key || seen.has(key)) continue;
        // Check if this key was already consumed via matchedLocalKey
        if (!localAppMap.has(key)) continue;
        seen.add(key);
        merged.push(app);
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
                src={getActiveLogo()}
                alt="JMD FinCap"
                className="h-12 w-auto object-contain mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/generated/jmd-fincap-logo-real.dim_500x500.jpg";
                }}
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
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
                    activeTab === "settings"
                      ? "bg-gold-500/15 text-gold-500"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  Settings
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
              <TabsTrigger
                value="settings"
                className="font-body text-sm rounded-lg data-[state=active]:bg-navy-900 data-[state=active]:text-white px-5 py-2"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
            {/* ── Settings Tab ── */}
            <TabsContent value="settings" className="space-y-0">
              <LogoUploadSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// ─── Logo Upload Settings Component ──────────────────────────────────────────

const DEFAULT_LOGO = "/assets/generated/jmd-fincap-logo-real.dim_500x500.jpg";
export const LOGO_STORAGE_KEY = "jmd_custom_logo";

export function getActiveLogo(): string {
  try {
    const stored = localStorage.getItem(LOGO_STORAGE_KEY);
    if (stored?.startsWith("data:")) return stored;
  } catch {
    // ignore
  }
  return DEFAULT_LOGO;
}

function LogoUploadSettings() {
  const [logoPreview, setLogoPreview] = useState<string>(getActiveLogo());
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate type
      if (!file.type.startsWith("image/")) {
        toast.error("Sirf image file upload karein (JPG, PNG, WebP)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size 5MB se kam honi chahiye");
        return;
      }

      setUploading(true);
      setSaved(false);

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Compress image
        const compressed = await new Promise<string>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX = 600;
            let { width, height } = img;
            if (width > MAX || height > MAX) {
              if (width > height) {
                height = Math.round((height * MAX) / width);
                width = MAX;
              } else {
                width = Math.round((width * MAX) / height);
                height = MAX;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
          };
          img.src = dataUrl;
        });

        localStorage.setItem(LOGO_STORAGE_KEY, compressed);
        setLogoPreview(compressed);
        setSaved(true);
        toast.success("Logo save ho gaya! Website par ab naya logo dikhega.", {
          description: "Page refresh karein to logo update dekhein.",
        });
      } catch {
        toast.error("Logo upload nahi hua. Dobara try karein.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [],
  );

  const handleReset = useCallback(() => {
    localStorage.removeItem(LOGO_STORAGE_KEY);
    setLogoPreview(DEFAULT_LOGO);
    setSaved(false);
    toast.success("Logo default par reset ho gaya.");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="max-w-2xl"
    >
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-display text-lg font-bold text-navy-900 flex items-center gap-2">
            <Image className="h-5 w-5 text-gold-500" />
            Website Logo Settings
          </h2>
          <p className="font-body text-xs text-gray-500 mt-1">
            Yahan se aap website ka logo upload karke replace kar sakte hain.
            JPG, PNG, WebP format supported hai.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Logo Preview */}
          <div>
            <p className="font-body text-sm font-semibold text-gray-700 mb-3">
              Current Logo (Preview)
            </p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 flex items-center justify-center min-h-[120px]">
              <img
                src={logoPreview}
                alt="Current logo"
                className="max-h-24 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_LOGO;
                }}
              />
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <p className="font-body text-sm font-semibold text-gray-700 mb-3">
              Naya Logo Upload Karein
            </p>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="logo-upload-input"
              />
              <label htmlFor="logo-upload-input">
                <div
                  className={`
                    flex flex-col items-center justify-center gap-3 px-6 py-10 
                    border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200
                    ${uploading ? "border-gold-300 bg-gold-50" : "border-gray-200 bg-gray-50 hover:border-gold-400 hover:bg-gold-50"}
                  `}
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                  <div className="text-center">
                    <p className="font-body text-sm font-semibold text-navy-900">
                      {uploading
                        ? "Upload ho raha hai..."
                        : "Logo file select karein"}
                    </p>
                    <p className="font-body text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP · Max 5MB · Transparent PNG best result
                      deta hai
                    </p>
                  </div>
                </div>
              </label>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 bg-navy-900 hover:bg-navy-700 text-white font-body text-sm"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Upload ho raha hai..." : "Logo Upload Karein"}
                </Button>
                {logoPreview !== DEFAULT_LOGO && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="font-body text-sm border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-300"
                  >
                    Reset
                  </Button>
                )}
              </div>

              {saved && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="font-body text-sm text-green-700">
                    Logo successfully save ho gaya! Website par ab naya logo
                    dikhega -- page refresh karein.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-body text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">
              Logo Upload Guide
            </p>
            <ul className="space-y-1">
              {[
                "Transparent background wala PNG sabse accha dikhega",
                "Logo ka size 300x100px se 600x200px ke beech rakhen",
                "Upload ke baad website ka page refresh karein",
                "Logo navbar, footer, admin panel sab jagah update hoga",
              ].map((tip) => (
                <li
                  key={tip}
                  className="font-body text-xs text-blue-600 flex items-start gap-2"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
