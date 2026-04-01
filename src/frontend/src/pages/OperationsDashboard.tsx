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
  CheckCircle2,
  Eye,
  LayoutDashboard,
  LogOut,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

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

export function OperationsDashboard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const token = localStorage.getItem("adminToken") || "";
  const role = localStorage.getItem("adminRole") || "";
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<WorkflowApplication | null>(
    null,
  );
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [remarkApp, setRemarkApp] = useState<string | null>(null);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["ops-apps"],
    queryFn: async () => {
      if (actor) {
        try {
          const all = await actor.getAllWorkflowApplications(token);
          return all.filter(
            (a) => a.status === "Approved" || a.status === "Disbursed",
          );
        } catch {}
      }
      try {
        return JSON.parse(localStorage.getItem("loanApplications") || "[]")
          .map(mapLocal)
          .filter(
            (a: WorkflowApplication) =>
              a.status === "Approved" || a.status === "Disbursed",
          );
      } catch {
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const disburseMutation = useMutation({
    mutationFn: async ({
      appId,
      remark,
    }: { appId: string; remark: string }) => {
      if (actor) {
        try {
          await actor.markDisbursed(appId, token, remark);
          return;
        } catch {}
      }
      const arr = JSON.parse(localStorage.getItem("loanApplications") || "[]");
      const idx = arr.findIndex((a: any) => a.id === appId);
      if (idx >= 0) {
        arr[idx].status = "Disbursed";
        localStorage.setItem("loanApplications", JSON.stringify(arr));
      }
    },
    onSuccess: () => {
      toast.success("Loan marked as disbursed");
      qc.invalidateQueries({ queryKey: ["ops-apps"] });
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
  const pending = apps.filter((a) => a.status === "Approved").length;
  const disbursed = apps.filter((a) => a.status === "Disbursed").length;

  const roleLabel = role === "accounts" ? "Accounts" : "Operations";

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
          <div className="text-white/80 text-xs mt-2">
            {roleLabel} Dashboard
          </div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium"
          >
            <LayoutDashboard className="h-4 w-4" /> Disbursement Queue
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-white/60 text-xs mb-1">{roleLabel}</div>
          <div className="text-white text-sm">
            {localStorage.getItem("adminEmail") || roleLabel}
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
            <h1 className="text-xl font-bold text-gray-900">
              {roleLabel} Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Process approved loans and manage disbursements
            </p>
          </div>
          <Badge className="bg-orange-100 text-orange-700">{roleLabel}</Badge>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Pending Disbursement",
                value: pending,
                color: "bg-green-500",
              },
              { label: "Disbursed", value: disbursed, color: "bg-teal-500" },
              {
                label: "Total Processed",
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

          <div className="bg-white rounded-xl border p-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search approved applications..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-900">
                Approved Loans ({filtered.length})
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
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No approved applications pending disbursement</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((app) => (
                  <div
                    key={app.id}
                    className="px-5 py-4 hover:bg-gray-50 flex items-center gap-4"
                  >
                    <div
                      className={`w-1 h-12 rounded-full ${app.status === "Approved" ? "bg-green-500" : "bg-teal-500"}`}
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
                        app.status === "Disbursed"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-green-100 text-green-700"
                      }
                    >
                      {app.status === "Disbursed" ? "Disbursed" : "Approved"}
                    </Badge>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetail(app)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                      {app.status === "Approved" && (
                        <Button
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                          onClick={() => setRemarkApp(app.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Mark
                          Disbursed
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
        title="Mark as Disbursed"
        confirmLabel="Confirm Disbursement"
        loading={disburseMutation.isPending}
        onConfirm={(remark) =>
          remarkApp && disburseMutation.mutate({ appId: remarkApp, remark })
        }
      />
    </div>
  );
}
