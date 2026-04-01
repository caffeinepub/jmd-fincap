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
  ArrowRight,
  Eye,
  LayoutDashboard,
  LogOut,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700 border-blue-200",
  UnderCRMReview: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const STATUS_LABELS: Record<string, string> = {
  New: "New",
  UnderCRMReview: "Under Review",
};

function formatTs(ts: bigint): string {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN");
  } catch {
    return "-";
  }
}

function getLocalApps(): WorkflowApplication[] {
  try {
    const raw = localStorage.getItem("loanApplications");
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return arr.map((a: any) => ({
      id: a.id || "",
      firstName: a.fullName || a.firstName || "",
      lastName: a.lastName || "",
      fatherName: a.fatherName || "",
      motherName: "",
      dateOfBirth: a.dob || a.dateOfBirth || "",
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
      tenure: a.loanDuration ? String(a.loanDuration) : a.tenure || "",
      loanPurpose: a.loanPurpose || "",
      reference1Name: a.refName || a.reference1Name || "",
      reference1Mobile: a.refMobile || a.reference1Mobile || "",
      reference1Relation: a.refRelation || a.reference1Relation || "",
      aadharCardFile: a.aadharFile || a.aadharCardFile || "",
      panCardFile: a.panFile || a.panCardFile || "",
      photoFile: a.livePhoto || a.photoFile || "",
      electricityBillFile: a.electricityBill || a.electricityBillFile || "",
      status: a.status || "New",
      createdAt: a.createdAt || BigInt(Date.now() * 1_000_000),
      updatedAt: a.updatedAt || BigInt(Date.now() * 1_000_000),
    }));
  } catch {
    return [];
  }
}

export function CRMDashboard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const token = localStorage.getItem("adminToken") || "";
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<WorkflowApplication | null>(
    null,
  );
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [remarkApp, setRemarkApp] = useState<{
    id: string;
    action: "review" | "forward";
  } | null>(null);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["crm-apps"],
    queryFn: async () => {
      if (actor) {
        try {
          const all = await actor.getAllWorkflowApplications(token);
          return all.filter(
            (a) => a.status === "New" || a.status === "UnderCRMReview",
          );
        } catch {}
      }
      return getLocalApps().filter(
        (a) => a.status === "New" || a.status === "UnderCRMReview",
      );
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
          if (action === "review")
            await actor.markUnderCRMReview(appId, token, remark);
          else await actor.forwardToBM(appId, token, remark);
          return;
        } catch {}
      }
      // localStorage fallback
      const raw = localStorage.getItem("loanApplications") || "[]";
      const arr = JSON.parse(raw);
      const idx = arr.findIndex((a: any) => a.id === appId);
      if (idx >= 0) {
        arr[idx].status = action === "review" ? "UnderCRMReview" : "BMReview";
        localStorage.setItem("loanApplications", JSON.stringify(arr));
      }
    },
    onSuccess: () => {
      toast.success("Action completed");
      qc.invalidateQueries({ queryKey: ["crm-apps"] });
      setRemarkApp(null);
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

  const filtered = apps.filter(
    (a) =>
      !search ||
      `${a.firstName} ${a.lastName} ${a.mobile} ${a.id}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const newCount = apps.filter((a) => a.status === "New").length;
  const reviewCount = apps.filter((a) => a.status === "UnderCRMReview").length;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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
          <div className="text-white/80 text-xs mt-2">CRM Dashboard</div>
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
            <Users className="h-4 w-4" /> Applications
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-white/60 text-xs mb-1">Logged in as</div>
          <div className="text-white text-sm font-medium">
            {localStorage.getItem("adminEmail") || "CRM"}
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-sm text-gray-500">
              Review and forward loan applications
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700">CRM</Badge>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "New Applications",
                value: newCount,
                color: "bg-blue-500",
              },
              {
                label: "Under Review",
                value: reviewCount,
                color: "bg-yellow-500",
              },
              {
                label: "Total Assigned",
                value: apps.length,
                color: "bg-gray-500",
              },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 border">
                <div className={`h-2 w-8 rounded-full ${s.color} mb-3`} />
                <div className="text-2xl font-bold text-gray-900">
                  {s.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, mobile, ID..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b">
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
                <p>No applications in your queue</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((app) => (
                  <div
                    key={app.id}
                    className="px-5 py-4 hover:bg-gray-50 flex items-center gap-4"
                  >
                    <div
                      className={`w-1 h-12 rounded-full ${app.status === "New" ? "bg-blue-500" : "bg-yellow-500"}`}
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
                        {Number(app.loanAmount).toLocaleString()}
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
                      {app.status === "New" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-yellow-700 border-yellow-300"
                          onClick={() =>
                            setRemarkApp({ id: app.id, action: "review" })
                          }
                        >
                          Start Review
                        </Button>
                      )}
                      {app.status === "UnderCRMReview" && (
                        <Button
                          size="sm"
                          className="bg-[#0a1628] text-white hover:bg-[#1a2638]"
                          onClick={() =>
                            setRemarkApp({ id: app.id, action: "forward" })
                          }
                        >
                          <ArrowRight className="h-3 w-3 mr-1" /> Forward to BM
                        </Button>
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
      />

      <RemarkModal
        open={!!remarkApp}
        onClose={() => setRemarkApp(null)}
        title={
          remarkApp?.action === "forward"
            ? "Forward to Branch Manager"
            : "Start CRM Review"
        }
        confirmLabel={
          remarkApp?.action === "forward" ? "Forward to BM" : "Start Review"
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
