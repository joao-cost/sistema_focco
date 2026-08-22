import { verifySession } from "@/lib/dal";
import { Nav } from "./nav";
import { logoutAction } from "./logout-action";
import { ROLE_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold">
              <span className="text-focco-green">FOCC</span>
              <span className="text-focco-blue">O</span>
            </span>
            <Nav role={session.user.role} />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="font-medium text-foreground">{session.user.name}</p>
              <p className="text-xs text-muted">{ROLE_LABELS[session.user.role]}</p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
