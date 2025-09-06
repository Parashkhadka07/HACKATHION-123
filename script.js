// Elements needed
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gestureText = document.getElementById("gestureName");
canvas.width = 320;
canvas.height = 240;

// Camera on 
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error("Camera error:", err));

// to take out the distance between two points
function distance(a, b) {
  return Math.sqrt((b[0] - a[0])**2 + (b[1] - a[1])**2);
}

// Gesture detection
function detectGesture(landmarks) {
  
  
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const indexBase = landmarks[5];
  const middleBase = landmarks[9];
  const ringBase = landmarks[13];
  const pinkyBase = landmarks[17];

  const indexUp = indexTip[1] < indexBase[1];
  const middleUp = middleTip[1] < middleBase[1];
  const ringUp = ringTip[1] < ringBase[1];
  const pinkyUp = pinkyTip[1] < pinkyBase[1];

  const fingersUp = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

  if (fingersUp === 1 && indexUp) {
    return "1 Finger Up";
  } else if (fingersUp === 2 && indexUp && middleUp) {
    return "2 Fingers Up";
  } else if (fingersUp === 3 && indexUp && middleUp && ringUp) {
    return "3 Fingers Up";
  } else if (fingersUp === 4 && indexUp && middleUp && ringUp && pinkyUp) {
    return "palm";
  }  else if (
    thumbTip[1] < wrist[1] &&
    distance(thumbTip, wrist) > 60 &&
    !indexUp &&
    !middleUp &&
    !ringUp &&
    !pinkyUp
  ) {
    return "Thumbs Up";
  } else if (
    thumbTip[1] > wrist[1] &&
    distance(thumbTip, wrist) > 60 &&
    !indexUp &&
    !middleUp &&
    !ringUp &&
    !pinkyUp
  ) {
    return "Thumbs Down";
  } else if (
    distance(thumbTip, indexTip) < 30 &&
    middleUp &&
    ringUp &&
    pinkyUp
  ) {
    return "OK Sign";
  } else if (
    !indexUp &&
    !middleUp &&
    !ringUp &&
    !pinkyUp &&
    distance(thumbTip, wrist) < 50
  ) {
    return "Fist";
  } else if (
    distance(thumbTip, indexTip) < 30 &&
    !middleUp &&
    !ringUp &&
    !pinkyUp
  ) {
    return "Pinch";
  } else {
    return "Unknown";
  }
}
///for dark mode
function toggleDarkMode() {
    const body = document.body;
    const toggleBtn = document.getElementById('darkModeToggle');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
      if(toggleBtn) toggleBtn.textContent = "Light Mode";
    } else {
      if(toggleBtn) toggleBtn.textContent = "Dark Mode";
    }
  }

// Gesture actions
const btn = document.getElementById('darkModeToggle');
let canToggleDark = true; // flag to control toggle

function performAction(gesture) {
  switch(gesture) {
    case "1 Finger Up": loadTab("home.html"); break;
    case "2 Fingers Up": loadTab("About.html"); break;
    case "3 Fingers Up": loadTab("rooms.html"); break;
    case "Thumbs Down": loadTab("contact.html"); break;
    case "Thumbs Up": loadTab("services.html"); break;

    case "palm":
      if (canToggleDark) {
        btn.click();            // toggle dark mode
        canToggleDark = false;  // disable further toggles temporarily

        // Re-enable after 1 second (1000ms)
        setTimeout(() => {
          canToggleDark = true;
        }, 2000);
      }
      break;
  }
}

// Load tab content
function loadTab(file) {
  fetch(file)
    .then(res => res.text())
    .then(data => document.getElementById("content").innerHTML = data)
    .catch(err => console.error(err));
}

// Load handpose model
let model;
handpose.load().then(m => {
  model = m;
  detectHands();
});


// Detection loop
async function detectHands() {
  if (video.readyState === 4 && model) {
    const predictions = await model.estimateHands(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
      predictions.forEach(pred => {
        pred.landmarks.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x/2, y/2, 5, 0, Math.PI*2);
          ctx.fillStyle = "red";
          ctx.fill();
        });
        const gesture = detectGesture(pred.landmarks);
        gestureText.textContent = "Gesture: " + gesture;
        performAction(gesture);
      });
    } else {
      gestureText.textContent = "Gesture: None";
    }
  }
  requestAnimationFrame(detectHands);
}
