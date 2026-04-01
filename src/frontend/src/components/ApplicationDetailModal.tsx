import type { AuditEntry, WorkflowApplication } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

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
  AdminApproval: "Pending Admin Approval",
  Approved: "Approved",
  Rejected: "Rejected",
  Disbursed: "Disbursed",
};

function formatTs(ts: bigint): string {
  try {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleString("en-IN");
  } catch {
    return "-";
  }
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-900 break-words">
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-navy-700 mb-3 pb-1 border-b">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  app: WorkflowApplication | null;
  auditTrail?: AuditEntry[];
  actions?: React.ReactNode;
}

export function ApplicationDetailModal({
  open,
  onClose,
  app,
  auditTrail = [],
  actions,
}: Props) {
  if (!app) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">
                {app.firstName} {app.lastName}
              </DialogTitle>
              <div className="text-sm text-gray-500 mt-0.5">
                App ID: {app.id}
              </div>
            </div>
            <Badge
              className={`shrink-0 ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-700"}`}
            >
              {STATUS_LABELS[app.status] || app.status}
            </Badge>
          </div>
          {actions && <div className="flex gap-2 mt-3">{actions}</div>}
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <Section title="Personal Details">
            <InfoRow
              label="Full Name"
              value={`${app.firstName} ${app.lastName}`}
            />
            <InfoRow label="Father / Husband Name" value={app.fatherName} />
            <InfoRow label="Date of Birth" value={app.dateOfBirth} />
            <InfoRow label="Gender" value={app.gender} />
            <InfoRow label="Mobile" value={app.mobile} />
            <InfoRow label="Email" value={app.email} />
          </Section>

          <Section title="KYC Details">
            <InfoRow
              label="Aadhaar Number"
              value={
                app.aadharNumber
                  ? `XXXX XXXX ${app.aadharNumber.slice(-4)}`
                  : ""
              }
            />
            <InfoRow label="PAN Number" value={app.panNumber} />
          </Section>

          <Section title="Address Details">
            <div className="col-span-2">
              <InfoRow label="Current Address" value={app.currentAddress} />
            </div>
            <div className="col-span-2">
              <InfoRow label="Permanent Address" value={app.permanentAddress} />
            </div>
          </Section>

          <Section title="Employment Details">
            <InfoRow label="Occupation" value={app.occupation} />
            <InfoRow label="Company / Business" value={app.companyName} />
            <InfoRow
              label="Monthly Income"
              value={
                app.monthlyIncome
                  ? `₹${Number(app.monthlyIncome).toLocaleString()}`
                  : ""
              }
            />
            <InfoRow
              label="Work Experience"
              value={app.workExperience ? `${app.workExperience} years` : ""}
            />
          </Section>

          <Section title="Loan Details">
            <InfoRow label="Loan Type" value={app.loanType} />
            <InfoRow
              label="Loan Amount"
              value={
                app.loanAmount
                  ? `₹${Number(app.loanAmount).toLocaleString()}`
                  : ""
              }
            />
            <InfoRow
              label="Tenure"
              value={app.tenure ? `${app.tenure} months` : ""}
            />
            <div className="col-span-2">
              <InfoRow label="Purpose" value={app.loanPurpose} />
            </div>
          </Section>

          <Section title="Reference Details">
            <InfoRow label="Reference Name" value={app.reference1Name} />
            <InfoRow label="Reference Mobile" value={app.reference1Mobile} />
            <InfoRow label="Relation" value={app.reference1Relation} />
          </Section>

          {/* Documents */}
          {(app.aadharCardFile ||
            app.panCardFile ||
            app.photoFile ||
            app.electricityBillFile) && (
            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-700 mb-3 pb-1 border-b">
                Uploaded Documents
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Aadhaar Card", file: app.aadharCardFile },
                  { label: "PAN Card", file: app.panCardFile },
                  { label: "Photo", file: app.photoFile },
                  { label: "Electricity Bill", file: app.electricityBillFile },
                ].map(({ label, file }) =>
                  file ? (
                    <div key={label} className="border rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-2">{label}</div>
                      {file.startsWith("data:image") ? (
                        <img
                          src={file}
                          alt={label}
                          className="w-full h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="text-xs text-gray-500">
                          PDF Document
                        </div>
                      )}
                      <a
                        href={file}
                        download={`${label.replace(/ /g, "_")}.${file.startsWith("data:image") ? "jpg" : "pdf"}`}
                        className="text-xs text-blue-600 hover:underline mt-1 block"
                      >
                        Download
                      </a>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {/* Audit Trail */}
          {auditTrail.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-700 mb-3 pb-1 border-b">
                Audit Trail
              </h4>
              <div className="space-y-3">
                {auditTrail.map((entry, idx) => (
                  <div
                    key={`${entry.applicationId}-${entry.timestamp}-${idx}`}
                    className="flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                          entry.action === "Rejected"
                            ? "bg-red-100"
                            : entry.action === "Disbursed"
                              ? "bg-teal-100"
                              : "bg-blue-100"
                        }`}
                      >
                        {entry.action === "Rejected" ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : entry.action === "Disbursed" ? (
                          <CheckCircle2 className="h-4 w-4 text-teal-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      {idx < auditTrail.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-100 my-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {STATUS_LABELS[entry.action] || entry.action}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {entry.performedBy}
                        </Badge>
                      </div>
                      {entry.remark && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {entry.remark}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTs(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
