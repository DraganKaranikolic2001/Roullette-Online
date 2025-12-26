// import { wrap } from "module";

// import { start } from "repl";

const gridCanvas = document.getElementById("table-selection");
const ctx = gridCanvas.getContext("2d");

const canvas = document.getElementById("canvasNumber");
const ctxNum = canvas.getContext("2d");
let totalBet = 0;
let playerBalance = 0;
let avaliableChips = [];
let bettingZones = [];
let hoveredZone = null;
let placedChips = [];
let selectedChipValue = 10;
const winDiv = document.getElementById("winAmount");
const betDiv = document.getElementById("betAmount");

document.getElementById("start").addEventListener("click", (ev) => spin());
const chipImage = new Image();
chipImage.src = "images/chips/chip-active6.png";

function setSelectedChipValue(value) {
  if (![10, 20, 50, 100, 200].includes(value)) {
    console.error(`Nevalidna vrednost čipa: ${value}`);
    return;
  }
  selectedChipValue = value;
  console.log(`Izabran čip vrednosti: ${value}`);
}

function spin() {
  const messages = document.getElementById("messages");
  const socket = new WebSocket("ws://localhost:1337");
  socket.onopen = (event) => {
    // console.log("Web socket is connected");
    // const id = Math.round(Math.random() * 100);
    // console.log("sending...", id);

    // console.log(hand);
    const dataToSend = {
      bets: placedChips,
      betAmount: totalBet,
    };
    // console.log(dataToSend);
    const data = JSON.stringify(dataToSend);
    console.log(data);
    socket.send(data);
    const roulTable = document.querySelectorAll(".buttonB");
    roulTable.forEach((r) => {
      console.log(r);
      r.style.pointerEvents = "none";
    });
  };
  socket.onmessage = (msg) => {
    const message = msg.data;
    // console.log("I got a message", message);
    const result = JSON.parse(msg.data);
    // console.log("Parsed result:", result);
    if (result.type === "init") {
      handleInitData(result);
    } else if (result.type === "spinResult") {
      handleSpinResult(result);
    } else {
      // Fallback za tvoj stari format (ako nema type)
      handleSpinResult(result);
    }
  };
  socket.onerror = (error) => console.error("Web socket error", error);
  socket.onclose = (event) =>
    console.log("Disconected from the web socket server");

  setTimeout(() => {
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    placedChips.splice(0);
    winDiv.innerHTML = "";
    betDiv.innerHTML = " ";
    totalBet = 0;
    const roulTable = document.querySelectorAll(".buttonB");
    roulTable.forEach((r) => {
      r.style.pointerEvents = "all";
    });
    console.log(placedChips);
  }, 6000);
}
function handleInitData(data) {
  playerBalance = data.balance;
  tableLimit = data.tableLimit;
  console.log(" Inicijalni balance:", playerBalance);
  updateBalanceDisplay();
}
function handleSpinResult(data) {
  const imageNumber = data.serverResult.number;

  if (data.newBalance !== undefined) {
    playerBalance = data.newBalance;
    updateBalanceDisplay();
    console.log(`💰 Novi balance: ${playerBalance}`);
  }

  drawNumberWin(imageNumber);

  winDiv.innerHTML = data.win;
}

// 🎯 NOVA FUNKCIJA - Ažuriraj prikaz balance-a
function updateBalanceDisplay() {
  const balanceEl = document.getElementById("balanceAmount");
  if (balanceEl) {
    balanceEl.innerHTML = playerBalance;

    // 🎯 OPCIONO - Animacija promene
    balanceEl.classList.add("balance-updated");
    setTimeout(() => {
      balanceEl.classList.remove("balance-updated");
    }, 500);
  }
}
function drawNumberWin(n) {
  const numberObject = numbers.find((num) => num.id === n);

  const dpr = window.devicePixelRatio || 1;

  // CSS veličina
  const cssWidth = canvas.offsetWidth;
  const cssHeight = canvas.offsetHeight;

  // Canvas buffer veličina
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  // Scale canvas context da odgovara DPR
  ctxNum.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Očisti canvas
  ctxNum.clearRect(0, 0, cssWidth, cssHeight);

  // Učitaj i nacrtaj sliku
  const image = new Image();
  image.onload = () => {
    ctxNum.drawImage(image, 0, 0, cssWidth, cssHeight);
  };
  image.onerror = () => {
    console.error(`❌ Failed to load image: ${numberObject.src}`);
  };

  image.src = numberObject.src;
}
function initGrid() {
  const wrapper = document.querySelector(".table-wrapper");
  gridCanvas.width = wrapper.offsetWidth;
  gridCanvas.height = wrapper.offsetHeight;

  // console.log(
  // `Canvas dimenzije su width: ${gridCanvas.width}, height: ${gridCanvas.height}`
  // );
  createBettingZones();
  drawGrid();
  setTimeout(initBetHighlighting, 100);

  const lineCanvas = document.getElementById("lineCanvas");
  const ctxLine = lineCanvas.getContext("2d");

  const maxX = lineCanvas.width;
  const maxY = lineCanvas.height;

  ctxLine.strokeStyle = "#FF0000"; // Crvena linija
  ctxLine.shadowColor = "#00FFFF";
  ctxLine.shadowBlur = 15;
  ctxLine.shadowOffsetX = 0;
  ctxLine.shadowOffsetY = 0;
  ctxLine.lineWidth = 12;
  ctxLine.lineJoin = "round";
  ctxLine.lineCap = "round";
  ctxLine.beginPath();
  ctxLine.moveTo(0, maxY - 8 + 0.5);
  ctxLine.lineTo(maxX / 4, maxY - 8 + 0.5);
  ctxLine.stroke();
  ctxLine.beginPath();
  ctxLine.lineJoin = "miter";
  ctxLine.lineWidth = 5;
  ctxLine.moveTo(maxX / 4 + 3.5, maxY - 8 + 0.5);
  ctxLine.lineTo(maxX / 2, 3 + 2.5);

  ctxLine.moveTo(maxX / 2, 3 + 2.5);
  ctxLine.lineTo((maxX * 3) / 4 - 3.5, maxY - 8 + 0.5);
  ctxLine.stroke();
  ctxLine.beginPath();

  ctxLine.lineWidth = 12;
  ctxLine.lineJoin = "round";
  ctxLine.moveTo((maxX * 3) / 4, maxY - 8 + 0.5);
  ctxLine.lineTo(maxX, maxY - 8 + 0.5);
  ctxLine.stroke();

  // gridCanvas.addEventListener("mousemove", handleMouseMove);
  // gridCanvas.addEventListener("mouseleave", handleMouseLeave);
  // gridCanvas.addEventListener("click", handleClick);

  // console.log("Table selection inicijalizovan!");
}
function drawChipValue() {
  const chips = document.querySelectorAll(".chip");
  const values = [10, 20, 50, 100, 200];

  chips.forEach((c, index) => {
    c.textContent = values[index];
  });
}
drawChipValue();
function drawChip(x, y, amount, chipValue) {
  const pixelX = (x / 100) * gridCanvas.width;
  const pixelY = (y / 100) * gridCanvas.height;

  const chipSize = Math.min(gridCanvas.width, gridCanvas.height) * 0.1;
  // console.log(`PixelX : ${pixelX}`);
  // console.log(`PixelY :  ${pixelY}`);
  // console.log(`chipSize:  ${chipSize}`);
  // const chipImage = chipImages[chipValue];
  if (chipImage && chipImage.complete) {
    const chipX = pixelX - chipSize / 2;
    const chipY = pixelY - chipSize / 2;

    // console.log(`ChipX ${chipX}`);
    // console.log(`ChipY ${chipY}`);

    ctx.drawImage(chipImage, chipX, chipY, chipSize, chipSize);
  } else {
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, chipSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  const textY = pixelY + chipSize / 5 - 4.5;

  ctx.font = `bold ${chipSize * 0.25}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseLine = "bottom";

  // Tekst sa iznosom
  ctx.fillStyle = "#000000";
  ctx.fillText(amount, pixelX, textY);
}

// Funkcija za iscrtavanje svih čipova
function redrawAllChips() {
  // Očistimo canvas
  ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

  // Ponovo nacrtamo sve čipove
  placedChips.forEach((chip) => {
    drawChip(chip.x, chip.y, chip.amount, chip.chipValue);
  });
  // console.log(placedChips);
}
function handleBetClick(event) {
  const btn = event.target;
  const type = btn.dataset.type;
  const numbers = JSON.parse(btn.dataset.numbers);

  // console.log("KLIK DETALJI");
  // console.log("Tip bet-a:", type);
  // console.log("Broj(evi):", numbers);
  // console.log("X u procentima :", btn.style.left);
  // console.log("Y u procentima :", btn.style.top);

  // Dobijamo poziciju dugmeta
  const rect = btn.getBoundingClientRect();
  const canvasRect = gridCanvas.getBoundingClientRect();

  let xPercent = parseFloat(btn.dataset.chipX);
  let yPercent = parseFloat(btn.dataset.chipY);

  // Provera da li već postoji čip na ovoj poziciji
  const existingChipIndex = placedChips.findIndex(
    (chip) =>
      Math.abs(chip.x - xPercent) < 0.5 && Math.abs(chip.y - yPercent) < 0.5
  );

  if (existingChipIndex !== -1) {
    placedChips[existingChipIndex].amount += selectedChipValue;
    totalBet += selectedChipValue;
    // console.log(" Dodajem na postojeći čip:");
    // console.log(- Slika čipa: ${placedChips[existingChipIndex].chipValue} (NE MENJA SE!));
    // console.log(`Novi ukupan iznos: ${placedChips[existingChipIndex].amount}` );
    // console.log(` Dodato: ${selectedChipValue}`);
  } else {
    totalBet += selectedChipValue;
    const chip = {
      x: xPercent,
      y: yPercent,
      amount: selectedChipValue,
      chipValue: selectedChipValue,
      type: type,
      numbers: numbers,
    };
    placedChips.push(chip);
    // console.log("Novi čip postavljen:");
    // console.log(`Slika čipa: ${chip.chipValue}`);
    // console.log(`Iznos: ${chip.amount}`);
  }
  document.getElementById("betAmount").innerHTML = totalBet;
  // Ponovo crtamo sve čipove
  redrawAllChips();

  // if (type === "straight") {
  //   console.log(`Kliknuo si direktan bet na broj ${numbers[0]}`);
  // } else if (type === "split") {
  //   console.log(`Kliknuo si split bet između ${numbers[0]} i ${numbers[1]}`);
  // } else if (type === "corner") {
  //   console.log(`Kliknuo si corner bet na brojeve ${numbers.join(", ")}`);
  // } else if (type === "triple") {
  //   console.log(`Kliknuo si triple bet na brojeve ${numbers.join(", ")}`);
  // }
}
initGrid();

const chipValues = {
  chip1: 10,
  chip2: 20,
  chip3: 50,
  chip4: 100,
  chip5: 200,
};

function initChipSelection() {
  const chips = document.querySelectorAll(".chip");

  // console.log(chips);
  chips[0].classList.add("active");

  selectedChipValue = chipValues["chip1"];

  chips.forEach((c) => {
    c.addEventListener("click", function () {
      chips.forEach((c) => c.classList.remove("active"));

      this.classList.add("active");

      const chipId = this.id;
      selectedChipValue = chipValues[chipId];

      console.log(`Izabran chip: ${chipId}, vrednost: ${selectedChipValue}`);
    });
  });
}

initChipSelection();
function initBetHighlighting() {
  const hitArea = document.getElementById("hitarea");

  // Funkcija koja pronalazi straight bet dugme koje treba hajlajtovati
  function findStraightButton(number) {
    const buttons = hitArea.querySelectorAll(".bet-button-straight");

    for (let btn of buttons) {
      const numbers = JSON.parse(btn.dataset.numbers);
      if (numbers[0] === number) {
        return btn;
      }
      // console.log(numbers);
    }
    return null;
  }

  const complexBets = hitArea.querySelectorAll(
    ".bet-button-corner, .bet-button-split, .bet-button-triple, .bet-button-25-36, .bet-button-1-12, .bet-button-13-24, .bet-button-black, .bet-button-red, .bet-button-1-18, .bet-button-19-36, .bet-button-2x1-1, .bet-button-2x1-2, .bet-button-2x1-3"
  );

  complexBets.forEach((btn) => {
    btn.addEventListener("mouseenter", function () {
      const numbers = JSON.parse(this.dataset.numbers);

      numbers.forEach((num) => {
        const straightBtn = findStraightButton(num);
        if (straightBtn) {
          straightBtn.classList.add("highlighted");
        }
      });
    });

    btn.addEventListener("mouseleave", function () {
      const highlightedButtons = hitArea.querySelectorAll(
        ".bet-button-straight.highlighted"
      );
      highlightedButtons.forEach((btn) => {
        btn.classList.remove("highlighted");
      });
    });
  });

  // console.log(
  //   `Bet highlighting inicijalizovan za ${complexBets.length} dugmadi`
  // );
}

// Pozovi nakon što se inicijalizuje grid
