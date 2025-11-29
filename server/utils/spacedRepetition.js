// spacedRepetition.js
exports.getNextReviewDate = (prevInterval, efactor, correct) => {
  let newE = efactor + (0.1 - (5 - correct) * (0.08 + (5 - correct) * 0.02));
  newE = Math.max(1.3, Math.min(newE, 2.5));
  const interval = correct ? (prevInterval === 0 ? 1 : prevInterval * newE) : 1;
  const days = Math.round(interval);
  const next = new Date();
  next.setDate(next.getDate() + days);
  return { days, newE, nextReviewDate: next };
};
