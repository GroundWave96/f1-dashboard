import { Language } from '../i18n/dictionaries';

export interface WikiSummary {
  extract: string;
  thumbnail?: { source: string };
}

const summaryUrl = (lang: Language, title: string) =>
  `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;

async function getSummary(lang: Language, title: string): Promise<WikiSummary | null> {
  const res = await fetch(summaryUrl(lang, title));
  if (!res.ok) return null;
  const data = await res.json();
  if (data.type === 'disambiguation' || !data.extract) return null;
  return data;
}

// A Ergast sempre aponta para o artigo em inglês; para outros idiomas buscamos o título equivalente via langlinks.
async function resolveTitleFromUrl(url: string, lang: Language): Promise<string | null> {
  const enTitle = decodeURIComponent(url.split('/wiki/')[1] ?? '');
  if (!enTitle) return null;
  if (lang === 'en') return enTitle;

  const res = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&prop=langlinks&redirects=1&lllang=${lang}&titles=${encodeURIComponent(enTitle)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.query?.pages?.[0]?.langlinks?.[0]?.title ?? null;
}

export async function fetchWikiSummary(
  lang: Language,
  url: string | undefined,
  fallbackTitles: string[]
): Promise<WikiSummary | null> {
  const titles: string[] = [];

  if (url) {
    try {
      const resolved = await resolveTitleFromUrl(url, lang);
      if (resolved) titles.push(resolved);
    } catch (error) {
      console.error("Erro ao resolver título na Wikipédia:", error);
    }
  }
  titles.push(...fallbackTitles);

  for (const title of titles) {
    const summary = await getSummary(lang, title);
    if (summary) return summary;
  }
  return null;
}

export const firstSentences = (text: string, count: number): string => {
  const sentences = text.split('. ');
  if (sentences.length <= count) return text;
  return sentences.slice(0, count).join('. ') + '.';
};
