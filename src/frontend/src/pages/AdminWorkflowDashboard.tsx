import type { AuditEntry, WorkflowApplication } from "@/backend.d";
import { ApplicationDetailModal } from "@/components/ApplicationDetailModal";
import { RemarkModal } from "@/components/RemarkModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Eye,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  UnderCRMReview: "bg-yellow-100 text-yellow-700",
  BMReview: "bg-orange-100 text-orange-700",
  AdminApproval: "bg-purple-100 text-purple-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Disbursed: "bg-teal-100 text-teal-700",
};

const STATUS_LABELS: Record<string, string> = {
  New: "New",
  UnderCRMReview: "Under CRM Review",
  BMReview: "BM Review",
  AdminApproval: "Pending Approval",
  Approved: "Approved",
  Rejected: "Rejected",
  Disbursed: "Disbursed",
};

const TABS = [
  "All",
  "New",
  "UnderCRMReview",
  "BMReview",
  "AdminApproval",
  "Approved",
  "Rejected",
  "Disbursed",
];
const TAB_LABELS: Record<string, string> = {
  All: "All",
  New: "New",
  UnderCRMReview: "CRM Review",
  BMReview: "BM Review",
  AdminApproval: "Pending Approval",
  Approved: "Approved",
  Rejected: "Rejected",
  Disbursed: "Disbursed",
};

function formatTs(ts: bigint): string {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN");
  } catch {
    return "-";
  }
}

function mapLocal(a: any): WorkflowApplication {
  return {
    id: a.id || "",
    firstName: a.fullName || a.firstName || "",
    lastName: a.lastName || "",
    fatherName: a.fatherName || "",
    motherName: "",
    dateOfBirth: a.dob || "",
    gender: a.gender || "",
    mobile: a.mobile || "",
    email: a.email || "",
    aadharNumber: a.aadharNumber || "",
    panNumber: a.panNumber || "",
    currentAddress: a.currentAddress || "",
    permanentAddress: a.permanentAddress || "",
    occupation: a.occupation || "",
    companyName: a.companyName || "",
    monthlyIncome: a.monthlyIncome || "",
    workExperience: a.workExperience || "",
    loanType: a.loanType || "",
    loanAmount: a.loanAmount || "",
    tenure: String(a.loanDuration || a.tenure || ""),
    loanPurpose: a.loanPurpose || "",
    reference1Name: a.refName || "",
    reference1Mobile: a.refMobile || "",
    reference1Relation: a.refRelation || "",
    aadharCardFile: a.aadharFile || "",
    panCardFile: a.panFile || "",
    photoFile: a.livePhoto || "",
    electricityBillFile: a.electricityBill || "",
    status: a.status || "New",
    createdAt: a.createdAt || BigInt(Date.now() * 1_000_000),
    updatedAt: BigInt(Date.now() * 1_000_000),
  };
}

function getLocalApps(): WorkflowApplication[] {
  try {
    return JSON.parse(localStorage.getItem("loanApplications") || "[]").map(
      mapLocal,
    );
  } catch {
    return [];
  }
}

export function AdminWorkflowDashboard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const token = localStorage.getItem("adminToken") || "";
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedApp, setSelectedApp] = useState<WorkflowApplication | null>(
    null,
  );
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [remarkApp, setRemarkApp] = useState<{
    id: string;
    action: "approve" | "reject";
  } | null>(null);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: async () => {
      if (actor) {
        try {
          return await actor.getAllWorkflowApplications(token);
        } catch {}
      }
      return getLocalApps();
    },
    refetchInterval: 30000,
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      appId,
      action,
      remark,
    }: { appId: string; action: string; remark: string }) => {
      if (actor) {
        try {
          if (action === "approve")
            await actor.adminApprove(appId, token, remark);
          else await actor.adminReject(appId, token, remark);
          return;
        } catch {}
      }
      const arr = JSON.parse(localStorage.getItem("loanApplications") || "[]");
      const idx = arr.findIndex((a: any) => a.id === appId);
      if (idx >= 0) {
        arr[idx].status = action === "approve" ? "Approved" : "Rejected";
        localStorage.setItem("loanApplications", JSON.stringify(arr));
      }
    },
    onSuccess: () => {
      toast.success("Decision recorded");
      qc.invalidateQueries({ queryKey: ["admin-apps"] });
      setRemarkApp(null);
      setDetailOpen(false);
    },
    onError: () => toast.error("Action failed"),
  });

  const openDetail = async (app: WorkflowApplication) => {
    setSelectedApp(app);
    setAuditTrail([]);
    setDetailOpen(true);
    if (actor) {
      try {
        setAuditTrail(await actor.getAuditTrail(app.id, token));
      } catch {}
    }
  };

  const tabFiltered =
    activeTab === "All" ? apps : apps.filter((a) => a.status === activeTab);
  const filtered = tabFiltered.filter(
    (a) =>
      !search ||
      `${a.firstName} ${a.lastName} ${a.mobile} ${a.id}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const stats = {
    total: apps.length,
    pendingApproval: apps.filter((a) => a.status === "AdminApproval").length,
    approved: apps.filter(
      (a) => a.status === "Approved" || a.status === "Disbursed",
    ).length,
    rejected: apps.filter((a) => a.status === "Rejected").length,
    totalValue: apps
      .filter((a) => a.status === "Approved" || a.status === "Disbursed")
      .reduce((s, a) => s + Number(a.loanAmount || 0), 0),
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-[#0a1628] flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <img
            src={LOGO}
            alt="JMD FinCap"
            className="h-10 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="text-white/80 text-xs mt-2">Admin Panel</div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </button>
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 text-sm hover:bg-white/5"
          >
            <Users className="h-4 w-4" /> All Applications
          </button>
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 text-sm hover:bg-white/5"
          >
            <Shield className="h-4 w-4" /> Pending Approval
          </button>
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 text-sm hover:bg-white/5"
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 mb-2">
            Admin
          </Badge>
          <div className="text-white text-sm">
            {localStorage.getItem("adminEmail") || "Admin"}
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/admin/login";
            }}
            className="flex items-center gap-2 mt-3 text-white/50 text-xs hover:text-white"
          >
            <LogOut className="h-3 w-3" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">
              Full control over all loan applications
            </p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-700">Administrator</Badge>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              {
                label: "Total Applications",
                value: stats.total,
                color: "bg-blue-500",
              },
              {
                label: "Pending Approval",
                value: stats.pendingApproval,
                color: "bg-purple-500",
              },
              {
                label: "Approved",
                value: stats.approved,
                color: "bg-green-500",
              },
              { label: "Rejected", value: stats.rejected, color: "bg-red-500" },
              {
                label: "Total Approved Value",
                value: `₹${(stats.totalValue / 100000).toFixed(1)}L`,
                color: "bg-teal-500",
              },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border">
                <div className={`h-2 w-8 rounded-full ${s.color} mb-3`} />
                <div className="text-xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "bg-[#0a1628] text-white"
                    : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {TAB_LABELS[tab]}
                {tab !== "All" && (
                  <span className="ml-1 opacity-60">
                    ({apps.filter((a) => a.status === tab).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, mobile, application ID..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Applications ({filtered.length})
              </h2>
            </div>
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No applications found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((app) => (
                  <div
                    key={app.id}
                    className="px-5 py-4 hover:bg-gray-50 flex items-center gap-4"
                  >
                    <div
                      className={`w-1 h-12 rounded-full ${
                        app.status === "New"
                          ? "bg-blue-500"
                          : app.status === "UnderCRMReview"
                            ? "bg-yellow-500"
                            : app.status === "BMReview"
                              ? "bg-orange-500"
                              : app.status === "AdminApproval"
                                ? "bg-purple-500"
                                : app.status === "Approved"
                                  ? "bg-green-500"
                                  : app.status === "Rejected"
                                    ? "bg-red-500"
                                    : "bg-teal-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {app.firstName} {app.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {app.id} &bull; {app.mobile} &bull;{" "}
                        {formatTs(app.createdAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {app.loanType} &bull; ₹
                        {Number(app.loanAmount).toLocaleString()} &bull;{" "}
                        {app.tenure} months
                      </div>
                    </div>
                    <Badge
                      className={
                        STATUS_COLORS[app.status] || "bg-gray-100 text-gray-700"
                      }
                    >
                      {STATUS_LABELS[app.status] || app.status}
                    </Badge>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetail(app)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                      {app.status === "AdminApproval" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              setRemarkApp({ id: app.id, action: "approve" })
                            }
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Final
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setRemarkApp({ id: app.id, action: "reject" })
                            }
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplicationDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        app={selectedApp}
        auditTrail={auditTrail}
        actions={
          selectedApp?.status === "AdminApproval" ? (
            <>
              <Button
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  setDetailOpen(false);
                  setRemarkApp({ id: selectedApp!.id, action: "approve" });
                }}
              >
                Final Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setDetailOpen(false);
                  setRemarkApp({ id: selectedApp!.id, action: "reject" });
                }}
              >
                Reject
              </Button>
            </>
          ) : undefined
        }
      />
      <RemarkModal
        open={!!remarkApp}
        onClose={() => setRemarkApp(null)}
        title={
          remarkApp?.action === "approve"
            ? "Final Approval"
            : "Reject Application"
        }
        confirmLabel={
          remarkApp?.action === "approve"
            ? "Final Approve"
            : "Reject Application"
        }
        confirmVariant={
          remarkApp?.action === "reject" ? "destructive" : "default"
        }
        loading={actionMutation.isPending}
        onConfirm={(remark) =>
          remarkApp &&
          actionMutation.mutate({
            appId: remarkApp.id,
            action: remarkApp.action,
            remark,
          })
        }
      />
    </div>
  );
}
