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
  let targetNumber = null; // Broj koji je backend generisao
  let targetAngle = null; // Ciljni ugao za lopticu

  const INITIAL_STATE = {
    ball: {
      x: null,
      y: null,
    },
  };

  // ========================================
  // MAPA POZICIJA BROJEVA NA RULETU
  // ========================================
  // Evropski rulet - standardni redosled brojeva (CW od vrha)
  const rouletteNumberOrder = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
    16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
  ];

  const anglePerNumber = (Math.PI * 2) / 37;

  // ✅ OFFSET KOREKCIJA:
  // U PIXI.js theta=0 je desno (3h pozicija) = broj 34
  // Broj 0 je gore (12h pozicija) = theta = 3π/2
  // Broj 34 je na indeksu 9, dakle offset = -9 * anglePerNumber
  const INDEX_OF_34 = rouletteNumberOrder.indexOf(34); // Indeks broja 34 = 9
  const ANGLE_OFFSET = -INDEX_OF_34 * anglePerNumber; // Offset za theta=0 na broj 34

  // Mapa: broj -> ugao (u radijanima, theta=0 = 3h/broj 34, raste CW)
  const numberAngles = {};
  rouletteNumberOrder.forEach((number, index) => {
    // Primenjujemo offset da bi theta=0 pokazivao na broj 34 (3h pozicija)
    let angle = index * anglePerNumber + ANGLE_OFFSET;

    // Normalizujemo ugao u opseg [0, 2π)
    angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    numberAngles[number] = angle;
  });

  function getAngleForNumber(number) {
    return numberAngles[number] || 0;
  }

  // 🐛 DEBUG: Proveri da li je mapiranje tačno
  console.log(
    `✅ Broj 34 (3h/theta=0): ${numberAngles[34]?.toFixed(4)} rad (${((numberAngles[34] * 180) / Math.PI)?.toFixed(1)}°)`,
  );
  console.log(
    `✅ Broj 0 (12h/theta=3π/2): ${numberAngles[0]?.toFixed(4)} rad (${((numberAngles[0] * 180) / Math.PI)?.toFixed(1)}°)`,
  );
  // ========================================

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
        // console.log("APPSCREEN", app.screen.width);
        // console.log("BALL WIDTH : ", ball.width);
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

  function animateBall(delta) {
    if (!ball || !isBallSpinning) return;

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

        // 🎯 OVDE USMERAVAMO LOPTICU KA CILJNOM BROJU
        if (targetNumber !== null) {
          targetAngle = getAngleForNumber(targetNumber);
          // console.log(
          //   `🎯 Target broj: ${targetNumber}, target ugao: ${targetAngle.toFixed(2)} rad (${((targetAngle * 180) / Math.PI).toFixed(1)}°)`,
          // );

          // Prilagodi theta da ide ka target uglu
          // Loptica trenutno ima theta, moramo je usmeriti ka targetAngle
          // Ali mora da uradi još nekoliko rotacija pre nego što stigne
          const fullRotations = 2; // Dodatne rotacije za dramatičan efekat
          const additionalRotation = fullRotations * Math.PI * 2;

          // Normalizuj trenutni theta
          const normalizedTheta =
            ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

          // Izračunaj koliko je udaljen targetAngle od trenutnog theta
          // Loptica ide CCW (negativno), tako da targetAngle treba biti ispred
          let angleDiff = targetAngle - normalizedTheta;

          // Normalizuj razliku da bude u opsegu [-π, π]
          if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          // Postavi novu ugaoną brzinu tako da loptica stigne tačno na targetAngle
          // Bounce faza traje 420 frejmova, moramo izračunati brzinu
          const totalFrames = 420;
          const targetThetaFinal = theta - additionalRotation + angleDiff;

          // Novaчугаона brzina će polako usporavati
          // Jednostavnije rešenje: direktno targetiramo finalni ugao
          // console.log(`Current theta: ${theta.toFixed(2)}, Target final theta: ${targetThetaFinal.toFixed(2)}`);
        }
      }
    } else if (inBouncingPhase) {
      // FAZA 2: BOUNCE sa targetiranjem
      bounceFrameCount++;

      const totalBounceFrames = 420;
      const progress = bounceFrameCount / totalBounceFrames;

      let baseR = 110;
      let bounceAmplitude = 40 * (1 - progress);
      let oscillation = -Math.sin(progress * Math.PI * 3) * bounceAmplitude;
      r = baseR + oscillation;

      // 🎯 PRECISION TARGETING: Postepeno usmeravaj theta ka targetAngle
      if (targetAngle !== null) {
        // Normalizuj theta
        const normalizedTheta =
          ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        // Izračunaj razliku do cilja (u CW smeru, jer loptica ide CCW)
        let angleDiff = normalizedTheta - targetAngle;

        // Normalizuj razliku
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Postepeno smanjuj ugaonu brzinu i usmeravaj ka cilju
        // U poslednjoj trećini bouncinga, tačno cilja broj
        if (progress > 0.66) {
          // Precision mode - veoma sporo prilagođavaj ka tačnom uglu
          const correctionFactor = (0.05 * (progress - 0.66)) / 0.34; // 0 do 0.05
          angularSpeed *= 0.999 - correctionFactor;

          // Direktna korekcija theta ka targetAngle
          theta -= angleDiff * correctionFactor;
        } else {
          // Normalno usporavanje
          angularSpeed *= 0.999;
        }
      } else {
        // Nema target broja, normalno usporavanje
        angularSpeed *= 0.999;
      }

      ball.x = app.screen.width / 2 + r * Math.cos(theta);
      ball.y = app.screen.height / 2 + r * Math.sin(theta);

      if (bounceFrameCount >= totalBounceFrames) {
        inBouncingPhase = false;
        r = 105;

        // 🎯 FINALNA KOREKCIJA: Postavi theta tačno na targetAngle
        if (targetAngle !== null) {
          theta = targetAngle;
          // console.log(`✅ Loptica je stigla na broj ${targetNumber} (${theta.toFixed(2)} rad)`);
        }
      }
    } else {
      // FAZA 3: ZAUSTAVLJANJE
      // console.log("UPAO U BROJ nakon", bounceFrameCount, "frejmova");
      bounceFrameCount = 0;

      angularSpeed = 0;
      r = 105;

      // Finalna pozicija
      ball.x = app.screen.width / 2 + r * Math.cos(theta);
      ball.y = app.screen.height / 2 + r * Math.sin(theta);
      isBallSpinning = false;

      setTimeout(resetAll, 6000);
    }

    // Nastavi kretanje loptice CCW
    theta -= delta * angularSpeed;
  }

  let targetStopRotation = 0; // DODAJ OVO GLOBALNO
  function animateWheel(delta) {
    console.log(
      "🔄 animateWheel POZVAN - isSpinning:",
      isSpinning,
      "roulleteWheel:",
      !!roulleteWheel,
    );

    if (!roulleteWheel || !isSpinning) return;

    const remainingDistance = targetStopRotation - currentRotation;

    // Ako smo stigli - STOP
    if (remainingDistance <= 0.001) {
      currentRotation = targetStopRotation;
      roulleteWheel.rotation = 0;
      spinSpeed = 0;
      isSpinning = false;
      app.ticker.remove(animateWheel);
      console.log("✅ ZAUSTAVLJENO tačno na 12h");
      return;
    }

    // 🔥 DODAJ MINIMUM BRZINU - ako je premala, skoči na cilj!
    if (spinSpeed < 0.005) {
      console.log("⚠️ Brzina premala, prelazim u finalni režim");
      const finalStep = Math.min(remainingDistance * 0.1, remainingDistance);
      currentRotation += finalStep;
      const displayRotation = currentRotation % (Math.PI * 2);
      roulleteWheel.rotation = displayRotation;
      return;
    }

    // 🔥 FINALNI režim - samo kada je BLIZU (ispod 0.5 rad)
    if (remainingDistance < 0.5) {
      const finalStep = remainingDistance * 0.05;
      currentRotation += finalStep;
      const displayRotation = currentRotation % (Math.PI * 2);
      roulleteWheel.rotation = displayRotation;
      console.log(
        `🎯 FINALA: ${remainingDistance.toFixed(4)} rad, korak: ${finalStep.toFixed(6)}`,
      );
      return;
    }

    // Normalan režim
    const nextStep = spinSpeed * delta;
    currentRotation += nextStep;
    const displayRotation = currentRotation % (Math.PI * 2);
    roulleteWheel.rotation = displayRotation;

    // USPORAVANJE - BEZ agresivnog režima
    // 🔥 PROMENI: poslednji krug počinje tek ispod 1 radijana
    if (remainingDistance < 1.0) {
      const percentRemaining = remainingDistance;
      spinSpeed *= 0.85 + percentRemaining * 0.1; // Manje agresivno
    } else {
      // Normalno usporavanje
      const speed70 = initialSpeed * 0.7;
      const speed50 = initialSpeed * 0.5;
      const speed30 = initialSpeed * 0.3;
      const speed10 = initialSpeed * 0.1;

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
    }

    console.log(
      `📊 remaining: ${remainingDistance.toFixed(2)}, speed: ${spinSpeed.toFixed(4)}, step: ${nextStep.toFixed(4)}`,
    );
  }
  /**
   * Pokreće spin ruleta sa targetiranim brojem
   * @param {number} winningNumber - Broj na koji loptica treba da padne (0-36)
   */
  function spinRouletteWheel(winningNumber) {
    if (isSpinning) {
      return;
    }

    // Postavi target broj
    targetNumber = winningNumber;

    const MIN_ROTATIONS = 4;
    const rotations = MIN_ROTATIONS + Math.floor(Math.random() * 2);
    targetStopRotation = rotations * Math.PI * 2;

    // 🔥 KLJUČNO: Resetuj currentRotation na početak! 🔥
    currentRotation = 0;

    r = 175;
    theta = Math.random() * Math.PI * 2;
    angularSpeed = 0.045 + Math.random() * 0.01;

    isSpinning = true;
    isBallSpinning = true;

    spinSpeed = 0.12 + Math.random() * 0.1;
    initialSpeed = spinSpeed;
    app.ticker.add(animateWheel);
    console.log("🚀 SPIN POČEO - animateWheel dodato");

    // Ovo već postoji, ostavi:
    app.ticker.add(animateBall);
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

    // Reset target values
    targetNumber = null;
    targetAngle = null;
    inBouncingPhase = false;
    bounceFrameCount = 0;
  }

  window.resetAll = resetAll;
  window.spinRouletteWheel = spinRouletteWheel;
