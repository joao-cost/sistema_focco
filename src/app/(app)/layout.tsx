import { verifySession } from "@/lib/dal";
import { Sidebar } from "./sidebar";
import { ROLE_LABELS } from "@/lib/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role={session.user.role}
        userName={session.user.name}
        roleLabel={ROLE_LABELS[session.user.role]}
      />
      <main className="min-w-0 flex-1 overflow-y-auto px-9 py-16">{children}</main>
    </div>
  );
}
