import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requirePlatformAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "PLATFORM_ADMIN" && session.user.role !== "PLATFORM_OPERATOR")) {
    redirect("/admin-login");
  }
  return session;
}
