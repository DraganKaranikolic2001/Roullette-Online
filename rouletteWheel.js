let app;
let roulleteWheel;
let isSpinning = false;
let currentRotation = 0;
let spinSpeed = 0;
let targetStopRotation = 0;
let initialSpeed;
let ball;
let resetTimeoutId = null;

let CX, CY, R_WHEEL, R_INNER;

const INITIAL_STATE = {
  ball: { x: null, y: null },
};

//Redosled i uglovi brojeva
const rouletteNumberOrder = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
const numberAngles = {};
const anglePerNumber = (Math.PI * 2) / 37;
const INDEX_OF_0 = rouletteNumberOrder.indexOf(0);
const ANGLE_OFFSET = Math.PI / 2;

rouletteNumberOrder.forEach((number, index) => {
  let angle = -(index * anglePerNumber) + ANGLE_OFFSET;
  angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  numberAngles[number] = angle;
});

function getAngleForNumber(number) {
  return numberAngles[number] || 0;
}

// Helper funkcije

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function px(angle, r) {
  return CX + r * Math.cos(angle);
}
function py(angle, r) {
  return CY - r * Math.sin(angle);
}

//  Inicijalizacija

function initRouletteWheel() {
  app = new PIXI.Application({
    width: 400,
    height: 400,
    resolution: window.devicePixelRatio || 1,
    transparent: true,
  });

  CX = app.screen.width / 2;
  CY = app.screen.height / 2;
  R_WHEEL = app.screen.width * 0.43;
  R_INNER = app.screen.width * 0.27;

  const container = document.getElementById("rouletteTable");
  if (container) {
    if (container.tagName === "DIV") {
      container.parentNode.replaceChild(app.view, container);
      app.view.id = "roulleteTable";
    } else {
      container.innerHTML = "";
      container.appendChild(app.view);
    }
  }

  PIXI.Assets.load("images/table.png")
    .then((texture) => {
      roulleteWheel = new PIXI.Sprite(texture);
      roulleteWheel.anchor.set(0.5);
      roulleteWheel.x = CX;
      roulleteWheel.y = CY;
      roulleteWheel.zIndex = 0;
      const scale = Math.min(
        app.screen.width / roulleteWheel.width,
        app.screen.height / roulleteWheel.height,
      );
      roulleteWheel.scale.set(scale * 0.95);
      app.stage.addChild(roulleteWheel);
      app.stage.sortableChildren = true;
      console.log("Roulette wheel inicijalizovano!");
    })
    .catch((err) => console.error("Failed to load roulette wheel image:", err));

  initBall();
}

function initBall() {
  PIXI.Assets.load("images/ball.png")
    .then((texture) => {
      ball = new PIXI.Sprite(texture);
      ball.anchor.set(0.5);
      ball.x = CX;
      ball.y = app.screen.height * 0.08;
      INITIAL_STATE.ball.x = ball.x;
      INITIAL_STATE.ball.y = ball.y;
      ball.zIndex = 1;
      const scale = Math.min(
        app.screen.width / ball.width / 6,
        app.screen.height / ball.height / 6,
      );
      ball.scale.set(scale * 0.35);
      app.stage.addChild(ball);
      console.log("Init je ball");
    })
    .catch((err) => console.error("Failed to load ball image:", err));
}

// Rotacija tocka

function animateWheel(delta) {
  if (!roulleteWheel || !isSpinning) return;

  const remainingDistance = targetStopRotation - currentRotation;

  if (remainingDistance <= 0.001) {
    currentRotation = targetStopRotation;
    roulleteWheel.rotation = 0;
    spinSpeed = 0;
    isSpinning = false;
    return;
  }
  console.log("0", INDEX_OF_0);
  let decelerationFactor;
  if (remainingDistance > Math.PI * 4) decelerationFactor = 0.998;
  else if (remainingDistance > Math.PI * 2) decelerationFactor = 0.996;
  else if (remainingDistance > Math.PI) decelerationFactor = 0.993;
  else decelerationFactor = 0.99;

  spinSpeed *= decelerationFactor;

  const nextStep = spinSpeed * delta;
  if (remainingDistance < 0.1 && nextStep > remainingDistance) {
    currentRotation = targetStopRotation;
  } else {
    currentRotation += nextStep;
  }

  roulleteWheel.rotation = currentRotation % (Math.PI * 2);
}

//  Segment i config loptice

function getSegment(angle) {
  const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  if (a < Math.PI * 0.5) return 1;
  if (a < Math.PI) return 2;
  if (a < Math.PI * 1.5) return 3;
  return 4;
}

function getBallConfig(winningNumber) {
  const numAngle = numberAngles[winningNumber];
  const segment = getSegment(numAngle);
  console.log("NUM ANGLEEE : ", numAngle);
  const starAngle = segment === 1 || segment === 4 ? 0 : Math.PI;
  const bounce = segment === 1 || segment === 3 ? "back" : "forward";
  return { winningNumber, numAngle, segment, starAngle, bounce };
}

// Entry strategije

const entryStrategies = {
  parabola: {
    getPath(starX, starY, numAngle) {
      const destX = px(numAngle, R_INNER);
      const destY = py(numAngle, R_INNER);
      const ctrlX = (starX + destX) / 2 + Math.cos(numAngle + Math.PI / 2) * 60;
      const ctrlY = (starY + destY) / 2 - Math.sin(numAngle + Math.PI / 2) * 60;
      return { type: "parabola", ctrlX, ctrlY, destX, destY };
    },
  },
  arc: {
    getPath(starX, starY, numAngle) {
      const destX = px(numAngle, R_INNER);
      const destY = py(numAngle, R_INNER);
      const arcDir = starX < CX ? 1 : -1;
      return { type: "arc", destX, destY, numAngle, arcDir };
    },
  },
};

//  Faze animacije
const PHASES = {

  rimSpiral: {
    duration: 2.5, // najveci deo ukupnog vremena
    run(t, { startTheta, rimRotations, rStart, rEnd }) {
     
      const t0 = 0.08;
      const tS = t0 + t * (1 - t0);

     
      const a = Math.PI * 0.15;
      const b = Math.PI * 0.75;
      const at = a + tS * (b - a);

      // Integral sinusa = pozicija, uvek raste
      const eased =
        (-Math.cos(at) + Math.cos(a)) / (-Math.cos(b) + Math.cos(a));

      const angle = startTheta - eased * rimRotations * Math.PI * 2;
      const rProgress = Math.pow(t, 2.5);
      const r = lerp(rStart, rEnd, rProgress);
      return { x: px(angle, r), y: py(angle, r) };
    },
  },


  // Udarac u zvezdu — kratka animacija trzaja pre pravca ka centru
  hitStar: {
    duration: 0.05,
    run(t, { starX, starY }) {
      // Loptica se malo "udubi" u zvezdu i odbija — simulacija udarca
      const impact = Math.cos(t * Math.PI) * 5;
      return {
        x: starX + impact * Math.cos(Math.atan2(starY - CY, starX - CX)),
        y: starY + impact * Math.sin(Math.atan2(starY - CY, starX - CX)),
      };
    },
  },

  // Prava linija od zvezde ka centru
  straightToCenter: {
    duration: 0.35,
    run(t, { starX, starY, newCX }) {
      return {
        x: lerp(starX, newCX, easeOut(t)),
        y: lerp(starY, CY, easeOut(t)),
      };
    },
  },

  //  Entry — parabola ili arc od centra ka broju
  entry: {
    duration: 0.25,
    run(t, { path, newCX }) {
      const et = easeInOut(t);
      if (path.type === "parabola") {
        return {
          x:
            Math.pow(1 - et, 2) * newCX +
            2 * (1 - et) * et * path.ctrlX +
            Math.pow(et, 2) * path.destX,
          y:
            Math.pow(1 - et, 2) * CY +
            2 * (1 - et) * et * path.ctrlY +
            Math.pow(et, 2) * path.destY,
        };
      } else {
        console.log("arcDir: ", path.arcDir);
        const fromAngle = path.arcDir === 1 ? Math.PI : 0;
        const curAngle = lerp(fromAngle, path.numAngle, et);

        // console.log("curAngle: " + curAngle);

        const fromR = Math.abs(CX - newCX);
        // console.log("FROM R:  " + fromR + " newCX: " + newCX + " CX " + CX);

        const curR = lerp(fromR, R_INNER, et);
        // console.log("curR : " + curR);
        return {
          x: CX + curR * Math.cos(curAngle),
          y: CY - curR * Math.sin(curAngle),
        };
      }
    },
  },

};

// Runner faza — kroz PixiJS ticker

let ballTickerCallback = null;

function runPhases(phases, winningNumber) {
  if (ballTickerCallback) {
    app.ticker.remove(ballTickerCallback);
    ballTickerCallback = null;
  }
  console.log(numberAngles);
  // Ukupno vreme — dovoljno dugo da se jasno vidi kretanje loptice
  // i da se poklopI sa zaustavljanjem tocka
  const TOTAL_MS = 10000 * (0.92 + Math.random() * 0.16);

  const totalDur = phases.reduce((s, p) => s + p.phase.duration, 0);
  const timestamps = [];
  let acc = 0;
  for (const p of phases) {
    timestamps.push({ start: acc, end: acc + p.phase.duration / totalDur });
    acc += p.phase.duration / totalDur;
  }
  console.log("time", timestamps);
  let elapsed = 0;

  ballTickerCallback = (delta) => {
    elapsed += (delta / 60) * 1000;

    const T = Math.min(elapsed / TOTAL_MS, 1);

    for (let i = 0; i < phases.length; i++) {
      const { start, end } = timestamps[i];
      if (T >= start && T <= end) {
        const localT = (T - start) / (end - start);
        const { x, y } = phases[i].phase.run(localT, phases[i].config);
        ball.x = x;
        ball.y = y;
        break;
      }
      // console.log("PHASE U  I ", phases[i].config);
    }

    if (T >= 1) {
      const last = phases[phases.length - 1].config;
      console.log("LAST", last);
      ball.x = last.destX;
      ball.y = last.destY;

      app.ticker.remove(ballTickerCallback);
      ballTickerCallback = null;

      window.showWin(winningNumber);
      resetTimeoutId = setTimeout(resetAll, 6000);
    }
  };

  app.ticker.add(ballTickerCallback);
}

// Glavni pokretac

function spinRouletteWheel(winningNumber) {
  if (isSpinning) {
    console.warn("spin vec u toku");
    return;
  }

  if (resetTimeoutId) {
    clearTimeout(resetTimeoutId);
    resetTimeoutId = null;
  }

  app.ticker.remove(animateWheel);
  if (ballTickerCallback) {
    app.ticker.remove(ballTickerCallback);
    ballTickerCallback = null;
  }

  // Tocak
  isSpinning = true;
  currentRotation = 0;
  targetStopRotation = 4 * Math.PI * 2;
  spinSpeed = 0.25;
  initialSpeed = spinSpeed;
  app.ticker.add(animateWheel);

  //Config loptice
  const config = getBallConfig(winningNumber);

  const starX = px(config.starAngle, R_WHEEL);
  const starY = py(config.starAngle, R_WHEEL);

  // rimRotations se racuna tako da faza zavrsi TACNO na starAngle
  const startTheta = Math.PI / 2;
  const baseRounds = 3 + Math.floor(Math.random() * 2); // 4-5 krugova — sporije

  let angleDiff = startTheta - config.starAngle;
  angleDiff = ((angleDiff % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  const rimRotations = baseRounds + angleDiff / (Math.PI * 2);
  const rStart = R_WHEEL * 1.025;
  const rEnd = R_WHEEL;
  // console.log("CONFIG NUM ANGLE " , config.numAngle);
  const entryType =
    config.segment === 1 || config.segment === 3 ? "arc" : "parabola";
  const path = entryStrategies[entryType].getPath(
    starX,
    starY,
    config.numAngle,
    config.bounce,
  );
  console.log("PATHH", path);
  const newCX = CX > starX ? CX * 0.8 : CX * 1.2;

  const animConfig = {
    startTheta,
    rimRotations,
    rStart,
    rEnd,
    starX,
    starY,
    path,
    destX: path.destX,
    destY: path.destY,
    newCX,
  };

  ball.x = px(startTheta, rStart);
  ball.y = py(startTheta, rStart);

  runPhases(
    [
      { phase: PHASES.rimSpiral, config: animConfig },
      { phase: PHASES.hitStar, config: animConfig },
      { phase: PHASES.straightToCenter, config: animConfig },
      { phase: PHASES.entry, config: animConfig },
    ],
    winningNumber,
  );
}

function resetAll() {
  if (resetTimeoutId) {
    clearTimeout(resetTimeoutId);
    resetTimeoutId = null;
  }

  app.ticker.remove(animateWheel);

  if (ballTickerCallback) {
    app.ticker.remove(ballTickerCallback);
    ballTickerCallback = null;
  }

  currentRotation = 0;
  if (roulleteWheel) roulleteWheel.rotation = 0;

  if (ball) {
    ball.x = INITIAL_STATE.ball.x;
    ball.y = INITIAL_STATE.ball.y;
  }

  isSpinning = false;
  spinSpeed = 0;

  ctxNum.clearRect(0, 0, canvas.width, canvas.height);
  if (typeof window.clearAll === "function") window.clearAll();
  if (typeof window.resetSpinProgress === "function")
    window.resetSpinProgress();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRouletteWheel);
} else {
  initRouletteWheel();
}

window.resetAll = resetAll;
window.spinRouletteWheel = spinRouletteWheel;
