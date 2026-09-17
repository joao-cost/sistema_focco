import { verifySession } from "@/lib/dal";
import { listReservas } from "@/lib/queries/agenda";
import { listCelulasForUser } from "@/lib/queries/celulas";
import { PageHeaderBand } from "@/components/ui";
import { AgendaCalendar } from "./agenda-calendar";

export default async function AgendaPage() {
  const session = await verifySession();

  const [reservas, celulas] = await Promise.all([listReservas(session), listCelulasForUser(session)]);

  return (
    <div>
      <PageHeaderBand
        module="agenda"
        title="Agenda"
        description="Horário semanal das células e reserva da sala do FOCCO para preparação."
      />

      <AgendaCalendar
        reservas={reservas.map((r) => ({
          id: r.id,
          celulaId: r.celulaId,
          celulaNome: r.celula.nome,
          tipo: r.tipo,
          diaSemana: r.diaSemana,
          horaInicio: r.horaInicio,
          horaFim: r.horaFim,
          sala: r.sala,
          observacoes: r.observacoes,
        }))}
        celulas={celulas.map((c) => ({ id: c.id, nome: c.nome }))}
      />
    </div>
  );
}
