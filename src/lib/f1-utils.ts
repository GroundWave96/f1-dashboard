export const nationalityToISO = (nationality: string): string => {
  const map: Record<string, string> = {
    'British': 'gb',
    'Brazilian': 'br',
    'Dutch': 'nl',
    'Italian': 'it',
    'Spanish': 'es',
    'French': 'fr',
    'German': 'de',
    'Argentine': 'ar',
    'Australian': 'au',
    'Monegasque': 'mc',
    'Thai': 'th',
    'Mexican': 'mx',
    'American': 'us',
    'Canadian': 'ca',
    'Japanese': 'jp',
    'Danish': 'dk',
    'Finnish': 'fi',
    'Chinese': 'cn',
    'New Zealander': 'nz',
    'Austrian': 'at',
    'Swiss': 'ch',
    'Belgian': 'be',
    'Colombian': 'co',
    'Swedish': 'se',
    'Polish': 'pl',
    'Russian': 'ru',
    'Indian': 'in',
    'Indonesian': 'id',
    'Malaysian': 'my',
    'Portuguese': 'pt',
    'Venezuelan': 've',
    'Irish': 'ie',
    'Hungarian': 'hu',
    'Czech': 'cz',
    'Chilean': 'cl',
    'Uruguayan': 'uy',
    'South African': 'za',
    'Liechtensteiner': 'li',
    'Rhodesian': 'zw',
    'East German': 'de',
    'Hong Kong': 'hk',
  };
  return map[nationality] || 'un';
};

export const getConstructorLogo = (constructorId: string | undefined): string => {
  if (!constructorId) return '/teams/f1.svg';

  const logoMap: Record<string, string> = {
    'alpine': 'alpine.svg',
    'aston_martin': 'aston-martin.svg',
    'audi': 'audi.svg',
    'cadillac': 'cadillac.svg',
    'ferrari': 'ferrari.svg',
    'haas': 'haas.svg',
    'mclaren': 'mclaren.svg',
    'mercedes': 'mercedes-benz.svg',
    'rb': 'racing-bulls.svg',
    'red_bull': 'red-bull.svg',
    'sauber': 'sauber.svg',
    'williams': 'williams-racing.svg',
    'alfa': 'alfa-romeo.svg',
    'alphatauri': 'alphatauri.svg',
    'renault': 'renault.svg',
    'toro_rosso': 'toro-rosso.svg',
    'force_india': 'force-india.svg',
    'caterham': 'caterham.svg',
    'hrt': 'hrt.svg',
    'toyota': 'toyota.svg',
    'bmw_sauber': 'bmw-sauber.svg',
    'honda': 'honda.svg',
    'jordan': 'jordan.svg',
    'tyrrell': 'tyrrell.svg',
    'team_lotus': 'team-lotus.svg',
    'lotus_racing': 'team-lotus.svg',
    'lotus_f1': 'lotus-f1.svg',
    'dallara': 'dallara.svg',
    'ags': 'ags.svg',
    'jaguar': 'jaguar.svg',
    'minardi': 'minardi.svg',
    'maserati': 'maserati.svg',
  };

  const logoFile = logoMap[constructorId];
  
  return logoFile ? `/teams/${logoFile}` : '/teams/f1.svg';
};

export const translateNationality = (nationality: string, lang: 'pt' | 'en'): string => {
  if (lang === 'en') return nationality;

  const map: Record<string, string> = {
    'British': 'Britânico',
    'Brazilian': 'Brasileiro',
    'Dutch': 'Holandês',
    'Italian': 'Italiano',
    'Spanish': 'Espanhol',
    'French': 'Francês',
    'German': 'Alemão',
    'Argentine': 'Argentino',
    'Australian': 'Australiano',
    'Monegasque': 'Monegasco',
    'Thai': 'Tailandês',
    'Mexican': 'Mexicano',
    'American': 'Americano',
    'Canadian': 'Canadense',
    'Japanese': 'Japonês',
    'Danish': 'Dinamarquês',
    'Finnish': 'Finlandês',
    'Chinese': 'Chinês',
    'New Zealander': 'Neozelandês',
    'Colombian': 'Colombiano',
    'Austrian': 'Austríaco',
    'Swiss': 'Suíço',
    'Belgian': 'Belga',
    'Swedish': 'Sueco',
    'Polish': 'Polonês',
    'Russian': 'Russo',
    'Indian': 'Indiano',
    'Indonesian': 'Indonésio',
    'Malaysian': 'Malaio',
    'Portuguese': 'Português',
    'Venezuelan': 'Venezuelano',
    'Irish': 'Irlandês',
    'Hungarian': 'Húngaro',
    'Czech': 'Tcheco',
    'Chilean': 'Chileno',
    'Uruguayan': 'Uruguaio',
    'South African': 'Sul-Africano',
    'Liechtensteiner': 'Liechtensteinense',
    'Rhodesian': 'Rodesiano',
    'East German': 'Alemão Oriental',
    'Hong Kong': 'Honconguês'
  };
  return map[nationality] || nationality;
};

export const countryToISO = (country: string): string => {
  const map: Record<string, string> = {
    'Australia': 'au', 
    'Bahrain': 'bh', 
    'Saudi Arabia': 'sa', 
    'Japan': 'jp', 
    'China': 'cn',
    'USA': 'us', 
    'United States': 'us', 
    'Italy': 'it', 
    'Monaco': 'mc', 
    'Canada': 'ca',
    'Spain': 'es', 
    'Austria': 'at', 
    'UK': 'gb', 
    'Hungary': 'hu', 
    'Belgium': 'be',
    'Netherlands': 'nl', 
    'Azerbaijan': 'az', 
    'Singapore': 'sg', 
    'Brazil': 'br',
    'Mexico': 'mx', 
    'Qatar': 'qa', 
    'UAE': 'ae', 
    'Saudi': 'sa',
    'Malaysia': 'my',
    'Argentina': 'ar',
    'France': 'fr',
    'Germany': 'de',
    'India': 'in',
    'Korea': 'kr',
    'Morocco': 'ma',
    'Portugal': 'pt',
    'Russia': 'ru',
    'South Africa': 'za',
    'Sweden': 'se',
    'Switzerland': 'ch',
    'Turkey': 'tr'
  };
  return map[country] || 'un';
};

export const getPositionStyle = (pos: string): string => {
  if (pos === "1") return "text-yellow-400 font-black drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] text-base sm:text-lg";
  if (pos === "2") return "text-slate-300 font-black drop-shadow-[0_0_8px_rgba(203,213,225,0.5)] text-base sm:text-lg";
  if (pos === "3") return "text-amber-600 font-black drop-shadow-[0_0_8px_rgba(217,119,6,0.5)] text-base sm:text-lg";
  return "text-white font-bold";
};

export type ResultOutcome = 'classified' | 'dnf' | 'dns' | 'dsq' | 'dnq' | 'nc';

// Siglas usadas pela própria F1 (iguais em português e inglês)
export const OUTCOME_LABEL: Record<Exclude<ResultOutcome, 'classified'>, string> = {
  dnf: 'DNF',
  dns: 'DNS',
  dsq: 'DSQ',
  dnq: 'DNQ',
  nc: 'NC',
};

const isFinishedStatus = (status: string) =>
  status === 'Finished' || status === 'Lapped' || /^\+\d+ Laps?$/.test(status);

export const getResultOutcome = (result: { positionText?: string; status: string }): ResultOutcome => {
  switch (result.positionText) {
    case 'R': return 'dnf';
    case 'D':
    case 'E': return 'dsq';
    case 'W': return 'dns';
    case 'F': return 'dnq';
    case 'N': return 'nc';
  }
  if (result.positionText) return 'classified';

  // Dados antigos sem positionText: deduz pelo status
  const { status } = result;
  if (/disqualified|excluded/i.test(status)) return 'dsq';
  if (/did not start|withdrew/i.test(status)) return 'dns';
  if (/did not (pre)?qualify/i.test(status)) return 'dnq';
  return isFinishedStatus(status) ? 'classified' : 'dnf';
};

const statusPt: Record<string, string> = {
  'Finished': 'Completou',
  'Lapped': 'Retardatário',
  'Retired': 'Abandono',
  'Disqualified': 'Desclassificado',
  'Excluded': 'Excluído',
  'Did not start': 'Não largou',
  'Withdrew': 'Retirou-se',
  'Did not qualify': 'Não se classificou',
  'Did not prequalify': 'Não pré-classificado',
  'Not classified': 'Não classificado',
  'Accident': 'Acidente',
  'Fatal accident': 'Acidente fatal',
  'Collision': 'Colisão',
  'Collision damage': 'Danos de colisão',
  'Damage': 'Danos',
  'Spun off': 'Rodou',
  'Engine': 'Motor',
  'Power Unit': 'Unidade de potência',
  'Gearbox': 'Câmbio',
  'Transmission': 'Transmissão',
  'Clutch': 'Embreagem',
  'Hydraulics': 'Hidráulica',
  'Electrical': 'Elétrica',
  'Electronics': 'Eletrônica',
  'Battery': 'Bateria',
  'Brakes': 'Freios',
  'Suspension': 'Suspensão',
  'Steering': 'Direção',
  'Driveshaft': 'Semieixo',
  'Exhaust': 'Escapamento',
  'Turbo': 'Turbo',
  'Overheating': 'Superaquecimento',
  'Radiator': 'Radiador',
  'Water leak': 'Vazamento de água',
  'Oil leak': 'Vazamento de óleo',
  'Oil pressure': 'Pressão do óleo',
  'Fuel pressure': 'Pressão de combustível',
  'Fuel system': 'Sistema de combustível',
  'Fuel pump': 'Bomba de combustível',
  'Out of fuel': 'Sem combustível',
  'Puncture': 'Pneu furado',
  'Tyre': 'Pneu',
  'Wheel': 'Roda',
  'Wheel nut': 'Porca da roda',
  'Front wing': 'Asa dianteira',
  'Rear wing': 'Asa traseira',
  'Throttle': 'Acelerador',
  'Pneumatics': 'Pneumática',
  'Vibrations': 'Vibrações',
  'Mechanical': 'Problema mecânico',
  'Debris': 'Detritos',
  'Fire': 'Incêndio',
  'Illness': 'Doença',
  'Injury': 'Lesão',
};

/** Traduz o status de um resultado. `lapsDown` = voltas atrás do vencedor (para "Lapped"). */
export const translateStatus = (status: string, lang: 'pt' | 'en', lapsDown = 0): string => {
  const lapped = status === 'Lapped' || /^\+\d+ Laps?$/.test(status);
  if (lapped && lapsDown > 0) {
    if (lang === 'pt') return `+${lapsDown} ${lapsDown === 1 ? 'volta' : 'voltas'}`;
    return `+${lapsDown} ${lapsDown === 1 ? 'Lap' : 'Laps'}`;
  }
  if (lang === 'en') return status;
  return statusPt[status] ?? status;
};