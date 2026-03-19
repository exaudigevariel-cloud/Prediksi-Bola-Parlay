import { calculatePrediction } from '../src/lib/predictionEngine';

// Mock data for 1000 iterations
const teams = [
  { name: 'Man City', attack: 2.5, defense: 0.8, form: 90, h2h: 70 },
  { name: 'Real Madrid', attack: 2.3, defense: 0.9, form: 85, h2h: 60 },
  { name: 'Burnley', attack: 0.8, defense: 1.8, form: 20, h2h: 10 },
  { name: 'Liverpool', attack: 2.4, defense: 1.0, form: 80, h2h: 55 },
  { name: 'Everton', attack: 0.9, defense: 1.4, form: 40, h2h: 30 },
];

async function runSimulation() {
  console.log('--- SHARPEDGE 1000X LOGIC SIMULATION ---');
  let inconsistencies = 0;
  let highValueEdges = 0;
  let totalKelly = 0;

  for (let i = 0; i < 1000; i++) {
    const homeTeam = teams[Math.floor(Math.random() * teams.length)];
    const awayTeam = teams[Math.floor(Math.random() * teams.length)];
    if (homeTeam.name === awayTeam.name) { i--; continue; }

    const homeStats: any = {
      avgGoalsScored: homeTeam.attack,
      avgGoalsConceded: homeTeam.defense,
      formScore: homeTeam.form,
      moraleScore: homeTeam.form,
      h2hScore: homeTeam.h2h
    };
    const awayStats: any = {
      avgGoalsScored: awayTeam.attack,
      avgGoalsConceded: awayTeam.defense,
      formScore: awayTeam.form,
      moraleScore: awayTeam.form,
      h2hScore: awayTeam.h2h
    };

    const bandarOdds: any = {
      homeOdds: 1.5 + Math.random() * 3,
      homeImpliedProb: 40 + Math.random() * 30
    };

    const analysis = calculatePrediction(homeTeam.name, awayTeam.name, homeStats, awayStats, bandarOdds);

    // 1. Check Score vs O/U Consistency
    const totalGoals = analysis.homeGoals + analysis.awayGoals;
    if (analysis.overUnder25 === 'OVER' && totalGoals < 3) inconsistencies++;
    if (analysis.overUnder25 === 'UNDER' && totalGoals >= 3) inconsistencies++;

    // 2. Value Edge Stats
    if (analysis.valueFlag) highValueEdges++;
    totalKelly += analysis.kellyStake;
  }

  console.log(`Simulation Complete.`);
  console.log(`Inconsistencies (Score vs O/U): ${inconsistencies} (Must be 0!)`);
  console.log(`Value Edge Opportunities: ${highValueEdges}/1000`);
  console.log(`Avg Kelly Stake Recommendation: ${(totalKelly / 1000).toFixed(2)}%`);
  
  if (inconsistencies === 0) {
    console.log('✅ LOGIC VERIFIED: UNIFIED DATA MATRIX STABLE.');
  } else {
    console.log('❌ LOGIC ERROR: DISCREPANCY DETECTED.');
  }
}

runSimulation();
