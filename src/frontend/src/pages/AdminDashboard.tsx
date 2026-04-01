import { useEffect } from "react";
import { AdminWorkflowDashboard } from "./AdminWorkflowDashboard";
import { BMDashboard } from "./BMDashboard";
import { CRMDashboard } from "./CRMDashboard";
import { OperationsDashboard } from "./OperationsDashboard";

export function AdminDashboard() {
  const token = localStorage.getItem("adminToken");
  const role = localStorage.getItem("adminRole");

  useEffect(() => {
    if (!token || !role) {
      window.location.href = "/admin/login";
    }
  }, [token, role]);

  if (!token || !role) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  switch (role) {
    case "crm":
      return <CRMDashboard />;
    case "bm":
      return <BMDashboard />;
    case "operations":
    case "accounts":
      return <OperationsDashboard />;
    default:
      return <AdminWorkflowDashboard />;
  }
}
