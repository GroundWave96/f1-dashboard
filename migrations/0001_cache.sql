-- Cópia local das respostas das APIs (Jolpica e OpenF1).
-- O site lê daqui primeiro; se o dado venceu ou não existe, busca na API e grava de volta.
CREATE TABLE IF NOT EXISTS cache (
  key         TEXT PRIMARY KEY,           -- ex.: "jolpica:current/driverStandings.json?limit=100"
  body        TEXT NOT NULL,              -- resposta JSON, como veio da API
  fetched_at  INTEGER NOT NULL,           -- quando foi buscado (epoch ms)
  expires_at  INTEGER NOT NULL,           -- a partir de quando vale buscar de novo (epoch ms)
  immutable   INTEGER NOT NULL DEFAULT 0, -- 1 = dado que não muda mais (temporada ou sessão encerrada)
  last_access INTEGER NOT NULL            -- última vez que alguém pediu (atualizado no máximo 1x por hora)
);

-- O Worker de sincronização renova os dados vencidos que alguém pediu recentemente
CREATE INDEX IF NOT EXISTS cache_refresh ON cache (immutable, expires_at, last_access);

-- Registro das execuções do Worker (para conferir de fora se a sincronização está rodando)
CREATE TABLE IF NOT EXISTS sync_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at  INTEGER NOT NULL,
  finished_at INTEGER,
  fetched     INTEGER NOT NULL DEFAULT 0,
  failed      INTEGER NOT NULL DEFAULT 0,
  note        TEXT
);
