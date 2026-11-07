// Roda depois do `next build` (script "postbuild").
//
// Na exportação estática, o Next 16 grava os arquivos de pré-carregamento das páginas internas em pastas
// (out/sessao/__next.sessao/__PAGE__.txt), mas o navegador os pede com pontos no nome
// (/sessao/__next.sessao.__PAGE__.txt). Sem esta cópia as abas não são pré-carregadas e cada clique
// recarrega a página inteira. Na raiz (/) o problema não acontece porque lá não há pasta.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
let copied = 0;

function filesIn(dir, prefix = "") {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}.${entry.name}` : entry.name;
    return entry.isDirectory() ? filesIn(path.join(dir, entry.name), rel) : [[path.join(dir, entry.name), rel]];
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "_next") continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      for (const [file, rel] of filesIn(full)) {
        fs.copyFileSync(file, path.join(dir, `${entry.name}.${rel}`));
        copied++;
      }
    } else {
      walk(full);
    }
  }
}

if (fs.existsSync(OUT)) {
  walk(OUT);
  console.log(`flatten-prefetch: ${copied} arquivo(s) de pré-carregamento copiados`);
}
