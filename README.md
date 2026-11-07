# 🏎️ F1 PRO Dashboard - Temporada Atual

[![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

Um painel interativo e responsivo para acompanhamento em tempo real da temporada de Fórmula 1. Desenvolvido com foco extremo em performance, acessibilidade e com uma estética dark inspirada em dashboards reais de telemetria das equipes.

🚀 **Acesse o projeto online:** [https://f1dash.pages.dev/](https://f1dash.pages.dev/)

---

## 🌟 Principais Features e Diferenciais

O projeto foi arquitetado para proporcionar uma experiência de **App Nativo** diretamente no navegador, utilizando conceitos avançados de UI/UX e React:

- 🚦 **Abertura de largada:** as cinco luzes acendem, apagam juntas (com o suspense aleatório da F1 de verdade) e um rastro de luz cruza a tela revelando a marca, que se dissolve enquanto o app entra. Roda na primeira visita da sessão; um toque pula.
- 📱 **Um app no navegador:** páginas Início, Sessão, Campeonato, Calendário e Resultados, com barra de abas de vidro no celular e barra lateral no computador, no tablet deitado e no celular deitado. Cada página rola normalmente, sem rolagem dentro de rolagem. Dá para **instalar na tela inicial** (PWA), inclusive no iPhone, e abrir em tela cheia como um aplicativo.
- 🧊 **Visual de vidro:** barras e painéis translúcidos sobre um fundo com brilhos vermelhos, no estilo do iPhone, mantendo o preto e vermelho da F1.
- 🤖 **Zero Manutenção:** os dados vêm da Jolpica e do OpenF1 e ficam guardados num banco da Cloudflare (D1), atualizado sozinho a cada 10 minutos por um Worker agendado. Uns 30 minutos depois de cada treino, qualificação ou corrida, a sessão já aparece no site. Se surgir uma pista, equipe ou país novo sem imagem, o site mostra um substituto (traçado genérico, logo da F1, bandeira automática) em vez de quebrar.
- 🌍 **Internacionalização Persistente (i18n):** Sistema de tradução instantânea e sem recarregamento (Context API). A interface alterna fluidamente entre Português e Inglês com transições de opacidade, detecta o idioma do navegador na primeira visita e salva a preferência do usuário no `localStorage`.
- 🛡️ **Resiliência e Tratamento de Erros:** Fallbacks de interface elegantes caso ocorram falhas de conexão ou timeouts nas APIs de dados, impedindo que o layout quebre.
- 🖥️ **Bonito em qualquer tela:** no computador e no tablet as telas preenchem a altura disponível (listas em duas colunas, calendário em grade); no celular a página rola com o conteúdo inteiro. Testado em celulares de 320px a monitores 1440p, monitor na vertical, tablets e celulares deitados, sem rolagem lateral nem texto cortado.
- ✨ **Animações fluidas e discretas:** entrada em cascata na primeira vez que cada seção aparece, traçado da pista que se desenha, barras de pontos que "enchem" e pódio que sobe. Com a opção "reduzir movimento" do sistema ligada, tudo vira um simples esmaecer e o carro fica parado na largada.
- ♿ **Acessível:** dá para usar o site inteiro só com o teclado, com contorno de foco visível em cada botão; textos com contraste dentro do padrão WCAG AA; as janelas de detalhes fecham com Esc e devolvem o foco para onde você estava.

---

## 📸 Visão Geral das Seções

### 1. Próxima Corrida (Next Race)
O ponto de entrada do usuário. Traz informações críticas sobre o próximo evento do calendário, formatando a data e o horário automaticamente com base no fuso do usuário e no idioma selecionado.
- Contagem regressiva para a **próxima sessão** (TL1, Qualificação, Sprint, Corrida), com estado **AO VIVO** durante as sessões e "bandeira quadriculada" após a corrida. Assim que o fim de semana termina, passa sozinha para a próxima etapa.
- Programação completa do fim de semana, com sessões concluídas, ao vivo e a próxima destacadas.
- Previsão do tempo para os dias do GP (Open-Meteo) e os últimos vencedores no circuito — também no celular.
- **Sobre o circuito** (em telas com altura sobrando): GPs disputados ali, ano do primeiro GP, número de voltas e melhor volta da última edição.
- Layout dinâmico do traçado do circuito em formato SVG com animação de trajeto (com um traçado genérico caso o SVG ainda não exista).
- Fora de temporada: mostra os campeões e, quando o calendário seguinte sair, a contagem para a primeira corrida.

<div align="center">
   <img src="docs/sessao1.png" alt="Próxima Corrida no computador" width="600">
   <img src="docs/celular.png" alt="Próxima Corrida no celular" width="180">
</div>

### 2. Sessão (dados do OpenF1)
Cada treino, qualificação e corrida desde 2023, com escolha da etapa e da sessão (a escolha fica no endereço, para compartilhar).
- **Os três primeiros** em cards com a foto do piloto na cor da equipe.
- **Classificação no estilo da transmissão:** sigla de 3 letras com a barra da cor da equipe no celular e nome completo no computador; melhor volta (a mais rápida em roxo), diferença, voltas e pneu. Na qualificação, Q1/Q2/Q3 com o melhor tempo de cada Q em roxo e a diferença para a pole só entre quem chegou ao mesmo Q (quem caiu antes mostra "Q1" ou "Q2"); na corrida, tempo, diferença e abandonos.
- **Velocidade máxima** de cada piloto no ponto de medição, em barras na cor da equipe.
- **Setores:** volta mais rápida × volta teórica (soma dos melhores setores) e a classificação de cada setor.
- Durante uma sessão ao vivo a aba ganha um ponto vermelho piscando. O plano gratuito do OpenF1 fecha os dados durante as sessões e só libera ~30 min depois do fim: nesse meio-tempo o site mostra o que já tem guardado no banco; se ainda não tiver nada, aparece um aviso com a sessão em andamento, que tenta de novo sozinho a cada minuto e se preenche quando os dados chegam.

<div align="center">
   <img src="docs/sessao-openf1.png" alt="Página Sessão no computador" width="600">
   <img src="docs/sessao-celular.png" alt="Página Sessão no celular" width="180">
</div>

### 3. Destaques (Highlights)
- **Pódio do último GP**, com pole, volta mais rápida e o piloto que mais ganhou posições.
- **Disputa pelo título:** calcula, com o calendário restante, quem ainda tem chance matemática de ser campeão (pilotos e equipes) e avisa quando o título está decidido.
- **A temporada em números:** vencedores diferentes, abandonos e quem lidera em vitórias, poles, pódios e voltas mais rápidas — em telas grandes, os 3 primeiros de cada categoria, com barras.
- No computador os três cards ficam lado a lado; no celular viram um carrossel.

<div align="center">
   <img src="docs/destaques.png" alt="Destaques da temporada" width="600">
</div>

### 4. Classificação Mundial (Standings)
Uma visão completa e dividida da tabela de pontos atualizada, renderizada com animações suaves de fade-in.
- **Pilotos & Equipes:** Tabelas completas com cálculo de diferenças de pontos, logotipos oficiais e bandeiras.
- Em telas largas a lista se divide em duas colunas e ocupa a tela inteira, com uma barra mostrando os pontos de cada um em relação ao líder.
- Em telas altas, as **equipes** ficam numa coluna só, com os pilotos de cada uma e os pontos de cada piloto.
- **Evolução dos pontos:** gráfico interativo rodada a rodada dos 6 primeiros (pilotos ou equipes).
- **Modal da equipe:** números da equipe na história e o **duelo interno** entre os companheiros (qualificação, corrida e pontos).
- **Wikipédia Dinâmica (Modal):** Ao clicar em um piloto, um modal interativo é aberto. Ele consome a API oficial da Wikipédia (buscando em `pt` ou `en` dinamicamente) para extrair foto e biografia (a partir do link exato do piloto informado pela própria API), além dos números da carreira (GPs, vitórias, pódios e poles).

<div align="center">
  <img src="docs/pilotos.png" alt="Classificação de Pilotos" width="600">
  <br><br>
  <img src="docs/equipes.png" alt="Classificação de Equipes" width="600">
  <br><br>
  <img src="docs/modal-piloto.png" alt="Pop-up do Piloto" width="400">
</div>

### 5. Calendário
- A temporada inteira em uma grade de cards (no celular, uma lista), com a etapa do fim de semana destacada, o desenho de cada pista, datas, vencedor de cada GP já disputado e selo de fim de semana Sprint.
- Clicar numa etapa abre a programação completa, com os horários no fuso de quem está vendo.

<div align="center">
   <img src="docs/calendario.png" alt="Calendário da temporada" width="600">
</div>

### 6. Resultados da Temporada (Last Races)
Um arquivo histórico navegável de todas as corridas que já ocorreram no ano.
- Navegação rápida entre as etapas usando botões e selects integrados.
- Abas de **Corrida, Sprint e Qualificação** (Q1, Q2, Q3 e diferença para a pole).
- Destaque visual automático para a "Volta Mais Rápida" (Purple Lap).
- **Detalhes de cada resultado:** ao clicar em um piloto, uma janela mostra posição de largada, posições ganhas/perdidas, tempo total, pontos e a melhor volta com velocidade média.

<div align="center">
   <img src="docs/resultados.png" alt="Resultados e Telemetria" width="600">
</div>

---

## 🏗️ Arquitetura e Boas Práticas

Este projeto foi construído seguindo princípios de **Clean Code**:
- **Separação de Responsabilidades:** Funções lógicas de mapeamento (`f1-utils.ts`) isoladas dos componentes visuais.
- **Dicionário de Dados:** Textos abstraídos em `dictionaries.ts` para facilitar a escalabilidade de novos idiomas.
- **Tipagem Estrita:** Uso rigoroso de interfaces TypeScript (`types/f1.ts`) para garantir confiabilidade no consumo das APIs.
- **Otimização de Imagens:** Uso extensivo do componente `<Image>` do Next.js e atributos `loading="lazy"` para manter a nota máxima no Lighthouse (Performance e SEO).

---

## 🛠️ Tecnologias e Ferramentas

- **Core:** [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Requisições:** `fetch` nativo com cache compartilhado entre as seções e novas tentativas automáticas (`src/lib/api.ts`, `src/lib/openf1.ts`)
- **Hospedagem:** [Cloudflare Pages](https://pages.cloudflare.com/) com o site estático (`out/`) e a API em Pages Functions (`functions/`)
- **Dados:** banco [Cloudflare D1](https://developers.cloudflare.com/d1/) (`migrations/`) com a cópia das APIs, mantido por um Worker agendado a cada 10 minutos (`worker/`, `server/`)
- **Revisão visual:** as skills em `.claude/skills/` (de Emil Kowalski e Jakub Krehel, licença MIT) guiam o Claude Code na revisão de animações, acessibilidade, contraste e textos; os testes nos vários tamanhos de tela usam o Playwright MCP (configuração local em `.mcp.json`, fora do Git).

### 🔌 APIs Consumidas
- **[Ergast API (via Jolpi)](https://ergast.com/mrd/):** Fornece os dados brutos de calendários e classificações oficiais da FIA.
- **[OpenF1](https://openf1.org/):** Voltas, setores, velocidade máxima, pneus, siglas, cores e fotos dos pilotos de cada sessão (de 2023 para cá, plano gratuito).
- **[Wikimedia REST API](https://www.mediawiki.org/wiki/API:REST_API):** Enriquecimento do modal dos pilotos com fotos e resumos biográficos.
- **[Flagcdn](https://flagcdn.com/):** Renderização ultrarrápida das bandeiras de nacionalidades.
- **[UI-Avatars](https://ui-avatars.com/):** Sistema de fallback (letras iniciais) caso o piloto não possua imagem pública na Wikipédia.
- **[Open-Meteo](https://open-meteo.com/):** Previsão do tempo do fim de semana de corrida (gratuita e sem chave).

---

## 🧰 Manutenção (opcional)

O site se mantém sozinho: o Worker `f1dash-sync` roda a cada 10 minutos na Cloudflare e guarda no banco o que o site precisa. Para conferir se ele está rodando, abra [f1dash.pages.dev/api/status](https://f1dash.pages.dev/api/status) (mostra as últimas execuções). A única coisa que não vem da API são as imagens das pistas e os logos das equipes — e mesmo sem elas o site continua funcionando com substitutos.

O site é publicado sozinho a cada push na `main`. Só o Worker é publicado à mão, e apenas se o código dele (`worker/` ou `server/`) mudar: `npm run worker:deploy`. Mudanças na estrutura do banco ficam em `migrations/` e são aplicadas com `npm run db:migrate:remote`.

Quando quiser conferir se falta alguma imagem (por exemplo, quando sair o calendário de uma nova temporada):

```bash
npm run check:assets   # lista pistas, logos, bandeiras e traduções que faltam
```

**Ao adicionar uma pista nova:** salve o SVG em `public/circuits/` com o nome exatamente igual ao `circuitId` da API (ex.: `albert_park.svg`, `madring.svg`). O comando acima mostra o id certo.

---

## 👤 Autor

**Gabriel Henrique Ferreira Pimentel**
- 🌐 [Portifólio](https://gabrielpimentel.pages.dev/)
- 💼 [LinkedIn](https://www.linkedin.com/in/gabrielhfpimentel/)