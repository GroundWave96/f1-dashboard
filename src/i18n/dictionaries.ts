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
    }
  }
};

export type Language = keyof typeof dictionaries;