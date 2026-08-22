/**
 * Seed de exemplo para o sistema_focco.
 * Usa nomes reais de células/articuladores da planilha de horários do FOCCO
 * (compartilhada em ago/2026) para os dados de demonstração ficarem próximos
 * da realidade do programa. Celulandos e encontros são fictícios.
 *
 * Rodar com: npm run db:seed
 */
import "dotenv/config";
import { db } from "./index";
import { avisos, celulandos, celulas, encontros, presencas, users } from "./schema";
import { hashPassword } from "../lib/password";

const DEFAULT_PASSWORD = "focco123"; // trocar após o primeiro login

async function main() {
  console.log("Seed: limpando dados existentes...");
  await db.delete(presencas);
  await db.delete(encontros);
  await db.delete(avisos);
  await db.delete(celulandos);
  await db.delete(celulas);
  await db.delete(users);

  console.log("Seed: criando usuários...");
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const [coordenacao] = await db
    .insert(users)
    .values({
      name: "Coordenação FOCCO",
      email: "coordenacao@focco.unemat.br",
      passwordHash,
      role: "coordenacao",
    })
    .returning();

  const [joaoVitor] = await db
    .insert(users)
    .values({
      name: "João Vitor Costa",
      email: "joaovitor00220@gmail.com",
      passwordHash,
      role: "facilitador",
    })
    .returning();

  const articuladoresData = [
    { name: "Lara", email: "lara@focco.unemat.br" },
    { name: "Deisy", email: "deisy@focco.unemat.br" },
    { name: "Guilherme Baquer", email: "guilherme.baquer@focco.unemat.br" },
    { name: "Davi Franzon", email: "davi.franzon@focco.unemat.br" },
    { name: "Evillyn Ludimila", email: "evillyn.ludimila@focco.unemat.br" },
    { name: "Maxsuel", email: "maxsuel@focco.unemat.br" },
    { name: "Lucas Sividanes", email: "lucas.sividanes@focco.unemat.br" },
    { name: "Girlene", email: "girlene@focco.unemat.br" },
  ];

  const articuladores = await db
    .insert(users)
    .values(
      articuladoresData.map((a) => ({
        name: a.name,
        email: a.email,
        passwordHash,
        role: "articulador" as const,
      }))
    )
    .returning();

  const byName = (name: string) => articuladores.find((a) => a.name === name)!;

  console.log("Seed: criando células (baseadas na planilha de horários)...");
  const celulasData = [
    {
      nome: "FOCCO Projetos e Inovações",
      articulador: "Lara",
      diaSemana: "quarta" as const,
      turno: "tarde" as const,
      horario: "13h30 às 17h30",
      local: "Sala C3",
    },
    {
      nome: "Química Super Fácil",
      articulador: "Deisy",
      diaSemana: "terca" as const,
      turno: "tarde" as const,
      horario: "13h às 17h",
      local: "A definir",
    },
    {
      nome: "MATENG",
      articulador: "Guilherme Baquer",
      diaSemana: "quarta" as const,
      turno: "tarde" as const,
      horario: "13h às 17h",
      local: "A definir",
    },
    {
      nome: "Projeto Hidroelétrico",
      articulador: "Davi Franzon",
      diaSemana: "quinta" as const,
      turno: "tarde" as const,
      horario: "17h às 19h",
      local: "Sala N6",
      observacoes: "Também ocorre às sextas-feiras, no mesmo horário.",
    },
    {
      nome: "A Tabuada da Salvação",
      articulador: "Evillyn Ludimila",
      diaSemana: "sabado" as const,
      turno: "tarde" as const,
      horario: "14h às 18h",
      local: "Sala I1",
    },
    {
      nome: "MathFOCCO",
      articulador: "Maxsuel",
      diaSemana: "sabado" as const,
      turno: "tarde" as const,
      horario: "14h às 18h",
      local: "A definir",
    },
    {
      nome: "Suporte em Geografia",
      articulador: "Lucas Sividanes",
      diaSemana: "sabado" as const,
      turno: "tarde" as const,
      horario: "14h às 18h",
      local: "Sala C1",
    },
    {
      nome: "FOCCO em Trabalhos Acadêmicos",
      articulador: "Girlene",
      diaSemana: "sabado" as const,
      turno: "tarde" as const,
      horario: "14h às 18h",
      local: "Sala H1",
    },
  ];

  const nomesFicticios = [
    "Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Hugo",
    "Isabela", "João", "Karina", "Lucas", "Mariana", "Nicolas", "Otávio",
    "Paula", "Rafael", "Sofia", "Tiago", "Vitória",
  ];
  let nomeIdx = 0;
  const proximoNomeFicticio = () => nomesFicticios[nomeIdx++ % nomesFicticios.length];

  for (const c of celulasData) {
    const articulador = byName(c.articulador);
    const [celula] = await db
      .insert(celulas)
      .values({
        nome: c.nome,
        articuladorId: articulador.id,
        diaSemana: c.diaSemana,
        turno: c.turno,
        horario: c.horario,
        local: c.local,
        observacoes: c.observacoes,
        status: "ativa",
      })
      .returning();

    // Celulandos fictícios (2 a 4 por célula)
    const quantidade = 2 + Math.floor(Math.random() * 3);
    const celulandosCriados = [];
    for (let i = 0; i < quantidade; i++) {
      const [cel] = await db
        .insert(celulandos)
        .values({
          celulaId: celula.id,
          nome: `${proximoNomeFicticio()} (exemplo)`,
          status: i === 0 && quantidade > 2 ? "inativo" : "ativo",
        })
        .returning();
      celulandosCriados.push(cel);
    }

    // Um encontro de exemplo com presenças
    const [encontro] = await db
      .insert(encontros)
      .values({
        celulaId: celula.id,
        data: "2026-08-15",
        conteudoTrabalhado: "Revisão de conteúdo e resolução de exercícios em grupo.",
        duracaoMinutos: 120,
        processamentoGrupo: "Grupo relatou boa interação; sugeriram trazer mais exercícios práticos.",
        registradoPorId: articulador.id,
      })
      .returning();

    await db.insert(presencas).values(
      celulandosCriados
        .filter((cl) => cl.status === "ativo")
        .map((cl, idx) => ({
          encontroId: encontro.id,
          celulandoId: cl.id,
          presente: idx !== 0, // um ausente para variar o exemplo
        }))
    );
  }

  console.log("Seed: registrando aviso de exemplo (planilha de observações temporárias)...");
  await db.insert(avisos).values({
    celulaId: null,
    data: "2026-08-17",
    horario: "15h às 17h",
    mensagem: "Hoje não estarei utilizando a sala do FOCCO.",
    validadeAte: "2026-08-20",
    registradoPorId: joaoVitor.id,
  });

  console.log("\nSeed concluído!");
  console.log("Usuários de exemplo (senha padrão para todos: 'focco123'):");
  console.log(`  Coordenação:  ${coordenacao.email}`);
  console.log(`  Facilitador:  ${joaoVitor.email}`);
  articuladores.forEach((a) => console.log(`  Articulador:  ${a.email}`));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
