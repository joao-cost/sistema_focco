import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { Sidebar } from "./sidebar";
import { ROLE_LABELS } from "@/lib/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  const [user] = await db
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={session.user.role}
        userName={session.user.name}
        roleLabel={ROLE_LABELS[session.user.role]}
        avatarUrl={user?.avatarUrl}
      />
      <main className="h-full min-w-0 flex-1 overflow-y-auto px-4 py-16 sm:px-9">{children}</main>
    </div>
  );
}
