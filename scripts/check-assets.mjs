// Confere se o site sabe exibir tudo o que a API traz para a temporada atual (e a próxima,
// se já publicada): desenho da pista, logo da equipe, bandeiras e tradução de nacionalidades.
// O site funciona mesmo sem esses itens (usa traçado genérico e o logo da F1), então rodar
// este script é opcional — útil, por exemplo, quando sair o calendário de uma nova temporada.
//
// Uso: npm run check:assets

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { countryToISO, getConstructorLogo, nationalityToISO, translateNationality } from "../src/lib/f1-utils.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.jolpi.ca/ergast/f1/";

async function fetchTable(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`Jolpica respondeu ${res.status} para ${path}`);
  return (await res.json()).MRData;
}

const currentData = await fetchTable("current.json?limit=100");
const currentSeason = currentData.RaceTable.season;
const nextSeason = String(Number(currentSeason) + 1);
const nextData = await fetchTable(`${nextSeason}.json?limit=100`).catch(() => null);

const seasons = [currentSeason];
const races = [...currentData.RaceTable.Races];
if (nextData?.RaceTable.Races.length) {
  seasons.push(nextSeason);
  races.push(...nextData.RaceTable.Races);
}

const missing = {
  circuits: new Map(),
  countries: new Map(),
  teams: new Map(),
  nationalities: new Map(),
};

for (const race of races) {
  const { circuitId, circuitName, Location } = race.Circuit;
  if (!existsSync(join(ROOT, "public", "circuits", `${circuitId}.svg`))) {
    missing.circuits.set(circuitId, `${circuitName} (${Location.locality}, ${Location.country}) · ${race.season}, rodada ${race.round}`);
  }
  if (countryToISO(Location.country) === "un") {
    missing.countries.set(Location.country, `${race.raceName} ${race.season}`);
  }
}

for (const season of seasons) {
  const [drivers, constructors] = await Promise.all([
    fetchTable(`${season}/drivers.json?limit=100`),
    fetchTable(`${season}/constructors.json?limit=100`),
  ]);

  for (const driver of drivers.DriverTable?.Drivers ?? []) {
    const { nationality } = driver;
    // Pilotos reserva que só fazem treinos livres vêm sem nacionalidade na API e não aparecem nas tabelas
    if (!nationality) continue;
    const noFlag = nationalityToISO(nationality) === "un";
    const noTranslation = translateNationality(nationality, "pt") === nationality;
    if (noFlag || noTranslation) {
      const what = [noFlag && "bandeira", noTranslation && "tradução"].filter(Boolean).join(" e ");
      missing.nationalities.set(nationality, `${driver.givenName} ${driver.familyName} · falta ${what}`);
    }
  }

  for (const team of constructors.ConstructorTable?.Constructors ?? []) {
    const logo = getConstructorLogo(team.constructorId);
    if (logo === "/teams/f1.svg" || !existsSync(join(ROOT, "public", logo))) {
      missing.teams.set(team.constructorId, team.name);
    }
  }
}

const sections = [
  {
    title: "Pistas sem desenho (SVG)",
    items: missing.circuits,
    hint: "Adicione o arquivo `public/circuits/<id>.svg` (o nome tem que ser exatamente o id abaixo).",
  },
  {
    title: "Equipes sem logo",
    items: missing.teams,
    hint: "Adicione o SVG em `public/teams/` e mapeie o id em `getConstructorLogo` (`src/lib/f1-utils.ts`). Enquanto isso, o site mostra o logo da F1.",
  },
  {
    title: "Nacionalidades sem bandeira ou tradução",
    items: missing.nationalities,
    hint: "Inclua a nacionalidade em `nationalityToISO` e `translateNationality` (`src/lib/f1-utils.ts`).",
  },
  {
    title: "Países sem bandeira",
    items: missing.countries,
    hint: "Inclua o país em `countryToISO` (`src/lib/f1-utils.ts`).",
  },
].filter((section) => section.items.size > 0);

const hasMissing = sections.length > 0;

if (!hasMissing) {
  console.log(`Tudo certo: pistas, equipes, bandeiras e traduções de ${seasons.join(" e ")} estão cobertas. ✅`);
} else {
  console.log(`Itens da temporada ${seasons.join(" e ")} que o site ainda não sabe exibir:\n`);
  for (const section of sections) {
    console.log(section.title);
    console.log(`  ${section.hint}`);
    for (const [id, detail] of section.items) console.log(`  - ${id}: ${detail}`);
    console.log("");
  }
  process.exitCode = 1;
}
