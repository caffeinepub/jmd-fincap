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
  Camera,
  CheckCircle2,
  Home,
  Loader2,
  SkipForward,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilePreview {
  name: string;
  preview: string | null;
  base64: string;
}

// ─── Image Compression ────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_COMPRESSED_SIZE_BYTES = 800 * 1024;
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

// ─── Steps Config ─────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Personal Details", emoji: "👤" },
  { label: "Address", emoji: "🏠" },
  { label: "Identity Proof", emoji: "🪪" },
  { label: "Work & Income", emoji: "💼" },
  { label: "Loan Details", emoji: "💰" },
  { label: "Guarantor 1", emoji: "🤝" },
  { label: "Guarantor 2", emoji: "🤝" },
  { label: "Declaration", emoji: "✍️" },
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-navy-900">
          {STEPS[step].emoji} Step {step + 1} of {total} — {STEPS[step].label}
        </span>
        <span className="text-sm font-bold text-gold-600">{pct}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-navy-800 to-gold-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

interface UploadZoneProps {
  id: string;
  label: string;
  optional?: boolean;
  accept: string;
  value: FilePreview | null;
  onChange: (fp: FilePreview | null) => void;
  hint?: string;
}

function UploadZone({
  id,
  label,
  optional,
  accept,
  value,
  onChange,
  hint,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File bahut badi hai. 5MB se chhoti file chunein.");
      return;
    }
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      try {
        const compressed = await compressImage(file);
        const byteLength = Math.round((compressed.length * 3) / 4);
        if (byteLength > MAX_COMPRESSED_SIZE_BYTES) {
          toast.warning("Image thodi badi hai. Chhoti photo try karein.");
        }
        onChange({ name: file.name, preview: compressed, base64: compressed });
      } catch {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const b64 = ev.target?.result as string;
          onChange({ name: file.name, preview: b64, base64: b64 });
        };
        reader.readAsDataURL(file);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target?.result as string;
        onChange({ name: file.name, preview: null, base64: b64 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-base font-semibold text-navy-900">
          {label}
        </Label>
        {optional && (
          <span className="text-xs text-gray-400 font-normal">(Optional)</span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-400 bg-green-50">
          {value.preview ? (
            <img
              src={value.preview}
              alt="preview"
              className="h-14 w-14 rounded-lg object-cover border border-green-200 shrink-0"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800 truncate">
              {value.name}
            </p>
            <p className="text-xs text-green-600 mt-0.5">✅ Upload ho gaya!</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors shrink-0"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          data-ocid={`${id}.upload_button`}
          className="w-full flex items-center justify-center gap-3 h-16 rounded-xl border-2 border-dashed border-gold-300 bg-gold-50 hover:bg-gold-100 hover:border-gold-400 transition-colors text-navy-800 font-semibold text-sm active:scale-95"
        >
          <Camera className="h-5 w-5 text-gold-600" />📷 Photo Lein / File
          Chunein
        </button>
      )}
    </div>
  );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  optional,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label
          htmlFor={htmlFor}
          className="text-base font-medium text-navy-900"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {optional && <span className="text-xs text-gray-400">(Optional)</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "h-12 text-base border-gray-200 focus:border-gold-500 focus:ring-gold-500 rounded-xl";

// ─── Step Header ──────────────────────────────────────────────────────────────

function StepHeader({
  emoji,
  title,
  subtitle,
}: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 pb-5 border-b border-gray-100">
      <div className="text-4xl mb-2">{emoji}</div>
      <h2 className="text-2xl font-bold text-navy-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LoanApplicationPage() {
  const { actor } = useActor();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  // Section 1
  const [fullName, setFullName] = useState("");
  const [fatherHusbandName, setFatherHusbandName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [mobile1, setMobile1] = useState("");
  const [mobile2, setMobile2] = useState("");
  const [email, setEmail] = useState("");

  // Section 2
  const [currentAddress, setCurrentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [nearestLandmark, setNearestLandmark] = useState("");
  const [houseType, setHouseType] = useState("");

  // Section 3
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarCardFile, setAadhaarCardFile] = useState<FilePreview | null>(
    null,
  );
  const [panCardFile, setPanCardFile] = useState<FilePreview | null>(null);
  const [customerPhoto, setCustomerPhoto] = useState<FilePreview | null>(null);

  // Section 4
  const [occupation, setOccupation] = useState("");
  const [workplaceName, setWorkplaceName] = useState("");
  const [workAddress, setWorkAddress] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  // Section 5
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanStartDate, setLoanStartDate] = useState("");
  const [loanDuration, setLoanDuration] = useState("");
  const [monthlyEMI, setMonthlyEMI] = useState("");
  const [lateFineRule, setLateFineRule] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");

  // Section 6
  const [guarantor1Name, setGuarantor1Name] = useState("");
  const [guarantor1Mobile, setGuarantor1Mobile] = useState("");
  const [guarantor1Relation, setGuarantor1Relation] = useState("");
  const [guarantor1Address, setGuarantor1Address] = useState("");

  // Section 7
  const [guarantor2Name, setGuarantor2Name] = useState("");
  const [guarantor2Mobile, setGuarantor2Mobile] = useState("");
  const [guarantor2Relation, setGuarantor2Relation] = useState("");
  const [guarantor2Address, setGuarantor2Address] = useState("");

  // Section 8
  const [customerSignature, setCustomerSignature] =
    useState<FilePreview | null>(null);
  const [declarationDate, setDeclarationDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [declarationChecked, setDeclarationChecked] = useState(false);

  // AI Agent prefill
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("prefill") === "1") {
      try {
        const raw = localStorage.getItem("jmd_agent_prefill");
        if (raw) {
          const data = JSON.parse(raw) as Record<string, string>;
          if (data.fullName) setFullName(data.fullName);
          if (data.fatherHusbandName)
            setFatherHusbandName(data.fatherHusbandName);
          if (data.dateOfBirth) setDateOfBirth(data.dateOfBirth);
          if (data.mobile1) setMobile1(data.mobile1);
          if (data.mobile2) setMobile2(data.mobile2);
          if (data.email) setEmail(data.email);
          if (data.currentAddress) setCurrentAddress(data.currentAddress);
          if (data.permanentAddress) setPermanentAddress(data.permanentAddress);
          if (data.nearestLandmark) setNearestLandmark(data.nearestLandmark);
          if (data.houseType) setHouseType(data.houseType);
          if (data.aadhaarNumber) setAadhaarNumber(data.aadhaarNumber);
          if (data.panNumber) setPanNumber(data.panNumber);
          if (data.occupation) setOccupation(data.occupation);
          if (data.workplaceName) setWorkplaceName(data.workplaceName);
          if (data.workAddress) setWorkAddress(data.workAddress);
          if (data.monthlyIncome) setMonthlyIncome(data.monthlyIncome);
          if (data.loanAmount) setLoanAmount(data.loanAmount);
          if (data.loanDuration) setLoanDuration(data.loanDuration);
          if (data.loanPurpose) setLoanPurpose(data.loanPurpose);
          if (data.guarantor1Name) setGuarantor1Name(data.guarantor1Name);
          if (data.guarantor1Mobile) setGuarantor1Mobile(data.guarantor1Mobile);
          if (data.guarantor1Relation)
            setGuarantor1Relation(data.guarantor1Relation);
          if (data.guarantor1Address)
            setGuarantor1Address(data.guarantor1Address);
          localStorage.removeItem("jmd_agent_prefill");
        }
        window.history.replaceState({}, "", "/apply");
        toast.success(
          "AI Agent ne form fill kar diya! Documents upload karein aur submit karein.",
          { duration: 5000 },
        );
      } catch {
        /* ignore */
      }
    }
  }, []);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!fullName.trim() || !dateOfBirth || !mobile1.trim()) {
          toast.error("Naam, Janam Tithi aur Mobile Number zaroori hai.");
          return false;
        }
        if (!/^[6-9]\d{9}$/.test(mobile1.trim())) {
          toast.error("Sahi 10 digit ka mobile number dalein.");
          return false;
        }
        return true;
      case 1:
        if (!currentAddress.trim() || !permanentAddress.trim() || !houseType) {
          toast.error(
            "Current Address, Permanent Address aur Ghar Ka Type zaroori hai.",
          );
          return false;
        }
        return true;
      case 2:
        if (!aadhaarNumber.trim()) {
          toast.error("Aadhaar number zaroori hai.");
          return false;
        }
        if (!/^\d{12}$/.test(aadhaarNumber)) {
          toast.error("Aadhaar number 12 digit ka hona chahiye.");
          return false;
        }
        return true;
      case 3:
        if (!occupation || !monthlyIncome.trim()) {
          toast.error("Kaam aur Monthly Income zaroori hai.");
          return false;
        }
        return true;
      case 4:
        if (!loanAmount.trim() || !loanDuration.trim()) {
          toast.error("Loan Amount aur Duration zaroori hai.");
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

  const skipGuarantor = () => {
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mutation = useMutation({
    mutationFn: async () => {
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
        loanPurpose,
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
        firstName: fullName.trim().split(" ")[0] ?? fullName,
        lastName: fullName.trim().split(" ").slice(1).join(" ") || "",
        fatherName: fatherHusbandName,
        motherName: "",
        aadharNumber: aadhaarNumber,
        loanType: "Personal Loan",
        tenure: loanDuration,
        employeeType: occupation,
        aadharCardFile: aadhaarCardFile?.base64 ?? "",
        photoFile: customerPhoto?.base64 ?? "",
        signatureFile: customerSignature?.base64 ?? "",
        timestamp: Date.now(),
      };

      let savedToLocalStorage = false;
      try {
        const docData = {
          aadhaarCardFile: aadhaarCardFile?.base64 ?? "",
          panCardFile: panCardFile?.base64 ?? "",
          customerPhoto: customerPhoto?.base64 ?? "",
          customerSignature: customerSignature?.base64 ?? "",
        };
        let docsSaved = false;
        try {
          localStorage.setItem(`jmd_docs_${id}`, JSON.stringify(docData));
          docsSaved = true;
        } catch {
          /* quota exceeded */
        }
        if (!docsSaved) {
          if (docData.aadhaarCardFile)
            try {
              localStorage.setItem(
                `jmd_doc_aadhaar_${id}`,
                docData.aadhaarCardFile,
              );
            } catch {
              /* ignore */
            }
          if (docData.panCardFile)
            try {
              localStorage.setItem(`jmd_doc_pan_${id}`, docData.panCardFile);
            } catch {
              /* ignore */
            }
          if (docData.customerPhoto)
            try {
              localStorage.setItem(
                `jmd_doc_photo_${id}`,
                docData.customerPhoto,
              );
            } catch {
              /* ignore */
            }
          if (docData.customerSignature)
            try {
              localStorage.setItem(
                `jmd_doc_signature_${id}`,
                docData.customerSignature,
              );
            } catch {
              /* ignore */
            }
        }
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
      } catch (err) {
        console.error("[JMD] Failed to save to localStorage:", err);
      }

      if (!savedToLocalStorage)
        console.warn(
          "[JMD] WARNING: Application could not be saved to localStorage!",
        );

      if (actor) {
        try {
          const nameParts = fullName.trim().split(" ");
          await actor.submitLoanApplication(
            nameParts[0] ?? fullName,
            nameParts.slice(1).join(" ") || "",
            dateOfBirth,
            "",
            fatherHusbandName,
            aadhaarNumber,
            panNumber,
            `Occupation: ${occupation}. EMI: ${monthlyEMI || "N/A"}. Duration: ${loanDuration}`,
            "Personal Loan",
            loanDuration,
            loanAmount,
            monthlyIncome,
            occupation,
            aadhaarCardFile?.base64 ?? "",
            panCardFile?.base64 ?? "",
            customerPhoto?.base64 ?? "",
            customerSignature?.base64 ?? "",
          );
        } catch {
          /* backend save failed — data is in localStorage */
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
      toast.error("Submit nahi hua. Dobara try karein.", {
        description: err.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationChecked) {
      toast.error("Pehle declaration par tick karein.");
      return;
    }
    mutation.mutate();
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div
        className="min-h-screen bg-white flex flex-col"
        data-ocid="apply.success_state"
      >
        <Toaster position="top-center" richColors />
        <header className="bg-white border-b border-gray-100 py-3 px-5 flex items-center">
          <a href="/" className="flex items-center gap-3">
            <img
              src={getActiveLogo()}
              alt="JMD FinCap"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = _DEFAULT_LOGO;
              }}
            />
            <span className="font-bold text-navy-900 text-lg">JMD FinCap</span>
          </a>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md w-full">
            <div className="h-28 w-28 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              🎉 Ho Gaya!
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Aapki Application Submit Ho Gayi!
            </h2>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-navy-900 text-gold-400 font-bold text-sm mb-5">
              Application ID: {applicationId}
            </div>
            <p className="text-gray-600 text-base leading-relaxed mb-3">
              Shukriya, <strong>{fullName}</strong>!<br />
              Hamari team jald hi aapse contact karegi.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              📞 Hum <strong>{mobile1}</strong> par 24 ghante mein call karenge.
            </p>
            <a
              href="/"
              data-ocid="apply.primary_button"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-navy-900 bg-gold-500 hover:bg-gold-400 transition-colors text-base"
            >
              <Home className="h-5 w-5" />
              Ghar Jaayein
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-3 px-5 flex items-center justify-between sticky top-0 z-40">
        <a href="/" className="flex items-center gap-3">
          <img
            src={getActiveLogo()}
            alt="JMD FinCap"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = _DEFAULT_LOGO;
            }}
          />
          <span className="font-bold text-navy-900 text-lg hidden sm:block">
            JMD FinCap
          </span>
        </a>
        <a
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy-900 transition-colors"
          data-ocid="apply.link"
        >
          <ArrowLeft className="h-4 w-4" />
          Wapas Jaayein
        </a>
      </header>

      {/* Top Banner */}
      <div className="bg-navy-900 py-5 px-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white">
            💰 Loan Ke Liye Apply Karein
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Aasaan form — bas kuch minute mein poora karein
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-100 py-4 px-5 sticky top-[61px] z-30">
        <div className="max-w-2xl mx-auto">
          <ProgressBar step={currentStep} total={STEPS.length} />
        </div>
      </div>

      {/* Form Content */}
      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100">
              {/* ── STEP 0: Personal Details ── */}
              {currentStep === 0 && (
                <div>
                  <StepHeader
                    emoji="👤"
                    title="Personal Details"
                    subtitle="Aapki basic jankari"
                  />
                  <div className="space-y-5">
                    <Field label="Poora Naam" required htmlFor="fullName">
                      <Input
                        id="fullName"
                        placeholder="Apna poora naam likhein"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputCls}
                        autoComplete="name"
                      />
                    </Field>
                    <Field
                      label="Pita / Pati Ka Naam"
                      required
                      htmlFor="fatherName"
                    >
                      <Input
                        id="fatherName"
                        placeholder="Pita ya pati ka naam"
                        value={fatherHusbandName}
                        onChange={(e) => setFatherHusbandName(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Janam Tithi" required htmlFor="dob">
                      <Input
                        id="dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Mobile Number 1" required htmlFor="mobile1">
                      <Input
                        id="mobile1"
                        type="tel"
                        placeholder="10 digit mobile number"
                        value={mobile1}
                        onChange={(e) =>
                          setMobile1(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className={inputCls}
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                    </Field>
                    <Field label="Mobile Number 2" optional htmlFor="mobile2">
                      <Input
                        id="mobile2"
                        type="tel"
                        placeholder="Doosra mobile number (optional)"
                        value={mobile2}
                        onChange={(e) =>
                          setMobile2(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className={inputCls}
                        inputMode="numeric"
                      />
                    </Field>
                    <Field label="Email" optional htmlFor="email">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email address (optional)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Address Details ── */}
              {currentStep === 1 && (
                <div>
                  <StepHeader
                    emoji="🏠"
                    title="Address"
                    subtitle="Aap kahan rehte hain?"
                  />
                  <div className="space-y-5">
                    <Field
                      label="Current Address"
                      required
                      htmlFor="currentAddr"
                    >
                      <textarea
                        id="currentAddr"
                        placeholder="Ghar ka poora pata likhein"
                        value={currentAddress}
                        onChange={(e) => setCurrentAddress(e.target.value)}
                        rows={3}
                        className="w-full text-base border border-gray-200 rounded-xl p-3 focus:border-gold-500 focus:ring-gold-500 focus:outline-none focus:ring-1 resize-none"
                      />
                    </Field>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPermanentAddress(currentAddress)}
                        className="text-xs font-semibold text-gold-600 underline"
                      >
                        ✅ Current Address hi Permanent Address hai
                      </button>
                    </div>
                    <Field
                      label="Permanent Address"
                      required
                      htmlFor="permAddr"
                    >
                      <textarea
                        id="permAddr"
                        placeholder="Permanent pata (agar current se alag hai)"
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        rows={3}
                        className="w-full text-base border border-gray-200 rounded-xl p-3 focus:border-gold-500 focus:ring-gold-500 focus:outline-none focus:ring-1 resize-none"
                      />
                    </Field>
                    <Field label="Najdiki Landmark" optional htmlFor="landmark">
                      <Input
                        id="landmark"
                        placeholder="Koi badi jagah / school / mandir ke paas"
                        value={nearestLandmark}
                        onChange={(e) => setNearestLandmark(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Ghar Ka Type" required htmlFor="houseType">
                      <Select value={houseType} onValueChange={setHouseType}>
                        <SelectTrigger
                          id="houseType"
                          className="h-12 text-base rounded-xl border-gray-200"
                        >
                          <SelectValue placeholder="Chune — Apna ya Kiraye ka?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Owned">
                            🏠 Apna Ghar (Owned)
                          </SelectItem>
                          <SelectItem value="Rented">
                            🔑 Kiraye Par (Rented)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Identity Proof ── */}
              {currentStep === 2 && (
                <div>
                  <StepHeader
                    emoji="🪪"
                    title="Identity Proof"
                    subtitle="Aadhaar aur PAN ki jankari"
                  />
                  <div className="space-y-6">
                    <Field label="Aadhaar Number" required htmlFor="aadhaar">
                      <Input
                        id="aadhaar"
                        type="tel"
                        placeholder="12 digit Aadhaar number"
                        value={aadhaarNumber}
                        onChange={(e) =>
                          setAadhaarNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 12),
                          )
                        }
                        className={inputCls}
                        inputMode="numeric"
                        maxLength={12}
                      />
                      {aadhaarNumber.length > 0 &&
                        aadhaarNumber.length < 12 && (
                          <p className="text-xs text-orange-500">
                            {12 - aadhaarNumber.length} digit aur dalein
                          </p>
                        )}
                    </Field>
                    <Field label="PAN Number" optional htmlFor="pan">
                      <Input
                        id="pan"
                        placeholder="PAN card number (optional)"
                        value={panNumber}
                        onChange={(e) =>
                          setPanNumber(
                            e.target.value.toUpperCase().slice(0, 10),
                          )
                        }
                        className={inputCls}
                      />
                    </Field>

                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-base font-semibold text-navy-900 mb-4">
                        📄 Documents Upload Karein
                      </p>
                      <div className="space-y-5">
                        <UploadZone
                          id="aadhaarCard"
                          label="Aadhaar Card Ki Photo"
                          accept="image/*,application/pdf"
                          value={aadhaarCardFile}
                          onChange={setAadhaarCardFile}
                          hint="Aadhaar card ke aage aur peeche ki photo"
                        />
                        <UploadZone
                          id="panCard"
                          label="PAN Card Ki Photo"
                          optional
                          accept="image/*,application/pdf"
                          value={panCardFile}
                          onChange={setPanCardFile}
                          hint="PAN card ki saaf photo"
                        />
                        <UploadZone
                          id="customerPhotoUpload"
                          label="Aapki Photo (Selfie)"
                          accept="image/*"
                          value={customerPhoto}
                          onChange={setCustomerPhoto}
                          hint="Saaf chehra dikhne wali photo"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Work & Income ── */}
              {currentStep === 3 && (
                <div>
                  <StepHeader
                    emoji="💼"
                    title="Kaam aur Kamaai"
                    subtitle="Aap kya kaam karte hain?"
                  />
                  <div className="space-y-5">
                    <Field label="Kaam Ka Prakar" required htmlFor="occupation">
                      <Select value={occupation} onValueChange={setOccupation}>
                        <SelectTrigger
                          id="occupation"
                          className="h-12 text-base rounded-xl border-gray-200"
                        >
                          <SelectValue placeholder="Apna kaam chune" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Job">👨‍💼 Naukri (Job)</SelectItem>
                          <SelectItem value="Business">
                            🏪 Khud Ka Business
                          </SelectItem>
                          <SelectItem value="Labour">
                            🔨 Mazdoori (Labour)
                          </SelectItem>
                          <SelectItem value="Other">📋 Kuch Aur</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field
                      label="Dukaan / Company Ka Naam"
                      optional
                      htmlFor="workplace"
                    >
                      <Input
                        id="workplace"
                        placeholder="Jahan aap kaam karte hain"
                        value={workplaceName}
                        onChange={(e) => setWorkplaceName(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field
                      label="Kaam Ki Jagah Ka Pata"
                      optional
                      htmlFor="workAddr"
                    >
                      <Input
                        id="workAddr"
                        placeholder="Office ya dukaan ka pata"
                        value={workAddress}
                        onChange={(e) => setWorkAddress(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field
                      label="Mahine Ki Kamaai (₹)"
                      required
                      htmlFor="income"
                    >
                      <Input
                        id="income"
                        type="tel"
                        placeholder="Monthly income kitni hai?"
                        value={monthlyIncome}
                        onChange={(e) =>
                          setMonthlyIncome(e.target.value.replace(/\D/g, ""))
                        }
                        className={inputCls}
                        inputMode="numeric"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Loan Details ── */}
              {currentStep === 4 && (
                <div>
                  <StepHeader
                    emoji="💰"
                    title="Loan Ki Jankari"
                    subtitle="Kitna loan chahiye aur kitne time ke liye?"
                  />
                  <div className="space-y-5">
                    <Field
                      label="Loan Ka Uddeshya"
                      optional
                      htmlFor="loanPurpose"
                    >
                      <Input
                        id="loanPurpose"
                        placeholder="Loan kisliye chahiye? (ghar, padhai, business...)"
                        value={loanPurpose}
                        onChange={(e) => setLoanPurpose(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Loan Ki Rashi (₹)" required htmlFor="loanAmt">
                      <Input
                        id="loanAmt"
                        type="tel"
                        placeholder="Kitna loan chahiye?"
                        value={loanAmount}
                        onChange={(e) =>
                          setLoanAmount(e.target.value.replace(/\D/g, ""))
                        }
                        className={inputCls}
                        inputMode="numeric"
                      />
                    </Field>
                    <Field
                      label="Byaaj Dar (% per annum)"
                      optional
                      htmlFor="interest"
                    >
                      <Input
                        id="interest"
                        placeholder="Interest rate (%) — optional"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field
                      label="Loan Shuru Hone Ki Tithi"
                      optional
                      htmlFor="startDate"
                    >
                      <Input
                        id="startDate"
                        type="date"
                        value={loanStartDate}
                        onChange={(e) => setLoanStartDate(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field
                      label="Loan Ki Avadhi (Mahine Mein)"
                      required
                      htmlFor="duration"
                    >
                      <Input
                        id="duration"
                        type="tel"
                        placeholder="Kitne mahine mein wapas karenge?"
                        value={loanDuration}
                        onChange={(e) =>
                          setLoanDuration(e.target.value.replace(/\D/g, ""))
                        }
                        className={inputCls}
                        inputMode="numeric"
                      />
                    </Field>
                    <Field label="Mahine Ki EMI (₹)" optional htmlFor="emi">
                      <Input
                        id="emi"
                        type="tel"
                        placeholder="Har mahine kitna bharenge?"
                        value={monthlyEMI}
                        onChange={(e) =>
                          setMonthlyEMI(e.target.value.replace(/\D/g, ""))
                        }
                        className={inputCls}
                        inputMode="numeric"
                      />
                    </Field>
                    <Field
                      label="Late Fine Ka Niyam"
                      optional
                      htmlFor="lateFine"
                    >
                      <Input
                        id="lateFine"
                        placeholder="Late payment fine (optional)"
                        value={lateFineRule}
                        onChange={(e) => setLateFineRule(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 5: Guarantor 1 ── */}
              {currentStep === 5 && (
                <div>
                  <StepHeader
                    emoji="🤝"
                    title="Guarantor 1"
                    subtitle="Koi ek insaan jo aapke liye guarantee de"
                  />

                  {/* Skip Button - Prominent at top */}
                  <button
                    type="button"
                    onClick={skipGuarantor}
                    data-ocid="guarantor1.secondary_button"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors mb-6 font-semibold text-sm"
                  >
                    <SkipForward className="h-4 w-4" />
                    Guarantor Nahi Hai? Skip Karein →
                  </button>

                  <div className="space-y-5">
                    <Field
                      label="Guarantor 1 Ka Naam"
                      optional
                      htmlFor="g1name"
                    >
                      <Input
                        id="g1name"
                        placeholder="Poora naam"
                        value={guarantor1Name}
                        onChange={(e) => setGuarantor1Name(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Mobile Number" optional htmlFor="g1mobile">
                      <Input
                        id="g1mobile"
                        type="tel"
                        placeholder="10 digit mobile number"
                        value={guarantor1Mobile}
                        onChange={(e) =>
                          setGuarantor1Mobile(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className={inputCls}
                        inputMode="numeric"
                      />
                    </Field>
                    <Field label="Aapka Rishta" optional htmlFor="g1relation">
                      <Input
                        id="g1relation"
                        placeholder="Jaise: bhai, dost, chacha"
                        value={guarantor1Relation}
                        onChange={(e) => setGuarantor1Relation(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Address" optional htmlFor="g1addr">
                      <Input
                        id="g1addr"
                        placeholder="Guarantor ka pata"
                        value={guarantor1Address}
                        onChange={(e) => setGuarantor1Address(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 6: Guarantor 2 ── */}
              {currentStep === 6 && (
                <div>
                  <StepHeader
                    emoji="🤝"
                    title="Guarantor 2"
                    subtitle="Doosra guarantor (agar hai to)"
                  />

                  {/* Skip Button - Prominent at top */}
                  <button
                    type="button"
                    onClick={skipGuarantor}
                    data-ocid="guarantor2.secondary_button"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors mb-6 font-semibold text-sm"
                  >
                    <SkipForward className="h-4 w-4" />
                    Doosra Guarantor Nahi Hai? Skip Karein →
                  </button>

                  <div className="space-y-5">
                    <Field
                      label="Guarantor 2 Ka Naam"
                      optional
                      htmlFor="g2name"
                    >
                      <Input
                        id="g2name"
                        placeholder="Poora naam"
                        value={guarantor2Name}
                        onChange={(e) => setGuarantor2Name(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Mobile Number" optional htmlFor="g2mobile">
                      <Input
                        id="g2mobile"
                        type="tel"
                        placeholder="10 digit mobile number"
                        value={guarantor2Mobile}
                        onChange={(e) =>
                          setGuarantor2Mobile(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        className={inputCls}
                        inputMode="numeric"
                      />
                    </Field>
                    <Field label="Aapka Rishta" optional htmlFor="g2relation">
                      <Input
                        id="g2relation"
                        placeholder="Jaise: bhai, dost, chacha"
                        value={guarantor2Relation}
                        onChange={(e) => setGuarantor2Relation(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Address" optional htmlFor="g2addr">
                      <Input
                        id="g2addr"
                        placeholder="Guarantor ka pata"
                        value={guarantor2Address}
                        onChange={(e) => setGuarantor2Address(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 7: Declaration ── */}
              {currentStep === 7 && (
                <div>
                  <StepHeader
                    emoji="✍️"
                    title="Declaration"
                    subtitle="Ek baar sab check karein aur confirm karein"
                  />

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                    <p className="text-sm font-semibold text-navy-900 mb-3">
                      📋 Aapki Details Ka Summary:
                    </p>
                    {[
                      { label: "Naam", value: fullName },
                      { label: "Mobile", value: mobile1 },
                      {
                        label: "Loan Amount",
                        value: loanAmount ? `₹${loanAmount}` : "—",
                      },
                      {
                        label: "Avadhi",
                        value: loanDuration ? `${loanDuration} Mahine` : "—",
                      },
                      { label: "Kaam", value: occupation || "—" },
                      {
                        label: "Aadhaar",
                        value: aadhaarNumber
                          ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}`
                          : "—",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-500">{row.label}</span>
                        <span className="font-semibold text-navy-900">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Declaration Text */}
                  <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 mb-5">
                    <p className="text-sm text-navy-800 leading-relaxed">
                      Main confirm karta/karti hoon ki upar di gayi saari
                      jankari sahi aur poori hai. Main loan ko niyamon ke anusar
                      wapas karne ka vachan deta/deti hoon.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      I confirm that all the above information is correct and I
                      agree to repay the loan as per terms.
                    </p>
                  </div>

                  {/* Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gold-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={declarationChecked}
                      onChange={(e) => setDeclarationChecked(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-gray-300 accent-gold-500 shrink-0"
                      data-ocid="apply.checkbox"
                    />
                    <span className="text-sm font-medium text-navy-900">
                      ✅ Main agree karta/karti hoon — meri saari jankari sahi
                      hai
                    </span>
                  </label>

                  <UploadZone
                    id="signatureUpload"
                    label="Hastaakshar (Signature)"
                    optional
                    accept="image/*"
                    value={customerSignature}
                    onChange={setCustomerSignature}
                    hint="Apne hastaakshar ki photo kheench kar upload karein"
                  />

                  <Field label="Aaj Ki Tithi" optional htmlFor="declDate">
                    <Input
                      id="declDate"
                      type="date"
                      value={declarationDate}
                      onChange={(e) => setDeclarationDate(e.target.value)}
                      className={`${inputCls} mt-3`}
                    />
                  </Field>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-5">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  data-ocid="apply.secondary_button"
                  className="flex-1 h-14 text-base font-semibold rounded-xl border-2 border-gray-200"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Peeche
                </Button>
              )}

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  data-ocid="apply.primary_button"
                  className="flex-1 h-14 text-base font-bold rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 border-0"
                >
                  Aage Badhe
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={mutation.isPending || !declarationChecked}
                  data-ocid="apply.submit_button"
                  className="flex-1 h-14 text-base font-bold rounded-xl bg-navy-900 hover:bg-navy-800 text-white border-0"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Submit
                      Ho Raha Hai...
                    </>
                  ) : (
                    <>✅ Application Submit Karein</>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
        © {new Date().getFullYear()} JMD FinCap. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
