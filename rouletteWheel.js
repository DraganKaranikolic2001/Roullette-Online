let app;
let roulleteWheel;
let isSpinning = false;
let isBallSpinning = false;
let currentRotation = 0;
let spinSpeed = 0;
let targetRotation = 0;
let initialSpeed;
let widthApp = 400;
let heightApp = 400;
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
    width: widthApp,
    height: heightApp,
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
      ball.y = app.screen.height * 0.1;
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

function animateBall(delta) {
  if (!ball || !isBallSpinning) return;
  if (r >= 115) {
    r -= 0.03 * delta;
    angularSpeed *= 0.9995;

    ball.x = app.screen.width / 2 + r * Math.cos(theta);
    ball.y = app.screen.height / 2 + r * Math.sin(theta);
  } else if (r < 115 && r > 105) {
    r -= 0.02 * delta; 
    angularSpeed *= 0.993; 

    
    let wobble = 5;
    let offsetX = Math.sin(theta * 12) * wobble; 
    let offsetY = Math.cos(theta * 12) * wobble;

    ball.x = app.screen.width / 2 + r * Math.cos(theta) + offsetX;
    ball.y = app.screen.height / 2 + r * Math.sin(theta) + offsetY;
  } else {
    angularSpeed = 0;
    r = 105;
    // ball.x = app.screen.width / 2 + r * Math.cos(theta);
    // ball.y = app.screen.height / 2 + r * Math.sin(theta);
    isBallSpinning = false;
    setTimeout(resetAll, 3000);
  }

  // console.log("Ball X : " , ball.x);
  // console.log("Ball Y : " , ball.y);
  theta -= delta * angularSpeed;
  // console.log("THETA : ", theta);
}
function animateWheel(delta) {
  if (!roulleteWheel || !isSpinning) return;

  // Uvek rotira napred
  currentRotation += spinSpeed * delta;
  console.log("DELTA: ", delta);

  let speed70 = initialSpeed * 0.7;
  let speed50 = initialSpeed * 0.5;
  let speed30 = initialSpeed * 0.3;
  if (spinSpeed > speed70) {
    spinSpeed *= 0.9982;
  } else if (spinSpeed > speed50) {
    spinSpeed *= 0.9972;
  } else if (spinSpeed > speed30) {
    spinSpeed *= 0.9962;
  } else {
    spinSpeed *= 0.9942;
  }
  console.log("SPIN SPEED : ", spinSpeed);
  if (spinSpeed < 0.001) {
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
  r = 160;
  theta = 100;
  angularSpeed = 0.05;

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
