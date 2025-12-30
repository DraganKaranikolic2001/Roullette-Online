function createBettingZones() {
  const w = gridCanvas.width;
  const h = gridCanvas.height;
  console.log(w);
  console.log(h);
  const hitArea = document.getElementById("hitarea");
  hitArea.innerHTML = "";

  const startX = 7;
  const startY = 1;
  const cellWidth = (w / (w * 15)) * 100;
  const cellHeight = (h / (h * 6.5)) * 100;
  const gapX = 0.7;
  const gapY = 1.5;

  // createButton(hitArea,"straight",1,startX+cellWidth+0.5,startY+2*cellHeight+0.5,cellWidth,cellHeight);
  // 0 kao dugme
  createButton(hitArea, "straight", [0], 0.5, 1.5, cellWidth, cellHeight * 3.3);

  // Straight bets
  //1 - 34
  for (let col = 0; col < 12; col++) {
    for (let row = 0; row < 1; row++) {
      const number = col * 3 + row + 1;
      if (number > 36) break;

      let x = startX + 0.7 + col * cellWidth + (gapX * col) / 1.57;
      let y = startY + (2 - row) * (cellHeight + gapY + 1.1);

      createButton(hitArea, "straight", [number], x, y, cellWidth, cellHeight);
    }
  }
  //2 - 35
  for (let col = 0; col < 12; col++) {
    for (let row = 1; row < 2; row++) {
      const number = col * 3 + row + 1;
      if (number > 36) break;

      let x = startX + 0.7 + col * cellWidth + (gapX * col) / 1.57;
      let y = startY + row * (cellHeight + gapY + 1.2);

      createButton(hitArea, "straight", [number], x, y, cellWidth, cellHeight);
    }
  }
  //3 - 36
  for (let col = 0; col < 12; col++) {
    for (let row = 2; row < 3; row++) {
      const number = col * 3 + row + 1;
      if (number > 36) break;

      let x = startX + 0.7 + col * cellWidth + (gapX * col) / 1.57;
      let y = startY + gapY - 1;

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
        y = startY + 2 * cellHeight + 0.8;
      } else {
        y = startY + cellHeight - 1.5;
      }

      let splitHeight = cellHeight / 2.3;
      createButton(
        hitArea,
        "split",
        [num1, num2],
        xSplit,
        y,
        cellWidth,
        splitHeight
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
        y = startY + (2 - row) * cellHeight + 6.7;
      } else if (row === 1) {
        y = startY + (2 - row) * cellHeight + 4.2;
      } else {
        y = startY + (2 - row) * cellHeight + 2;
      }

      let splitWidth = cellWidth / 3;
      createButton(
        hitArea,
        "split",
        [num1, num2],
        xSplit,
        y,
        splitWidth,
        cellHeight / 1.25
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
        y = startY + 2 * cellHeight + 0.8;
      } else {
        y = startY + cellHeight - 1.5;
      }

      createButton(
        hitArea,
        "corner",
        [num1, num2, num3, num4],
        xSplit,
        y,
        cellWidth / 2.5,
        cellHeight / 2.3
      );
    }
  }

  createButton(
    hitArea,
    "split",
    [0, 1],
    startX - 1,
    startY + 2 * cellHeight + 6.7,
    cellWidth / 2.5,
    cellHeight / 1.3
  );

  // Split 0-2 (srednji)
  createButton(
    hitArea,
    "split",
    [0, 2],
    startX - 1,
    startY + cellHeight + 4.2,
    cellWidth / 2.5,
    cellHeight / 1.3
  );

  // Split 0-3 (gornji)
  createButton(
    hitArea,
    "split",
    [0, 3],
    startX - 1,
    startY + 2,
    cellWidth / 2.5,
    cellHeight / 1.3
  );

  //triple bets
  createButton(
    hitArea,
    "triple",
    [0, 1, 2],
    startX - 0.8,
    startY + 2 * cellHeight + 0.8,
    cellWidth / 3,
    cellHeight / 2.3
  );
  createButton(
    hitArea,
    "triple",
    [0, 2, 3],
    startX - 0.8,
    startY + cellHeight - 1.5,
    cellWidth / 3,
    cellHeight / 2.3
  );

  //1-12
  let array = Array.from({ length: 12 }, (_, i) => i + 1);
  // console.log(array);
  createButton(
    hitArea,
    "1-12",
    array,
    startX + 0.7,
    startY + 3 * cellHeight + 6.8,
    cellWidth * 4.2,
    cellHeight * 1.1
  );

  //13-24
  array = Array.from({ length: 12 }, (_, i) => i + 13);
  // console.log("ARRAY:", array);
  createButton(
    hitArea,
    "13-24",
    array,
    (startX + 0.6) * 4.75,
    startY + 3 * cellHeight + 6.8,
    cellWidth * 4.2,
    cellHeight * 1.1
  );
  //25-36
  array = Array.from({ length: 12 }, (_, i) => i + 25);
  // console.log("ARRAY:", array);
  createButton(
    hitArea,
    "25-36",
    array,
    (startX + 0.6) * 8.5,
    startY + 3 * cellHeight + 6.8,
    cellWidth * 4.2,
    cellHeight * 1.1
  );
  //1-18
  array = Array.from({ length: 18 }, (_, i) => i + 1);
  // console.log("ARRAY:", array);
  createButton(
    hitArea,
    "1-18",
    array,
    startX + 0.6,
    startY + 4 * cellHeight + 8.5,
    cellWidth * 2.1,
    cellHeight * 1.1
  );
  //19-36
  array = Array.from({ length: 18 }, (_, i) => i + 19);
  // console.log("ARRAY:", array);
  createButton(
    hitArea,
    "19-36",
    array,
    (startX + 0.6) * 10.35,
    startY + 4 * cellHeight + 8.5,
    cellWidth * 2.1,
    cellHeight * 1.1
  );

  //2x1-3
  array = Array.from({ length: 12 }, (_, i) => 3 * i + 3);
  // console.log("ARRAY 2x1-3:", array);
  createButton(
    hitArea,
    "2x1-3",
    array,
    (startX + 0.5) * 12.4,
    startY + 0.5,
    cellWidth,
    cellHeight
  );
  //2x1-2
  array = Array.from({ length: 12 }, (_, i) => 3 * i + 2);
  // console.log("ARRAY 2x1-2:", array);
  createButton(
    hitArea,
    "2x1-2",
    array,
    (startX + 0.5) * 12.4,
    startY + cellHeight + 2.7,
    cellWidth,
    cellHeight
  );
  //2x1-1
  array = Array.from({ length: 12 }, (_, i) => 3 * i + 1);
  // console.log("ARRAY 2x1-1:", array);
  createButton(
    hitArea,
    "2x1-1",
    array,
    (startX + 0.5) * 12.4,
    startY + 2 * (cellHeight + 2.6),
    cellWidth,
    cellHeight
  );
  //red
  createButton(
    hitArea,
    "red",
    [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],
    (startX + 0.57) * 4.75,
    startY + 4 * cellHeight + 8.5,
    cellWidth * 2.1,
    cellHeight * 1.1
  );
  //black
  createButton(
    hitArea,
    "black",
    [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35],
    (startX + 0.55) * 6.65,
    startY + 4 * cellHeight + 8.5,
    cellWidth * 2.1,
    cellHeight * 1.1
  );
}
function createButton(parent, type, numbers, x, y, width, height) {
  const btn = document.createElement("button");
  btn.className = `buttonB bet-button-${type}`;
  btn.dataset.type = type;
  btn.dataset.numbers = JSON.stringify(numbers);

  btn.dataset.chipX = x + width / 2;
  btn.dataset.chipY = y + height / 2;
  btn.style.position = "absolute";
  btn.style.left = `${x}%`;
  btn.style.top = `${y}%`;
  btn.style.width = `${width - 0.3}%`;
  btn.style.height = `${height - 0.5}%`;
  btn.style.padding = "0.2%";
  btn.addEventListener("click", handleBetClick);
  parent.appendChild(btn);
}
