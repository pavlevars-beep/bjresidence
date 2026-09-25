import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Route group, not a plain layout — this must NOT apply to
 * /admin/info-point-print, which is a sibling outside (shell) and is
 * deliberately chrome-free for physical printing.
 */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  return <AdminShell>{children}</AdminShell>;
}
