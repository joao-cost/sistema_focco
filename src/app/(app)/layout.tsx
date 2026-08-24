import Image from "next/image";
import { verifySession } from "@/lib/dal";
import { Nav } from "./nav";
import { logoutAction } from "./logout-action";
import { ROLE_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-6">
            <Image
              src="/brand/logo-focco.png"
              alt="FOCCO"
              width={200}
              height={70}
              priority
              className="h-8 w-auto"
            />
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
        <div className="focco-accent-bar h-[3px]" />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
