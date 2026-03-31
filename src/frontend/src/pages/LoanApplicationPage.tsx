import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

const STEPS = [
  { number: 1, title: "Personal Details" },
  { number: 2, title: "KYC Details" },
  { number: 3, title: "Address Details" },
  { number: 4, title: "Employment" },
  { number: 5, title: "Loan Details" },
  { number: 6, title: "Reference" },
  { number: 7, title: "Review & Submit" },
];

interface FormData {
  // Step 1
  fullName: string;
  fatherName: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  // Step 2
  aadharNumber: string;
  panNumber: string;
  aadharFile: string;
  panFile: string;
  livePhoto: string;
  // Step 3
  currentAddress: string;
  permanentAddress: string;
  sameAsCurrent: boolean;
  electricityBill: string;
  // Step 4
  occupation: string;
  companyName: string;
  monthlyIncome: string;
  workExperience: string;
  // Step 5
  loanType: string;
  loanAmount: string;
  loanDuration: number;
  loanPurpose: string;
  // Step 6
  refName: string;
  refMobile: string;
  refRelation: string;
}

const INITIAL: FormData = {
  fullName: "",
  fatherName: "",
  dob: "",
  gender: "",
  mobile: "",
  email: "",
  aadharNumber: "",
  panNumber: "",
  aadharFile: "",
  panFile: "",
  livePhoto: "",
  currentAddress: "",
  permanentAddress: "",
  sameAsCurrent: false,
  electricityBill: "",
  occupation: "",
  companyName: "",
  monthlyIncome: "",
  workExperience: "",
  loanType: "",
  loanAmount: "",
  loanDuration: 12,
  loanPurpose: "",
  refName: "",
  refMobile: "",
  refRelation: "",
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const MAX_W = 800;
      if (width > MAX_W) {
        height = Math.round((height * MAX_W) / width);
        width = MAX_W;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

async function handleFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File too large (max 5MB)");
  }
  if (file.type.startsWith("image/")) return compressImage(file);
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

function FileUploadField({
  label,
  value,
  onChange,
  icon,
  accept = "image/*,.pdf",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: boolean;
  accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const b64 = await handleFile(file);
      onChange(b64);
      toast.success(`${label} uploaded successfully`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block">
        {label}
      </Label>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors w-full text-left ${
          value
            ? "border-green-400 bg-green-50"
            : "border-gray-200 hover:border-gold-400 bg-gray-50"
        }`}
      >
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
            value ? "bg-green-100" : "bg-gold-100"
          }`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 text-gold-600 animate-spin" />
          ) : value ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : icon ? (
            <Camera className="h-5 w-5 text-gold-600" />
          ) : (
            <Upload className="h-5 w-5 text-gold-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`font-medium text-sm ${value ? "text-green-700" : "text-navy-700"}`}
          >
            {value
              ? "File Uploaded ✓"
              : icon
                ? "Take Photo or Upload"
                : "Click to Upload"}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Max 5MB &bull; Image or PDF
          </div>
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-xs text-red-500 hover:underline shrink-0"
          >
            Remove
          </button>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 overflow-x-auto gap-1">
        {STEPS.map((s) => (
          <div
            key={s.number}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s.number < step
                  ? "bg-green-500 text-white"
                  : s.number === step
                    ? "bg-gold-500 text-navy-900 ring-4 ring-gold-200"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {s.number < step ? "✓" : s.number}
            </div>
            <span
              className={`text-[10px] font-medium hidden sm:block ${
                s.number === step ? "text-navy-900" : "text-gray-400"
              }`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full">
        <div
          className="h-full bg-gold-500 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Step Forms ────────────────────────────────────────────────────────────────

function FieldGroup({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block">
        {label}
      </Label>
      {children}
    </div>
  );
}

const inputCls =
  "h-12 rounded-xl text-base border-gray-200 focus:border-gold-500 focus:ring-gold-500";

function Step1({
  data,
  set,
}: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <FieldGroup label="Full Name *">
        <Input
          className={inputCls}
          value={data.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Enter your full name"
          required
        />
      </FieldGroup>
      <FieldGroup label="Father / Husband Name *">
        <Input
          className={inputCls}
          value={data.fatherName}
          onChange={(e) => set("fatherName", e.target.value)}
          placeholder="Enter father / husband name"
          required
        />
      </FieldGroup>
      <FieldGroup label="Date of Birth *">
        <Input
          className={inputCls}
          type="date"
          value={data.dob}
          onChange={(e) => set("dob", e.target.value)}
          required
        />
      </FieldGroup>
      <FieldGroup label="Gender *">
        <Select value={data.gender} onValueChange={(v) => set("gender", v)}>
          <SelectTrigger className={inputCls}>
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Mobile Number *">
        <Input
          className={inputCls}
          type="tel"
          value={data.mobile}
          onChange={(e) => set("mobile", e.target.value)}
          placeholder="10-digit mobile number"
          maxLength={10}
          required
        />
      </FieldGroup>
      <FieldGroup label="Email Address">
        <Input
          className={inputCls}
          type="email"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="Email (optional)"
        />
      </FieldGroup>
    </div>
  );
}

function Step2({
  data,
  set,
}: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <FieldGroup label="Aadhaar Number *">
        <Input
          className={inputCls}
          value={data.aadharNumber}
          onChange={(e) => set("aadharNumber", e.target.value)}
          placeholder="12-digit Aadhaar number"
          maxLength={12}
          required
        />
      </FieldGroup>
      <FieldGroup label="PAN Number *">
        <Input
          className={inputCls}
          value={data.panNumber}
          onChange={(e) => set("panNumber", e.target.value.toUpperCase())}
          placeholder="ABCDE1234F"
          maxLength={10}
          required
        />
      </FieldGroup>
      <FileUploadField
        label="Upload Aadhaar Card *"
        value={data.aadharFile}
        onChange={(v) => set("aadharFile", v)}
      />
      <FileUploadField
        label="Upload PAN Card *"
        value={data.panFile}
        onChange={(v) => set("panFile", v)}
      />
      <div className="sm:col-span-2">
        <FileUploadField
          label="Upload Live Photo *"
          value={data.livePhoto}
          onChange={(v) => set("livePhoto", v)}
          icon
          accept="image/*"
        />
      </div>
    </div>
  );
}

function Step3({
  data,
  set,
  setB,
}: {
  data: FormData;
  set: (k: keyof FormData, v: string) => void;
  setB: (k: keyof FormData, v: boolean) => void;
}) {
  return (
    <div className="grid gap-5">
      <FieldGroup label="Current Address *">
        <Textarea
          className="rounded-xl resize-none"
          value={data.currentAddress}
          onChange={(e) => set("currentAddress", e.target.value)}
          placeholder="Door no., Street, City, State, PIN"
          rows={3}
          required
        />
      </FieldGroup>
      <div className="flex items-center gap-2">
        <Checkbox
          id="same"
          checked={data.sameAsCurrent}
          onCheckedChange={(v) => {
            setB("sameAsCurrent", Boolean(v));
            if (v) set("permanentAddress", data.currentAddress);
          }}
        />
        <Label htmlFor="same" className="text-sm text-navy-700 cursor-pointer">
          Permanent address same as current
        </Label>
      </div>
      <FieldGroup label="Permanent Address *">
        <Textarea
          className="rounded-xl resize-none"
          value={data.permanentAddress}
          onChange={(e) => set("permanentAddress", e.target.value)}
          placeholder="Permanent address"
          rows={3}
          disabled={data.sameAsCurrent}
          required
        />
      </FieldGroup>
      <FileUploadField
        label="Upload Electricity Bill (Optional)"
        value={data.electricityBill}
        onChange={(v) => set("electricityBill", v)}
      />
    </div>
  );
}

function Step4({
  data,
  set,
}: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <div className="sm:col-span-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-3 block">
          Occupation *
        </Label>
        <div className="flex gap-4">
          {["Salaried", "Self-Employed/Business", "Other"].map((occ) => (
            <label
              key={occ}
              className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                data.occupation === occ
                  ? "border-gold-500 bg-gold-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="occupation"
                value={occ}
                checked={data.occupation === occ}
                onChange={(e) => set("occupation", e.target.value)}
                className="w-4 h-4 accent-gold-500"
              />
              <span className="text-sm font-medium text-navy-800">{occ}</span>
            </label>
          ))}
        </div>
      </div>
      <FieldGroup label="Company / Business Name *">
        <Input
          className={inputCls}
          value={data.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          placeholder="Enter company or business name"
          required
        />
      </FieldGroup>
      <FieldGroup label="Monthly Income (₹) *">
        <Input
          className={inputCls}
          type="number"
          value={data.monthlyIncome}
          onChange={(e) => set("monthlyIncome", e.target.value)}
          placeholder="Enter monthly income (INR)"
          required
        />
      </FieldGroup>
      <FieldGroup label="Work Experience (Years) *">
        <Input
          className={inputCls}
          type="number"
          value={data.workExperience}
          onChange={(e) => set("workExperience", e.target.value)}
          placeholder="Enter years of work experience"
          required
        />
      </FieldGroup>
    </div>
  );
}

function Step5({
  data,
  set,
  setN,
}: {
  data: FormData;
  set: (k: keyof FormData, v: string) => void;
  setN: (k: keyof FormData, v: number) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <FieldGroup label="Loan Type *">
        <Select value={data.loanType} onValueChange={(v) => set("loanType", v)}>
          <SelectTrigger className={inputCls}>
            <SelectValue placeholder="Select Loan Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Personal Loan">Personal Loan</SelectItem>
            <SelectItem value="Business Loan">Business Loan</SelectItem>
            <SelectItem value="Gold Loan">Gold Loan</SelectItem>
            <SelectItem value="Home Loan">Home Loan</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Loan Amount (₹) *">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
            ₹
          </span>
          <Input
            className={`${inputCls} pl-7`}
            type="number"
            value={data.loanAmount}
            onChange={(e) => set("loanAmount", e.target.value)}
            placeholder="Enter desired loan amount"
            required
          />
        </div>
      </FieldGroup>
      <div className="sm:col-span-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-3 block">
          Loan Duration:{" "}
          <span className="text-gold-600">{data.loanDuration} months</span>
        </Label>
        <Slider
          min={3}
          max={84}
          step={3}
          value={[data.loanDuration]}
          onValueChange={([v]) => setN("loanDuration", v)}
          className="my-4"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>3 months</span>
          <span>84 months</span>
        </div>
      </div>
      <div className="sm:col-span-2">
        <FieldGroup label="Purpose of Loan *">
          <Textarea
            className="rounded-xl resize-none"
            value={data.loanPurpose}
            onChange={(e) => set("loanPurpose", e.target.value)}
            placeholder="Describe the purpose of the loan (e.g., home construction, business expansion)"
            rows={3}
            required
          />
        </FieldGroup>
      </div>
    </div>
  );
}

function Step6({
  data,
  set,
}: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <FieldGroup label="Reference Name *">
        <Input
          className={inputCls}
          value={data.refName}
          onChange={(e) => set("refName", e.target.value)}
          placeholder="Enter reference full name"
          required
        />
      </FieldGroup>
      <FieldGroup label="Reference Mobile *">
        <Input
          className={inputCls}
          type="tel"
          value={data.refMobile}
          onChange={(e) => set("refMobile", e.target.value)}
          placeholder="10-digit mobile"
          maxLength={10}
          required
        />
      </FieldGroup>
      <div className="sm:col-span-2">
        <FieldGroup label="Relation *">
          <Select
            value={data.refRelation}
            onValueChange={(v) => set("refRelation", v)}
          >
            <SelectTrigger className={inputCls}>
              <SelectValue placeholder="Select Relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Friend">Friend</SelectItem>
              <SelectItem value="Relative">Relative</SelectItem>
              <SelectItem value="Colleague">Colleague</SelectItem>
              <SelectItem value="Neighbor">Neighbor</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  items,
}: { title: string; items: [string, string][] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
      <h3 className="font-display font-semibold text-navy-900 mb-4 text-sm uppercase tracking-wider">
        {title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(
          ([k, v]) =>
            v && (
              <div key={k}>
                <div className="text-xs text-gray-400 mb-0.5">{k}</div>
                <div className="text-sm font-medium text-navy-900">{v}</div>
              </div>
            ),
        )}
      </div>
    </div>
  );
}

function Step7({
  data,
  agreed,
  setAgreed,
}: { data: FormData; agreed: boolean; setAgreed: (v: boolean) => void }) {
  return (
    <div className="space-y-5">
      <ReviewSection
        title="Personal Details"
        items={[
          ["Full Name", data.fullName],
          ["Father/Husband Name", data.fatherName],
          ["Date of Birth", data.dob],
          ["Gender", data.gender],
          ["Mobile", data.mobile],
          ["Email", data.email],
        ]}
      />
      <ReviewSection
        title="KYC Details"
        items={[
          [
            "Aadhaar Number",
            data.aadharNumber ? `XXXX XXXX ${data.aadharNumber.slice(-4)}` : "",
          ],
          ["PAN Number", data.panNumber],
          ["Aadhaar Card", data.aadharFile ? "Uploaded ✓" : ""],
          ["PAN Card", data.panFile ? "Uploaded ✓" : ""],
          ["Live Photo", data.livePhoto ? "Uploaded ✓" : ""],
        ]}
      />
      <ReviewSection
        title="Address Details"
        items={[
          ["Current Address", data.currentAddress],
          ["Permanent Address", data.permanentAddress],
        ]}
      />
      <ReviewSection
        title="Employment Details"
        items={[
          ["Occupation", data.occupation],
          ["Company/Business", data.companyName],
          [
            "Monthly Income",
            data.monthlyIncome
              ? `₹${Number(data.monthlyIncome).toLocaleString()}`
              : "",
          ],
          [
            "Work Experience",
            data.workExperience ? `${data.workExperience} years` : "",
          ],
        ]}
      />
      <ReviewSection
        title="Loan Details"
        items={[
          ["Loan Type", data.loanType],
          [
            "Loan Amount",
            data.loanAmount
              ? `₹${Number(data.loanAmount).toLocaleString()}`
              : "",
          ],
          ["Duration", `${data.loanDuration} months`],
          ["Purpose", data.loanPurpose],
        ]}
      />
      <ReviewSection
        title="Reference Details"
        items={[
          ["Reference Name", data.refName],
          ["Reference Mobile", data.refMobile],
          ["Relation", data.refRelation],
        ]}
      />

      <div className="flex items-start gap-3 p-4 bg-navy-50 rounded-xl border border-navy-100">
        <Checkbox
          id="agree"
          checked={agreed}
          onCheckedChange={(v) => setAgreed(Boolean(v))}
          className="mt-0.5"
        />
        <Label
          htmlFor="agree"
          className="text-sm text-navy-700 cursor-pointer leading-relaxed"
        >
          I hereby declare that all the information provided above is true and
          accurate. I agree to the terms and conditions of JMD FinCap and
          authorize the processing of my loan application.
        </Label>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────────

export function LoanApplicationPage() {
  const { actor, isFetching } = useActor();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState("");

  const set = (k: keyof FormData, v: string) =>
    setData((p) => ({ ...p, [k]: v }));
  const setB = (k: keyof FormData, v: boolean) =>
    setData((p) => ({ ...p, [k]: v }));
  const setN = (k: keyof FormData, v: number) =>
    setData((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: async () => {
      const id = `JMD${Date.now().toString().slice(-8)}`;
      const appData = {
        ...data,
        id,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };

      // Save to localStorage
      const apps = JSON.parse(localStorage.getItem("loanApplications") || "[]");
      apps.push(appData);
      localStorage.setItem("loanApplications", JSON.stringify(apps));

      // Try backend
      if (actor && !isFetching) {
        try {
          await actor.submitLoanApplication(
            data.fullName,
            "",
            data.dob,
            "",
            data.fatherName,
            data.aadharNumber,
            data.panNumber,
            data.loanPurpose,
            data.loanType,
            String(data.loanDuration),
            data.loanAmount,
            data.monthlyIncome,
            data.occupation,
            data.aadharFile,
            data.panFile,
            data.livePhoto,
            "",
          );
        } catch (err) {
          console.error("Backend save failed:", err);
        }
      }
      return id;
    },
    onSuccess: (id) => {
      setAppId(id);
      setSubmitted(true);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        return !!(
          data.fullName &&
          data.fatherName &&
          data.dob &&
          data.gender &&
          data.mobile
        );
      case 2:
        return !!(
          data.aadharNumber &&
          data.panNumber &&
          data.aadharFile &&
          data.panFile &&
          data.livePhoto
        );
      case 3:
        return !!(data.currentAddress && data.permanentAddress);
      case 4:
        return !!(
          data.occupation &&
          data.companyName &&
          data.monthlyIncome &&
          data.workExperience
        );
      case 5:
        return !!(data.loanType && data.loanAmount && data.loanPurpose);
      case 6:
        return !!(data.refName && data.refMobile && data.refRelation);
      case 7:
        return agreed;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (step < 7) setStep((p) => p + 1);
    else mutation.mutate();
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-3">
            Application Submitted!
          </h1>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Your loan application has been successfully submitted. Our team will
            contact you within 24-48 hours.
          </p>
          <div className="bg-gold-50 rounded-xl p-5 border border-gold-200 mb-8">
            <div className="text-xs text-gray-500 mb-1">Application ID</div>
            <div className="font-display text-2xl font-bold text-gold-600">
              {appId}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="/dashboard"
              className="py-3 rounded-full bg-gold-500 text-navy-900 font-semibold hover:bg-gold-400 transition-colors"
            >
              View Application Status
            </a>
            <a
              href="/"
              className="py-3 rounded-full bg-navy-50 text-navy-700 font-medium hover:bg-navy-100 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img
              src={LOGO}
              alt="JMD FinCap"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-display font-bold text-navy-900 hidden sm:block">
              JMD FinCap
            </span>
          </a>
          <div className="text-sm text-gray-500">
            Step {step} of {STEPS.length}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <StepIndicator step={step} />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-6">
            <h2 className="font-display text-xl font-bold text-white">
              {STEPS[step - 1].title}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Step {step} of {STEPS.length}
            </p>
          </div>

          <div className="p-8">
            {step === 1 && <Step1 data={data} set={set} />}
            {step === 2 && <Step2 data={data} set={set} />}
            {step === 3 && <Step3 data={data} set={set} setB={setB} />}
            {step === 4 && <Step4 data={data} set={set} />}
            {step === 5 && <Step5 data={data} set={set} setN={setN} />}
            {step === 6 && <Step6 data={data} set={set} />}
            {step === 7 && (
              <Step7 data={data} agreed={agreed} setAgreed={setAgreed} />
            )}
          </div>

          {/* Navigation */}
          <div className="px-8 pb-8 flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((p) => Math.max(1, p - 1))}
              disabled={step === 1}
              data-ocid="loan_form.back.button"
              className="gap-2 rounded-full px-6"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={mutation.isPending || isFetching}
              data-ocid={
                step === 7 ? "loan_form.submit.button" : "loan_form.next.button"
              }
              className="gap-2 rounded-full px-8 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : step === 7 ? (
                <>
                  Submit Application <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
