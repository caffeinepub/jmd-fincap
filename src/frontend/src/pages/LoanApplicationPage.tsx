import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const _DEFAULT_LOGO = "/assets/generated/jmd-fincap-logo-real.dim_500x500.jpg";
function getActiveLogo(): string {
  try {
    const s = localStorage.getItem("jmd_custom_logo");
    if (s?.startsWith("data:")) return s;
  } catch {
    /* ignore */
  }
  return _DEFAULT_LOGO;
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Home,
  Loader2,
  MapPin,
  MessageCircle,
  PenLine,
  Phone,
  Upload,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilePreview {
  name: string;
  preview: string | null;
  base64: string;
}

// ─── Image Compression Utility ───────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB hard limit
const MAX_COMPRESSED_SIZE_BYTES = 800 * 1024; // 800KB soft warning
const COMPRESS_MAX_WIDTH = 800;
const COMPRESS_QUALITY = 0.7;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > COMPRESS_MAX_WIDTH) {
        height = Math.round((height * COMPRESS_MAX_WIDTH) / width);
        width = COMPRESS_MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", COMPRESS_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };
    img.src = objectUrl;
  });
}

// ─── File Upload Field ────────────────────────────────────────────────────────

interface FileUploadFieldProps {
  id: string;
  label: string;
  accept: string;
  value: FilePreview | null;
  onChange: (file: FilePreview | null) => void;
  hint?: string;
  required?: boolean;
}

function FileUploadField({
  id,
  label,
  accept,
  value,
  onChange,
  hint,
  required = false,
}: FileUploadFieldProps) {
  const handleFile = async (file: File) => {
    // Hard limit: reject files > 5MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File too large. Please use a file under 5MB.");
      return;
    }

    const isImage = file.type.startsWith("image/");

    if (isImage) {
      try {
        const compressed = await compressImage(file);
        // Soft warning if still large after compression
        const byteLength = Math.round((compressed.length * 3) / 4);
        if (byteLength > MAX_COMPRESSED_SIZE_BYTES) {
          toast.warning(
            "Image is large even after compression. Consider using a smaller photo.",
          );
        }
        onChange({
          name: file.name,
          preview: compressed,
          base64: compressed,
        });
      } catch {
        // Compression failed — fallback to raw base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = (e.target?.result as string) ?? "";
          onChange({ name: file.name, preview: base64, base64 });
        };
        reader.readAsDataURL(file);
      }
    } else {
      // Non-image (PDF etc.) — warn if > 1MB
      if (file.size > 1024 * 1024) {
        toast.warning(
          "PDF is over 1MB. It may not save due to browser storage limits.",
        );
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string) ?? "";
        onChange({ name: file.name, preview: null, base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const inputId = `file-input-${id}`;

  return (
    <div className="space-y-2">
      <span className="font-body text-navy-900 text-sm font-medium block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <label
        htmlFor={inputId}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer group block ${
          value
            ? "border-gold-500 bg-gold-50/60"
            : "border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/5"
        }`}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        {value ? (
          <div className="p-5 flex items-center gap-4">
            {value.preview ? (
              <img
                src={value.preview}
                alt="Preview"
                className="h-16 w-16 object-cover rounded-xl border-2 border-gold-200 shrink-0 shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-navy-900 flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="h-7 w-7 text-gold-500" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-body text-sm font-semibold text-navy-900 truncate">
                {value.name}
              </p>
              <p className="font-body text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="h-3 w-3" /> Uploaded successfully
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="font-body text-xs text-red-500 hover:text-red-600 mt-1.5 underline focus-visible:outline-none"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="h-12 w-12 mx-auto mb-3 rounded-2xl bg-gold-100/80 group-hover:bg-gold-100 flex items-center justify-center transition-colors">
              <Upload className="h-6 w-6 text-gold-500 group-hover:text-gold-600 transition-colors" />
            </div>
            <p className="font-body text-sm font-semibold text-gray-600 group-hover:text-navy-700 transition-colors">
              Click to upload
            </p>
            {hint && (
              <p className="font-body text-xs text-gray-400 mt-1">{hint}</p>
            )}
          </div>
        )}
      </label>
    </div>
  );
}

// ─── Progress Stepper ─────────────────────────────────────────────────────────

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Address", icon: MapPin },
  { label: "Identity", icon: FileText },
  { label: "Work", icon: Briefcase },
  { label: "Loan", icon: Wallet },
  { label: "Guarantor 1", icon: Users },
  { label: "Guarantor 2", icon: Users },
  { label: "Declaration", icon: PenLine },
];

function Stepper({
  currentStep,
  totalSteps,
}: { currentStep: number; totalSteps: number }) {
  return (
    <div className="w-full">
      {/* Numbered step indicator */}
      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div
              key={step.label}
              className="flex items-center"
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Circle */}
              <div className="flex flex-col items-center gap-1.5 relative">
                <motion.div
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold font-display transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? "bg-navy-900 text-gold-400"
                      : isCurrent
                        ? "bg-gold-500 text-navy-900 shadow-gold"
                        : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </motion.div>
                <span
                  className={`font-body text-[9px] font-semibold uppercase tracking-wide hidden sm:block whitespace-nowrap ${
                    isCurrent
                      ? "text-gold-600"
                      : isCompleted
                        ? "text-navy-800"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-1 h-0.5 min-w-[12px]">
                  <motion.div
                    className={`h-full rounded-full transition-colors duration-500 ${
                      isCompleted ? "bg-gold-500" : "bg-gray-200"
                    }`}
                    initial={false}
                    animate={{ scaleX: 1 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress fraction */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-xs text-gray-400 font-medium">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="font-body text-xs text-gold-600 font-semibold">
          {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-gray-100 rounded-full">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
  stepNum,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  stepNum: number;
}) {
  return (
    <div className="flex items-start gap-4 mb-6 pb-5 border-b border-gray-100">
      <div className="h-12 w-12 rounded-xl bg-navy-900 flex items-center justify-center shrink-0 relative">
        <Icon className="h-5 w-5 text-gold-500" />
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gold-500 text-navy-900 font-body text-xs font-bold flex items-center justify-center">
          {stepNum}
        </span>
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-navy-900">
          {title}
        </h2>
        {description && (
          <p className="font-body text-sm text-gray-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-body text-navy-900 text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

const inputCls =
  "font-body border-gray-200 focus:border-gold-500 focus:ring-gold-500 h-11";

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LoanApplicationPage() {
  const { actor, isFetching: actorFetching } = useActor();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  // ── Section 1: Personal Details ──
  const [fullName, setFullName] = useState("");
  const [fatherHusbandName, setFatherHusbandName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [mobile1, setMobile1] = useState("");
  const [mobile2, setMobile2] = useState("");
  const [email, setEmail] = useState("");

  // ── Section 2: Address Details ──
  const [currentAddress, setCurrentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [nearestLandmark, setNearestLandmark] = useState("");
  const [houseType, setHouseType] = useState("");

  // ── Section 3: Identity Proof ──
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [customerPhoto, setCustomerPhoto] = useState<FilePreview | null>(null);
  const [aadhaarCardFile, setAadhaarCardFile] = useState<FilePreview | null>(
    null,
  );
  const [panCardFile, setPanCardFile] = useState<FilePreview | null>(null);

  // ── Section 4: Work & Income ──
  const [occupation, setOccupation] = useState("");
  const [workplaceName, setWorkplaceName] = useState("");
  const [workAddress, setWorkAddress] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  // ── Section 5: Loan Details ──
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanStartDate, setLoanStartDate] = useState("");
  const [loanDuration, setLoanDuration] = useState("");
  const [monthlyEMI, setMonthlyEMI] = useState("");
  const [lateFineRule, setLateFineRule] = useState("");

  // ── Section 6: Guarantor 1 ──
  const [guarantor1Name, setGuarantor1Name] = useState("");
  const [guarantor1Mobile, setGuarantor1Mobile] = useState("");
  const [guarantor1Relation, setGuarantor1Relation] = useState("");
  const [guarantor1Address, setGuarantor1Address] = useState("");

  // ── Section 7: Guarantor 2 ──
  const [guarantor2Name, setGuarantor2Name] = useState("");
  const [guarantor2Mobile, setGuarantor2Mobile] = useState("");
  const [guarantor2Relation, setGuarantor2Relation] = useState("");
  const [guarantor2Address, setGuarantor2Address] = useState("");

  // ── Declaration ──
  const [customerSignature, setCustomerSignature] =
    useState<FilePreview | null>(null);
  const [declarationDate, setDeclarationDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // ── AI Pre-fill from chat agent ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("prefill") === "1") {
      try {
        const raw = localStorage.getItem("jmd_loan_prefill");
        if (raw) {
          const d = JSON.parse(raw) as Record<string, string>;
          if (d.fullName) setFullName(d.fullName);
          if (d.fatherHusbandName) setFatherHusbandName(d.fatherHusbandName);
          if (d.dateOfBirth) setDateOfBirth(d.dateOfBirth);
          if (d.mobile1) setMobile1(d.mobile1);
          if (d.mobile2) setMobile2(d.mobile2);
          if (d.email) setEmail(d.email);
          if (d.currentAddress) setCurrentAddress(d.currentAddress);
          if (d.permanentAddress) setPermanentAddress(d.permanentAddress);
          if (d.nearestLandmark) setNearestLandmark(d.nearestLandmark);
          if (d.houseType) setHouseType(d.houseType);
          if (d.aadhaarNumber) setAadhaarNumber(d.aadhaarNumber);
          if (d.panNumber) setPanNumber(d.panNumber);
          if (d.occupation) setOccupation(d.occupation);
          if (d.workplaceName) setWorkplaceName(d.workplaceName);
          if (d.workAddress) setWorkAddress(d.workAddress);
          if (d.monthlyIncome) setMonthlyIncome(d.monthlyIncome);
          if (d.loanAmount) setLoanAmount(d.loanAmount);
          if (d.loanDuration) setLoanDuration(d.loanDuration);
          if (d.monthlyEMI) setMonthlyEMI(d.monthlyEMI);
          if (d.guarantor1Name) setGuarantor1Name(d.guarantor1Name);
          if (d.guarantor1Mobile) setGuarantor1Mobile(d.guarantor1Mobile);
          if (d.guarantor1Relation) setGuarantor1Relation(d.guarantor1Relation);
          if (d.guarantor2Name) setGuarantor2Name(d.guarantor2Name);
          // Clean up
          localStorage.removeItem("jmd_loan_prefill");
          // Remove ?prefill=1 from URL
          window.history.replaceState({}, "", "/apply");
          toast.success(
            "AI Agent ne form fill kar diya! Documents upload karein aur submit karein.",
            { duration: 5000 },
          );
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!fullName.trim() || !dateOfBirth || !mobile1.trim()) {
          toast.error("Please fill all required fields in Personal Details.");
          return false;
        }
        if (!/^[6-9]\d{9}$/.test(mobile1.trim())) {
          toast.error("Please enter a valid 10-digit mobile number.");
          return false;
        }
        return true;
      case 1:
        if (!currentAddress.trim() || !permanentAddress.trim() || !houseType) {
          toast.error("Please fill all required fields in Address Details.");
          return false;
        }
        return true;
      case 2:
        if (!aadhaarNumber.trim()) {
          toast.error("Aadhaar number is required.");
          return false;
        }
        if (!/^\d{12}$/.test(aadhaarNumber)) {
          toast.error("Aadhaar number must be exactly 12 digits.");
          return false;
        }
        return true;
      case 3:
        if (!occupation || !monthlyIncome.trim()) {
          toast.error("Please fill all required fields in Work & Income.");
          return false;
        }
        return true;
      case 4:
        if (!loanAmount.trim() || !loanDuration.trim()) {
          toast.error("Loan Amount and Duration are required.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      // Build comprehensive application data
      const id = `LOAN-${Date.now()}`;
      const appData = {
        id,
        fullName,
        fatherHusbandName,
        dateOfBirth,
        mobile1,
        mobile2,
        email,
        currentAddress,
        permanentAddress,
        nearestLandmark,
        houseType,
        aadhaarNumber,
        panNumber,
        aadhaarCardFile: aadhaarCardFile?.base64 ?? "",
        panCardFile: panCardFile?.base64 ?? "",
        occupation,
        workplaceName,
        workAddress,
        monthlyIncome,
        loanAmount,
        interestRate,
        loanStartDate,
        loanDuration,
        monthlyEMI,
        lateFineRule,
        guarantor1Name,
        guarantor1Mobile,
        guarantor1Relation,
        guarantor1Address,
        guarantor2Name,
        guarantor2Mobile,
        guarantor2Relation,
        guarantor2Address,
        customerPhoto: customerPhoto?.base64 ?? "",
        customerSignature: customerSignature?.base64 ?? "",
        declarationDate,
        submittedAt: new Date().toISOString(),
        status: "pending",
        // Backend-compatible fields
        firstName: fullName.trim().split(" ")[0] ?? fullName,
        lastName: fullName.trim().split(" ").slice(1).join(" ") || "",
        fatherName: fatherHusbandName,
        motherName: "",
        aadharNumber: aadhaarNumber,
        loanPurpose: `Occupation: ${occupation}. EMI: ${monthlyEMI || "N/A"}. Duration: ${loanDuration}`,
        loanType: "Personal Loan",
        tenure: loanDuration,
        employeeType: occupation,
        aadharCardFile: aadhaarCardFile?.base64 ?? "",
        photoFile: customerPhoto?.base64 ?? "",
        signatureFile: customerSignature?.base64 ?? "",
        // Timestamp as number for display in dashboard
        timestamp: Date.now(),
      };

      // STEP 1: Save to localStorage FIRST (guaranteed to work)
      // Save documents separately to avoid quota issues with large JSON blobs
      let savedToLocalStorage = false;
      try {
        // Save documents separately by application ID (avoids large array quota issues)
        const docData = {
          aadhaarCardFile: aadhaarCardFile?.base64 ?? "",
          panCardFile: panCardFile?.base64 ?? "",
          customerPhoto: customerPhoto?.base64 ?? "",
          customerSignature: customerSignature?.base64 ?? "",
        };
        // Try combined save first
        let docsSaved = false;
        try {
          localStorage.setItem(`jmd_docs_${id}`, JSON.stringify(docData));
          docsSaved = true;
        } catch {
          // Combined save failed (quota exceeded) — try saving each document individually
        }
        if (!docsSaved) {
          let anyDocSaved = false;
          if (docData.aadhaarCardFile) {
            try {
              localStorage.setItem(
                `jmd_doc_aadhaar_${id}`,
                docData.aadhaarCardFile,
              );
              anyDocSaved = true;
            } catch {
              /* ignore */
            }
          }
          if (docData.panCardFile) {
            try {
              localStorage.setItem(`jmd_doc_pan_${id}`, docData.panCardFile);
              anyDocSaved = true;
            } catch {
              /* ignore */
            }
          }
          if (docData.customerPhoto) {
            try {
              localStorage.setItem(
                `jmd_doc_photo_${id}`,
                docData.customerPhoto,
              );
              anyDocSaved = true;
            } catch {
              /* ignore */
            }
          }
          if (docData.customerSignature) {
            try {
              localStorage.setItem(
                `jmd_doc_signature_${id}`,
                docData.customerSignature,
              );
              anyDocSaved = true;
            } catch {
              /* ignore */
            }
          }
          if (!anyDocSaved) {
            toast.warning(
              "Documents could not be saved due to storage limits. Please use smaller image files.",
            );
          }
        }

        // Save application metadata (no large base64 files in the main array)
        const lightApp = {
          ...appData,
          aadhaarCardFile: "",
          panCardFile: "",
          customerPhoto: "",
          customerSignature: "",
          aadharCardFile: "",
          photoFile: "",
          signatureFile: "",
        };
        const existingRaw = localStorage.getItem("jmd_loan_applications");
        const existing = existingRaw
          ? (JSON.parse(existingRaw) as object[])
          : [];
        existing.push(lightApp);
        localStorage.setItem("jmd_loan_applications", JSON.stringify(existing));
        savedToLocalStorage = true;
        console.log(
          "[JMD] Loan application saved to localStorage:",
          id,
          "Total:",
          existing.length,
        );
      } catch (err) {
        console.error("[JMD] Failed to save to localStorage:", err);
      }

      if (!savedToLocalStorage) {
        console.warn(
          "[JMD] WARNING: Application could not be saved to localStorage!",
        );
      }

      // STEP 2: Also try to save to backend (best-effort, don't block submission)
      if (actor) {
        try {
          const nameParts = fullName.trim().split(" ");
          const firstName = nameParts[0] ?? fullName;
          const lastName = nameParts.slice(1).join(" ") || "";

          await actor.submitLoanApplication(
            firstName,
            lastName,
            dateOfBirth,
            "", // motherName
            fatherHusbandName,
            aadhaarNumber,
            panNumber,
            `Occupation: ${occupation}. EMI: ${monthlyEMI || "N/A"}. Duration: ${loanDuration}`,
            "Personal Loan",
            loanDuration,
            loanAmount,
            monthlyIncome,
            occupation,
            aadhaarCardFile?.base64 ?? "", // aadhaarCardFile — send to backend
            panCardFile?.base64 ?? "", // panCardFile — send to backend
            customerPhoto?.base64 ?? "", // photoFile — send to backend
            customerSignature?.base64 ?? "", // signatureFile — send to backend
          );
        } catch {
          // Backend save failed — data is already in localStorage, so it's fine
        }
      }

      return id;
    },
    onSuccess: (id) => {
      setApplicationId(id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err: Error) => {
      toast.error("Submission failed. Please try again.", {
        description: err.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Toaster position="top-right" richColors />
        <header className="bg-white border-b border-gray-100 py-3 px-6 flex items-center">
          <a href="/" className="flex items-center gap-3">
            <img
              src={getActiveLogo()}
              alt="JMD FinCap"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = _DEFAULT_LOGO;
              }}
            />
            <span className="font-display text-xl font-bold text-navy-900">
              JMD FinCap
            </span>
          </a>
        </header>
        <main className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-navy-900 mb-3">
              Application Submitted!
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900 text-gold-500 font-body text-sm font-semibold mb-4">
              Application ID: {applicationId}
            </div>
            <p className="font-body text-gray-600 leading-relaxed mb-8">
              Thank you, <strong>{fullName}</strong>. Your loan application has
              been received. Our team will review your details and contact you
              on <strong>{mobile1}</strong> within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/"
                className="px-6 py-3 rounded-lg font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 transition-colors text-center"
              >
                Back to Home
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(0);
                  setFullName("");
                  setFatherHusbandName("");
                  setDateOfBirth("");
                  setMobile1("");
                  setMobile2("");
                  setEmail("");
                  setCurrentAddress("");
                  setPermanentAddress("");
                  setNearestLandmark("");
                  setHouseType("");
                  setAadhaarNumber("");
                  setPanNumber("");
                  setAadhaarCardFile(null);
                  setPanCardFile(null);
                  setCustomerPhoto(null);
                  setOccupation("");
                  setWorkplaceName("");
                  setWorkAddress("");
                  setMonthlyIncome("");
                  setLoanAmount("");
                  setInterestRate("");
                  setLoanStartDate("");
                  setLoanDuration("");
                  setMonthlyEMI("");
                  setLateFineRule("");
                  setGuarantor1Name("");
                  setGuarantor1Mobile("");
                  setGuarantor1Relation("");
                  setGuarantor1Address("");
                  setGuarantor2Name("");
                  setGuarantor2Mobile("");
                  setGuarantor2Relation("");
                  setGuarantor2Address("");
                  setCustomerSignature(null);
                  setDeclarationDate(new Date().toISOString().split("T")[0]);
                }}
                className="px-6 py-3 rounded-lg font-body font-semibold text-navy-900 border-2 border-navy-900 hover:bg-navy-900 hover:text-white transition-colors"
              >
                New Application
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" richColors />

      {/* ─── Header ─── */}
      <header className="bg-white border-b border-gray-100 py-3 px-6 flex items-center justify-between sticky top-0 z-40">
        <a href="/" className="flex items-center gap-3">
          <img
            src={getActiveLogo()}
            alt="JMD FinCap"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = _DEFAULT_LOGO;
            }}
          />
          <span className="font-display text-lg font-bold text-navy-900 hidden sm:block">
            JMD FinCap
          </span>
        </a>
        <a
          href="/"
          className="flex items-center gap-2 font-body text-sm font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </a>
      </header>

      {/* ─── Page Hero ─── */}
      <div className="bg-navy-900 py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/20 border border-gold-500/30 mb-3">
            <Wallet className="h-3.5 w-3.5 text-gold-500" />
            <span className="font-body text-xs font-semibold text-gold-500 uppercase tracking-wider">
              Loan Application Form
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Apply for a <span className="text-gold-500 italic">Loan</span>
          </h1>
          <p className="font-body text-white/60 text-sm">
            Step {currentStep + 1} of {STEPS.length} —{" "}
            {STEPS[currentStep].label}
          </p>
        </div>
      </div>

      {/* ─── Stepper ─── */}
      <div className="bg-white border-b border-gray-100 py-5 px-6">
        <div className="max-w-3xl mx-auto">
          <Stepper currentStep={currentStep} totalSteps={STEPS.length} />
        </div>
      </div>

      {/* ─── AI Agent Banner ─── */}
      <div className="bg-white border-b border-gray-100 py-3 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 bg-navy-900 rounded-xl px-5 py-3.5">
            <div className="h-10 w-10 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-navy-900" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-semibold text-white leading-tight">
                AI Agent se form fill karwayein
              </p>
              <p className="font-body text-xs text-white/60 mt-0.5">
                Bass sawaalon ka jawab dein — Agent baaki sambhal lega!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("jmd_chat_open_loan", "1");
                // Dispatch storage event so AIChatWidget on same tab detects it
                window.dispatchEvent(
                  new StorageEvent("storage", {
                    key: "jmd_chat_open_loan",
                    newValue: "1",
                  }),
                );
                // Also directly open chat by scrolling to it
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                });
                // Reload to trigger the useEffect in AIChatWidget
                window.location.href = "/?open_loan_agent=1";
              }}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 text-navy-900 font-body text-xs font-semibold hover:bg-gold-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Start AI Agent
            </button>
          </div>
        </div>
      </div>

      {/* ─── Form Content ─── */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <form
                onSubmit={handleSubmit}
                noValidate
                id="loan-form"
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100"
              >
                {/* ── Step 0: Personal Details ── */}
                {currentStep === 0 && (
                  <>
                    <SectionHeader
                      icon={User}
                      title="Personal Details"
                      description="Basic information about the loan applicant"
                      stepNum={1}
                    />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <Field label="Full Name" required>
                          <Input
                            placeholder="e.g. Ramesh Kumar Sharma"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputCls}
                            autoComplete="name"
                          />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Father / Husband Name" required>
                          <Input
                            placeholder="e.g. Rajesh Kumar Sharma"
                            value={fatherHusbandName}
                            onChange={(e) =>
                              setFatherHusbandName(e.target.value)
                            }
                            className={inputCls}
                          />
                        </Field>
                      </div>
                      <Field label="Date of Birth" required>
                        <Input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className={inputCls}
                          autoComplete="bday"
                        />
                      </Field>
                      <Field label="Mobile Number 1" required>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          <Input
                            type="tel"
                            placeholder="9876543210"
                            value={mobile1}
                            onChange={(e) =>
                              setMobile1(
                                e.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                            className={`${inputCls} pl-10`}
                            inputMode="numeric"
                            autoComplete="tel"
                          />
                        </div>
                      </Field>
                      <Field label="Mobile Number 2 (Optional)">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          <Input
                            type="tel"
                            placeholder="9876543211"
                            value={mobile2}
                            onChange={(e) =>
                              setMobile2(
                                e.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                            className={`${inputCls} pl-10`}
                            inputMode="numeric"
                          />
                        </div>
                      </Field>
                      <Field label="Email (Optional)">
                        <Input
                          type="email"
                          placeholder="ramesh@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputCls}
                          autoComplete="email"
                        />
                      </Field>
                    </div>
                  </>
                )}

                {/* ── Step 1: Address Details ── */}
                {currentStep === 1 && (
                  <>
                    <SectionHeader
                      icon={MapPin}
                      title="Address Details"
                      description="Current and permanent residential address"
                      stepNum={2}
                    />
                    <div className="grid gap-5">
                      <Field label="Current Address" required>
                        <textarea
                          placeholder="House No., Street, Area, City, State, PIN"
                          value={currentAddress}
                          onChange={(e) => setCurrentAddress(e.target.value)}
                          rows={3}
                          className="w-full font-body text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none resize-none"
                        />
                      </Field>
                      <Field label="Permanent Address" required>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setPermanentAddress(currentAddress)}
                            className="font-body text-xs text-gold-600 hover:text-gold-500 underline focus-visible:outline-none"
                          >
                            Same as Current Address
                          </button>
                        </div>
                        <textarea
                          placeholder="House No., Street, Area, City, State, PIN"
                          value={permanentAddress}
                          onChange={(e) => setPermanentAddress(e.target.value)}
                          rows={3}
                          className="w-full font-body text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none resize-none"
                        />
                      </Field>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <Field label="Nearest Landmark">
                          <Input
                            placeholder="e.g. Near Govt. Hospital"
                            value={nearestLandmark}
                            onChange={(e) => setNearestLandmark(e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="House Type" required>
                          <Select
                            value={houseType}
                            onValueChange={setHouseType}
                          >
                            <SelectTrigger className="font-body border-gray-200 focus:ring-gold-500 h-11">
                              <SelectValue placeholder="Select house type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owned" className="font-body">
                                <Home className="inline h-3.5 w-3.5 mr-2" />
                                Owned
                              </SelectItem>
                              <SelectItem value="rented" className="font-body">
                                <Building2 className="inline h-3.5 w-3.5 mr-2" />
                                Rented
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 2: Identity Proof ── */}
                {currentStep === 2 && (
                  <>
                    <SectionHeader
                      icon={FileText}
                      title="Identity Proof"
                      description="Government issued identity documents"
                      stepNum={3}
                    />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Aadhaar Number" required>
                        <Input
                          type="text"
                          placeholder="1234 5678 9012"
                          value={aadhaarNumber}
                          onChange={(e) =>
                            setAadhaarNumber(
                              e.target.value.replace(/\D/g, "").slice(0, 12),
                            )
                          }
                          maxLength={12}
                          inputMode="numeric"
                          className={`${inputCls} font-mono tracking-widest`}
                        />
                        <p className="font-body text-xs text-gray-400 mt-1">
                          12-digit Aadhaar number
                        </p>
                      </Field>
                      <Field label="PAN Number (Optional)">
                        <Input
                          type="text"
                          placeholder="ABCDE1234F"
                          value={panNumber}
                          onChange={(e) =>
                            setPanNumber(
                              e.target.value.toUpperCase().slice(0, 10),
                            )
                          }
                          maxLength={10}
                          className={`${inputCls} font-mono tracking-widest uppercase`}
                        />
                        <p className="font-body text-xs text-gray-400 mt-1">
                          Format: ABCDE1234F
                        </p>
                      </Field>
                      <div className="sm:col-span-2 border-t border-gray-100 pt-5 mt-2">
                        <p className="font-body text-sm font-semibold text-navy-900 mb-4">
                          Document Uploads
                        </p>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <FileUploadField
                            id="aadhaarCardFile"
                            label="Aadhaar Card Upload"
                            accept="image/*,application/pdf"
                            value={aadhaarCardFile}
                            onChange={setAadhaarCardFile}
                            hint="Front & back photo of Aadhaar card (JPG, PNG, PDF)"
                            required
                          />
                          <FileUploadField
                            id="panCardFile"
                            label="PAN Card Upload"
                            accept="image/*,application/pdf"
                            value={panCardFile}
                            onChange={setPanCardFile}
                            hint="Clear photo of PAN card (JPG, PNG, PDF)"
                          />
                          <FileUploadField
                            id="customerPhoto"
                            label="Customer Photo"
                            accept="image/*"
                            value={customerPhoto}
                            onChange={setCustomerPhoto}
                            hint="Clear passport-size photo (JPG, PNG)"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 3: Work & Income ── */}
                {currentStep === 3 && (
                  <>
                    <SectionHeader
                      icon={Briefcase}
                      title="Work & Income Details"
                      description="Your current occupation and income information"
                      stepNum={4}
                    />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Occupation" required>
                        <Select
                          value={occupation}
                          onValueChange={setOccupation}
                        >
                          <SelectTrigger className="font-body border-gray-200 focus:ring-gold-500 h-11">
                            <SelectValue placeholder="Select occupation..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="job" className="font-body">
                              Job
                            </SelectItem>
                            <SelectItem value="business" className="font-body">
                              Business
                            </SelectItem>
                            <SelectItem value="labour" className="font-body">
                              Labour
                            </SelectItem>
                            <SelectItem value="other" className="font-body">
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Monthly Income (₹)" required>
                        <Input
                          type="number"
                          placeholder="25000"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          min={0}
                          inputMode="numeric"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Workplace / Shop Name">
                        <Input
                          placeholder="e.g. Sharma Enterprises"
                          value={workplaceName}
                          onChange={(e) => setWorkplaceName(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Work Address">
                          <textarea
                            placeholder="Shop/Office address"
                            value={workAddress}
                            onChange={(e) => setWorkAddress(e.target.value)}
                            rows={2}
                            className="w-full font-body text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none resize-none"
                          />
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 4: Loan Details ── */}
                {currentStep === 4 && (
                  <>
                    <SectionHeader
                      icon={Wallet}
                      title="Loan Details"
                      description="Details about the loan amount and repayment"
                      stepNum={5}
                    />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Loan Amount (₹)" required>
                        <Input
                          type="number"
                          placeholder="100000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          min={1000}
                          inputMode="numeric"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Interest Rate">
                        <Input
                          placeholder="e.g. 12% per annum"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Loan Start Date">
                        <Input
                          type="date"
                          value={loanStartDate}
                          onChange={(e) => setLoanStartDate(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Loan Duration (Months)" required>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="12"
                            value={
                              loanDuration
                                ? loanDuration.replace(/\s*months?\s*/i, "")
                                : ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setLoanDuration(val ? `${val} months` : "");
                            }}
                            className={`${inputCls} pr-20`}
                            min={1}
                            max={360}
                            inputMode="numeric"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-gray-400 pointer-events-none">
                            months
                          </span>
                        </div>
                      </Field>
                      <Field label="Monthly EMI (₹)">
                        <Input
                          placeholder="e.g. 9000"
                          value={monthlyEMI}
                          onChange={(e) => setMonthlyEMI(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Late Fine Rule">
                        <Input
                          placeholder="e.g. Rs 50 per day after due date"
                          value={lateFineRule}
                          onChange={(e) => setLateFineRule(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </>
                )}

                {/* ── Step 5: Guarantor 1 ── */}
                {currentStep === 5 && (
                  <>
                    <SectionHeader
                      icon={Users}
                      title="Guarantor / Reference 1"
                      description="First guarantor or reference contact"
                      stepNum={6}
                    />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Guarantor Name">
                        <Input
                          placeholder="Full name"
                          value={guarantor1Name}
                          onChange={(e) => setGuarantor1Name(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Mobile Number">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          <Input
                            type="tel"
                            placeholder="9876543210"
                            value={guarantor1Mobile}
                            onChange={(e) =>
                              setGuarantor1Mobile(
                                e.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                            className={`${inputCls} pl-10`}
                            inputMode="numeric"
                          />
                        </div>
                      </Field>
                      <Field label="Relation">
                        <Input
                          placeholder="e.g. Brother, Friend, Colleague"
                          value={guarantor1Relation}
                          onChange={(e) =>
                            setGuarantor1Relation(e.target.value)
                          }
                          className={inputCls}
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Address">
                          <textarea
                            placeholder="Full residential address"
                            value={guarantor1Address}
                            onChange={(e) =>
                              setGuarantor1Address(e.target.value)
                            }
                            rows={3}
                            className="w-full font-body text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none resize-none"
                          />
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 6: Guarantor 2 ── */}
                {currentStep === 6 && (
                  <>
                    <SectionHeader
                      icon={Users}
                      title="Guarantor / Reference 2"
                      description="Second guarantor or reference contact"
                      stepNum={7}
                    />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Guarantor Name">
                        <Input
                          placeholder="Full name"
                          value={guarantor2Name}
                          onChange={(e) => setGuarantor2Name(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Mobile Number">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          <Input
                            type="tel"
                            placeholder="9876543210"
                            value={guarantor2Mobile}
                            onChange={(e) =>
                              setGuarantor2Mobile(
                                e.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                            className={`${inputCls} pl-10`}
                            inputMode="numeric"
                          />
                        </div>
                      </Field>
                      <Field label="Relation">
                        <Input
                          placeholder="e.g. Brother, Friend, Colleague"
                          value={guarantor2Relation}
                          onChange={(e) =>
                            setGuarantor2Relation(e.target.value)
                          }
                          className={inputCls}
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Address">
                          <textarea
                            placeholder="Full residential address"
                            value={guarantor2Address}
                            onChange={(e) =>
                              setGuarantor2Address(e.target.value)
                            }
                            rows={3}
                            className="w-full font-body text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none resize-none"
                          />
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 7: Declaration ── */}
                {currentStep === 7 && (
                  <>
                    <SectionHeader
                      icon={PenLine}
                      title="Declaration"
                      description="Please read and confirm the declaration below"
                      stepNum={8}
                    />

                    {/* Application Summary */}
                    <div className="bg-navy-50 rounded-xl p-5 border border-navy-100 mb-6">
                      <h3 className="font-body text-sm font-semibold text-navy-900 mb-3">
                        Application Summary
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm font-body">
                        <div>
                          <span className="text-gray-500">Applicant:</span>{" "}
                          <span className="font-semibold text-navy-900">
                            {fullName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Mobile:</span>{" "}
                          <span className="font-semibold text-navy-900">
                            {mobile1}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Loan Amount:</span>{" "}
                          <span className="font-semibold text-navy-900">
                            ₹
                            {Number(loanAmount).toLocaleString("en-IN") ||
                              loanAmount}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>{" "}
                          <span className="font-semibold text-navy-900">
                            {loanDuration}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Aadhaar:</span>{" "}
                          <span className="font-mono font-semibold text-navy-900">
                            {aadhaarNumber.slice(0, 4)} ****{" "}
                            {aadhaarNumber.slice(-4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Occupation:</span>{" "}
                          <span className="font-semibold text-navy-900 capitalize">
                            {occupation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Declaration Text */}
                    <div className="border-2 border-gray-200 rounded-xl p-5 mb-6">
                      <p className="font-body text-sm text-gray-700 leading-relaxed italic">
                        "I confirm that all the above information provided in
                        this loan application is true, accurate and complete to
                        the best of my knowledge. I agree to repay the loan as
                        per the terms and conditions set by JMD FinCap. I
                        understand that providing false information may result
                        in rejection of my application and legal action."
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FileUploadField
                        id="customerSignature"
                        label="Customer Signature"
                        accept="image/*"
                        value={customerSignature}
                        onChange={setCustomerSignature}
                        hint="Clear scan/photo of signature"
                      />
                      <Field label="Date">
                        <Input
                          type="date"
                          value={declarationDate}
                          onChange={(e) => setDeclarationDate(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </AnimatePresence>

          {/* ─── Navigation Buttons ─── */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="font-body text-sm border-gray-200 text-gray-600 hover:text-navy-900 hover:border-navy-900 disabled:opacity-40"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 transition-colors px-6"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                form="loan-form"
                onClick={handleSubmit}
                disabled={mutation.isPending || actorFetching}
                className="font-body font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 transition-colors px-8"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="font-body text-xs text-gray-400">
              © {new Date().getFullYear()} JMD FinCap. All rights reserved. |{" "}
              <a
                href="tel:+918889956204"
                className="hover:text-gold-600 transition-colors"
              >
                +91 88899 56204
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
