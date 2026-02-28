import { Button } from "@/components/ui/button";
import { useSearch } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoanAppData {
  id?: string;
  fullName?: string;
  fatherHusbandName?: string;
  dateOfBirth?: string;
  mobile1?: string;
  mobile2?: string;
  email?: string;
  currentAddress?: string;
  permanentAddress?: string;
  nearestLandmark?: string;
  houseType?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  occupation?: string;
  workplaceName?: string;
  workAddress?: string;
  monthlyIncome?: string;
  loanAmount?: string;
  interestRate?: string;
  loanStartDate?: string;
  loanDuration?: string;
  monthlyEMI?: string;
  lateFineRule?: string;
  guarantor1Name?: string;
  guarantor1Mobile?: string;
  guarantor1Relation?: string;
  guarantor1Address?: string;
  guarantor2Name?: string;
  guarantor2Mobile?: string;
  guarantor2Relation?: string;
  guarantor2Address?: string;
  declarationDate?: string;
  submittedAt?: string;
  status?: string;
  sanctionDate?: string;

  // Old schema fields (backward compat)
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  motherName?: string;
  aadharNumber?: string;
  loanType?: string;
  loanPurpose?: string;
  tenure?: string;
  employeeType?: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_DATA: LoanAppData = {
  id: "LOAN-DEMO-001",
  fullName: "Ramesh Kumar Sharma",
  fatherHusbandName: "Rajesh Kumar Sharma",
  dateOfBirth: "1985-06-15",
  mobile1: "9876543210",
  currentAddress: "House No. 12, Shyam Nagar, Bistan Road, Khargone - 451001",
  permanentAddress: "House No. 12, Shyam Nagar, Bistan Road, Khargone - 451001",
  nearestLandmark: "Near Govt. Hospital",
  houseType: "Owned",
  aadhaarNumber: "1234****9012",
  panNumber: "ABCDE1234F",
  occupation: "Business",
  workplaceName: "Sharma General Store",
  monthlyIncome: "35000",
  loanAmount: "100000",
  interestRate: "12% per annum",
  loanStartDate: new Date().toISOString().split("T")[0],
  loanDuration: "12 months",
  monthlyEMI: "8885",
  lateFineRule: "₹50 per day after due date",
  guarantor1Name: "Suresh Kumar",
  guarantor1Mobile: "9876500001",
  guarantor1Relation: "Brother",
  guarantor1Address: "Plot 5, Gandhi Nagar, Khargone",
  guarantor2Name: "Mahesh Patel",
  guarantor2Mobile: "9876500002",
  guarantor2Relation: "Friend",
  guarantor2Address: "15 Nehru Colony, Khargone",
  sanctionDate: new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }),
  status: "approved",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatINR(val: string | undefined): string {
  if (!val) return "—";
  const n = Number(val.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(n)) return val;
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(val: string | undefined): string {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return val;
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-200">
      <td className="py-2 pr-6 font-body text-sm font-medium text-gray-600 whitespace-nowrap">
        {label}
      </td>
      <td className="py-2 font-body text-sm font-semibold text-navy-900">
        {value}
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SanctionLetterPage() {
  const searchParams = useSearch({ strict: false }) as { id?: string };
  const loanId = searchParams?.id ?? "";

  const [appData, setAppData] = useState<LoanAppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      // Look up from localStorage
      if (loanId) {
        const stored = JSON.parse(
          localStorage.getItem("jmd_loan_applications") ?? "[]",
        ) as LoanAppData[];
        const found = stored.find((a) => a.id === loanId);
        if (found) {
          setAppData(found);
          setLoading(false);
          return;
        }

        // Also check approved loans stored by admin
        const approvedStr = localStorage.getItem(`jmd_approved_loan_${loanId}`);
        if (approvedStr) {
          const parsed = JSON.parse(approvedStr) as LoanAppData;
          setAppData(parsed);
          setLoading(false);
          return;
        }
      }
      // Fall back to demo data
      setAppData({ ...DEMO_DATA, id: loanId || DEMO_DATA.id });
    } catch {
      setAppData({ ...DEMO_DATA, id: loanId || DEMO_DATA.id });
    }
    setLoading(false);
  }, [loanId]);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Normalize field names between new and old schema
  const name =
    appData?.fullName ??
    `${appData?.firstName ?? ""} ${appData?.lastName ?? ""}`.trim();
  const fatherName = appData?.fatherHusbandName ?? appData?.fatherName ?? "—";
  const address = appData?.currentAddress ?? "—";
  const mobile = appData?.mobile1 ?? "—";
  const aadhaar = appData?.aadhaarNumber ?? appData?.aadharNumber ?? "—";
  const pan = appData?.panNumber ?? "—";
  const income = appData?.monthlyIncome ?? "—";
  const loanAmt = appData?.loanAmount ?? "—";
  const intRate = appData?.interestRate ?? "N/A";
  const tenure = appData?.loanDuration ?? appData?.tenure ?? "—";
  const emi = appData?.monthlyEMI ?? "—";
  const startDate = appData?.loanStartDate
    ? formatDate(appData.loanStartDate)
    : today;
  const lateFine = appData?.lateFineRule ?? "₹50 per day after due date";
  const refNo = appData?.id ?? loanId;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 rounded-full border-4 border-gold-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* ─── Action Bar (hidden on print) ─── */}
      <div className="print:hidden bg-navy-900 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-50">
        <a
          href="/admin"
          className="flex items-center gap-2 font-body text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </a>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="font-body text-xs border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="font-body text-xs bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* ─── Letter ─── */}
      <div className="min-h-screen bg-gray-100 print:bg-white py-8 print:py-0 px-4 print:px-0">
        <div
          id="sanction-letter"
          className="max-w-[800px] mx-auto bg-white shadow-lg print:shadow-none"
          style={{ minHeight: "1100px" }}
        >
          {/* ── Letterhead ── */}
          <div className="border-b-4 border-navy-900 px-12 pt-10 pb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/uploads/WhatsApp-Image-2026-02-28-at-22.30.21-1.jpeg"
                  alt="JMD FinCap"
                  className="h-16 w-auto object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <h1 className="font-display text-2xl font-bold text-navy-900 leading-tight">
                    JMD FinCap
                  </h1>
                  <p className="font-body text-xs text-gray-500 mt-0.5">
                    Financial Services &amp; Loan Solutions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-body text-xs text-gray-500">
                  Bistan Road, Khargone
                </p>
                <p className="font-body text-xs text-gray-500">
                  Madhya Pradesh — 451001
                </p>
                <p className="font-body text-xs text-gray-500 mt-1">
                  📞 +91 73546 96765
                </p>
                <p className="font-body text-xs text-gray-500">
                  ✉ contact.jmdfincap@gmail.com
                </p>
              </div>
            </div>
          </div>

          <div className="px-12 py-8">
            {/* ── Title ── */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-300 mb-4">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-body text-sm font-semibold text-green-700">
                  LOAN APPROVED
                </span>
              </div>
              <h2
                className="font-display text-2xl font-bold text-navy-900 uppercase tracking-wide"
                style={{ letterSpacing: "0.08em" }}
              >
                LOAN SANCTION LETTER
              </h2>
              <div className="h-1 w-24 bg-gold-500 mx-auto mt-3 rounded-full" />
            </div>

            {/* ── Ref & Date ── */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-body text-sm text-gray-600">
                  <span className="font-semibold">Ref. No.:</span> {refNo}
                </p>
                <p className="font-body text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Date:</span> {today}
                </p>
              </div>
              <div className="text-right">
                <p className="font-body text-sm text-gray-600">
                  <span className="font-semibold">Type:</span> Personal Loan
                </p>
                <p className="font-body text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Status:</span>{" "}
                  <span className="text-green-600 font-semibold">
                    Sanctioned
                  </span>
                </p>
              </div>
            </div>

            {/* ── Salutation ── */}
            <div className="mb-6">
              <p className="font-body text-sm text-gray-700 leading-relaxed">
                Dear <strong>{name || "Applicant"}</strong>,
              </p>
              <p className="font-body text-sm text-gray-700 leading-relaxed mt-3">
                We are pleased to inform you that your loan application
                (Reference No. <strong>{refNo}</strong>) has been reviewed and
                approved by JMD FinCap. Please find the details of your
                sanctioned loan below:
              </p>
            </div>

            {/* ── Borrower Details ── */}
            <div className="mb-6">
              <h3 className="font-display text-base font-bold text-navy-900 mb-3 pb-2 border-b-2 border-navy-900">
                Borrower Information
              </h3>
              <table className="w-full">
                <tbody>
                  <Row label="Full Name" value={name || "—"} />
                  <Row label="Father / Husband Name" value={fatherName} />
                  <Row label="Address" value={address} />
                  <Row label="Mobile No." value={mobile} />
                  <Row
                    label="Aadhaar No."
                    value={
                      aadhaar.length >= 8
                        ? `${aadhaar.slice(0, 4)} **** ${aadhaar.slice(-4)}`
                        : aadhaar
                    }
                  />
                  <Row label="PAN No." value={pan || "N/A"} />
                  <Row label="Monthly Income" value={formatINR(income)} />
                </tbody>
              </table>
            </div>

            {/* ── Loan Details Table ── */}
            <div className="mb-6">
              <h3 className="font-display text-base font-bold text-navy-900 mb-3 pb-2 border-b-2 border-navy-900">
                Sanctioned Loan Details
              </h3>
              <div className="bg-navy-50 rounded-lg overflow-hidden border border-navy-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-navy-900">
                      <th className="py-2.5 px-4 text-left font-body text-xs font-semibold text-gold-500 uppercase tracking-wider">
                        Parameter
                      </th>
                      <th className="py-2.5 px-4 text-left font-body text-xs font-semibold text-gold-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "Sanctioned Amount",
                        value: formatINR(loanAmt),
                      },
                      { label: "Interest Rate", value: intRate },
                      { label: "Loan Tenure", value: tenure },
                      { label: "Monthly EMI", value: formatINR(emi) },
                      { label: "Loan Start Date", value: startDate },
                      { label: "Late Fine Rule", value: lateFine },
                    ].map((row, i) => (
                      <tr
                        key={row.label}
                        className={i % 2 === 0 ? "bg-white" : "bg-navy-50/50"}
                      >
                        <td className="py-2.5 px-4 font-body text-sm font-medium text-gray-600">
                          {row.label}
                        </td>
                        <td className="py-2.5 px-4 font-body text-sm font-bold text-navy-900">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Guarantors ── */}
            {(appData?.guarantor1Name || appData?.guarantor2Name) && (
              <div className="mb-6">
                <h3 className="font-display text-base font-bold text-navy-900 mb-3 pb-2 border-b-2 border-navy-900">
                  Guarantor Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {appData?.guarantor1Name && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="font-body text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Guarantor 1
                      </p>
                      <p className="font-body text-sm font-semibold text-navy-900">
                        {appData.guarantor1Name}
                      </p>
                      <p className="font-body text-xs text-gray-500 mt-1">
                        Relation: {appData.guarantor1Relation || "—"}
                      </p>
                      <p className="font-body text-xs text-gray-500">
                        Mobile: {appData.guarantor1Mobile || "—"}
                      </p>
                      {appData.guarantor1Address && (
                        <p className="font-body text-xs text-gray-500">
                          {appData.guarantor1Address}
                        </p>
                      )}
                    </div>
                  )}
                  {appData?.guarantor2Name && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="font-body text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Guarantor 2
                      </p>
                      <p className="font-body text-sm font-semibold text-navy-900">
                        {appData.guarantor2Name}
                      </p>
                      <p className="font-body text-xs text-gray-500 mt-1">
                        Relation: {appData.guarantor2Relation || "—"}
                      </p>
                      <p className="font-body text-xs text-gray-500">
                        Mobile: {appData.guarantor2Mobile || "—"}
                      </p>
                      {appData.guarantor2Address && (
                        <p className="font-body text-xs text-gray-500">
                          {appData.guarantor2Address}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Terms & Conditions ── */}
            <div className="mb-8">
              <h3 className="font-display text-base font-bold text-navy-900 mb-3 pb-2 border-b-2 border-navy-900">
                Terms &amp; Conditions
              </h3>
              <ol className="space-y-2">
                {[
                  "The loan amount shall be disbursed only upon completion of all required documentation and verification process.",
                  `EMI payments must be made on or before the due date every month. A late fine of ${lateFine} will be applicable on delayed payments.`,
                  "The borrower shall not use the loan amount for any purpose other than the stated purpose without prior written approval from JMD FinCap.",
                  "JMD FinCap reserves the right to recall the entire loan outstanding at any time in case of default or breach of any terms.",
                  "All disputes arising out of this loan agreement shall be subject to the jurisdiction of courts in Khargone, Madhya Pradesh.",
                  "The borrower agrees to notify JMD FinCap of any change in address, employment, or contact details within 7 days of such change.",
                ].map((term, i) => (
                  <li
                    key={`term-${i + 1}`}
                    className="flex gap-3 font-body text-sm text-gray-700"
                  >
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-navy-900 text-gold-500 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {term}
                  </li>
                ))}
              </ol>
            </div>

            {/* ── Signatures ── */}
            <div className="border-t-2 border-navy-900 pt-6 mt-6">
              <p className="font-body text-sm text-gray-700 mb-6">
                This letter is issued in good faith and is subject to
                verification of all submitted documents. Please acknowledge
                receipt by signing below.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {/* Borrower */}
                <div className="text-center">
                  <div className="h-16 border-b-2 border-gray-400 border-dashed mb-2" />
                  <p className="font-body text-xs font-semibold text-navy-900">
                    Borrower Signature
                  </p>
                  <p className="font-body text-xs text-gray-500 mt-0.5">
                    {name || "Applicant"}
                  </p>
                  <p className="font-body text-xs text-gray-400">
                    Date: ______
                  </p>
                </div>

                {/* CEO */}
                <div className="text-center">
                  <div className="h-16 border-b-2 border-navy-900 mb-2 flex items-end justify-center pb-1">
                    <p className="font-display text-lg font-bold text-navy-800 italic">
                      Sawan S.
                    </p>
                  </div>
                  <p className="font-body text-xs font-semibold text-navy-900">
                    Authorized Signatory
                  </p>
                  <p className="font-body text-xs text-gold-600 mt-0.5">
                    Sawan Solanki
                  </p>
                  <p className="font-body text-xs text-gray-500">
                    CEO — JMD FinCap
                  </p>
                </div>

                {/* Co-Founder */}
                <div className="text-center">
                  <div className="h-16 border-b-2 border-navy-900 mb-2 flex items-end justify-center pb-1">
                    <p className="font-display text-lg font-bold text-navy-800 italic">
                      Sawan C.
                    </p>
                  </div>
                  <p className="font-body text-xs font-semibold text-navy-900">
                    Authorized Signatory
                  </p>
                  <p className="font-body text-xs text-gold-600 mt-0.5">
                    Sawan Chouhan
                  </p>
                  <p className="font-body text-xs text-gray-500">
                    Co-Founder — JMD FinCap
                  </p>
                </div>
              </div>
            </div>

            {/* ── Stamp Area ── */}
            <div className="flex justify-end mt-6">
              <div className="h-20 w-20 rounded-full border-4 border-dashed border-navy-900/30 flex items-center justify-center">
                <p className="font-body text-xs text-navy-900/40 text-center font-semibold leading-tight">
                  COMPANY
                  <br />
                  SEAL
                </p>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="bg-navy-900 px-12 py-4 mt-4">
            <p className="font-body text-xs text-white/50 text-center">
              JMD FinCap | Bistan Road, Khargone, Madhya Pradesh — 451001 |
              contact.jmdfincap@gmail.com | +91 73546 96765
            </p>
            <p className="font-body text-xs text-white/30 text-center mt-1">
              This is a computer-generated letter. For any queries, please
              contact our office.
            </p>
          </div>
        </div>
      </div>

      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  );
}
