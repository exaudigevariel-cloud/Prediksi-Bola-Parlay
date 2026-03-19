/**
 * API-SPORTS (api-sports.io) — Key Rotation Engine
 * Mengelola 3 API Key (masing-masing 100 req/hari) untuk data odds bandar.
 */

const API_SPORTS_BASE = 'https://v3.football.api-sports.io';

// Key pool dari .env (Cloudflare)
const apiSportsKeys: string[] = [
  (import.meta as any).env?.VITE_API_SPORT_KEY_1 || '',
  (import.meta as any).env?.VITE_API_SPORT_KEY_2 || '',
  (import.meta as any).env?.VITE_API_SPORT_KEY_3 || '',
].filter(k => k.trim() !== '');

let currentKeyIdx = 0;
const exhaustedKeys = new Set<number>();

function getActiveKey(): string | null {
  for (let i = 0; i < apiSportsKeys.length; i++) {
    const idx = (currentKeyIdx + i) % apiSportsKeys.length;
    if (!exhaustedKeys.has(idx)) {
      currentKeyIdx = idx;
      return apiSportsKeys[idx];
    }
  }
  return null;
}

function markExhausted() {
  console.warn(`[APISport] Key #${currentKeyIdx + 1} limit mencapai 100/hari, merotasi...`);
  exhaustedKeys.add(currentKeyIdx);
}

// Reset setiap 24 jam (sesuai limit harian api-sports)
setInterval(() => {
  exhaustedKeys.clear();
}, 24 * 60 * 60 * 1000);

export interface BestOdds {
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  homeImpliedProb: number;
  drawImpliedProb: number;
  awayImpliedProb: number;
  pinnacleHomeProb?: number;
  pinnacleDrawProb?: number;
  pinnacleAwayProb?: number;
  source: string;
}

// Cache: league -> { data, ts }
const oddsCache = new Map<string, { data: any[]; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 60 menit (Tetap Segar & Hemat Kuota)

const LEAGUE_MAPPING: Record<string, number> = {
  // Europe
  'Premier League': 39,
  'Championship': 40,
  'La Liga': 140,
  'La Liga 2': 141,
  'Serie A': 135,
  'Serie B': 136,
  'Bundesliga': 78,
  '2. Bundesliga': 79,
  'Ligue 1': 61,
  'Ligue 2': 62,
  'Eredivisie': 88,
  'Primeira Liga': 94,
  'Süper Lig': 203,
  'Scottish Premiership': 179,
  'Belgian Pro League': 144,
  
  // Asia
  'Liga 1 Indonesia': 271,
  'Thai League 1': 296,
  'K League 1': 292,
  'J1 League': 98,
  'A-League': 188,
  'Chinese Super League': 169,
  'Saudi Pro League': 307,
  'Malaysia Super League': 298,
  
  // Americas
  'Brasileirão': 71,
  'Liga Profesional': 103,
  'MLS': 253,
  'Liga MX': 262,
  
  // Cups
  'Champions League': 2,
  'Europa League': 3,
  'Conference League': 848,
  'Copa Libertadores': 13,
  'Euro': 4,
  'Copa América': 9,
  'Nations League': 5,
  'Friendly': 10
};

export async function getOddsForMatch(
  homeTeam: string,
  awayTeam: string,
  leagueName: string
): Promise<BestOdds | null> {
  const key = getActiveKey();
  if (!key) return null;

  const leagueId = LEAGUE_MAPPING[leagueName];
  if (!leagueId) return null;

  // Check Cache
  const cached = oddsCache.get(leagueName);
  if (cached && (Date.now() - cached.ts < CACHE_TTL)) {
    return findMatchInPool(cached.data, homeTeam, awayTeam);
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const url = `${API_SPORTS_BASE}/odds?league=${leagueId}&season=2024&date=${today}`;
    
    const res = await fetch(url, {
      headers: { 'x-apisports-key': key }
    });

    if (res.status === 429 || res.status === 403) {
      markExhausted();
      return getOddsForMatch(homeTeam, awayTeam, leagueName);
    }

    const json = await res.json();
    const matches = json.response || [];
    
    oddsCache.set(leagueName, { data: matches, ts: Date.now() });
    
    return findMatchInPool(matches, homeTeam, awayTeam);
  } catch (err) {
    console.error('[APISport] Fetch Error:', err);
    return null;
  }
}

function findMatchInPool(matches: any[], home: string, away: string): BestOdds | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nHome = normalize(home);
  
  const match = matches.find(m => {
    const mHome = normalize(m.fixture.home?.name || m.teams?.home?.name || '');
    return mHome.includes(nHome.slice(0, 5)) || nHome.includes(mHome.slice(0, 5));
  });

  if (!match) return null;

  const bookie = match.bookmakers?.[0];
  const winBet = bookie?.bets?.find((b: any) => b.name === 'Match Winner');
  if (!winBet) return null;

  const v = winBet.values;
  const hOdds = v.find((x: any) => x.value === 'Home')?.odd || 0;
  const dOdds = v.find((x: any) => x.value === 'Draw')?.odd || 0;
  const aOdds = v.find((x: any) => x.value === 'Away')?.odd || 0;

  if (!hOdds) return null;

  const toProb = (dec: number) => (1 / dec) * 100;
  const total = toProb(hOdds) + toProb(dOdds) + toProb(aOdds);

  return {
    homeOdds: hOdds,
    drawOdds: dOdds,
    awayOdds: aOdds,
    homeImpliedProb: +(toProb(hOdds) / total * 100).toFixed(1),
    drawImpliedProb: +(toProb(dOdds) / total * 100).toFixed(1),
    awayImpliedProb: +(toProb(aOdds) / total * 100).toFixed(1),
    source: bookie.name
  };
}

export function hasApiSportKeys(): boolean {
  return apiSportsKeys.length > 0;
}
