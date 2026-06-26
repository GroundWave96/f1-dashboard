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
    'Swiss': 'Suíço'
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
    'Saudi': 'sa'
  };
  return map[country] || 'un';
};