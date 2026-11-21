// Gerado no build (exportação estática): a versão desta publicação, conferida pelo aviso de versão nova
export const dynamic = "force-static";

export function GET() {
  return Response.json({ version: process.env.NEXT_PUBLIC_APP_VERSION ?? "dev" });
}
