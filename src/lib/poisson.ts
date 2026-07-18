// Modelo de Poisson para cálculo de probabilidades de futebol

// Fator de vantagem do mandante (home advantage)
const HOME_ADVANTAGE = 1.15;

// Média de gols na liga (para normalização)
const LEAGUE_AVG_GOALS = 2.5;

/**
 * Calcula a probabilidade de Poisson para k eventos com média lambda
 */
function poissonProbability(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export interface MatchPrediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  mostLikelyScore: { home: number; away: number; probability: number };
  over25Prob: number;
  under25Prob: number;
  bttsProb: number; // ambos marcam
  topScores: { home: number; away: number; probability: number }[];
  scoreMatrix: number[][];
}

/**
 * Calcula a expectativa de gols para cada time baseado em suas estatísticas
 * Usa a média entre o poder de ataque do mandante e a fragilidade defensiva do visitante
 */
function calculateExpectedGoals(
  homeAttack: number,
  homeDefense: number,
  awayAttack: number,
  awayDefense: number
): { home: number; away: number } {
  // Média de gols esperados: combina ataque de um com defesa do outro
  const homeExpected = ((homeAttack + awayDefense) / 2) * HOME_ADVANTAGE;
  const awayExpected = ((awayAttack + homeDefense) / 2) / HOME_ADVANTAGE;

  return {
    home: Math.max(0.2, Math.min(5, homeExpected)),
    away: Math.max(0.2, Math.min(5, awayExpected)),
  };
}

/**
 * Calcula todas as probabilidades para uma partida
 */
export function predictMatch(
  homeAttack: number,
  homeDefense: number,
  awayAttack: number,
  awayDefense: number
): MatchPrediction {
  const { home: lambdaHome, away: lambdaAway } = calculateExpectedGoals(
    homeAttack,
    homeDefense,
    awayAttack,
    awayDefense
  );

  // Matriz de placares (0-5 gols cada time)
  const maxGoals = 6;
  const scoreMatrix: number[][] = [];

  for (let i = 0; i < maxGoals; i++) {
    scoreMatrix[i] = [];
    for (let j = 0; j < maxGoals; j++) {
      scoreMatrix[i][j] =
        poissonProbability(i, lambdaHome) * poissonProbability(j, lambdaAway);
    }
  }

  // Probabilidades de resultado
  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;

  for (let i = 0; i < maxGoals; i++) {
    for (let j = 0; j < maxGoals; j++) {
      if (i > j) homeWinProb += scoreMatrix[i][j];
      else if (i === j) drawProb += scoreMatrix[i][j];
      else awayWinProb += scoreMatrix[i][j];
    }
  }

  // Placar mais provável
  let mostLikelyScore = { home: 0, away: 0, probability: 0 };
  const allScores: { home: number; away: number; probability: number }[] = [];

  for (let i = 0; i < maxGoals; i++) {
    for (let j = 0; j < maxGoals; j++) {
      const prob = scoreMatrix[i][j];
      allScores.push({ home: i, away: j, probability: prob });
      if (prob > mostLikelyScore.probability) {
        mostLikelyScore = { home: i, away: j, probability: prob };
      }
    }
  }

  // Top 5 placares mais prováveis
  const topScores = allScores
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  // Over/Under 2.5 gols
  let over25Prob = 0;
  let under25Prob = 0;
  for (let i = 0; i < maxGoals; i++) {
    for (let j = 0; j < maxGoals; j++) {
      if (i + j > 2) over25Prob += scoreMatrix[i][j];
      else under25Prob += scoreMatrix[i][j];
    }
  }

  // Ambos marcam (BTTS)
  let bttsProb = 0;
  for (let i = 1; i < maxGoals; i++) {
    for (let j = 1; j < maxGoals; j++) {
      bttsProb += scoreMatrix[i][j];
    }
  }

  return {
    homeWinProb: homeWinProb * 100,
    drawProb: drawProb * 100,
    awayWinProb: awayWinProb * 100,
    expectedHomeGoals: lambdaHome,
    expectedAwayGoals: lambdaAway,
    mostLikelyScore,
    over25Prob: over25Prob * 100,
    under25Prob: under25Prob * 100,
    bttsProb: bttsProb * 100,
    topScores: topScores.map((s) => ({ ...s, probability: s.probability * 100 })),
    scoreMatrix,
  };
}

/**
 * Converte probabilidade em odds decimal
 */
export function probToOdds(prob: number): number {
  return prob > 0 ? (100 / prob) : 0;
}
