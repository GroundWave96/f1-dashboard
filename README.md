# 🏁 F1 PRO Dashboard - Temporada Atual

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

Um painel interativo e ultra-responsivo para acompanhamento em tempo real da temporada atual de Fórmula 1. Desenvolvido com foco em performance e estética inspirada em dashboards de telemetria de Sim Racing.

---

## 🌟 Diferenciais do Projeto

Este não é apenas mais um site de resultados. Ele foi construído com técnicas avançadas para proporcionar uma experiência de **App Nativo** no navegador:

-   **Experiência "App-Like" (Scroll Snap):** Navegação vertical mandatória que trava a tela em seções específicas, simulando o comportamento de aplicativos móveis modernos.
-   **Otimização de Viewport Dinâmica (DVH):** Utilização da unidade `dvh` (Dynamic Viewport Height) para garantir que as barras de navegação dos celulares (Safari/Chrome) não cortem o conteúdo do site.
-   **Estética Sim Racing:** Design minimalista com traçados de circuitos em SVG (White Outline) e logos de construtores oficiais, inspirados em dashboards de alto desempenho como o *Lovely Dashboard*.
-   **Cronômetro em Tempo Real:** Sistema de contagem regressiva para a próxima corrida ajustado automaticamente para o horário de Brasília.
-   **Acessibilidade Mobile:** Troca inteligente de elementos visuais (ex: bandeiras no PC viram logos de equipes no Celular) para priorizar a legibilidade em telas pequenas.
-   **SEO & Social Ready:** Configuração completa de metadados Open Graph para visualização rica em compartilhamentos via WhatsApp e redes sociais.

---

## 🛠️ Tecnologias Utilizadas

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **Consumo de Dados:** [Axios](https://axios-http.com/)
-   **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/)

---

## 📊 API de Dados

O projeto consome a **API Ergast (via Jolpi)**, fornecendo dados precisos sobre:
-   Calendário completo da temporada.
-   Resultados de corridas passadas com detalhes de voltas rápidas e ganho de posições.
-   Classificação mundial de pilotos e construtores.

---

## ⚙️ Instalação e Execução

Para rodar o projeto localmente:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/GroundWave96/f1-dashboard.git
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

---

## 🏗️ Estrutura de Arquivos

-   `/public/teams`: Logos das equipes em SVG.
-   `/public/circuits`: Traçados das pistas oficiais em White Outline.
-   `/src/components/f1`: Componentes modulares (NextRace, DriverStandings, LastRaceResults).
-   `/src/lib/f1-utils.ts`: Funções utilitárias para conversão de nacionalidades e IDs de imagens.

---

## 👤 Autor

**Gabriel Henrique Ferreira Pimentel**
*Desenvolvedor & Criador da Apex Dev Studio*