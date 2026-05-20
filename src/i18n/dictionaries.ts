export const dictionaries = {
  pt: {
    nextRace: {
      title: "Próxima Corrida",
      round: "Rodada",
      at: "às",
      weekendHighlights: "Destaques do Fim de Semana",
      qualifying: "Qualificação",
      race: "Corrida",
      saturday: "Sábado",
      sunday: "Domingo",
      days: "Dias",
      hours: "Horas",
      minutes: "Minutos",
      seconds: "Segundos"
    },
    standings: {
      title: "Classificação Mundial",
      season: "Temporada",
      drivers: "Pilotos",
      teams: "Equipes",
      pos: "Pos",
      driver: "Piloto",
      team: "Equipe",
      wins: "Vitórias",
      pts: "Pts",
      loading: "Carregando Dados...",
      noTeam: "Sem Equipe"
    },
    errors: {
      connectionTitle: "Erro de Conexão",
      nextRaceMsg: "Não foi possível carregar a próxima corrida. Tente recarregar a página.",
      standingsMsg: "Não foi possível carregar a classificação. Tente recarregar a página.",
      resultsMsg: "Não foi possível carregar os resultados da temporada.",
      tryAgain: "Tentar Novamente"
    },
    driverModal: {
      age: "Idade",
      nationality: "Nacionalidade",
      team: "Equipe",
      biography: "Biografia",
      loadingBio: "Carregando biografia...",
      bioNotFound: "Biografia não encontrada para este piloto."
    },
    results: {
      title: "Resultados da Temporada",
      round: "Rodada",
      fastestLap: "Melhor Volta",
      pos: "Pos",
      driver: "Piloto",
      team: "Equipe",
      timeStatus: "Info",
      pts: "Pts",
      loading: "Carregando resultados da temporada",
      noRaces: "Nenhuma corrida encontrada para esta temporada.",
      backToCurrent: "Voltar para a atual",
      currentSeason: "Temporada Atual",
      current: "Atual",
      previous: "Anterior",
      next: "Próxima",
      start: "Largada",
      positions: "posições",
      pitLane: "Pit Lane",
      keptPosition: "Manteve posição",
      totalTime: "Tempo Total / Gap",
      laps: "Voltas",
      lap: "Volta"
    },
    footer: {
      portfolioTitle: "Ver Portfólio de Gabriel Pimentel"
    }
  },
  en: {
    nextRace: {
      title: "Next Race",
      round: "Round",
      at: "at",
      weekendHighlights: "Weekend Highlights",
      qualifying: "Qualifying",
      race: "Race",
      saturday: "Saturday",
      sunday: "Sunday",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds"
    },
    standings: {
      title: "World Standings",
      season: "Season",
      drivers: "Drivers",
      teams: "Teams",
      pos: "Pos",
      driver: "Driver",
      team: "Team",
      wins: "Wins",
      pts: "Pts",
      loading: "Loading Data...",
      noTeam: "No Team"
    },
    errors: {
      connectionTitle: "Connection Error",
      nextRaceMsg: "Could not load the next race. Please try refreshing the page.",
      standingsMsg: "Could not load the standings. Please try refreshing the page.",
      resultsMsg: "Could not load the season results.",
      tryAgain: "Try Again"
    },
    driverModal: {
      age: "Age",
      nationality: "Nationality",
      team: "Team",
      biography: "Biography",
      loadingBio: "Loading biography...",
      bioNotFound: "Biography not found for this driver."
    },
    results: {
      title: "Season Results",
      round: "Round",
      fastestLap: "Fastest Lap",
      pos: "Pos",
      driver: "Driver",
      team: "Team",
      timeStatus: "Info",
      pts: "Pts",
      loading: "Loading results for season",
      noRaces: "No races found for this season.",
      backToCurrent: "Back to current",
      currentSeason: "Current Season",
      current: "Current",
      previous: "Previous",
      next: "Next",
      start: "Start",
      positions: "positions",
      pitLane: "Pit Lane",
      keptPosition: "Kept position",
      totalTime: "Total Time / Gap",
      laps: "Laps",
      lap: "Lap"
    },
    footer: {
      portfolioTitle: "View Gabriel Pimentel's Portfolio"
    }
  }
};

export type Language = keyof typeof dictionaries;