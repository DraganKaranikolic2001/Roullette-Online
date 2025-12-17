import { createServer } from "http";
import crypto from "crypto";
import { buffer, json } from "stream/consumers";
const PORT = 1337;
const WEBSOCKET_MAGIC_STRING_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const SEVEN_BITS_INTEGER_MARKER = 125;
const SIXTEEN_BITS_INTEGER_MARKER = 126;
const SIXFOUR_BITS_INTEGER_MARKER = 127;
const FIRST_BIT = 128;

const MAXIMUM_SIXTEENBITS_INTEGER = 2 ** 16;
const MASK_KEY_BYTES_LENGTH = 4;
const OPCODE_TEXT = 0x01; // 1 bit in binary

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

const server = createServer((request, response) => {
  response.writeHead(200);
  response.end("hey there");
}).listen(1337, () => console.log("server listening to", PORT));
server.on("upgrade", onSocketUpgrade);

function onSocketUpgrade(req, socket, head) {
  const { "sec-websocket-key": webClientSocketKey } = req.headers;

  console.log(`${webClientSocketKey} connected !`);
  const headers = prepareHandShakeHeaders(webClientSocketKey);
  //salje handshake odgovor
  socket.write(headers);
  //listener za citanje poruka
  socket.on("readable", () => onSocketReadable(socket));
}

//slanje klijentu
function sendMessage(msg, socket) {
  const dataFrameBuffer = prepareMessage(msg);
  socket.write(dataFrameBuffer);
}
//slanje klijentu
function prepareMessage(message) {
  const msg = Buffer.from(message);
  const messageSize = msg.length;

  let dataFrameBuffer;

  //0x80 === 128 in binary
  // '0x' + Math.abs(128).toString(16) == 0x80
  const firstByte = 0x80 | OPCODE_TEXT; //single frame + text

  if (messageSize <= SEVEN_BITS_INTEGER_MARKER) {
    const bytes = [firstByte];
    dataFrameBuffer = Buffer.from(bytes.concat(messageSize));
  } else if (messageSize <= MAXIMUM_SIXTEENBITS_INTEGER) {
    const offsetFourBytes = 4;
    const target = Buffer.allocUnsafe(offsetFourBytes);
    target[0] = firstByte;
    target[1] = SIXTEEN_BITS_INTEGER_MARKER | 0x0; //just to know the mask
    target.writeUInt16BE(messageSize, 2); // content length is 2 bytes
    dataFrameBuffer = target;

    //alloc 4 bytes
    //[0] - 128 + 1 - 10000001 = 0x81 fin + opcode
    //[1] - 126 + 0 - payload length marker + mask indicator
    //[2] 0 - content length
    //[3] 171 - content length
    //[4 - ..] - the message itself
  } else {
    throw new Error("message too long buddy :(");
  }
  const totalLength = dataFrameBuffer.byteLength + messageSize;
  const dataFrameResponse = concat([dataFrameBuffer, msg], totalLength);
  return dataFrameResponse;
}

function concat(bufferList, totalLength) {
  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (const buffer of bufferList) {
    target.set(buffer, offset);
    offset += buffer.length;
  }
  return target;
}
//XOR DEKODIRANJE< ODNOSNO SKLANJA MASKU STO KLIJENT SALJE SERVERU
function unMask(encodedBuffer, maskKey) {
  const finalBuffer = Buffer.from(encodedBuffer);
  // because the maskKey has only 4 bites
  //index %4 === 0, 1 , 2 , 3 = index bits need to decode the message

  //XOR ^
  // returns 1 if both are diffrent
  //return 0 if both are equal

  // (71).toString(2).padStart(8,"0") = 0 1 0 0 0 1 1 1
  // (53).toString(2)padStart(8,"0") =  0 0 1 1 0 1 0 1
  //                                    0 1 1 1 0 0 1 0

  //(71^53)toString(2).padStart(8,"0") = '01110010'
  // String.fromCharCode(parseInt('01110010',2)) => 'r'
  const fillWIthEightZeros = (t) => t.padStart(8, "0");
  const toBinary = (t) => fillWIthEightZeros(t.toString(2));
  const fromBinaryToDecimal = (t) => parseInt(toBinary(t), 2);
  const getCharFromBinary = (t) => String.fromCharCode(fromBinaryToDecimal(t));

  for (let index = 0; index < encodedBuffer.length; index++) {
    finalBuffer[index] =
      encodedBuffer[index] ^ maskKey[index % MASK_KEY_BYTES_LENGTH];

    const logger = {
      unmaskingCalc: `${toBinary(encodedBuffer[index])} ^ ${toBinary(
        maskKey[index % MASK_KEY_BYTES_LENGTH]
      )} = ${toBinary(finalBuffer[index])}}`,
      decoded: getCharFromBinary(finalBuffer[index]),
    };
    //console.log(logger);
  }
  return finalBuffer;
}
//uspostavlja konekciju(handshake)
function prepareHandShakeHeaders(id) {
  const acceptKey = createSocketAccept(id);
  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    "",
  ]
    .map((line) => line.concat("\r\n"))
    .join("");
  return headers;
}
//Spaja kljuc sa magicnim stringom , ovo klijentu dokazuje da server razume WebSocket protokol
function createSocketAccept(id) {
  const shaum = crypto.createHash("sha1");
  shaum.update(id + WEBSOCKET_MAGIC_STRING_KEY);
  return shaum.digest("base64");
}

//error handling to keep server on
["uncaughtException", "unhandledRejection"].forEach((event) =>
  process.on(event, (err) => {
    console.error(
      `something bad happened! event: ${event}, msg: ${err.stack || err}`
    );
  })
);

//dekodira poruku
function onSocketReadable(socket) {
  //consume optcode (first byte)
  //1 -1 byte - 8bits
  const firstByteBuffer = socket.read(1);
  if (!firstByteBuffer) return;

  const secondByteBuffer = socket.read(1);
  if (!secondByteBuffer) return;

  const markerAndPayLoadLength = secondByteBuffer[0];
  //Because the first bit is always 1 for client-to-server messages
  //You can substract one bit (128 or '10000000')
  //from this byte to get rid of the MASK bit
  const lengthIndicatorInBits = markerAndPayLoadLength - FIRST_BIT;

  let messageLength = 0;

  if (lengthIndicatorInBits <= SEVEN_BITS_INTEGER_MARKER) {
    messageLength = lengthIndicatorInBits;
  } else if (lengthIndicatorInBits === SIXTEEN_BITS_INTEGER_MARKER) {
    //unisged, big-endian 16-bit integer [0 - 65k]
    const lenghtBuffer = socket.read(2);
    if (!lenghtBuffer) return;
    messageLength = lenghtBuffer.readUint16BE(0);
  } else {
    throw new Error("your message is to long! we dont handle 64 bit messages");
  }

  const maskKey = socket.read(MASK_KEY_BYTES_LENGTH);
  if (!maskKey) return;
  const encoded = socket.read(messageLength);
  if (!encoded) return;
  const decoded = unMask(encoded, maskKey);
  const received = decoded.toString("utf-8");

  try {
    const data = JSON.parse(received);
    console.log("received message from client", data);
    // const clientData = Array.isArray(data) ? data[0] : data;
    //slanje klijentu
    const serverHand = generateHand();
    console.log("Server generated: ", serverHand);
    const result = checkGuess(data, serverHand);
    console.log("Result: ", result);
    const msg = JSON.stringify(result);
    sendMessage(msg, socket);
  } catch (error) {
    console.error("Error parsing JSON:", error.message);
    console.log("Received non-JSON data:", received);
  }
}
// const amount = 50;
function checkGuess(data, serverHand) {
  console.log("DATA BETS: ", data.bets);
  // const parityMatch = data === serverHand.parity;
  // const numberMatch = data.numberBet === serverHand.number;
  // const cornerMatch = data.cornerNumbers.includes(serverHand.number);

  let message = "";
  let success = false;
  let win = 0;
  let winDetails = [];
  let clientNumbers = [];
  let clientCorners = [];
  let clientSplits = [];
  let clientParity = null;
  let clientColor = null;
  data.bets.forEach((d) => {
    if (d.type === "straight") {
      if (d.numbers[0] === serverHand.number) {
        message = "Bravo kuco , pogodio si broj";
        success = true;
        const numberWin = d.amount * 35;
        win += numberWin;

        winDetails.push({
          type: "straight",
          bet: d.numbers[0],
          amount: d.amount,
          winOnNumber: numberWin,
        });
      }
      clientNumbers.push(d.numbers[0]);
    } else if (d.type === "corner") {
      if (d.numbers.includes(serverHand.number)) {
        if (message) {
          message += "Pogodio si i corner";
        } else {
          message += "Pogodio si corner";
          success = true;
        }
        const cornerWin = d.amount * 4;
        win += cornerWin;

        winDetails.push({
          type: "corner",
          bet: d.numbers,
          amount: d.amount,
          win: cornerWin,
        });
      }
      clientCorners.push(d.cornerId);
    } else if (d.type === "split") {
      if (d.numbers.includes(serverHand.number)) {
        if (message) {
          message += "Pogodio si i split";
        } else {
          message += "Pogodio si split";
          success = true;
        }
        const splitWin = d.amount * 18;
        win += splitWin;

        winDetails.push({
          type: "split",
          bet: d.numbers,
          amount: d.amount,
          win: splitWin,
        });
      }
      clientSplits.push(d.splitId);
    } else if (d.type === "parity") {
      if (serverHand.parity !== null && d.value === serverHand.parity) {
        if (message) {
          message += " PLUS pogodio si parnost!";
        } else {
          message = "Pogodio si parnost (" + d.value + ")!";
          success = true;
        }
        const parityWin = d.amount * 2;
        win += parityWin;

        winDetails.push({
          type: "parity",
          bet: d.value,
          amount: d.amount,
          win: parityWin,
        });
      }
      clientParity = d.value;
    } else if (d.type === "color") {
      if (d.color === serverHand.color) {
        if (message) {
          message += " PLUS pogodio si boju";
        } else {
          message = "Pogodio si boju (" + d.color + ")!";
          success = true;
        }
        const colorWin = d.amount * 2;
        win += colorWin;
        winDetails.push({
          type: "color",
          bet: d.color,
          amount: d.amount,
          win: colorWin,
        });
      }
      clientColor = d.color;
    }
  });
  if (!success) {
    message = "Kuco sve si promasio :(";
  }
  let val = 0;
  const totalBet = 0;

  return {
    success: success,
    message: message,
    win: win,
    totalBet: totalBet,
    winningDetails: winDetails,
    clientGuess: {
      number: clientNumbers,
      parity: clientParity,
      corner: clientCorners,
      color: clientColor,
    },
    serverResult: {
      number: serverHand.number,
      parity: serverHand.parity,
      color: serverHand.color,
      corners: serverHand.corner,
      splits: serverHand.split,
    },
    at: new Date().toISOString(),
  };

  // if (numberMatch) {
  //   message = "Bravo kuco , pogodio si broj";
  //   success = true;
  //   const numberWin = data.betAmountOnNumber * 35;
  //   win += numberWin;
  //   winDetails.push({
  //     type: "straight",
  //     bet: data.numberBet,
  //     amount: data.betAmountOnNumber,
  //     winOnNumber: numberWin,
  //   });
  // }
  // if (cornerMatch) {
  //   if (message) {
  //     message += "Pogodio si i koren";
  //   } else {
  //     message = "Pogodio si koren";
  //     success = true;
  //   }
  //   const cornerWin = data.betAmountCorner * 8;
  //   win += cornerWin;
  //   winDetails.push({
  //     type: "corner",
  //     bet: data.cornerNumbers,
  //     amount: data.betAmountCorner,
  //     win: cornerWin,
  //   });
  // }
  // if (parityMatch && serverHand.parity !== null) {
  //   if (message) {
  //     message += " PLUS pogodio si parnost!";
  //   } else {
  //     message = "Pogodio si parnost (" + data.parity + ")!";
  //     success = true;
  //   }
  //   const parityWin = data.betAmountOnParity * 2;
  //   win += parityWin;
  //   winDetails.push({
  //     type: "parity",
  //     bet: data.parity,
  //     amount: data.betAmountOnParity,
  //     win: parityWin,
  //   });
  // }
  // if (!success) {
  //   message = "Kuco sve si promasio :(";
  // }
  // const totalBet =
  //   data.betAmountOnNumber + data.betAmountCorner + data.betAmountOnParity;
  // return {
  //   success: success,
  //   message: message,
  //   win: win,
  //   totalBet: totalBet,
  //   winningDetails: winDetails,
  //   clientGuess: {
  //     number: data.numberBet,
  //     parity: data.parityNumber,
  //     corner: data.cornerBetID,
  //   },
  //   serverResult: {
  //     number: serverHand.number,
  //     parity: serverHand.parity,
  //   },
  //   at: new Date().toISOString(),
  // };
}
function generateHand() {
  let rng = generateRandomNumber(numberStruct.length);
  return numberStruct[rng];
}
function generateRandomNumber(n) {
  return Math.floor(Math.random() * n);
}
