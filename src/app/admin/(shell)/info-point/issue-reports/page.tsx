import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { IssueReportsPanel } from "@/components/admin/info-point/IssueReportsPanel";

export default function IssueReportsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }
  return <IssueReportsPanel />;
}
