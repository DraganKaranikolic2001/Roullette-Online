let app;
let roulleteWheel;
let isSpinning = false;
let isBallSpinning = false;
let currentRotation = 0;
let spinSpeed = 0;
let targetRotation = 0;
let initialSpeed;
let ball;
let theta;
let r;
let angularSpeed;
let targetNumber = null;
let targetAngle = null;

const INITIAL_STATE = {
  ball: {
    x: null,
    y: null,
  },
};

const rouletteNumberOrder = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const anglePerNumber = (Math.PI * 2) / 37;
const INDEX_OF_34 = rouletteNumberOrder.indexOf(34);
const ANGLE_OFFSET = -INDEX_OF_34 * anglePerNumber;

const numberAngles = {};
rouletteNumberOrder.forEach((number, index) => {
  let angle = index * anglePerNumber + ANGLE_OFFSET;
  angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  numberAngles[number] = angle;
});

function getAngleForNumber(number) {
  return numberAngles[number] || 0;
}

function initRouletteWheel() {
  app = new PIXI.Application({
    width: 400,
    height: 400,
    resolution: window.devicePixelRatio || 1,
    transparent: true,
  });

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
      roulleteWheel.x = app.screen.width / 2;
      roulleteWheel.y = app.screen.height / 2;
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

    .catch((err) => {
      console.error("Failed to load roulette wheel image:", err);
    });
  initBall();
}

function initBall() {
  PIXI.Assets.load("images/ball.png")
    .then((texture) => {
      ball = new PIXI.Sprite(texture);
      ball.anchor.set(0.5);
      ball.x = app.screen.width / 2;
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
    .catch((err) => {
      console.error("Failed to load ball image :", err);
    });
}

let bounceFrameCount = 0;
let inBouncingPhase = false;
let waitingForAlignment = false;

let activeWheelCallback = null;
let activeBallCallback = null;
let resetTimeoutId = null;

function animateBall(delta) {
  if (!ball || !isBallSpinning) return;

  if (r < 190 && r >= 140 && !inBouncingPhase && !waitingForAlignment) {
    // FAZA 1: Spirala
    r -= 0.035 * delta;
    angularSpeed *= 0.9994;

    ball.x = app.screen.width / 2 + r * Math.cos(theta);
    ball.y = app.screen.height / 2 + r * Math.sin(theta);

    if (r < 140) {
      r = 140;
      if (targetNumber !== null) {
        targetAngle = getAngleForNumber(targetNumber);
        waitingForAlignment = true;
      }
    }
  } else if (waitingForAlignment) {
    // FAZA 2: Čekanje na alignment
    const normalizedTheta =
      ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    if (targetNumber !== null) {
      targetAngle = getAngleForNumber(targetNumber);
    }

    let angleDiff = normalizedTheta - targetAngle;

    if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const absoluteDiff = Math.abs(angleDiff);

    if (absoluteDiff < 0.5) {
      inBouncingPhase = true;
      waitingForAlignment = false;
      bounceFrameCount = 0;
    } else {
      r = 140;
      ball.x = app.screen.width / 2 + r * Math.cos(theta);
      ball.y = app.screen.height / 2 + r * Math.sin(theta);
    }
  } else if (inBouncingPhase) {
    // FAZA 3: Bounce
    bounceFrameCount++;

    const totalBounceFrames = 420;
    const progress = bounceFrameCount / totalBounceFrames;

    let baseR = 110;
    let bounceAmplitude = 40 * (1 - progress);
    let oscillation = -Math.sin(progress * Math.PI * 3) * bounceAmplitude;
    r = baseR + oscillation;

    if (targetAngle !== null) {
      const normalizedTheta =
        ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let angleDiff = normalizedTheta - targetAngle;

      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      if (progress > 0.3) {
        // Bazna korekcija (30-80% progresa)
        let correctionFactor = 0.025 * ((progress - 0.3) / 0.7);

        if (progress > 0.8) {
          const finalPhase = (progress - 0.8) / 0.2; // 0 do 1
          correctionFactor += finalPhase * 0.1; // Dodaj do 0.1 ekstra
        }

        theta -= angleDiff * correctionFactor;
      }

      angularSpeed *= 0.999;
    } else {
      angularSpeed *= 0.999;
    }

    ball.x = app.screen.width / 2 + r * Math.cos(theta);
    ball.y = app.screen.height / 2 + r * Math.sin(theta);

    if (bounceFrameCount >= totalBounceFrames) {
      inBouncingPhase = false;
      r = 105;

      if (targetAngle !== null) {
        const normalizedTheta =
          ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let angleDiff = normalizedTheta - targetAngle;

        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        const finalError = Math.abs(angleDiff);

        // Samo ako je greška > 0.05 radijana (2.8°), koristi hard snap
        if (finalError > 0.05) {
          console.log(
            ` Finalna korekcija: ${(finalError * 57.3).toFixed(1)}° → 0°`,
          );
          theta = targetAngle;
        } else {
          console.log(`Perfektno! Greška: ${(finalError * 57.3).toFixed(2)}°`);
        }
      }
      if (typeof showWin === "function") {
        window.showWin(targetNumber);
      }
      ball.x = app.screen.width / 2 + r * Math.cos(theta);
      ball.y = app.screen.height / 2 + r * Math.sin(theta);

      isBallSpinning = false;
      angularSpeed = 0;

      //RESET nakon 6 sekundi
      resetTimeoutId = setTimeout(resetAll, 6000);
    }
  }

  theta -= delta * angularSpeed;
}

let targetStopRotation = 0;

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

  let decelerationFactor;

  if (remainingDistance > Math.PI * 4) {
    decelerationFactor = 0.998;
  } else if (remainingDistance > Math.PI * 2) {
    decelerationFactor = 0.996;
  } else if (remainingDistance > Math.PI) {
    decelerationFactor = 0.993;
  } else {
    decelerationFactor = 0.99;
  }

  spinSpeed *= decelerationFactor;

  const nextStep = spinSpeed * delta;

  if (remainingDistance < 0.1 && nextStep > remainingDistance) {
    currentRotation = targetStopRotation;
  } else {
    currentRotation += nextStep;
  }

  const displayRotation = currentRotation % (Math.PI * 2);
  roulleteWheel.rotation = displayRotation;
}

function spinRouletteWheel(winningNumber) {
  if (isSpinning) {
    console.warn("spin već u toku");
    return;
  }

  if (resetTimeoutId) {
    clearTimeout(resetTimeoutId);
    resetTimeoutId = null;
  }

  app.ticker.remove(animateWheel);
  app.ticker.remove(animateBall);

  // Reset state
  targetNumber = winningNumber;
  bounceFrameCount = 0;
  inBouncingPhase = false;
  waitingForAlignment = false;
  targetAngle = null;

  const rotations = 4;
  targetStopRotation = rotations * Math.PI * 2;

  currentRotation = 0;

  r = 175;
  theta = Math.random() * Math.PI * 2;
  angularSpeed = 0.045 + Math.random() * 0.01;

  isSpinning = true;
  isBallSpinning = true;

  spinSpeed = 0.25;
  initialSpeed = spinSpeed;

  app.ticker.add(animateWheel);
  app.ticker.add(animateBall);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRouletteWheel);
} else {
  initRouletteWheel();
}
function resetAll() {
  if (resetTimeoutId) {
    clearTimeout(resetTimeoutId);
    resetTimeoutId = null;
  }

  app.ticker.remove(animateWheel);
  app.ticker.remove(animateBall);

  currentRotation = 0;
  if (roulleteWheel) {
    roulleteWheel.rotation = 0;
  }

  if (ball) {
    ball.x = INITIAL_STATE.ball.x;
    ball.y = INITIAL_STATE.ball.y;
  }

  targetNumber = null;
  targetAngle = null;
  inBouncingPhase = false;
  waitingForAlignment = false;
  bounceFrameCount = 0;
  isSpinning = false;
  isBallSpinning = false;
  spinSpeed = 0;
  angularSpeed = 0;
  ctxNum.clearRect(0, 0, canvas.width, canvas.height);
  if (typeof window.clearAll === "function") {
    window.clearAll();
  }
  if (typeof window.resetSpinProgress === "function") {
    window.resetSpinProgress();
  }
}

window.resetAll = resetAll;
window.spinRouletteWheel = spinRouletteWheel;
