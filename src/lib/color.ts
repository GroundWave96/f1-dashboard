/**
 * Cor de equipe usada como cor de TEXTO sobre o fundo escuro do site: algumas (o azul da Red Bull, o
 * vermelho da Ferrari) ficam escuras demais para ler em letras pequenas. Clareia misturando com branco
 * só o necessário para o contraste chegar a 4,5:1 (o mínimo para texto). Barras e bolinhas continuam
 * com a cor original.
 */
const BACKGROUND = [17, 17, 20];

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export function readableText(hex: string, min = 4.5) {
  const h = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) return hex;
  const base = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  for (let mix = 0; mix <= 1; mix += 0.05) {
    const rgb = base.map((v) => Math.round(v + (255 - v) * mix));
    if (contrast(rgb, BACKGROUND) >= min) return `rgb(${rgb.join(" ")})`;
  }
  return "#fff";
}
