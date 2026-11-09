/** Troca {nome} pelos valores: fill("{n} voltas", { n: 3 }) → "3 voltas". */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Singular ou plural: plural(2, { one: "1 volta", many: "{n} voltas" }) → "2 voltas". */
export function plural(n: number, forms: { one: string; many: string }) {
  return n === 1 ? forms.one : fill(forms.many, { n });
}

/** Lista de nomes: "Albon", "Albon e Gasly", "Albon, Gasly e Ocon", "Albon, Gasly, Ocon e mais 2". */
export function joinNames(names: string[], and: string, andMore: string, max = 3) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length > max + 1) return `${names.slice(0, max).join(", ")} ${fill(andMore, { n: names.length - max })}`;
  return `${names.slice(0, -1).join(", ")} ${and} ${names[names.length - 1]}`;
}

/** Número com a vírgula/ponto do idioma: decimal(2.1, "pt", 1) → "2,1". */
export function decimal(value: number, lang: string, digits = 1) {
  return value.toLocaleString(lang === "pt" ? "pt-BR" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
