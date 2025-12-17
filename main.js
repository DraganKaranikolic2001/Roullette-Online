// import { wrap } from "module";

// import { start } from "repl";

// const messages = document.getElementById("messages");
// const socket = new WebSocket("ws://localhost:1337");
// socket.onopen = (event) => {
//   console.log("Web socket is connected");
//   // const id = Math.round(Math.random() * 100);
//   // console.log("sending...", id);
//   const hand = pickHand();
//   console.log(hand);
//   const dataToSend = {
//     ...hand,
//   };
//   const data = JSON.stringify(dataToSend);
//   socket.send(data);
// };
// socket.onmessage = (msg) => {
//   const message = msg.data;
//   console.log("I got a message", message);
//   const result = JSON.parse(msg.data);
//   console.log("Parsed result:", result);
//   // messages.innerHTML += `<br/><strong>${result.message}</strong>`;
//   // messages.innerHTML += `<br/>Client: ${result.clientGuess.number} ()`;
//   // messages.innerHTML += `<br/>Server: ${result.serverResult.number} ()<br/>`;
//   // messages.innerHTML += `<br/>Parity:  Klijent-(${result.clientGuess.parity}) / Server-(${result.serverResult.parity})<br/>`;
//   // messages.innerHTML += `<br/>Win: ({${result.win} })<br/>`;
// };
// socket.onerror = (error) => console.error("Web socket error", error);
// socket.onclose = (event) =>
//   console.log("Disconected from the web socket server");
// function pickHand() {
//   const n = numberStruct[Math.floor(Math.random() * numberStruct.length)];
//   const m = corners[Math.floor(Math.random() * corners.length)];
//   const p = parity[Math.floor(Math.random()) * 2];
//   // const m = corners[0];
//   // const n = numberStruct[0]
//   // console.log(m);
//   console.log(n);
//   //   console.log(n.bet.parity);
//   return {
//     parityGamble: p.name,
//     numberBet: n.number,
//     parityNumber: n.bet[0].parity,
//     cornerBetID: m.id,
//     cornerNumbers: m.numbers,
//     betAmountOnNumber: 20,
//     betAmountCorner: 10,
//     betAmountOnParity: 10,
//   };
// }

const gridCanvas = document.getElementById("table-selection");
const ctx = gridCanvas.getContext("2d");
let totalBet = 0;
let bettingZones = [];
let hoveredZone = null;
let placedChips = [];
let selectedChipValue = 10;
document.getElementById('start').addEventListener('click',ev =>spin());

function spin(){
  console.log("Cao");
}
const chipImage = new Image()
chipImage.src="images/chips/chip-active6.png";


function setSelectedChipValue(value) {
  if (![10, 20, 50, 100, 200].includes(value)) {
    console.error(`Nevalidna vrednost čipa: ${value}`);
    return;
  }
  selectedChipValue = value;
  console.log(`Izabran čip vrednosti: ${value}`);
}

function initGrid() {
  const wrapper = document.querySelector(".table-wrapper");
  gridCanvas.width = wrapper.offsetWidth;
  gridCanvas.height = wrapper.offsetHeight;

  console.log(
    `Canvas dimenzije su width: ${gridCanvas.width}, height: ${gridCanvas.height}`
  );

  createBettingZones();
  drawGrid();

  // gridCanvas.addEventListener("mousemove", handleMouseMove);
  // gridCanvas.addEventListener("mouseleave", handleMouseLeave);
  // gridCanvas.addEventListener("click", handleClick);

  console.log("Table selection inicijalizovan!");
}
function drawChipValue(){
  const chips= document.querySelectorAll('.chip');
  const values = [10,20,50,100,200];

  chips.forEach((c,index)=>{
    c.textContent = values[index];
  })
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
    // Ako slika nije učitana, crtamo placeholder krug
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
  console.log(placedChips);
}
function handleBetClick(event) {
  const btn = event.target;
  const type = btn.dataset.type;
  const numbers = JSON.parse(btn.dataset.numbers);

  console.log("KLIK DETALJI");
  console.log("Tip bet-a:", type);
  console.log("Broj(evi):", numbers);
  console.log("X u procentima :", btn.style.left);
  console.log("Y u procentima :", btn.style.top);

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

  if (type === "straight") {
    console.log(`Kliknuo si direktan bet na broj ${numbers[0]}`);
  } else if (type === "split") {
    console.log(`Kliknuo si split bet između ${numbers[0]} i ${numbers[1]}`);
  } else if (type === "corner") {
    console.log(`Kliknuo si corner bet na brojeve ${numbers.join(", ")}`);
  } else if (type === "triple") {
    console.log(`Kliknuo si triple bet na brojeve ${numbers.join(", ")}`);
  }
}
initGrid();

// function pickHand() {
//   const bets = [];

//   const numberOfStraightBets = Math.floor(Math.random() * 3) + 1;
//   for (let i = 0; i < numberOfStraightBets; i++) {
//     const n = numberStruct[Math.floor(Math.random() * numberStruct.length)];
//     bets.push({
//       type: "straight",
//       numbers: [n.number],
//       amount: Math.floor(Math.random() * 20) + 5, // 5-24
//       parity: n.bet[0].parity,
//       color: n.bet[0].color,
//     });
//   }

//   //betovi na cornere
//   const numberOfCornerBets = Math.floor(Math.random() * 2) + 1;
//   for (let i = 0; i < numberOfCornerBets; i++) {
//     const m = corners[Math.floor(Math.random() * corners.length)];
//     bets.push({
//       type: "corner",
//       cornerId: m.id,
//       numbers: m.numbers,
//       amount: Math.floor(Math.random() * 15) + 10,
//     });
//   }
//   //split betovi
//   const numberOfSplitBets = Math.floor(Math.random() * 2) + 2;
//   for (let i = 0; i < numberOfSplitBets; i++) {
//     const s = splits[Math.floor(Math.random() * corners.length)];
//     bets.push({
//       type: "split",
//       splitId: s.id,
//       numbers: s.numbers,
//       amount: Math.floor(Math.random() * 15) + 10,
//     });
//   }

//   // odd/even
//   const shouldBetParity = Math.random() > 0.5;
//   if (shouldBetParity) {
//     const p = parity[Math.floor(Math.random() * 2)];
//     bets.push({
//       type: "parity",
//       value: p.name, // 'odd' ili 'even'
//       amount: Math.floor(Math.random() * 30) + 10,
//     });
//   }
//   //Ako nema parity kockamo boju
//   else {
//     const c = colors[Math.floor(Math.random() * 2)];
//     console.log("USO c U COLOR:", c);
//     bets.push({
//       type: "color",
//       color: c.color,
//       amount: Math.floor(Math.random() * 30) + 10,
//     });
//   }

//   return {
//     bets: bets,
//     totalBetAmount: bets.reduce((sum, bet) => sum + bet.amount, 0),
//   };
// }

const chipValues = {
  chip1: 10,
  chip2: 20,
  chip3: 50,
  chip4: 100,
  chip5: 200,
};

function initChipSelection()
{
  const chips = document.querySelectorAll('.chip');

  console.log(chips);
  chips[0].classList.add('active');

  selectedChipValue = chipValues['chip1'];

  chips.forEach(c=>{
    c.addEventListener('click',function(){
      chips.forEach(c=>c.classList.remove('active'));
    
      this.classList.add('active');

      const chipId = this.id;
      selectedChipValue=chipValues[chipId];

      console.log(`Izabran chip: ${chipId}, vrednost: ${selectedChipValue}`);
    })
  })

}

initChipSelection();