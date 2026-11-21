/** Dados do site usados em vários lugares (metadados, páginas, contato). */
export const SITE_URL = "https://f1dash.pages.dev";
export const SITE_NAME = "F1 Dashboard";
export const AUTHOR_NAME = "Gabriel Pimentel";
export const AUTHOR_URL = "https://gabrielpimentel.pages.dev/";
export const CONTACT_EMAIL = "gabrielhfp96@gmail.com";

/** Link de e-mail com o assunto já preenchido. */
export const mailto = (subject: string) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

/** Páginas públicas (sitemap e links do rodapé). */
export const PAGES = ["/", "/sessao", "/campeonato", "/calendario", "/resultados", "/perguntas", "/sobre"] as const;
