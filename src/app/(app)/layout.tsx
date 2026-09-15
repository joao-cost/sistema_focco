import { verifySession } from "@/lib/dal";
import { Sidebar } from "./sidebar";
import { ROLE_LABELS } from "@/lib/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={session.user.role}
        userName={session.user.name}
        roleLabel={ROLE_LABELS[session.user.role]}
      />
      <main className="h-full min-w-0 flex-1 overflow-y-auto px-4 py-16 sm:px-9">{children}</main>
    </div>
  );
}
