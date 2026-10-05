import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getRoleRedirectUrl } from "@/lib/permissions/rbac";

export default async function RootPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(getRoleRedirectUrl(session.role));
  } else {
    redirect("/login");
  }
}
