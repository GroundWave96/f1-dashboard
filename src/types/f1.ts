export interface Driver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  givenName: string;
  familyName: string;
  nationality: string;
  dateOfBirth?: string;
  url?: string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
  url?: string;
}

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface Location {
  lat?: string;
  long?: string;
  locality: string;
  country: string;
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  Location: Location;
}

export interface Session {
  date: string;
  time: string;
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time: string;
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  Qualifying?: Session;
  Sprint?: Session;
  SprintQualifying?: Session;
  SprintShootout?: Session;
}

export interface RaceResult {
  position: string;
  positionText?: string;
  points: string;
  grid: string;
  laps: string;
  status: string;
  Driver: Driver;
  Constructor: Constructor;
  Time?: {
    time: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: {
      time: string;
    };
    AverageSpeed: {
      units: string;
      speed: string;
    };
  };
}

export interface QualifyingResult {
  position: string;
  Driver: Driver;
  Constructor: Constructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface PastRace extends Race {
  Results?: RaceResult[];
  SprintResults?: RaceResult[];
  QualifyingResults?: QualifyingResult[];
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface StandingsList {
  season: string;
  round: string;
  DriverStandings?: DriverStanding[];
  ConstructorStandings?: ConstructorStanding[];
}

// Envelope padrão das respostas da Jolpica/Ergast
export interface MRData {
  total: string;
  limit: string;
  offset: string;
  RaceTable?: {
    season?: string;
    Races: PastRace[];
  };
  StandingsTable?: {
    season: string;
    round?: string;
    StandingsLists: StandingsList[];
  };
}
