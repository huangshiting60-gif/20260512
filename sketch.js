let capture;
let faceMesh;
let faces = [];

function preload() {
  // 載入 ml5.faceMesh 模型
  faceMesh = ml5.faceMesh();
}

function setup() {
  // 產生全螢幕畫布
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
  // 1. 背景改為馬卡龍粉藍色，與黃色的長頸鹿形成鮮明對比
  background(204, 240, 255); 
  
  // 2. 繪製緩緩飄過的馬卡龍色雲朵
  drawClouds();

  // 3. 繪製背景彩虹 (動態浮動)
  drawRainbow();

  // 4. 繪製動態叢林植物 (左右輕微搖擺)
  drawJungle();

  // 5. 繪製緩慢移動的動物
  drawAnimatedAnimals(); // 長頸鹿

  // 繪製學號
  push();
  fill(100, 100, 150); // 深馬卡龍藍文字，讓學號在淺色背景更清楚
  textSize(36);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  // 確保文字在畫布中間，且距離頂部有一點空間
  text("414730175", width / 2, 30);
  pop();

  // 繪製攝影機影像
  push();
  // 將原點移動到畫布中心
  translate(width / 2, height / 2);
  
  // 左右顛倒處理 (鏡像)
  scale(-1, 1);
  
  // 計算影像大小 (畫布寬高的 50%)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
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

// 繪製馬卡龍動態彩虹
function drawRainbow() {
  push();
  noFill();
  let centerX = width / 2;
  let centerY = height * 1.0; // 將中心點放在螢幕下方，形成大圓弧，稍微上移
  let baseRadius = width * 1.2;
  let thickness = 30;
  
  // 馬卡龍彩虹色系
  let rainbowColors = [
    color(255, 179, 186, 150), // 粉紅 (更透明)
    color(255, 223, 186, 150), // 粉橘 (更透明)
    color(255, 255, 186, 150), // 粉黃 (更透明)
    color(186, 255, 201, 150), // 粉綠 (更透明)
    color(186, 225, 255, 150), // 粉藍 (更透明)
    color(220, 186, 255, 150)  // 粉紫 (更透明)
  ];

  for (let i = 0; i < rainbowColors.length; i++) {
    stroke(rainbowColors[i]);
    strokeWeight(thickness);
    let r = baseRadius - (i * thickness * 2);
    let floating = sin(frameCount * 0.02 + i * 0.5) * 10; // 每個顏色有微小時間差的浮動
    arc(centerX, centerY + floating, r, r, PI, TWO_PI);
  }
  pop();
}

// 繪製緩緩飄過的馬卡龍色雲朵
function drawClouds() {
  noStroke();
  // 雲朵顏色改為純白色
  let cloudColors = [
    color(255, 255, 255, 220), 
    color(255, 255, 255, 220), 
    color(255, 255, 255, 220)
  ];

  // 雲朵 1
  let cloud1X = (frameCount * 0.5) % (width + 200) - 100;
  fill(cloudColors[0]);
  ellipse(cloud1X, height * 0.15, 150, 80);
  ellipse(cloud1X + 60, height * 0.18, 100, 60);
  ellipse(cloud1X - 50, height * 0.12, 120, 70);

  // 雲朵 2
  let cloud2X = (frameCount * 0.8 + width / 2) % (width + 200) - 100;
  fill(cloudColors[1]);
  ellipse(cloud2X, height * 0.25, 120, 70);
  ellipse(cloud2X + 40, height * 0.22, 80, 50);

  // 雲朵 3
  let cloud3X = (frameCount * 0.3 + width / 4) % (width + 200) - 100;
  fill(cloudColors[2]);
  ellipse(cloud3X, height * 0.1, 100, 50);
}

// 繪製叢林與搖擺效果
function drawJungle() {
  // 移除底部的綠色灌木元素
}

// 繪製動畫動物
function drawAnimatedAnimals() {
  // 長頸鹿從左往右走
  let gX = (frameCount * 1.2) % (width + 200) - 100;
  // 增加輕微的上下晃動感
  let gY = height * 0.75 + sin(frameCount * 0.1) * 5;
  drawCuteGiraffe(gX, gY);
}

// 精細版的長頸鹿形狀
function drawCuteGiraffe(x, y) {
  push();
  translate(x, y);
  scale(0.7); // 稍微縮小整體比例，讓它看起來更可愛
  noStroke();
  fill(255, 240, 180); // 更柔和的馬卡龍黃色
  
  // 身體 (更圓潤)
  ellipse(0, 0, 100, 60); 
  
  // 腿 (稍微粗短)
  rect(-35, 20, 15, 40, 5);     // 後左腿
  rect(20, 20, 15, 40, 5);      // 前左腿
  rect(-20, 20, 15, 40, 5);     // 後右腿 (部分遮擋)
  rect(35, 20, 15, 40, 5);      // 前右腿 (部分遮擋)

  // 脖子 (依然細長，但稍微粗一點)
  rect(30, -80, 20, 90, 10); 
  
  // 頭部 (更圓潤)
  ellipse(45, -90, 50, 40);  
  
  // 耳朵 (小巧可愛)
  fill(255, 240, 180);
  ellipse(30, -105, 10, 15); // 左耳
  ellipse(60, -105, 10, 15); // 右耳
  
  // 角 (小巧圓潤)
  fill(210, 180, 140); // 棕色
  ellipse(35, -115, 8, 10);  
  ellipse(55, -115, 8, 10);  

  // 斑點 (更柔和，大小不一)
  fill(210, 180, 140, 180); // 稍微不透明的淡咖啡色
  circle(-20, -10, 15);
  circle(10, 5, 18);
  circle(35, -50, 10);
  circle(50, -70, 12);
  circle(0, 20, 10);

  // 眼睛與閃光
  noStroke();
  fill(0);
  circle(35, -95, 8); // 左眼
  circle(55, -95, 8); // 右眼
  fill(255);
  circle(37, -97, 3); // 左眼神光點
  circle(57, -97, 3); // 右眼神光點
  
  // 簡單的嘴巴
  fill(255, 150, 150, 150); // 改用可愛的粉紅色嘴巴
  arc(45, -80, 20, 10, 0, PI, CHORD); // 簡單的弧形嘴巴

  // 尾巴 (更蓬鬆)
  stroke(210, 180, 140);
  strokeWeight(4);
  line(-50, 10, -65, 30);
  noStroke();
  fill(210, 180, 140);
  ellipse(-65, 35, 10, 15); // 尾巴末端的絨毛
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
      circle(x, y + (j * (imgH * 0.05)), imgH * 0.02);
    }
  }
}

// 當視窗大小改變時，重新調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
