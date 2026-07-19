// Mesmo modelo de src/lib/poisson.ts, portado pra JS puro (sem TypeScript)
// pra rodar como script standalone de geração de posts.

const HOME_ADVANTAGE = 1.15;

function poissonProbability(k, lambda) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function calculateExpectedGoals(homeAttack, homeDefense, awayAttack, awayDefense) {
  const homeExpected = ((homeAttack + awayDefense) / 2) * HOME_ADVANTAGE;
  const awayExpected = ((awayAttack + homeDefense) / 2) / HOME_ADVANTAGE;
  return {
    home: Math.max(0.2, Math.min(5, homeExpected)),
    away: Math.max(0.2, Math.min(5, awayExpected)),
  };
}

export function predictMatch(homeAttack, homeDefense, awayAttack, awayDefense) {
  const { home: lambdaHome, away: lambdaAway } = calculateExpectedGoals(
    homeAttack, homeDefense, awayAttack, awayDefense
  );

  const maxGoals = 6;
  const scoreMatrix = [];
  for (let i = 0; i < maxGoals; i++) {
    scoreMatrix[i] = [];
    for (let j = 0; j < maxGoals; j++) {
      scoreMatrix[i][j] = poissonProbability(i, lambdaHome) * poissonProbability(j, lambdaAway);
    }
  }

  let homeWinProb = 0, drawProb = 0, awayWinProb = 0;
  for (let i = 0; i < maxGoals; i++) {
    for (let j = 0; j < maxGoals; j++) {
      if (i > j) homeWinProb += scoreMatrix[i][j];
      else if (i === j) drawProb += scoreMatrix[i][j];
      else awayWinProb += scoreMatrix[i][j];
    }
  }

  let mostLikelyScore = { home: 0, away: 0, probability: 0 };
  const allScores = [];
  for (let i = 0; i < maxGoals; i++) {
    for (let j = 0; j < maxGoals; j++) {
      const prob = scoreMatrix[i][j];
      allScores.push({ home: i, away: j, probability: prob });
      if (prob > mostLikelyScore.probability) mostLikelyScore = { home: i, away: j, probability: prob };
    }
  }
  const topScores = allScores.sort((a, b) => b.probability - a.probability).slice(0, 5);

  let over25Prob = 0, under25Prob = 0;
  for (let i = 0; i < maxGoals; i++) {
    for (let j = 0; j < maxGoals; j++) {
      if (i + j > 2) over25Prob += scoreMatrix[i][j];
      else under25Prob += scoreMatrix[i][j];
    }
  }

  let bttsProb = 0;
  for (let i = 1; i < maxGoals; i++) {
    for (let j = 1; j < maxGoals; j++) bttsProb += scoreMatrix[i][j];
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
  };
}
