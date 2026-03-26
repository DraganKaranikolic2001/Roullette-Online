import { WebSocketServer } from "ws";
import { betStrategies } from "./betStrategies.mjs";
const PORT = 1337;

const wss = new WebSocketServer({ port: PORT });

// za corner i split vrednosti su kao id-jevi
let numberStruct = [
  { number: 0, parity: null, color: "green", split: [1, 2, 3] },
  { number: 1, parity: "odd", color: "red", corner: 1, split: [1, 4, 6] },
  {
    number: 2,
    parity: "even",
    color: "black",
    corner: [1, 2],
    split: [2, 4, 5, 7],
  },
  { number: 3, parity: "odd", color: "red", corner: 2, split: [3, 5, 8] },
  {
    number: 4,
    parity: "even",
    color: "black",
    corner: [1, 3],
    split: [6, 9, 11],
  },
  {
    number: 5,
    parity: "odd",
    color: "red",
    corner: [1, 2, 3, 4],
    split: [7, 9, 10, 12],
  },
  {
    number: 6,
    parity: "even",
    color: "black",
    corner: [2, 4],
    split: [8, 10, 13],
  },
  {
    number: 7,
    parity: "odd",
    color: "red",
    corner: [3, 5],
    split: [11, 14, 16],
  },
  {
    number: 8,
    parity: "even",
    color: "black",
    corner: [3, 4, 5, 6],
    split: [12, 14, 15, 17],
  },
  {
    number: 9,
    parity: "odd",
    color: "red",
    corner: [4, 6],
    split: [13, 15, 18],
  },
  {
    number: 10,
    parity: "even",
    color: "black",
    corner: [5, 7],
    split: [16, 19, 21],
  },
  {
    number: 11,
    parity: "odd",
    color: "black",
    corner: [5, 6, 7, 8],
    split: [17, 19, 20, 22],
  },
  {
    number: 12,
    parity: "even",
    color: "red",
    corner: [6, 8],
    split: [18, 20, 23],
  },
  {
    number: 13,
    parity: "odd",
    color: "black",
    corner: [7, 9],
    split: [21, 24, 26],
  },
  {
    number: 14,
    parity: "even",
    color: "red",
    corner: [7, 8, 9, 10],
    split: [22, 24, 25, 27],
  },
  {
    number: 15,
    parity: "odd",
    color: "black",
    corner: [8, 10],
    split: [23, 25, 28],
  },
  {
    number: 16,
    parity: "even",
    color: "red",
    corner: [9, 11],
    split: [26, 29, 31],
  },
  {
    number: 17,
    parity: "odd",
    color: "black",
    corner: [9, 10, 11, 12],
    split: [27, 29, 30, 32],
  },
  {
    number: 18,
    parity: "even",
    color: "red",
    corner: [10, 12],
    split: [28, 30, 33],
  },
  {
    number: 19,
    parity: "odd",
    color: "red",
    corner: [11, 13],
    split: [31, 34, 36],
  },
  {
    number: 20,
    parity: "even",
    color: "black",
    corner: [11, 12, 13, 14],
    split: [32, 34, 35, 37],
  },
  {
    number: 21,
    parity: "odd",
    color: "red",
    corner: [12, 14],
    split: [33, 35, 38],
  },
  {
    number: 22,
    parity: "even",
    color: "black",
    corner: [13, 15],
    split: [36, 39, 41],
  },
  {
    number: 23,
    parity: "odd",
    color: "red",
    corner: [13, 14, 15, 16],
    split: [37, 39, 40, 42],
  },
  {
    number: 24,
    parity: "even",
    color: "black",
    corner: [14, 16],
    split: [38, 40, 43],
  },
  {
    number: 25,
    parity: "odd",
    color: "red",
    corner: [15, 17],
    split: [41, 44, 46],
  },
  {
    number: 26,
    parity: "even",
    color: "black",
    corner: [15, 16, 17, 18],
    split: [42, 44, 45, 47],
  },
  {
    number: 27,
    parity: "odd",
    color: "red",
    corner: [16, 18],
    split: [43, 45, 48],
  },
  {
    number: 28,
    parity: "even",
    color: "black",
    corner: [17, 19],
    split: [46, 49, 51],
  },
  {
    number: 29,
    parity: "odd",
    color: "black",
    corner: [17, 18, 19, 20],
    split: [47, 49, 50, 52],
  },
  {
    number: 30,
    parity: "even",
    color: "red",
    corner: [18, 20],
    split: [48, 50, 53],
  },
  {
    number: 31,
    parity: "odd",
    color: "black",
    corner: [19, 21],
    split: [51, 54, 56],
  },
  {
    number: 32,
    parity: "even",
    color: "red",
    corner: [19, 20, 21, 22],
    split: [52, 54, 55, 57],
  },
  {
    number: 33,
    parity: "odd",
    color: "black",
    corner: [20, 22],
    split: [53, 55, 58],
  },
  { number: 34, parity: "even", color: "red", corner: 21, split: [56, 59] },
  {
    number: 35,
    parity: "odd",
    color: "black",
    corner: [21, 22],
    split: [57, 59, 60],
  },
  { number: 36, parity: "even", color: "red", corner: 22, split: [58, 60] },
];

let gameState = {
  currentBalance: 5000,
  tableLimit: 10000,
  minBet: 10,
  maxBet: 500,
  availableChips: [10, 20, 50, 100, 200],
};

//CONNECTION HANDLER
wss.on("connection", (ws) => {
  console.log("Novi klijent konektovan");

  //  INIT PORUKU
  const initData = {
    type: "init",
    balance: gameState.currentBalance,
    availableChips: gameState.availableChips,
    tableLimit: gameState.tableLimit,
    enabledBets: gameState.enabledBets,
    timestamp: Date.now(),
  };

  ws.send(JSON.stringify(initData));
  console.log("Poslata init data:", initData);

  // MESSAGE HANDLER
  ws.on("message", (message) => {
    try {
      // console.log("Strategije: ", betStrategies);
      const data = JSON.parse(message);
      console.log("Primljena poruka od klijenta:", data);

      // Generiši ruku
      const serverHand = generateHand();
      console.log("Server generisao:", serverHand);

      // Proveri bet
      const result = checkGuess(data, serverHand);
      console.log(" Rezultat:", result);

      // Ažuriraj balance
      const netWin = result.win - result.totalBet;
      gameState.currentBalance += netWin;

      // Dodaj balance u rezultat
      result.newBalance = gameState.currentBalance;
      result.type = "spinResult";

      ws.send(JSON.stringify(result));

      console.log(
        `Balance update: ${result.totalBet} bet, ${result.win} win, novi balance: ${gameState.currentBalance}`,
      );
    } catch (error) {
      console.error("Error parsing JSON:", error.message);
    }
  });

  ws.on("close", () => {
    console.log(" Klijent diskonektovan");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
  console.log(` WebSocket server pokrenut na ws://localhost:${PORT}`);
});

//eero handling za ceo proces
["uncaughtException", "unhandledRejection"].forEach((event) =>
  process.on(event, (err) => {
    console.error(`Problem! event: ${event}, msg: ${err.stack || err}`);
  }),
);

function checkGuess(data, serverHand) {
  let message = "";
  let success = false;
  let win = 0;
  const winDetails = [];
  const clientGuess = {
    number: [],
    parity: null,
    corner: [],
    color: null,
    client2x1: null,
    thirdTable: null,
    halfTable: null,
    splits: [],
    triple: [],
  };
  console.log("Pobeda :", winDetails);
  data.bets.forEach((bet) => {
    const strategy = betStrategies[bet.type];
    if (!strategy) return;
    if (strategy.storeClient) {
      strategy.storeClient(bet, clientGuess);
    }

    // Provera da li je pogodio
    if (strategy.check(bet, serverHand)) {
      success = true;

      // Računanje dobitka
      const winAmount = bet.amount * strategy.multiplier;
      win += winAmount;

      // Dodavanje detalja
      winDetails.push(strategy.getWinDetails(bet, winAmount));

      // Poruka
      const newMessage =
        typeof strategy.message === "function"
          ? strategy.message(bet)
          : strategy.message;

      message = message ? `${message} + ${newMessage}` : newMessage;
    }
  });

  if (!success) {
    message = "Kuco sve si promašio :(";
  }

  return {
    success,
    message,
    win,
    totalBet: data.betAmount,
    winningDetails: winDetails,
    clientGuess,
    serverResult: {
      number: serverHand.number,
      parity: serverHand.parity,
      color: serverHand.color,
      corners: serverHand.corner,
      splits: serverHand.split,
    },
    at: new Date().toISOString(),
  };
}

function generateHand() {
  let rng = generateRandomNumber(numberStruct.length);
  return numberStruct[rng];
}

function generateRandomNumber(n) {
  return Math.floor(Math.random() * n);
}
// sa servera salje init poruku u kojoj su definisani betovi za cipove i pocetni kredit i dodati mogucnost kao slider za vise cipova da se prikazuju
