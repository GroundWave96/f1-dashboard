import { apiGet } from "./api";

// Só precisamos do total de registros de cada consulta, então pedimos 1 item por página
const count = async (path: string) => Number((await apiGet(`${path}.json?limit=1`)).total);

export async function loadDriverCareer(driverId: string) {
  const base = `drivers/${driverId}`;
  const [races, wins, second, third, poles] = await Promise.all([
    count(`${base}/results`),
    count(`${base}/results/1`),
    count(`${base}/results/2`),
    count(`${base}/results/3`),
    // Largadas na pole: o grid existe para toda a história da F1, ao contrário dos dados de qualificação
    count(`${base}/grid/1/results`),
  ]);
  return { races, wins, podiums: wins + second + third, poles };
}

export async function loadConstructorCareer(constructorId: string) {
  const base = `constructors/${constructorId}`;
  const [wins, second, third, poles] = await Promise.all([
    count(`${base}/results/1`),
    count(`${base}/results/2`),
    count(`${base}/results/3`),
    count(`${base}/grid/1/results`),
  ]);
  return { wins, podiums: wins + second + third, poles };
}
