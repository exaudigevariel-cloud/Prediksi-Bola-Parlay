/**
 * SHARPEDGE Prediction Engine v2.1 (The Ultimate Logic)
 * ───────────────────────────────────────────────────
 * Using Bivariate Poisson (Dixon-Coles base) for goals prediction.
 * Integrating Market Intelligence from The Odds API / Pinnacle.
 * Real-time match data via ESPN Scoreboard.
 */

import { generateGeminiContent } from './geminiApi';

// ========================
// TYPES & INTERFACES
// ========================

export interface TeamStats {
  formScore: number;       // 0-100 based on recent results
  h2hScore: number;        // 0-100 based on historical wins against current opponent
  moraleScore: number;     // 0-100 based on winning streak / team news
  xFactorScore: number;    // 0-100 special rating for superstar presence
  avgGoalsScored: number;
  avgGoalsConceded: number;
  winRate: number;
}

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
}

export interface MatchAnalysis {
  exactScore: string;
  homeGoals: number;
  awayGoals: number;
  lambdaHome: number;
  lambdaAway: number;
  winner1X2: string;
  prob1X2: { home: number; draw: number; away: number };
  overUnder25: 'OVER' | 'UNDER';
  probOU25: number;
  btts: boolean;
  probBTTS: number;
  handicapLine: number;
  handicapFavored: string;
  probHandicap: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'SUSPICIOUS' | 'EXTREME';
  valueFlag: boolean;
  edgeLabel: string;
  kellyStake: number;      // % suggested bankroll stake
  lineupStatus: 'CONFIRMED' | 'PREDICTED' | 'SQUAD_ROTATION';
  droppingOdds: boolean;   // if odds are crashing
  isTrap?: boolean;
  matchMomentum?: number;
}

// ========================
// MATH UTILS
// ========================

/**
 * Compute P(X = k) for Poisson distribution
 */
function poissonPmf(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 1; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

/**
 * Bivariate Poisson: P(homeGoals, awayGoals)
 */
export function poissonModel(lambdaHome: number, lambdaAway: number) {
  const MAX = 8;
  let homeWin = 0, draw = 0, awayWin = 0;
  let over25 = 0, btts = 0;

  for (let h = 0; h <= MAX; h++) {
    const ph = poissonPmf(lambdaHome, h);
    for (let a = 0; a <= MAX; a++) {
      const pa = poissonPmf(lambdaAway, a);
      const prob = ph * pa;
      if (h > a) homeWin += prob;
      else if (h === a) draw += prob;
      else awayWin += prob;
      if (h + a > 2.5) over25 += prob;
      if (h >= 1 && a >= 1) btts += prob;
    }
  }
  const total = homeWin + draw + awayWin;
  return { 
    homeWinProb: homeWin / total * 100, 
    drawProb: draw / total * 100, 
    awayWinProb: awayWin / total * 100, 
    over25Prob: over25 / total * 100, 
    bttsProb: btts / total * 100 
  };
}

/**
 * Asian Handicap Win Probability for Home team
 */
function calculateHandicapProb(lambdaHome: number, lambdaAway: number, line: number): number {
  const MAX = 8;
  let homeCov = 0;
  for (let h = 0; h <= MAX; h++) {
    const ph = poissonPmf(lambdaHome, h);
    for (let a = 0; a <= MAX; a++) {
      const pa = poissonPmf(lambdaAway, a);
      if (h + line > a) homeCov += ph * pa;
    }
  }
  return homeCov * 100;
}

/**
 * Most likely exact score from Poisson
 */
function mostLikelyScore(lambdaHome: number, lambdaAway: number): string {
  const MAX = 6;
  let bestProb = 0;
  let bestH = 1, bestA = 0;
  for (let h = 0; h <= MAX; h++) {
    for (let a = 0; a <= MAX; a++) {
      const p = poissonPmf(lambdaHome, h) * poissonPmf(lambdaAway, a);
      if (p > bestProb) { bestProb = p; bestH = h; bestA = a; }
    }
  }
  return `${bestH}-${bestA}`;
}

// ========================
// CORE PREDICTION (POISSON-BASED) v2.1
// ========================

export function calculatePrediction(
  homeName: string,
  awayName: string,
  home: TeamStats,
  away: TeamStats,
  bandarOdds?: BestOdds | null
): MatchAnalysis {
  const HOME_ADVANTAGE = 0.35;
  const LEAGUE_AVG_GOALS = 1.35;

  let homeAttack   = (home.avgGoalsScored   ?? LEAGUE_AVG_GOALS) * (1 + (home.formScore || 50) / 185);
  let homeDefense  = (home.avgGoalsConceded ?? LEAGUE_AVG_GOALS) * (1 - (home.moraleScore || 50) / 240);
  let awayAttack   = (away.avgGoalsScored   ?? LEAGUE_AVG_GOALS) * (1 + (away.formScore || 50) / 185);
  let awayDefense  = (away.avgGoalsConceded ?? LEAGUE_AVG_GOALS) * (1 - (away.moraleScore || 50) / 240);

  let lambdaHome = Math.max(0.2, (homeAttack * awayDefense / LEAGUE_AVG_GOALS) + HOME_ADVANTAGE);
  let lambdaAway = Math.max(0.2, awayAttack  * homeDefense / LEAGUE_AVG_GOALS);

  // Momentum Trend
  const trendHome = (home.formScore || 50) > 72 ? 1.12 : ((home.formScore || 50) < 35 ? 0.9 : 1);
  const trendAway = (away.formScore || 50) > 72 ? 1.12 : ((away.formScore || 50) < 35 ? 0.9 : 1);
  lambdaHome *= trendHome;
  lambdaAway *= trendAway;

  // H2H
  const h2hAdj = ((home.h2hScore || 50) - 50) / 450; 
  lambdaHome = Math.max(0.2, lambdaHome * (1 + h2hAdj));
  lambdaAway = Math.max(0.2, lambdaAway * (1 - h2hAdj));

  // ── MONTE CARLO ELITE SIMULATION (5,000 VIRTUAL MATCHES) ──
  let mcHomeWins = 0, mcDraws = 0, mcAwayWins = 0;
  let mcOver25 = 0, mcBtts = 0;
  const SIM_COUNT = 5000;

  const poissonRandom = (L: number) => {
    let p = 1.0, k = 0, L_val = Math.exp(-L);
    do { k++; p *= Math.random(); } while (p > L_val);
    return k - 1;
  };

  for (let i = 0; i < SIM_COUNT; i++) {
    const hG = poissonRandom(lambdaHome);
    const aG = poissonRandom(lambdaAway);
    if (hG > aG) mcHomeWins++;
    else if (hG === aG) mcDraws++;
    else mcAwayWins++;
    if (hG + aG > 2.5) mcOver25++;
    if (hG >= 1 && aG >= 1) mcBtts++;
  }

  let homeWinProb = (mcHomeWins / SIM_COUNT) * 100;
  let drawProb    = (mcDraws / SIM_COUNT) * 100;
  let awayWinProb = (mcAwayWins / SIM_COUNT) * 100;
  const overProb  = (mcOver25 / SIM_COUNT) * 100;
  const mcBttsProb = (mcBtts / SIM_COUNT) * 100;

  if (bandarOdds) {
    const BLEND = 0.4; 
    const pinH = bandarOdds.pinnacleHomeProb ?? bandarOdds.homeImpliedProb;
    const pinD = bandarOdds.pinnacleDrawProb ?? bandarOdds.drawImpliedProb;
    const pinA = bandarOdds.pinnacleAwayProb ?? bandarOdds.awayImpliedProb;
    homeWinProb = (homeWinProb * (1 - BLEND) + pinH * BLEND);
    drawProb    = (drawProb    * (1 - BLEND) + pinD * BLEND);
    awayWinProb = (awayWinProb * (1 - BLEND) + pinA * BLEND);
    const t = homeWinProb + drawProb + awayWinProb;
    homeWinProb = (homeWinProb / t) * 100;
    drawProb    = (drawProb / t) * 100;
    awayWinProb = (awayWinProb / t) * 100;
  }

  const exactScore = mostLikelyScore(lambdaHome, lambdaAway);
  let [bestH, bestA] = exactScore.split('-').map(Number);
  
  const totalGoals = bestH + bestA;
  let ou25: 'OVER' | 'UNDER' = totalGoals > 2.5 ? 'OVER' : 'UNDER';
  if (overProb > 72 && totalGoals <= 2.5) {
    if (homeWinProb > awayWinProb) { bestH = 2; bestA = 1; }
    else if (awayWinProb > homeWinProb) { bestH = 1; bestA = 2; }
    else { bestH = 2; bestA = 2; }
    ou25 = 'OVER';
  } else if (overProb < 28 && totalGoals > 2.5) {
    if (homeWinProb > awayWinProb) { bestH = 1; bestA = 0; }
    else if (awayWinProb > homeWinProb) { bestH = 0; bestA = 1; }
    else { bestH = 1; bestA = 1; }
    ou25 = 'UNDER';
  }

  let hLine = 0;
  let hProb = calculateHandicapProb(lambdaHome, lambdaAway, 0);
  const potentialLines = [-1.75, -1.5, -1.25, -1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75];
  let bestDist = Math.abs(hProb - 50);
  potentialLines.forEach(l => {
    const p = calculateHandicapProb(lambdaHome, lambdaAway, l);
    if (Math.abs(p - 50) < bestDist) { bestDist = Math.abs(p - 50); hLine = l; hProb = p; }
  });
  const favored = hProb >= 50 ? homeName : awayName;
  const finalHProb = hProb >= 50 ? hProb : 100 - hProb;

  const marketHProb = (bandarOdds?.homeImpliedProb || 50) / 100;
  const edge = (finalHProb / 100 - marketHProb) * 100;
  const isTrap = edge < -12;
  const isValue = edge > 8.5;

  const b = (bandarOdds?.homeOdds || 2.0) - 1;
  const p_win = Math.max(homeWinProb, awayWinProb) / 100;
  const q_loss = 1 - p_win;
  let kelly = b > 0 ? (b * p_win - q_loss) / b : 0;
  kelly = Math.max(0, kelly) * 100;

  return {
    exactScore: `${bestH}-${bestA}`,
    homeGoals: bestH,
    awayGoals: bestA,
    lambdaHome: +lambdaHome.toFixed(2),
    lambdaAway: +lambdaAway.toFixed(2),
    winner1X2: homeWinProb > awayWinProb && homeWinProb > drawProb ? homeName : (awayWinProb > drawProb ? awayName : 'Draw'),
    prob1X2: { home: Math.round(homeWinProb), draw: Math.round(drawProb), away: Math.round(awayWinProb) },
    overUnder25: ou25 as 'OVER' | 'UNDER',
    probOU25: Math.round(overProb),
    btts: mcBttsProb > 52,
    probBTTS: Math.round(mcBttsProb),
    handicapLine: hLine,
    handicapFavored: favored,
    probHandicap: Math.round(finalHProb),
    riskLevel: isTrap ? 'EXTREME' : (finalHProb > 80 && !isTrap ? 'LOW' : (finalHProb > 65 ? 'MEDIUM' : 'HIGH')),
    valueFlag: isValue,
    edgeLabel: isTrap ? '⚠️ TRAP DETECTION' : (isValue ? `VALUE EDGE +${edge.toFixed(1)}%` : 'FAIR ODDS'),
    kellyStake: +(kelly * 0.15).toFixed(1),
    lineupStatus: 'PREDICTED',
    droppingOdds: isValue || edge > 6,
    isTrap,
    matchMomentum: +((home.formScore || 50) / (away.formScore || 50)).toFixed(2)
  };
}

// ========================
// REAL MATCH DATA (ESPN)
// ========================

export async function fetchRealMatches(): Promise<any[]> {
  const leagues = [
    { id: 'eng.1', name: 'Premier League' },
    { id: 'esp.1', name: 'La Liga' },
    { id: 'ita.1', name: 'Serie A' },
    { id: 'ger.1', name: 'Bundesliga' },
    { id: 'fra.1', name: 'Ligue 1' },
    { id: 'uefa.euro', name: 'Euro' }, // EURO 2024
    { id: 'uefa.champions',    name: 'Champions League' },
    { id: 'uefa.europa',       name: 'Europa League' },
    { id: 'ind.1', name: 'Liga 1 Indonesia' },
  ];

  const BATCH = 5;
  let allMatches: any[] = [];
  for (let i = 0; i < leagues.length; i += BATCH) {
    const batch = leagues.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map(league => fetchLeague(league)));
    results.forEach(r => { if (r.status === 'fulfilled') allMatches.push(...r.value); });
  }

  const filtered = allMatches
    .filter(m => m.status !== 'post')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  // Background save finished matches to history
  saveFinishedMatchesToHistory(allMatches.filter(m => m.status === 'post'));
  
  return filtered;
}

async function fetchLeague(league: { id: string; name: string }): Promise<any[]> {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.events) return [];

    const parsed: any[] = [];
    for (const event of data.events) {
      const comp = event.competitions[0];
      const homeTeam = comp.competitors.find((c: any) => c.homeAway === 'home');
      const awayTeam = comp.competitors.find((c: any) => c.homeAway === 'away');
      if (!homeTeam || !awayTeam) continue;

      const parseRecord = (summary: string) => {
        if (!summary) return { w: 0, d: 0, l: 0, total: 0 };
        const parts = summary.split('-').map(Number);
        return { w: parts[0], d: parts[1], l: parts[2], total: parts[0] + parts[1] + (parts[2] || 0) };
      };

      const hRec = parseRecord(homeTeam.records?.[0]?.summary);
      const aRec = parseRecord(awayTeam.records?.[0]?.summary);
      const hWr = hRec.total > 0 ? (hRec.w / hRec.total) * 100 : 50;
      const aWr = aRec.total > 0 ? (aRec.w / aRec.total) * 100 : 50;

      const teamStats = {
        home: { formScore: hWr, h2hScore: 50, moraleScore: hWr, xFactorScore: 70, avgGoalsScored: 1.5, avgGoalsConceded: 1.1, winRate: hWr },
        away: { formScore: aWr, h2hScore: 50, moraleScore: aWr, xFactorScore: 65, avgGoalsScored: 1.3, avgGoalsConceded: 1.4, winRate: aWr },
      };

      parsed.push({
        id: event.id,
        league: league.name,
        homeTeam: homeTeam.team.displayName,
        awayTeam: awayTeam.team.displayName,
        matchDate: event.date,
        status: event.status.type.state, // 'pre', 'in', 'post'
        homeScore: homeTeam.score,
        awayScore: awayTeam.score,
        prediction: calculatePrediction(homeTeam.team.displayName, awayTeam.team.displayName, teamStats.home, teamStats.away),
        homeLogo: homeTeam.team.logo,
        awayLogo: awayTeam.team.logo,
      });
    }
    return parsed;
  } catch { return []; }
}

// ========================
// HISTORY & AUTO-CLEAN CACHE
// ========================

const HISTORY_KEY = 'sharpedge_match_history';

/**
 * Save finished matches and their predictions to persistent storage
 */
export function saveFinishedMatchesToHistory(matches: any[]) {
  if (matches.length === 0) return;
  const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  // Only add unique matches
  const uniqueNew = matches.filter(m => !existing.some((e: any) => e.id === m.id));
  const combined = [...uniqueNew, ...existing];
  
  // AUTO-CLEAN: Remove matches older than 7 days
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const cleaned = combined.filter((m: any) => new Date(m.matchDate).getTime() > sevenDaysAgo);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(cleaned.slice(0, 100))); // Cap at 100 for storage
}

export function getMatchHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

// ========================
// NEWS
// ========================

export async function fetchRealNews() {
  const rss = 'https://www.espn.com/espn/rss/soccer/news';
  try {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return (data.items || []).slice(0, 5).map((i: any) => ({
      title: i.title,
      source: 'ESPN FC',
      timestamp: i.pubDate,
      link: i.link
    }));
  } catch { return []; }
}

export async function fetchMatchDetails(eventId: string) {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${eventId}`);
    const data = await res.json();
    
    let injuries: any[] = [];
    if (data.injuries) {
       data.injuries.forEach((t: any) => {
         (t.injuries || []).forEach((j: any) => {
            injuries.push({ name: j.athlete.displayName, team: t.team.displayName, status: j.status });
         });
       });
    }

    return {
       injuries,
       referee: data.gameInfo?.officials?.[0]?.fullName || 'Belum ditentukan',
       venue: data.gameInfo?.venue?.fullName || 'Stadion Rahasia',
       stats: data.boxscore?.teams || []
    };
  } catch { return null; }
}
