import { requireRole } from "@/lib/dal";
import { listUsers } from "@/lib/queries/users";
import { Avatar, Badge, Card, PageHeaderBand } from "@/components/ui";
import { ROLE_LABELS, cn } from "@/lib/utils";
import { getModuleTheme } from "@/lib/theme";
import { UserForm } from "./user-form";
import { UserRowActions } from "./user-row-actions";

export default async function UsuariosPage() {
  await requireRole("coordenacao");
  const usersList = await listUsers();
  const theme = getModuleTheme("usuarios");

  return (
    <div>
      <PageHeaderBand
        module="usuarios"
        title="Usuários"
        description="Coordenação, facilitadores e articuladores com acesso ao sistema."
      />

      <Card className="mb-[18px] p-5">
        <p className={cn(theme.text, "m-0 mb-4 text-sm font-bold")}>Novo usuário</p>
        <UserForm />
      </Card>

      <Card>
        <div className={cn(theme.bg, "border-b border-[#F2F4F7] px-[18px] py-3.5")}>
          <p className={cn(theme.text, "m-0 text-sm font-bold")}>Todos os usuários</p>
          <p className={cn(theme.text, "mt-0.5 text-[11.5px]")}>{usersList.length} conta(s) cadastrada(s)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cn(theme.bg, "border-b", theme.border)}>
                {["Nome", "E-mail", "Papel", "Status", "Ações"].map((h) => (
                  <th
                    key={h}
                    className={cn(theme.text, "px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} className="border-b border-[#F2F4F7] last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} />
                      <span className="font-semibold text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#344054]">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge value={u.role} label={ROLE_LABELS[u.role]} />
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge value={u.ativo ? "ativo" : "inativo"} label={u.ativo ? "Ativo" : "Inativo"} />
                  </td>
                  <td className="px-5 py-3.5">
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
