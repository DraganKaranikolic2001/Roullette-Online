let _hitAreaClickHandler = null;
let _hitAreaMouseEnterHandler = null;
let _hitAreaMouseLeaveHandler = null;

function attachHitAreaListeners(hitArea) {
  // Ukloni stare listenere pre nego što ih dodamo (sigurno kad se poziva više puta)
  if (_hitAreaClickHandler) {
    hitArea.removeEventListener("click", _hitAreaClickHandler);
    hitArea.removeEventListener("mouseover", _hitAreaMouseEnterHandler);
    hitArea.removeEventListener("mouseout", _hitAreaMouseLeaveHandler);
  }

  // CLICK – delegiran na hitArea
  _hitAreaClickHandler = function (event) {
    const btn = event.target.closest(".buttonB");
    if (!btn) return;
    handleBetClick({ target: btn });
  };

  // MOUSEOVER – za highlighting straight betova
  _hitAreaMouseEnterHandler = function (event) {
    const btn = event.target.closest(
      ".bet-button-corner, .bet-button-split, .bet-button-triple, " +
        ".bet-button-25-36, .bet-button-1-12, .bet-button-13-24, " +
        ".bet-button-black, .bet-button-red, .bet-button-1-18, " +
        ".bet-button-19-36, .bet-button-2x1-1, .bet-button-2x1-2, " +
        ".bet-button-2x1-3, .bet-button-even, .bet-button-odd",
    );
    if (!btn) return;

    const nums = JSON.parse(btn.dataset.numbers);
    nums.forEach((num) => {
      const straight = findStraightButton(hitArea, num);
      if (straight) straight.classList.add("highlighted");
    });
  };

  // MOUSEOUT – ukloni highlight
  _hitAreaMouseLeaveHandler = function (event) {
    // Provjeri da li smo zaista izašli iz dugmeta (ne samo ušli u child)
    const btn = event.target.closest(".buttonB");
    if (!btn) return;
    hitArea
      .querySelectorAll(".bet-button-straight.highlighted")
      .forEach((el) => el.classList.remove("highlighted"));
  };

  hitArea.addEventListener("click", _hitAreaClickHandler);
  hitArea.addEventListener("mouseover", _hitAreaMouseEnterHandler);
  hitArea.addEventListener("mouseout", _hitAreaMouseLeaveHandler);
}
function findStraightButton(hitArea, number) {
  // Traži straight dugme po data-numbers atributu (cache-ovano iterovanje)
  for (const btn of hitArea.querySelectorAll(".bet-button-straight")) {
    if (JSON.parse(btn.dataset.numbers)[0] === number) return btn;
  }
  return null;
}

function createBettingZones() {
  // const w = gridCanvas.width;
  // const h = gridCanvas.height;
  // console.log(w);
  // console.log(h);
  const hitArea = document.getElementById("hitarea");
  hitArea.innerHTML = "";
  const cellWidth = 100 / 15; // 6.667%
  const cellHeight = 100 / 6.8; // 15.385%
  const startX = 7;
  const startY = 2;
  // const cellWidth = (w / (w * 15)) * 100;
  console.log("OG SIRINA ", cellWidth);
  // const cellHeight = (h / (h * 6.5)) * 100;
  console.log("OG VISINA ", cellHeight);
  const gapX = 0.7;
  const gapY = 0;
  function retOddArray() {
    let array = [];
    for (let i = 0; i < 37; i++) {
      if (i % 2 === 1) {
        array.push(i);
      }
      // console.log(array);
    }
    return array;
  }
  function retEvenArray() {
    let array = [];
    for (let i = 1; i < 37; i++) {
      if (i % 2 === 0) {
        array.push(i);
      }
      // console.log(array);
    }
    return array;
  }

  attachHitAreaListeners(hitArea);
  // createButton(hitArea,"straight",1,startX+cellWidth+0.5,startY+2*cellHeight+0.5,cellWidth,cellHeight);
  // 0 kao dugme
  createButton(hitArea, "straight", [0], 0.5, 1.5, cellWidth, cellHeight * 3.1);

  // Straight bets
  //1 - 34
  for (let col = 0; col < 12; col++) {
    for (let row = 0; row < 1; row++) {
      const number = col * 3 + row + 1;
      if (number > 36) break;

      let x = startX + 0.7 + col * cellWidth + (gapX * col) / 1.57;
      let y = startY + (2 - row) * (cellHeight + gapY + 0.3);

      createButton(hitArea, "straight", [number], x, y, cellWidth, cellHeight);
    }
  }
  //2 - 35
  for (let col = 0; col < 12; col++) {
    for (let row = 1; row < 2; row++) {
      const number = col * 3 + row + 1;
      if (number > 36) break;

      let x = startX + 0.7 + col * cellWidth + (gapX * col) / 1.57;
      let y = startY + row * (cellHeight + gapY + 1.2) - 1;

      createButton(hitArea, "straight", [number], x, y, cellWidth, cellHeight);
    }
  }
  //3 - 36
  for (let col = 0; col < 12; col++) {
    for (let row = 2; row < 3; row++) {
      const number = col * 3 + row + 1;
      if (number > 36) break;

      let x = startX + 0.7 + col * cellWidth + (gapX * col) / 1.57;
      let y = startY + gapY - 0.7;

      createButton(hitArea, "straight", [number], x, y, cellWidth, cellHeight);
    }
  }
  let xSplit;
  for (let col = 0; col < 12; col++) {
    for (let row = 0; row < 2; row++) {
      const num1 = col * 3 + row + 1;
      const num2 = num1 + 1;
      let y;
      if (num1 > 36) break;

      if (col === 0) {
        xSplit = startX + col * cellWidth + gapX;
      } else if (row == 1) {
        xSplit = xSplit;
      } else {
        xSplit = xSplit + cellWidth + gapX / 1.565;
      }
      if (row === 0) {
        y = startY + 2 * cellHeight - 2.4;
      } else {
        y = startY + cellHeight - 3.3;
      }

      let splitHeight = cellHeight / 2.3;
      createButton(
        hitArea,
        "split",
        [num1, num2],
        xSplit,
        y,
        cellWidth,
        splitHeight,
      );
    }
  }

  xSplit = 0;
  for (let col = 0; col < 11; col++) {
    for (let row = 0; row < 3; row++) {
      const num1 = col * 3 + row + 1;
      const num2 = num1 + 3;
      if (num2 > 36) break;
      if (col == 0) {
        xSplit = startX + cellWidth - 0.25;
      } else if (row == 1 || row == 2) {
        xSplit = xSplit;
      } else {
        xSplit = xSplit + cellWidth + 0.45;
      }
      let y;
      if (row === 0) {
        y = startY + (2 - row) * cellHeight + 2; //
      } else if (row === 1) {
        y = startY + (2 - row) * cellHeight + 2;
      } else {
        y = startY + (2 - row) * cellHeight + 0.5;
      }

      let splitWidth = cellWidth / 3;
      createButton(
        hitArea,
        "split",
        [num1, num2],
        xSplit,
        y,
        splitWidth,
        cellHeight / 1.25,
      );
    }
  }
  // Corner
  xSplit = 0;
  for (let col = 0; col < 12; col++) {
    for (let row = 0; row < 2; row++) {
      const num1 = col * 3 + row + 1;
      const num2 = num1 + 1;
      const num3 = num1 + 3;
      const num4 = num1 + 4;
      if (num4 > 36) break;

      if (col == 0) {
        xSplit = startX + cellWidth - 0.5;
      } else if (row == 1) {
        xSplit = xSplit;
      } else {
        xSplit = xSplit + cellWidth + 0.45;
      }
      let y;
      if (row === 0) {
        y = startY + 2 * cellHeight - 2.4;
      } else {
        y = startY + cellHeight - 3.3;
      }

      createButton(
        hitArea,
        "corner",
        [num1, num2, num3, num4],
        xSplit,
        y,
        cellWidth / 2.5,
        cellHeight / 2.3,
      );
    }
  }

  createButton(
    hitArea,
    "split",
    [0, 1],
    startX - 1,
    startY + 2 * cellHeight + 2,
    cellWidth / 2.5,
    cellHeight / 1.3,
  );

  // Split 0-2 (srednji)
  createButton(
    hitArea,
    "split",
    [0, 2],
    startX - 1,
    startY + cellHeight + 2,
    cellWidth / 2.5,
    cellHeight / 1.3,
  );

  // Split 0-3 (gornji)
  createButton(
    hitArea,
    "split",
    [0, 3],
    startX - 1,
    startY + 0.5,
    cellWidth / 2.5,
    cellHeight / 1.3,
  );

  //triple bets
  createButton(
    hitArea,
    "triple",
    [0, 1, 2],
    startX - 0.8,
    startY + 2 * cellHeight - 2.4,
    cellWidth / 3,
    cellHeight / 2.3,
  );
  createButton(
    hitArea,
    "triple",
    [0, 2, 3],
    startX - 0.8,
    startY + cellHeight - 3.3,
    cellWidth / 3,
    cellHeight / 2.3,
  );

  //1-12
  let array = Array.from({ length: 12 }, (_, i) => i + 1);
  // console.log(array);
  createButton(
    hitArea,
    "1-12",
    array,
    startX + 0.7,
    startY + 3 * cellHeight + 1.2,
    cellWidth * 4.2,
    cellHeight,
  );

  //13-24
  array = Array.from({ length: 12 }, (_, i) => i + 13);
  // console.log("ARRAY:", array);
  createButton(
    hitArea,
    "13-24",
    array,
    (startX + 0.6) * 4.75,
    startY + 3 * cellHeight + 1.2,
    cellWidth * 4.2,
    cellHeight,
  );
  //25-36
  array = Array.from({ length: 12 }, (_, i) => i + 25);
  // console.log("ARRAY:", array);
  createButton(
    hitArea,
    "25-36",
    array,
    (startX + 0.6) * 8.5,
    startY + 3 * cellHeight + 1.2,
    cellWidth * 4.2,
    cellHeight,
  );
  //1-18
  array = Array.from({ length: 18 }, (_, i) => i + 1);
  // console.log("ARRAY:", array);
  createButton(
    hitArea,
    "1-18",
    array,
    startX + 0.6,
    startY + 4 * cellHeight + 2.2,
    cellWidth * 2.1,
    cellHeight,
  );
  //19-36
  array = Array.from({ length: 18 }, (_, i) => i + 19);
  // console.log("ARRAY:", array);
  createButton(
    hitArea,
    "19-36",
    array,
    (startX + 0.6) * 10.35,
    startY + 4 * cellHeight + 2.2,
    cellWidth * 2.1,
    cellHeight,
  );

  //2x1-3
  array = Array.from({ length: 12 }, (_, i) => 3 * i + 3);
  // console.log("ARRAY 2x1-3:", array);
  createButton(
    hitArea,
    "2x1-3",
    array,
    (startX + 0.5) * 12.4,
    startY - 0.6,
    cellWidth,
    cellHeight,
  );
  //2x1-2
  array = Array.from({ length: 12 }, (_, i) => 3 * i + 2);
  // console.log("ARRAY 2x1-2:", array);
  createButton(
    hitArea,
    "2x1-2",
    array,
    (startX + 0.5) * 12.4,
    startY + cellHeight,
    cellWidth,
    cellHeight,
  );
  //2x1-1
  array = Array.from({ length: 12 }, (_, i) => 3 * i + 1);
  // console.log("ARRAY 2x1-1:", array);
  createButton(
    hitArea,
    "2x1-1",
    array,
    (startX + 0.5) * 12.4,
    startY + 2 * cellHeight + 0.8,
    cellWidth,
    cellHeight,
  );
  //red
  createButton(
    hitArea,
    "red",
    [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    (startX + 0.57) * 4.75,
    startY + 4 * cellHeight + 2.2,
    cellWidth * 2.1,
    cellHeight,
  );
  //black
  createButton(
    hitArea,
    "black",
    [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    (startX + 0.55) * 6.65,
    startY + 4 * cellHeight + 2.2,
    cellWidth * 2.1,
    cellHeight,
  );
  createButton(
    hitArea,
    "odd",
    retOddArray(),
    (startX + 0.55) * 8.55,
    startY + 4 * cellHeight + 2.2,
    cellWidth * 2.1,
    cellHeight,
    "odd",
  );
  createButton(
    hitArea,
    "even",
    retEvenArray(),
    (startX + 0.55) * 2.9,
    startY + 4 * cellHeight + 2.2,
    cellWidth * 2.1,
    cellHeight,
    "even",
  );
}

function createButton(
  parent,
  type,
  numbers,
  x,
  y,
  width,
  height,
  label = null,
) {
  const btn = document.createElement("button");
  btn.className = `buttonB bet-button-${type}`;
  btn.dataset.type = type;
  btn.dataset.numbers = JSON.stringify(numbers);

  btn.dataset.chipX = x + width / 2;
  btn.dataset.chipY = y + height / 2;
  btn.style.cssText = `
    position: absolute;
    left : ${x}%;
    top: ${y}%;
    width : ${width - 0.3}%;
    height: ${height - 0.5}%;
    padding : 0.2%;
  `;
  if (label) {
    btn.innerHTML = label.toUpperCase();
    btn.style.color = "white";
    btn.style.fontSize = "9cqh";
    btn.style.fontWeight = "bold";
  }

  parent.appendChild(btn);
}

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

function resize() {
  const container = document.getElementById("main-content");
  const windowW = window.innerWidth;
  const windowH = window.innerHeight;

  const scaleX = windowW / BASE_WIDTH;
  const scaleY = windowH / BASE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  // Fiksne bazne dimenzije - scale transform vizuelno skalira sve
  container.style.width = BASE_WIDTH + "px";
  container.style.height = BASE_HEIGHT + "px";
  container.style.transform = `scale(${scale})`;
  container.style.transformOrigin = "top left";
  container.style.position = "absolute";
  container.style.left = `${(windowW - BASE_WIDTH * scale) / 2}px`;
  container.style.top = `${(windowH - BASE_HEIGHT * scale) / 2}px`;

  // Canvas mora biti reinicijalizovan sa novim dimenzijama wrappera
  const wrapper = document.querySelector(".table-wrapper");
  if (gridCanvas && wrapper) {
    gridCanvas.width = wrapper.offsetWidth;
    gridCanvas.height = wrapper.offsetHeight;
    redrawAllChips();
  }
}

window.addEventListener("resize", resize);

//info deo
