import { requireRole } from "@/lib/dal";
import { listUsers } from "@/lib/queries/users";
import { Badge, Card, CardHeader } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/utils";
import { UserForm } from "./user-form";
import { UserRowActions } from "./user-row-actions";

export default async function UsuariosPage() {
  await requireRole("coordenacao");
  const usersList = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Usuários</h1>
        <p className="text-sm text-muted">Contas de coordenação, facilitadores e articuladores.</p>
      </div>

      <Card>
        <CardHeader title="Novo usuário" />
        <div className="p-5">
          <UserForm />
        </div>
      </Card>

      <Card>
        <CardHeader title="Todos os usuários" description={`${usersList.length} conta(s) cadastrada(s)`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">E-mail</th>
                <th className="px-5 py-3 font-medium">Papel</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge value={u.role} label={ROLE_LABELS[u.role]} />
                  </td>
                  <td className="px-5 py-3">
                    <Badge value={u.ativo ? "ativo" : "inativo"} label={u.ativo ? "Ativo" : "Inativo"} />
                  </td>
                  <td className="px-5 py-3">
                    <UserRowActions userId={u.id} ativo={u.ativo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
