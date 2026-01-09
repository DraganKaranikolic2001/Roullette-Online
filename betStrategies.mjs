export const betStrategies = {
  straight: {
    multiplier: 35,
    check: (bet, serverHand) => bet.numbers[0] === serverHand.number,
    message: "Bravo pogodio si broj",
    storeClient: (bet, clientGuess) => clientGuess.number.push(bet.numbers[0]),
    getWinDetails: (bet, winAmount) => ({
      type: "straight",
      bet: bet.numbers[0],
      amount: bet.amount,
      winOnNumber: winAmount,
    }),
  },
  corner: {
    multiplier: 8,
    check: (bet, serverHand) => bet.numbers.includes(serverHand.number),
    message: "Bravo pogodio si corner",
    storeClient: (bet, clientGuess) => clientGuess.corner.push(bet.numbers),
    getWinDetails: (bet, winAmount) => ({
      type: "corner",
      bet: bet.numbers,
      amount: bet.amount,
      win: winAmount,
    }),
  },
  triple: {
    multiplier: 12,
    check: (bet, serverHand) => bet.numbers.includes(serverHand.number),
    message: "Bravo pogodio si triple",
    storeClient: (bet, clientGuess) => clientGuess.triple.push(bet.numbers),
    getWinDetails: (bet, winAmount) => ({
      type: "triple",
      bet: bet.numbers,
      amount: bet.amount,
      win: winAmount,
    }),
  },
  split: {
    multiplier: 18,
    check: (bet, serverHand) => bet.numbers.includes(serverHand.number),
    message: "Bravo pogodio si split",
    storeClient: (bet, clientGuess) => clientGuess.splits.push(bet.numbers),
    getWinDetails: (bet, winAmount) => ({
      type: "split",
      bet: bet.numbers,
      amount: bet.amount,
      win: winAmount,
    }),
  },
  parity: {
    multiplier: 2,
    check: (bet, serverHand) =>
      serverHand.parity !== null && bet.value === serverHand.parity,
    message: "Bravo pogodio si parity",
    storeClient: (bet, clientGuess) => (clientGuess.parity = bet.parity),
    getWinDetails: (bet, winAmount) => ({
      type: "parity",
      bet: bet.value,
      amount: bet.amount,
      win: winAmount,
    }),
  },
  red: {
    multiplier: 2,
    check: (bet, serverHand) => bet.type === serverHand.color,
    message: "Bravo pogodio si color",
    storeClient: (bet, clientGuess) => (clientGuess.color = bet.type),
    getWinDetails: (bet, winAmount) => ({
      type: "color",
      bet: bet.type,
      amount: bet.amount,
      win: winAmount,
    }),
  },
  black: {
    multiplier: 2,
    check: (bet, serverHand) => bet.type === serverHand.color,
    message: "Bravo pogodio si corner",
    storeClient: (bet, clientGuess) => (clientGuess.color = bet.type),
    getWinDetails: (bet, winAmount) => ({
      type: "color",
      bet: bet.type,
      amount: bet.amount,
      win: winAmount,
    }),
  },
};

["2x1-1", "2x1-2", "2x1-3"].forEach((type) => {
  betStrategies[type] = {
    multiplier: 3,
    check: (bet, serverHand) => bet.numbers.includes(serverHand.number),
    message: (bet) => `Bravo pogodio si 2x1 ${bet.type}`,
    storeClient: (bet, clientGuess) => (clientGuess.client2x1 = bet.type),
    getWinDetails: (bet, winAmount) => ({
      type: "2x1",
      bet: bet.type,
      amount: bet.amount,
      win: winAmount,
    }),
  };
});

["1-12", "13-24", "25-36"].forEach((type) => {
  betStrategies[type] = {
    multiplier: 3,
    check: (bet, serverHand) => bet.numbers.includes(serverHand.number),
    message: (bet) => `Bravo pogodio si trecinu table ${bet.type}`,
    storeClient: (bet, clientGuess) => (clientGuess.thirdTable = bet.type),
    getWinDetails: (bet, winAmount) => ({
      type: "ThirdTable",
      bet: bet.type,
      amount: bet.amount,
      win: winAmount,
    }),
  };
});

["1-18", "19-36"].forEach((type) => {
  betStrategies[type] = {
    multiplier: 2,
    check: (bet, serverHand) => bet.numbers.includes(serverHand.number),
    message: (bet) => `Bravo pogodio si polovinu table ${bet.type}`,
    storeClient: (bet, clientGuess) => (clientGuess.halfTable = bet.type),
    getWinDetails: (bet, winAmount) => ({
      type: "HalfTable",
      bet: bet.type,
      amount: bet.amount,
      win: winAmount,
    }),
  };
});
