import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  LogOut,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CustomerUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

export function CustomerDashboard() {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [profile, setProfile] = useState({ name: "", email: "", mobile: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("customerUser");
    if (!stored) {
      window.location.href = "/login";
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    setProfile({ name: u.name, email: u.email, mobile: u.mobile });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customerUser");
    toast.success("Logged out successfully.");
    window.location.href = "/login";
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (!user) return;
      const updated = { ...user, ...profile };
      localStorage.setItem("customerUser", JSON.stringify(updated));
      setUser(updated);
      // Update in customers list
      const users = JSON.parse(localStorage.getItem("jmd_customers") || "[]");
      const idx = users.findIndex((u: any) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = updated;
        localStorage.setItem("jmd_customers", JSON.stringify(users));
      }
      toast.success("Profile updated successfully!");
    }, 800);
  };

  // Get customer's loan applications from localStorage
  const applications = (() => {
    try {
      const apps = JSON.parse(localStorage.getItem("loanApplications") || "[]");
      return apps.filter((a: any) => a.email === user?.email);
    } catch {
      return [];
    }
  })();

  if (!user) return null;

  const latestApp = applications[applications.length - 1];
  const statusKey = (latestApp?.status ||
    "pending") as keyof typeof STATUS_CONFIG;
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="bg-navy-900 text-white py-8">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold">
                Welcome back, {user.name}
              </h1>
              <p className="text-white/60 text-sm mt-1">{user.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              data-ocid="dashboard.logout.button"
              className="border-white/30 text-white hover:bg-white/10 gap-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="status">
            <TabsList className="mb-6">
              <TabsTrigger value="status" data-ocid="dashboard.status.tab">
                Application Status
              </TabsTrigger>
              <TabsTrigger value="docs" data-ocid="dashboard.docs.tab">
                My Documents
              </TabsTrigger>
              <TabsTrigger value="profile" data-ocid="dashboard.profile.tab">
                Edit Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status">
              {latestApp ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display text-lg text-navy-900">
                        Latest Application
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${statusConfig.color}`}
                      >
                        <StatusIcon className="h-6 w-6" />
                        <div>
                          <div className="font-semibold">
                            {statusConfig.label}
                          </div>
                          <div className="text-xs opacity-75">
                            Application ID: #{latestApp.id || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        {[
                          ["Loan Type", latestApp.loanType],
                          [
                            "Amount",
                            latestApp.loanAmount
                              ? `₹${Number(latestApp.loanAmount).toLocaleString()}`
                              : "N/A",
                          ],
                          [
                            "Duration",
                            latestApp.tenure
                              ? `${latestApp.tenure} months`
                              : "N/A",
                          ],
                          [
                            "Applied On",
                            latestApp.submittedAt
                              ? new Date(
                                  latestApp.submittedAt,
                                ).toLocaleDateString("en-IN")
                              : "N/A",
                          ],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-500">{k}</span>
                            <span className="font-medium text-navy-900">
                              {v || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display text-lg text-navy-900">
                        All Applications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {applications.length === 0 ? (
                        <div
                          className="text-center py-8 text-gray-400"
                          data-ocid="dashboard.applications.empty_state"
                        >
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p>No applications yet</p>
                          <a
                            href="/apply"
                            className="text-gold-500 text-sm font-medium hover:underline"
                          >
                            Apply for a loan →
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {applications.map((app: any, i: number) => (
                            <div
                              key={app.id || String(i)}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                              data-ocid={`dashboard.applications.item.${i + 1}`}
                            >
                              <div>
                                <div className="font-medium text-sm text-navy-900">
                                  {app.loanType || "Loan"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ₹
                                  {Number(app.loanAmount || 0).toLocaleString()}
                                </div>
                              </div>
                              <Badge className="text-xs" variant="outline">
                                {app.status || "Pending"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div
                  className="text-center py-20"
                  data-ocid="dashboard.status.empty_state"
                >
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="font-display text-xl font-bold text-navy-900 mb-2">
                    No Loan Applications Yet
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Apply for a loan to get started.
                  </p>
                  <a
                    href="/apply"
                    className="px-6 py-3 rounded-full bg-gold-500 text-navy-900 font-semibold hover:bg-gold-400 transition-colors"
                  >
                    Apply for Loan
                  </a>
                </div>
              )}
            </TabsContent>

            <TabsContent value="docs">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg text-navy-900">
                    Uploaded Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestApp?.documents ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {Object.entries(latestApp.documents).map(
                        ([key, val]: [string, any], i) =>
                          val && (
                            <div
                              key={key}
                              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100"
                              data-ocid={`dashboard.docs.item.${i + 1}`}
                            >
                              <FileText className="h-8 w-8 text-gold-500" />
                              <div>
                                <div className="font-medium text-sm text-navy-900 capitalize">
                                  {key.replace(/_/g, " ")}
                                </div>
                                <Badge className="text-xs bg-green-100 text-green-700 border-0 mt-1">
                                  Uploaded
                                </Badge>
                              </div>
                            </div>
                          ),
                      )}
                    </div>
                  ) : (
                    <div
                      className="text-center py-8 text-gray-400"
                      data-ocid="dashboard.docs.empty_state"
                    >
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No documents uploaded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="max-w-lg">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-gold-500" /> Edit Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSaveProfile}
                    className="space-y-4"
                    data-ocid="dashboard.profile.modal"
                  >
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        data-ocid="dashboard.profile.name.input"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, name: e.target.value }))
                        }
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block">
                        Email
                      </Label>
                      <Input
                        type="email"
                        data-ocid="dashboard.profile.email.input"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, email: e.target.value }))
                        }
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-navy-800 mb-2 block">
                        Mobile
                      </Label>
                      <Input
                        type="tel"
                        data-ocid="dashboard.profile.mobile.input"
                        value={profile.mobile}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, mobile: e.target.value }))
                        }
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      data-ocid="dashboard.profile.save.button"
                      disabled={saving}
                      className="w-full rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold h-11"
                    >
                      {saving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
