import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { QrCodesPanel } from "@/components/admin/info-point/QrCodesPanel";

export default function QrCodesPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }
  return <QrCodesPanel />;
}
