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

const INITIAL_STATE = {
  ball: {
    x: null,
    y: null,
  },
};

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

      // app.stage.addChild(ball);
      app.stage.addChild(roulleteWheel);
      app.stage.sortableChildren = true;
      app.ticker.add(animateBall);
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
      console.log("APPSCREEN", app.screen.width);
      console.log("BALL WIDTH : ", ball.width);
      const scale = Math.min(
        app.screen.width / ball.width / 6,
        app.screen.height / ball.height / 6,
      );
      ball.scale.set(scale * 0.35);
      app.stage.addChild(ball);
      app.ticker.add(animateWheel);
      app.ticker.add(animateBall);
      console.log("Init je ball");
    })
    .catch((err) => {
      console.error("Failed to load ball image :", err);
    });
}
let bounceFrameCount = 0;
let inBouncingPhase = false; // ← NOVA ZASTAVICA

function animateBall(delta) {
  if (!ball || !isBallSpinning) return;
  // console.log("R : ", r);

  if (r < 190 && r >= 140 && !inBouncingPhase) {
    // FAZA 1: Spirala
    r -= 0.03 * delta;
    angularSpeed *= 0.9992;

    ball.x = app.screen.width / 2 + r * Math.cos(theta);
    ball.y = app.screen.height / 2 + r * Math.sin(theta);

    // Započni bounce fazu kada r padne ispod 140
    if (r < 140) {
      inBouncingPhase = true;
      bounceFrameCount = 0;
    }
  } else if (inBouncingPhase) {
    // FAZA 2: BOUNCE
    bounceFrameCount++;
    angularSpeed *= 0.999;

    let totalBounceFrames = 420;
    let progress = bounceFrameCount / totalBounceFrames;

    let baseR = 110;

    let bounceAmplitude = 40 * (1 - progress);
    let oscillation = -Math.sin(progress * Math.PI * 3) * bounceAmplitude;

    r = baseR + oscillation;

    // console.log(
    //   "Frame:",
    //   bounceFrameCount,
    //   "BaseR:",
    //   baseR,
    //   "Oscillation:",
    //   oscillation.toFixed(1),
    //   "Final R:",
    //   r.toFixed(1),
    // );

    ball.x = app.screen.width / 2 + r * Math.cos(theta);
    ball.y = app.screen.height / 2 + r * Math.sin(theta);

    if (bounceFrameCount >= totalBounceFrames) {
      inBouncingPhase = false;
      r = 105;
    }
  } else {
    // FAZA 3: ZAUSTAVLJANJE
    console.log("UPAO U BROJ nakon", bounceFrameCount, "frejmova");
    bounceFrameCount = 0;

    angularSpeed = 0;
    r = 105;
    ball.x = app.screen.width / 2 + r * Math.cos(theta);
    ball.y = app.screen.height / 2 + r * Math.sin(theta);
    isBallSpinning = false;
    setTimeout(resetAll, 6000);
  }

  theta -= delta * angularSpeed;
}
function animateWheel(delta) {
  if (!roulleteWheel || !isSpinning) return;

  // Uvek rotira napred
  currentRotation += spinSpeed * delta;
  // console.log("DELTA: ", delta);

  let speed70 = initialSpeed * 0.7;
  let speed50 = initialSpeed * 0.5;
  let speed30 = initialSpeed * 0.3;
  let speed10 = initialSpeed * 0.1;
  if (spinSpeed > speed70) {
    spinSpeed *= 0.9982;
  } else if (spinSpeed > speed50) {
    spinSpeed *= 0.9972;
  } else if (spinSpeed > speed30) {
    spinSpeed *= 0.9962;
  } else if (spinSpeed > speed10) {
    spinSpeed *= 0.9942;
  } else {
    spinSpeed *= 0.9922;
  }

  // console.log("SPIN SPEED : ", spinSpeed);
  if (spinSpeed < 0.001) {
    // ovaj uslov ga vraca na pocetak , da nula bude na 12h, ali ovde ga isece samo
    if (currentRotation % (Math.PI * 2) != 0) {
      currentRotation = currentRotation - (currentRotation % (Math.PI * 2));
    }
    spinSpeed = 0;
    isSpinning = false;
    console.log(
      `Tocak je stao na ritaciji : ${currentRotation.toFixed(2)} radijana`,
    );
    console.log(`To je  ${((currentRotation * 180) / Math.PI).toFixed(1)}`);
  }
  // initBall();
  roulleteWheel.rotation = currentRotation;
}

function spinRouletteWheel() {
  if (isSpinning) {
    console.log("Spin already in progress");
    return;
  }
  r = 175;
  theta = Math.random() * Math.PI * 2;
  angularSpeed = 0.045 + Math.random() * 0.01;

  isSpinning = true;
  isBallSpinning = true;

  spinSpeed = 0.12 + Math.random() * 0.1;
  initialSpeed = spinSpeed;
  // console.log("Pocetna brzina : ", spinSpeed.toFixed(2));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRouletteWheel);
} else {
  initRouletteWheel();
}
function resetAll() {
  currentRotation = 0;
  if (roulleteWheel) {
    roulleteWheel.rotation = 0;
  }

  if (ball) {
    ball.x = INITIAL_STATE.ball.x;
    ball.y = INITIAL_STATE.ball.y;
  }
}
window.resetAll = resetAll;
window.spinRouletteWheel = spinRouletteWheel;
