/**
 * Worker f1dash-sync: roda sozinho a cada 10 minutos (Cron Trigger da Cloudflare) e mantém o banco
 * do site atualizado. Não tem endereço público; o site lê os dados pela própria API (functions/).
 */
import type { CacheEnv } from "../../server/cache";
import { runSync } from "../../server/sync";

export default {
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runSync(env));
  },
} satisfies ExportedHandler<CacheEnv>;
