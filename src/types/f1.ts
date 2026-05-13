export interface Driver {
  driverId: string;
  permanentNumber: string;
  givenName: string;
  familyName: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface Location {
  locality: string;
  country: string;
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  Location: Location;
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time: string;
}

export interface RaceResult {
  position: string;
  points: string;
  grid: string;
  laps: string;
  status: string;
  Driver: Driver;
  Constructor: Constructor;
  Time?: {
    time: string;
  };
}

export interface PastRace extends Race {
  Results: RaceResult[];
}