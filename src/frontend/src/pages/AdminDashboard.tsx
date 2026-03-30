import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  GitBranch,
  Loader2,
  LogOut,
  Menu,
  Phone,
  Plus,
  Search,
  Settings,
  Shield,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

const LOGO = "/assets/JMD_FINCAP_LOGO-removebg-preview-1.png";

type RoleId = "admin" | "bm" | "crm" | "accounts" | "operations";

type SidebarSection =
  | "dashboard"
  | "leads"
  | "customers"
  | "loans"
  | "documents"
  | "followups"
  | "emi"
  | "reports"
  | "users"
  | "branches"
  | "settings";

interface SidebarItem {
  id: SidebarSection;
  label: string;
  icon: React.ElementType;
  roles: RoleId[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    roles: ["admin", "bm", "crm", "accounts", "operations"],
  },
  {
    id: "leads",
    label: "Leads",
    icon: TrendingUp,
    roles: ["admin", "bm", "crm"],
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    roles: ["admin", "bm", "crm"],
  },
  {
    id: "loans",
    label: "Loan Applications",
    icon: FileText,
    roles: ["admin", "bm", "crm", "operations"],
  },
  {
    id: "documents",
    label: "Documents",
    icon: ClipboardList,
    roles: ["admin", "crm", "operations"],
  },
  {
    id: "followups",
    label: "Follow-ups",
    icon: Phone,
    roles: ["admin", "crm"],
  },
  {
    id: "emi",
    label: "EMI Management",
    icon: CreditCard,
    roles: ["admin", "accounts"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BookOpen,
    roles: ["admin", "bm", "accounts"],
  },
  { id: "users", label: "User Management", icon: UserCheck, roles: ["admin"] },
  {
    id: "branches",
    label: "Branch Management",
    icon: GitBranch,
    roles: ["admin", "bm"],
  },
  { id: "settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────────

const MOCK_LEADS = [
  {
    id: "LD001",
    name: "Rajesh Sharma",
    phone: "9876543210",
    city: "Khargone",
    loanType: "Personal",
    amount: "2,50,000",
    source: "Website",
    crm: "Priya S.",
    status: "New",
  },
  {
    id: "LD002",
    name: "Sunita Patel",
    phone: "9765432109",
    city: "Barwani",
    loanType: "Business",
    amount: "5,00,000",
    source: "Referral",
    crm: "Rahul K.",
    status: "Contacted",
  },
  {
    id: "LD003",
    name: "Mohan Verma",
    phone: "9654321098",
    city: "Indore",
    loanType: "Gold",
    amount: "1,50,000",
    source: "Walk-in",
    crm: "Priya S.",
    status: "Interested",
  },
  {
    id: "LD004",
    name: "Geeta Mishra",
    phone: "9543210987",
    city: "Sendhwa",
    loanType: "Home",
    amount: "12,00,000",
    source: "Campaign",
    crm: "Ankit R.",
    status: "Follow-up",
  },
  {
    id: "LD005",
    name: "Ajay Yadav",
    phone: "9432109876",
    city: "Khargone",
    loanType: "Personal",
    amount: "1,00,000",
    source: "Website",
    crm: "Rahul K.",
    status: "Converted",
  },
];

const MOCK_CUSTOMERS = [
  {
    id: "CU001",
    name: "Rajesh Sharma",
    phone: "9876543210",
    city: "Khargone",
    employment: "Salaried",
    income: "₹45,000",
    status: "Active",
  },
  {
    id: "CU002",
    name: "Sunita Patel",
    phone: "9765432109",
    city: "Barwani",
    employment: "Business",
    income: "₹75,000",
    status: "Active",
  },
  {
    id: "CU003",
    name: "Mohan Verma",
    phone: "9654321098",
    city: "Indore",
    employment: "Salaried",
    income: "₹32,000",
    status: "Pending",
  },
  {
    id: "CU004",
    name: "Geeta Mishra",
    phone: "9543210987",
    city: "Sendhwa",
    employment: "Self-Employed",
    income: "₹60,000",
    status: "Approved",
  },
];

const MOCK_FOLLOWUPS = [
  {
    customer: "Rajesh Sharma",
    phone: "9876543210",
    date: "2026-03-31",
    notes: "Interested in personal loan, needs more info",
    crm: "Priya S.",
  },
  {
    customer: "Sunita Patel",
    phone: "9765432109",
    date: "2026-04-02",
    notes: "Business loan docs pending",
    crm: "Rahul K.",
  },
  {
    customer: "Mohan Verma",
    phone: "9654321098",
    date: "2026-04-05",
    notes: "Gold loan valuation done",
    crm: "Ankit R.",
  },
];

const MOCK_EMI = [
  {
    loanId: "LN001",
    customer: "Rajesh Sharma",
    amount: "₹8,500",
    dueDate: "2026-04-01",
    status: "Pending",
  },
  {
    loanId: "LN002",
    customer: "Sunita Patel",
    amount: "₹12,300",
    dueDate: "2026-04-05",
    status: "Paid",
  },
  {
    loanId: "LN003",
    customer: "Mohan Verma",
    amount: "₹6,700",
    dueDate: "2026-04-10",
    status: "Pending",
  },
  {
    loanId: "LN004",
    customer: "Geeta Mishra",
    amount: "₹18,500",
    dueDate: "2026-04-15",
    status: "Overdue",
  },
];

const MOCK_DOCS = [
  {
    id: "D001",
    customer: "Rajesh Sharma",
    type: "Aadhaar",
    uploadedAt: "2026-03-15",
    status: "Verified",
    size: "1.2 MB",
  },
  {
    id: "D002",
    customer: "Rajesh Sharma",
    type: "PAN",
    uploadedAt: "2026-03-15",
    status: "Verified",
    size: "0.8 MB",
  },
  {
    id: "D003",
    customer: "Sunita Patel",
    type: "Bank Statement",
    uploadedAt: "2026-03-18",
    status: "Pending",
    size: "2.5 MB",
  },
  {
    id: "D004",
    customer: "Mohan Verma",
    type: "Salary Slip",
    uploadedAt: "2026-03-20",
    status: "Rejected",
    size: "1.1 MB",
  },
  {
    id: "D005",
    customer: "Geeta Mishra",
    type: "Photo",
    uploadedAt: "2026-03-22",
    status: "Verified",
    size: "0.5 MB",
  },
];

const MOCK_USERS = [
  {
    id: 1,
    name: "Arun Sharma",
    email: "admin@jmdfincap.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2026-03-29",
  },
  {
    id: 2,
    name: "Vikram Singh",
    email: "bm@jmdfincap.com",
    role: "Branch Manager",
    status: "Active",
    lastLogin: "2026-03-28",
  },
  {
    id: 3,
    name: "Priya Soni",
    email: "crm@jmdfincap.com",
    role: "CRM",
    status: "Active",
    lastLogin: "2026-03-29",
  },
  {
    id: 4,
    name: "Neha Gupta",
    email: "accounts@jmdfincap.com",
    role: "Accounts",
    status: "Active",
    lastLogin: "2026-03-27",
  },
  {
    id: 5,
    name: "Ravi Patel",
    email: "operations@jmdfincap.com",
    role: "Operations",
    status: "Active",
    lastLogin: "2026-03-29",
  },
];

const MOCK_BRANCHES = [
  {
    id: "BR001",
    name: "Khargone Main Branch",
    manager: "Vikram Singh",
    city: "Khargone",
    customers: 1250,
    loans: 340,
    status: "Active",
  },
  {
    id: "BR002",
    name: "Barwani Branch",
    manager: "Sanjay Kumar",
    city: "Barwani",
    customers: 680,
    loans: 180,
    status: "Active",
  },
  {
    id: "BR003",
    name: "Sendhwa Branch",
    manager: "Rajesh Jain",
    city: "Sendhwa",
    customers: 420,
    loans: 115,
    status: "Active",
  },
];

const CHART_DATA = {
  monthlyDisbursal: [
    { month: "Oct", amount: 42 },
    { month: "Nov", amount: 65 },
    { month: "Dec", amount: 58 },
    { month: "Jan", amount: 78 },
    { month: "Feb", amount: 90 },
    { month: "Mar", amount: 84 },
  ],
  leadConversion: [
    { name: "Converted", value: 35 },
    { name: "In Progress", value: 40 },
    { name: "Lost", value: 25 },
  ],
  branchPerformance: [
    { month: "Jan", khargone: 120, barwani: 80, sendhwa: 60 },
    { month: "Feb", khargone: 145, barwani: 95, sendhwa: 72 },
    { month: "Mar", khargone: 168, barwani: 110, sendhwa: 85 },
  ],
};

const PIE_COLORS = ["#c9a84c", "#1a2e5a", "#ef4444"];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  disbursed: "bg-blue-100 text-blue-700",
  Active: "bg-green-100 text-green-700",
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Interested: "bg-purple-100 text-purple-700",
  "Follow-up": "bg-orange-100 text-orange-700",
  Converted: "bg-green-100 text-green-700",
  Verified: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
  Paid: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={`text-xs border-0 ${STATUS_BADGE[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </Badge>
  );
}

// ─── Dashboard Section ─────────────────────────────────────────────────────────────

function DashboardSection({
  role: _role,
  loanApplications,
}: { role: RoleId; loanApplications: any[] }) {
  const allApps = [
    ...loanApplications,
    ...JSON.parse(localStorage.getItem("loanApplications") || "[]"),
  ];

  const approved = allApps.filter((a) => a.status === "approved").length;
  const rejected = allApps.filter((a) => a.status === "rejected").length;
  const pending = allApps.filter(
    (a) => !a.status || a.status === "pending",
  ).length;

  const stats = [
    {
      label: "Total Leads",
      value: "245",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      sub: "+12 today",
    },
    {
      label: "New Leads Today",
      value: "12",
      icon: Plus,
      color: "from-emerald-500 to-emerald-600",
      sub: "Across all branches",
    },
    {
      label: "Total Customers",
      value: "2,350",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      sub: "+28 this month",
    },
    {
      label: "Approved Loans",
      value: String(approved || 34),
      icon: CheckCircle2,
      color: "from-green-500 to-green-600",
      sub: "This month",
    },
    {
      label: "Rejected Loans",
      value: String(rejected || 8),
      icon: X,
      color: "from-red-500 to-red-600",
      sub: "This month",
    },
    {
      label: "Disbursed Loans",
      value: "18",
      icon: Wallet,
      color: "from-teal-500 to-teal-600",
      sub: "₹1.8Cr disbursed",
    },
    {
      label: "Pending Applications",
      value: String(pending || 24),
      icon: Loader2,
      color: "from-yellow-500 to-yellow-600",
      sub: "Requires action",
    },
    {
      label: "Total Loan Amount",
      value: "₹48.5Cr",
      icon: BarChart3,
      color: "from-gold-500 to-gold-600",
      sub: "FY 2025-26",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-5 text-white`}
            data-ocid={`dashboard.${stat.label.toLowerCase().replace(/ /g, "_")}.card`}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-6 w-6 opacity-80" />
              <span className="text-white/60 text-xs">{stat.sub}</span>
            </div>
            <div className="font-display text-2xl font-bold">{stat.value}</div>
            <div className="text-white/75 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base text-navy-900">
              Monthly Loan Disbursement (₹Cr)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={CHART_DATA.monthlyDisbursal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`₹${v}L`, "Amount"]} />
                <Bar dataKey="amount" fill="#c9a84c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base text-navy-900">
              Lead Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={CHART_DATA.leadConversion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {CHART_DATA.leadConversion.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base text-navy-900">
            Branch Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={CHART_DATA.branchPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="khargone"
                stroke="#c9a84c"
                strokeWidth={2}
                name="Khargone"
              />
              <Line
                type="monotone"
                dataKey="barwani"
                stroke="#1a2e5a"
                strokeWidth={2}
                name="Barwani"
              />
              <Line
                type="monotone"
                dataKey="sendhwa"
                stroke="#22c55e"
                strokeWidth={2}
                name="Sendhwa"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base text-navy-900">
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allApps.length === 0 ? (
              <div
                className="text-center py-8 text-gray-400"
                data-ocid="dashboard.recent_apps.empty_state"
              >
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allApps
                  .slice(-5)
                  .reverse()
                  .map((app: any, i: number) => (
                    <div
                      key={app.id || String(i)}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      data-ocid={`dashboard.recent_apps.item.${i + 1}`}
                    >
                      <div>
                        <div className="font-medium text-sm text-navy-900">
                          {app.fullName || app.firstName || "Applicant"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {app.loanType || "Loan"} &bull; ₹
                          {Number(app.loanAmount || 0).toLocaleString()}
                        </div>
                      </div>
                      <StatusBadge status={app.status || "pending"} />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base text-navy-900">
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  task: "Verify KYC documents for 5 customers",
                  priority: "High",
                },
                { task: "Follow up with 12 pending leads", priority: "Medium" },
                { task: "Process 3 loan disbursals", priority: "High" },
                { task: "Generate monthly report", priority: "Low" },
              ].map((t, i) => (
                <div
                  key={t.task}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  data-ocid={`dashboard.tasks.item.${i + 1}`}
                >
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      t.priority === "High"
                        ? "bg-red-500"
                        : t.priority === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1 text-sm text-navy-800">{t.task}</div>
                  <Badge
                    className={`text-xs border-0 ${
                      t.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : t.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {t.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Loan Applications Section ─────────────────────────────────────────────────────────

function LoanApplicationsSection({
  role,
  applications,
}: { role: RoleId; applications: any[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [localApps, setLocalApps] = useState(() => {
    return [
      ...applications,
      ...JSON.parse(localStorage.getItem("loanApplications") || "[]"),
    ];
  });

  const updateStatus = (idx: number, status: string) => {
    const updated = [...localApps];
    updated[idx] = { ...updated[idx], status };
    setLocalApps(updated);
    // Persist to localStorage
    const allSaved = JSON.parse(
      localStorage.getItem("loanApplications") || "[]",
    );
    const appId = updated[idx].id;
    const savedIdx = allSaved.findIndex((a: any) => a.id === appId);
    if (savedIdx >= 0) {
      allSaved[savedIdx].status = status;
      localStorage.setItem("loanApplications", JSON.stringify(allSaved));
    }
    toast.success(`Application ${status}`);
  };

  const filtered = localApps.filter((a) => {
    const matchSearch = (a.fullName || a.firstName || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || (a.status || "pending") === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="loans.search.input"
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-40 rounded-xl"
            data-ocid="loans.status.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="loans.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  {(role === "admin" || role === "bm") && (
                    <TableHead>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-400"
                      data-ocid="loans.table.empty_state"
                    >
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((app, i) => (
                    <TableRow
                      key={app.id || String(i)}
                      data-ocid={`loans.table.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {app.id || `LN${String(i + 1).padStart(3, "0")}`}
                      </TableCell>
                      <TableCell className="font-medium">
                        {app.fullName || app.firstName || "N/A"}
                      </TableCell>
                      <TableCell>{app.loanType || "N/A"}</TableCell>
                      <TableCell>
                        ₹{Number(app.loanAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {app.loanDuration || app.tenure || "N/A"} mo
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status || "pending"} />
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {app.submittedAt
                          ? new Date(app.submittedAt).toLocaleDateString(
                              "en-IN",
                            )
                          : "N/A"}
                      </TableCell>
                      {(role === "admin" || role === "bm") && (
                        <TableCell>
                          <div className="flex gap-2">
                            {app.status !== "approved" && (
                              <Button
                                size="sm"
                                onClick={() => updateStatus(i, "approved")}
                                data-ocid={`loans.approve.button.${i + 1}`}
                                className="h-7 rounded-full text-xs bg-green-500 hover:bg-green-600 text-white"
                              >
                                Approve
                              </Button>
                            )}
                            {app.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateStatus(i, "rejected")}
                                data-ocid={`loans.reject.button.${i + 1}`}
                                className="h-7 rounded-full text-xs"
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Leads Section ──────────────────────────────────────────────────────────────────────

function LeadsSection() {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [showAdd, setShowAdd] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    city: "",
    loanType: "",
    amount: "",
  });

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search),
  );

  const addLead = () => {
    if (!newLead.name || !newLead.phone) {
      toast.error("Name and phone required");
      return;
    }
    setLeads((p) => [
      ...p,
      {
        id: `LD${String(p.length + 1).padStart(3, "0")}`,
        ...newLead,
        source: "Manual",
        crm: "Unassigned",
        status: "New",
      },
    ]);
    setNewLead({ name: "", phone: "", city: "", loanType: "", amount: "" });
    setShowAdd(false);
    toast.success("Lead added successfully!");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="leads.search.input"
            className="pl-9 rounded-xl"
          />
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button
              data-ocid="leads.add.button"
              className="bg-gold-500 hover:bg-gold-400 text-navy-900 gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" /> Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="leads.add.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-wide mb-2 block">
                    Name *
                  </Label>
                  <Input
                    data-ocid="leads.name.input"
                    value={newLead.name}
                    onChange={(e) =>
                      setNewLead((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide mb-2 block">
                    Phone *
                  </Label>
                  <Input
                    data-ocid="leads.phone.input"
                    value={newLead.phone}
                    onChange={(e) =>
                      setNewLead((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="10-digit mobile"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide mb-2 block">
                    City
                  </Label>
                  <Input
                    value={newLead.city}
                    onChange={(e) =>
                      setNewLead((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide mb-2 block">
                    Loan Type
                  </Label>
                  <Select
                    value={newLead.loanType}
                    onValueChange={(v) =>
                      setNewLead((p) => ({ ...p, loanType: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Personal", "Business", "Gold", "Home"].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide mb-2 block">
                  Loan Amount
                </Label>
                <Input
                  value={newLead.amount}
                  onChange={(e) =>
                    setNewLead((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder="e.g., 2,50,000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAdd(false)}
                data-ocid="leads.cancel.button"
              >
                Cancel
              </Button>
              <Button
                onClick={addLead}
                data-ocid="leads.confirm.button"
                className="bg-gold-500 text-navy-900"
              >
                Add Lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="leads.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>CRM</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead, i) => (
                  <TableRow
                    key={lead.id}
                    data-ocid={`leads.table.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs">
                      {lead.id}
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>{lead.city}</TableCell>
                    <TableCell>{lead.loanType}</TableCell>
                    <TableCell>₹{lead.amount}</TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>{lead.crm}</TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Customers Section ─────────────────────────────────────────────────────────────────

function CustomersSection() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="customers.search.input"
            className="pl-9 rounded-xl"
          />
        </div>
        <Button
          data-ocid="customers.add.button"
          className="bg-gold-500 hover:bg-gold-400 text-navy-900 gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="customers.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c, i) => (
                  <TableRow
                    key={c.id}
                    data-ocid={`customers.table.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{c.city}</TableCell>
                    <TableCell>{c.employment}</TableCell>
                    <TableCell>{c.income}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Documents Section ──────────────────────────────────────────────────────────────────

function DocumentsSection({ role }: { role: RoleId }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState(MOCK_DOCS);

  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-wrap">
        {(role === "admin" || role === "crm") && (
          <Button
            onClick={() => fileRef.current?.click()}
            data-ocid="documents.upload.button"
            className="bg-gold-500 hover:bg-gold-400 text-navy-900 gap-2 rounded-xl"
          >
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={() => toast.success("Document uploaded!")}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="documents.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Doc ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc, i) => (
                  <TableRow
                    key={doc.id}
                    data-ocid={`documents.table.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs">
                      {doc.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {doc.customer}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs bg-blue-100 text-blue-700 border-0">
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {doc.uploadedAt}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {doc.size}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toast.success("Downloading...")}
                          data-ocid={`documents.download.button.${i + 1}`}
                          className="h-7 gap-1 text-xs"
                        >
                          <Download className="h-3 w-3" /> Download
                        </Button>
                        {(role === "admin" || role === "operations") &&
                          doc.status === "Pending" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const d = [...docs];
                                d[i] = { ...d[i], status: "Verified" };
                                setDocs(d);
                                toast.success("Verified!");
                              }}
                              className="h-7 text-xs bg-green-500 hover:bg-green-600 text-white rounded-full"
                            >
                              Verify
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Follow-ups Section ───────────────────────────────────────────────────────────────

function FollowupsSection() {
  const [followups, setFollowups] = useState(MOCK_FOLLOWUPS);
  const [showAdd, setShowAdd] = useState(false);
  const [newFU, setNewFU] = useState({
    customer: "",
    phone: "",
    date: "",
    notes: "",
    crm: "",
  });

  const add = () => {
    if (!newFU.customer || !newFU.phone) {
      toast.error("Required fields missing");
      return;
    }
    setFollowups((p) => [...p, newFU]);
    setNewFU({ customer: "", phone: "", date: "", notes: "", crm: "" });
    setShowAdd(false);
    toast.success("Follow-up added!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button
              data-ocid="followups.add.button"
              className="bg-gold-500 hover:bg-gold-400 text-navy-900 gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" /> Add Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="followups.add.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">Add Follow-up</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase mb-2 block">
                    Customer *
                  </Label>
                  <Input
                    data-ocid="followups.customer.input"
                    value={newFU.customer}
                    onChange={(e) =>
                      setNewFU((p) => ({ ...p, customer: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase mb-2 block">
                    Phone *
                  </Label>
                  <Input
                    data-ocid="followups.phone.input"
                    value={newFU.phone}
                    onChange={(e) =>
                      setNewFU((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase mb-2 block">Date</Label>
                  <Input
                    type="date"
                    value={newFU.date}
                    onChange={(e) =>
                      setNewFU((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase mb-2 block">
                    Assigned CRM
                  </Label>
                  <Input
                    value={newFU.crm}
                    onChange={(e) =>
                      setNewFU((p) => ({ ...p, crm: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase mb-2 block">Notes</Label>
                <Textarea
                  value={newFU.notes}
                  onChange={(e) =>
                    setNewFU((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAdd(false)}
                data-ocid="followups.cancel.button"
              >
                Cancel
              </Button>
              <Button
                onClick={add}
                data-ocid="followups.confirm.button"
                className="bg-gold-500 text-navy-900"
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table data-ocid="followups.table">
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Follow-up Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Assigned CRM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followups.map((f, i) => (
                <TableRow
                  key={f.customer + f.date}
                  data-ocid={`followups.table.row.${i + 1}`}
                >
                  <TableCell className="font-medium">{f.customer}</TableCell>
                  <TableCell>{f.phone}</TableCell>
                  <TableCell>{f.date}</TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                    {f.notes}
                  </TableCell>
                  <TableCell>{f.crm}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── EMI Section ─────────────────────────────────────────────────────────────────────

function EMISection() {
  const [emis, setEmis] = useState(MOCK_EMI);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total EMIs Due",
            value: emis.filter(
              (e) => e.status === "Pending" || e.status === "Overdue",
            ).length,
            color: "bg-yellow-50 text-yellow-700",
          },
          {
            label: "Collected This Month",
            value: emis.filter((e) => e.status === "Paid").length,
            color: "bg-green-50 text-green-700",
          },
          {
            label: "Overdue",
            value: emis.filter((e) => e.status === "Overdue").length,
            color: "bg-red-50 text-red-700",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl p-5 ${s.color} border border-current/10`}
          >
            <div className="text-2xl font-bold font-display">{s.value}</div>
            <div className="text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <Card>
        <CardContent className="p-0">
          <Table data-ocid="emi.table">
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>EMI Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emis.map((e, i) => (
                <TableRow
                  key={e.loanId || String(i)}
                  data-ocid={`emi.table.row.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs">
                    {e.loanId}
                  </TableCell>
                  <TableCell className="font-medium">{e.customer}</TableCell>
                  <TableCell>{e.amount}</TableCell>
                  <TableCell>{e.dueDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                  <TableCell>
                    {e.status !== "Paid" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const d = [...emis];
                          d[i] = { ...d[i], status: "Paid" };
                          setEmis(d);
                          toast.success("EMI marked as paid!");
                        }}
                        className="h-7 text-xs bg-green-500 hover:bg-green-600 text-white rounded-full"
                        data-ocid={`emi.mark_paid.button.${i + 1}`}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Reports Section ─────────────────────────────────────────────────────────────────────

function ReportsSection() {
  const reports = [
    {
      name: "Daily Loan Report",
      desc: "All loan applications for today",
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      name: "Monthly Loan Report",
      desc: "Month-wise loan disbursements and collections",
      icon: BarChart3,
      color: "bg-purple-50 text-purple-600",
    },
    {
      name: "Lead Conversion Report",
      desc: "Lead source analysis and conversion rates",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      name: "Branch Performance Report",
      desc: "Branch-wise metrics and target achievement",
      icon: Building2,
      color: "bg-orange-50 text-orange-600",
    },
    {
      name: "Revenue Report",
      desc: "Commission, fee income, and revenue summary",
      icon: Wallet,
      color: "bg-gold-50 text-gold-600",
    },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((r) => (
        <Card key={r.name} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}
            >
              <r.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-navy-900 mb-1">
              {r.name}
            </h3>
            <p className="text-gray-500 text-xs mb-4">{r.desc}</p>
            <Button
              onClick={() =>
                toast.success(`${r.name} generated!`, {
                  description: "CSV file ready for download",
                })
              }
              data-ocid={`reports.${r.name.toLowerCase().replace(/ /g, "_")}.button`}
              variant="outline"
              className="w-full gap-2 rounded-xl text-sm"
            >
              <Download className="h-4 w-4" /> Generate Report
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── User Management Section ─────────────────────────────────────────────────────────────

function UserManagementSection() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button
              data-ocid="users.add.button"
              className="bg-gold-500 hover:bg-gold-400 text-navy-900 gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="users.add.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">Add New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div>
                <Label className="text-xs uppercase mb-2 block">
                  Full Name
                </Label>
                <Input data-ocid="users.name.input" placeholder="Full name" />
              </div>
              <div>
                <Label className="text-xs uppercase mb-2 block">Email</Label>
                <Input
                  type="email"
                  data-ocid="users.email.input"
                  placeholder="email@jmdfincap.com"
                />
              </div>
              <div>
                <Label className="text-xs uppercase mb-2 block">Role</Label>
                <Select>
                  <SelectTrigger data-ocid="users.role.select">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Admin",
                      "Branch Manager",
                      "CRM",
                      "Accounts",
                      "Operations",
                    ].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase mb-2 block">
                  Temporary Password
                </Label>
                <Input type="password" placeholder="Min 8 chars" />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAdd(false)}
                data-ocid="users.cancel.button"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowAdd(false);
                  toast.success("User added!");
                }}
                data-ocid="users.confirm.button"
                className="bg-gold-500 text-navy-900"
              >
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table data-ocid="users.table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((u, i) => (
                <TableRow key={u.id} data-ocid={`users.table.row.${i + 1}`}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge className="text-xs bg-navy-100 text-navy-700 border-0">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {u.lastLogin}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.success("Password reset link sent!")}
                      data-ocid={`users.reset_password.button.${i + 1}`}
                      className="h-7 text-xs"
                    >
                      Reset Password
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Branch Management Section ────────────────────────────────────────────────────────────

function BranchManagementSection() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {MOCK_BRANCHES.map((b, i) => (
          <Card key={b.id} data-ocid={`branches.card.${i + 1}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-navy-50 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-navy-600" />
                </div>
                <div>
                  <div className="font-display font-semibold text-navy-900 text-sm">
                    {b.name}
                  </div>
                  <div className="text-xs text-gray-500">{b.city}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Manager</span>
                  <span className="font-medium">{b.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customers</span>
                  <span className="font-medium">
                    {b.customers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Active Loans</span>
                  <span className="font-medium">{b.loans}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <StatusBadge status={b.status} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Section ────────────────────────────────────────────────────────────────────

function SettingsSection() {
  return (
    <Tabs defaultValue="products">
      <TabsList className="mb-6">
        <TabsTrigger value="products" data-ocid="settings.products.tab">
          Loan Products
        </TabsTrigger>
        <TabsTrigger value="rates" data-ocid="settings.rates.tab">
          Interest Rates
        </TabsTrigger>
        <TabsTrigger value="fees" data-ocid="settings.fees.tab">
          Processing Fees
        </TabsTrigger>
        <TabsTrigger value="system" data-ocid="settings.system.tab">
          System
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-navy-900 mb-4">
              Active Loan Products
            </h3>
            <div className="space-y-4">
              {[
                {
                  type: "Personal Loan",
                  minAmt: "50,000",
                  maxAmt: "50,00,000",
                  maxTenure: "60",
                  active: true,
                },
                {
                  type: "Business Loan",
                  minAmt: "1,00,000",
                  maxAmt: "2,00,00,000",
                  maxTenure: "84",
                  active: true,
                },
                {
                  type: "Gold Loan",
                  minAmt: "10,000",
                  maxAmt: "50,00,000",
                  maxTenure: "24",
                  active: true,
                },
                {
                  type: "Home Loan",
                  minAmt: "5,00,000",
                  maxAmt: "5,00,00,000",
                  maxTenure: "240",
                  active: true,
                },
              ].map((p) => (
                <div
                  key={p.type}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div>
                    <div className="font-semibold text-navy-900">{p.type}</div>
                    <div className="text-xs text-gray-500">
                      ₹{p.minAmt} – ₹{p.maxAmt} &bull; Max {p.maxTenure} months
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-0">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rates">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-navy-900 mb-4">
              Interest Rate Configuration
            </h3>
            <div className="space-y-4">
              {[
                { type: "Personal Loan", rate: "10.5% - 18%" },
                { type: "Business Loan", rate: "11% - 20%" },
                { type: "Gold Loan", rate: "7% - 12%" },
                { type: "Home Loan", rate: "8.5% - 12%" },
              ].map((r) => (
                <div
                  key={r.type}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
                >
                  <span className="font-medium">{r.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-navy-700 font-semibold">
                      {r.rate} p.a.
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs rounded-full"
                      onClick={() =>
                        toast.info(
                          "Rate configuration requires backend integration",
                        )
                      }
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fees">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-navy-900 mb-4">
              Processing Fees
            </h3>
            <div className="space-y-3">
              {[
                { type: "Processing Fee", value: "1% - 2% of loan amount" },
                {
                  type: "Prepayment Charges",
                  value: "2% of outstanding amount",
                },
                { type: "Late Payment Fee", value: "₹500 per month" },
                { type: "Document Charges", value: "₹1,000 - ₹2,000" },
              ].map((f) => (
                <div
                  key={f.type}
                  className="flex justify-between p-3 rounded-lg bg-gray-50 text-sm"
                >
                  <span className="text-gray-600">{f.type}</span>
                  <span className="font-medium text-navy-900">{f.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="system">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-navy-900 mb-4">
              System Configuration
            </h3>
            <div className="space-y-5">
              <div>
                <Label className="text-xs uppercase tracking-wide mb-2 block">
                  Company Name
                </Label>
                <Input
                  defaultValue="JMD FinCap Pvt. Ltd."
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide mb-2 block">
                  Contact Email
                </Label>
                <Input
                  defaultValue="contact.jmdfincap@gmail.com"
                  type="email"
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide mb-2 block">
                  Contact Phone
                </Label>
                <Input
                  defaultValue="+91 88899 56204"
                  type="tel"
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={() => toast.success("Settings saved!")}
                data-ocid="settings.save.button"
                className="rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900"
              >
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// ─── Section Title Map ────────────────────────────────────────────────────────────────

const SECTION_TITLES: Record<SidebarSection, string> = {
  dashboard: "Dashboard",
  leads: "Leads Management",
  customers: "Customer Database",
  loans: "Loan Applications",
  documents: "Document Management",
  followups: "Follow-ups",
  emi: "EMI Management",
  reports: "Reports & Analytics",
  users: "User Management",
  branches: "Branch Management",
  settings: "System Settings",
};

// ─── Main AdminDashboard Component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { actor, isFetching } = useActor();
  const [activeSection, setActiveSection] =
    useState<SidebarSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const role = (localStorage.getItem("adminRole") || "admin") as RoleId;
  const adminEmail =
    localStorage.getItem("adminEmail") || "admin@jmdfincap.com";
  const adminToken = localStorage.getItem("adminToken");

  // Redirect if not authenticated
  useEffect(() => {
    if (!adminToken) {
      window.location.href = "/admin/login";
    }
  }, [adminToken]);

  const { data: backendApps = [] } = useQuery({
    queryKey: ["loanApplications", adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      try {
        const apps = await actor.getAllLoanApplications(adminToken);
        return Array.isArray(apps) ? apps : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!adminToken,
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminEmail");
    toast.success("Logged out successfully.");
    window.location.href = "/admin/login";
  };

  const visibleItems = SIDEBAR_ITEMS.filter((item) =>
    item.roles.includes(role),
  );
  const roleLabel: Record<RoleId, string> = {
    admin: "Admin",
    bm: "Branch Manager",
    crm: "CRM Executive",
    accounts: "Accounts",
    operations: "Operations",
  };
  const roleBadgeColor: Record<RoleId, string> = {
    admin: "bg-yellow-500/20 text-yellow-300",
    bm: "bg-blue-500/20 text-blue-300",
    crm: "bg-green-500/20 text-green-300",
    accounts: "bg-purple-500/20 text-purple-300",
    operations: "bg-orange-500/20 text-orange-300",
  };

  if (!adminToken) return null;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <img
            src={LOGO}
            alt="JMD FinCap"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <div className="font-display font-bold text-white text-sm">
              JMD FinCap
            </div>
            <div className="text-white/40 text-xs">CRM Dashboard</div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-white/40 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-5 py-3 border-b border-white/10">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${roleBadgeColor[role]}`}
          >
            <Shield className="h-3 w-3" />
            {roleLabel[role]}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              data-ocid={`sidebar.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all mb-1 ${
                activeSection === item.id
                  ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="sidebar.logout.button"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 shadow-xs px-4 sm:px-6 h-16 flex items-center gap-4 sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-navy-700 hover:bg-gray-100 rounded-lg"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="header.search.input"
              className="pl-9 h-9 rounded-xl border-gray-200 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              className="relative p-2 text-gray-400 hover:text-navy-700 hover:bg-gray-100 rounded-lg"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="h-8 w-8 rounded-full bg-gold-500 flex items-center justify-center">
                <span className="text-navy-900 font-bold text-xs">
                  {adminEmail.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-navy-900">
                  {roleLabel[role]}
                </div>
                <div className="text-xs text-gray-400">{adminEmail}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="font-display text-xl font-bold text-navy-900">
              {SECTION_TITLES[activeSection]}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              JMD FinCap &bull; {roleLabel[role]} Panel
            </p>
          </div>

          {activeSection === "dashboard" && (
            <DashboardSection role={role} loanApplications={backendApps} />
          )}
          {activeSection === "leads" && <LeadsSection />}
          {activeSection === "customers" && <CustomersSection />}
          {activeSection === "loans" && (
            <LoanApplicationsSection role={role} applications={backendApps} />
          )}
          {activeSection === "documents" && <DocumentsSection role={role} />}
          {activeSection === "followups" && <FollowupsSection />}
          {activeSection === "emi" && <EMISection />}
          {activeSection === "reports" && <ReportsSection />}
          {activeSection === "users" && <UserManagementSection />}
          {activeSection === "branches" && <BranchManagementSection />}
          {activeSection === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}
