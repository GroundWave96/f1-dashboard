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
      loading: "Carregando Dados..."
    },
    driverModal: {
      age: "Idade",
      nationality: "Nacionalidade",
      team: "Equipe",
      biography: "Biografia",
      loadingBio: "Carregando biografia...",
      bioNotFound: "Biografia não encontrada para este piloto."
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
      loading: "Loading Data..."
    },
    driverModal: {
      age: "Age",
      nationality: "Nationality",
      team: "Team",
      biography: "Biography",
      loadingBio: "Loading biography...",
      bioNotFound: "Biography not found for this driver."
    }
  }
};

export type Language = keyof typeof dictionaries;