# 🏁 F1 PRO Dashboard - Temporada Atual

[![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

Um painel interativo e responsivo para acompanhamento em tempo real da temporada de Fórmula 1. Desenvolvido com foco extremo em performance, acessibilidade e com uma estética inspirada em dashboards de telemetria.

🚀 **Acesse o projeto online:** [https://f1dash.pages.dev/](https://f1dash.pages.dev/)

---

## 🌟 Diferenciais do Projeto

Ele foi arquitetado para proporcionar uma experiência de **App Nativo** no navegador:

-   **Experiência "App-Like" (Scroll Snap):** Navegação vertical mandatória que trava a tela em seções específicas, simulando o comportamento de aplicativos móveis modernos.
-   **Internacionalização (i18n):** Sistema de tradução instantânea e sem recarregamento (Context API). Com um único clique no *toggle* de bandeiras, toda a interface alterna de forma fluida entre Português e Inglês.
-   **Estética Racing:** Design minimalista com traçados de circuitos em SVG e logos de construtores oficiais.
-   **Acessibilidade Mobile First:** Troca inteligente de elementos visuais (ex: bandeiras de países no Desktop viram logos de equipes compactos no Mobile) para priorizar a legibilidade em telas menores.

---

## 📸 Visão Geral das Seções

### 1. Próxima Corrida (Next Race)
O ponto de entrada do usuário. Traz as informações críticas sobre o próximo evento do calendário, formatando a data e o horário automaticamente com base no fuso do usuário e no idioma selecionado.
- Contagem regressiva em tempo real.
- Layout dinâmico do traçado do circuito.
- Chave seletora de idiomas animada e integrada ao contexto global.

<div align="center">
   <img src="docs/sessao1.png" alt="Próxima Corrida" width="600">
</div>

### 2. Classificação Mundial (Standings)
Uma visão completa da tabela de pontos atualizada. Esta seção é dividida por uma chave seletora intuitiva e possui integração com a Wikipédia.
- **Pilotos:** Tabela completa com cálculo de diferenças de pontos e bandeiras de nacionalidades.
- **Equipes:** Visualização do campeonato de construtores com logotipos oficiais.
- **Wikipédia Dinâmica:** Ao clicar em um piloto, um modal interativo é aberto. Ele consome a API oficial da Wikipédia (adaptando para `pt` ou `en` de acordo com o idioma do site) para trazer foto, biografia, idade e outras estatísticas do piloto.

<div align="center">
  <img src="docs/pilotos.png" alt="Classificação de Pilotos" width="600">
  <br><br>
  <img src="docs/equipes.png" alt="Classificação de Equipes" width="600">
  <br><br>
  <img src="docs/modal-piloto.png" alt="Pop-up do Piloto" width="400">
</div>

### 3. Resultados da Temporada (Last Races)
Um arquivo histórico navegável de todas as corridas que já ocorreram no ano.
- Navegação entre as etapas usando botões "Anterior" e "Próximo".
- Tabela de resultados detalhada destacando a "Volta Mais Rápida" em roxo (Purple Lap).
- **Linha Expansível (Accordion):** Ao clicar em um piloto na tabela, a linha se expande revelando uma grade de telemetria com a posição de largada, o total de posições ganhas/perdidas durante a prova, tempo total de corrida, quantidade de voltas e a velocidade média na volta mais rápida.

<div align="center">
   <img src="docs/resultados.png" alt="Resultados e Telemetria" width="600">
</div>

---

## 🛠️ Tecnologias Utilizadas

-   **Framework:** [Next.js](https://nextjs.org/) (App Router & Turbopack)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **Consumo de Dados:** [Axios](https://axios-http.com/)
-   **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/)

---

## 📊 APIs Consumidas

- **Ergast API (via Jolpi):** Fornece os dados brutos de calendários, voltas e classificações oficiais da FIA.
- **Wikimedia REST API:** Usada para enriquecer o modal dos pilotos com fotos e resumos biográficos adaptados dinamicamente ao idioma do painel.
- **Flagcdn:** Para renderização ultrarrápida das bandeiras de nacionalidades em formato WebP/PNG.

---

## 👤 Autor

**Gabriel Henrique Ferreira Pimentel**

---