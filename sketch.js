let capture;
let faceMesh;
let faces = [];

function preload() {
  // 載入 ml5.faceMesh 模型
  faceMesh = ml5.faceMesh();
}

function setup() {
  // 步驟一：產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480); // 設定固定輸入尺寸以利座標映射
  capture.hide(); // 隱藏 HTML 預設的 video 物件
  
  // 開始持續偵測臉部
  faceMesh.detectStart(capture, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // 繪製馬卡龍色系的漸層背景
  let topColor = color(255, 204, 229); // 馬卡龍粉
  let bottomColor = color(204, 255, 255); // 馬卡龍青
  
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(topColor, bottomColor, inter);
    stroke(c);
    line(0, y, width, y);
  }

  // 設定影像繪製基準點為中心
  imageMode(CENTER);
  
  // 計算影像大小 (畫布寬高的 50%)
  let imgW = width * 0.5;
  let imgH = height * 0.5;

  push();
  // 將原點移動到畫布中心
  translate(width / 2, height / 2);
  
  // 左右顛倒處理 (鏡像)
  scale(-1, 1);
  
  // 繪製影像 (因為 translate 過，座標使用 0, 0)
  image(capture, 0, 0, imgW, imgH);

  // 辨識耳垂並畫出三個黃色圓圈 (耳環效果)
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    // 使用 MediaPipe FaceMesh 索引點：215 是右耳垂底部，435 是左耳垂底部
    let rightLobe = face.keypoints[215];
    let leftLobe = face.keypoints[435];

    drawEarring(rightLobe, imgW, imgH);
    drawEarring(leftLobe, imgW, imgH);
  }
  pop();
}

function drawEarring(kp, imgW, imgH) {
  if (kp) {
    // 將偵測點從影片原始尺寸映射到畫布上影像顯示的大小範圍
    let x = map(kp.x, 0, capture.width, -imgW / 2, imgW / 2);
    let y = map(kp.y, 0, capture.height, -imgH / 2, imgH / 2);

    fill(255, 255, 0); // 黃色
    noStroke();
    for (let j = 0; j < 3; j++) {
      // 由耳垂位置往下顯示三個圓圈，形成耳環樣式
      circle(x, y + (j * 15), 10);
    }
  }
}

// 當視窗大小改變時，重新調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
