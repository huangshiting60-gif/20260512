let capture;
let faceMesh;
let faces = [];
let handPose;
let hands = [];
let earringImages = []; // 用於儲存 5 張耳環圖片
let currentGesture = 0; // 儲存手指伸出的數量

function preload() {
  // 載入 ml5.faceMesh 模型
  faceMesh = ml5.faceMesh();
  // 載入 ml5.handPose 模型
  handPose = ml5.handPose();
  // 載入五種手勢對應的耳環圖片
  earringImages[0] = loadImage('picture/acc1_ring.png');
  earringImages[1] = loadImage('picture/acc2_pearl.png');
  earringImages[2] = loadImage('picture/acc3_tassel.png');
  earringImages[3] = loadImage('picture/acc4_jade.png');
  earringImages[4] = loadImage('picture/acc5_phoenix.png');
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
  // 開始持續偵測手部
  handPose.detectStart(capture, gotHands);
}

function gotFaces(results) {
  faces = results;
}

function gotHands(results) {
  hands = results;
  if (hands.length > 0) {
    currentGesture = countExtendedFingers(hands[0].landmarks);
  } else {
    currentGesture = 0;
  }
}

// 判斷有多少手指伸出
function countExtendedFingers(landmarks) {
  let extendedFingers = 0;
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3]; // Intermediate Phalanx
  const thumbMCP = landmarks[2]; // Metacarpophalangeal
  const wrist = landmarks[0];

  // 判斷拇指：如果拇指尖的Y座標比它的IP關節Y座標小，且X座標在手腕外側 (簡化判斷)
  // 這裡簡化為拇指尖Y座標比MCP Y座標小，並假設拇指是向上的
  if (thumbTip.y < thumbIP.y && thumbTip.y < thumbMCP.y) {
    extendedFingers++;
  }

  // 判斷其他四指 (食指、中指、無名指、小指)
  // 每個手指的關鍵點索引：
  // 食指: tip=8, dip=7, pip=6, mcp=5
  // 中指: tip=12, dip=11, pip=10, mcp=9
  // 無名指: tip=16, dip=15, pip=14, mcp=13
  // 小指: tip=20, dip=19, pip=18, mcp=17
  const fingerTips = [8, 12, 16, 20];
  const fingerMCPs = [5, 9, 13, 17];

  for (let i = 0; i < fingerTips.length; i++) {
    if (landmarks[fingerTips[i]].y < landmarks[fingerMCPs[i]].y) { // 尖端Y座標小於MCP Y座標表示伸出
      extendedFingers++;
    }
  }
  return extendedFingers;
}

function draw() {
  // 1. 背景改為馬卡龍奶黃色
  background(255, 253, 208); 
  
  // 2. 繪製緩緩飄過的馬卡龍色雲朵
  drawClouds();

  // 3. 繪製背景彩虹 (動態浮動)
  drawRainbow();

  // 4. 繪製緩慢移動的動物 (小兔子)
  drawAnimatedAnimals();

  // 繪製學號
  push();
  fill(150, 120, 50); // 深咖啡色文字，搭配奶黃背景較協調
  textSize(36);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  // 確保文字在畫布中間，且距離頂部有一點空間
  text("414730175", width / 2, 30);
  pop();

  // 繪製目前偵測到的手指數量
  push();
  // 在左下角繪製一個半透明底色，防止文字與背景打架
  noStroke();
  fill(255, 253, 208, 200); 
  rect(10, height - 50, 220, 40, 10);

  fill(150, 120, 50); 
  textSize(24);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("偵測到手指數量: " + currentGesture, 25, height - 30);
  pop();

  // 繪製攝影機影像
  push();
  // 將原點移動到畫布中心
  translate(width / 2, height / 2);
  
  // 左右顛倒處理 (鏡像)
  scale(-1, 1);
  
  // 設定影像繪製模式為中心，確保影像顯示在畫布中央
  imageMode(CENTER);
  
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

    // 根據手勢選擇耳環圖片，沒偵測到手勢時預設顯示第一張 (索引 0)
    let selectedEarringImage = earringImages[0];
    if (currentGesture > 0 && currentGesture <= earringImages.length) {
      selectedEarringImage = earringImages[currentGesture - 1];
    }

    drawEarring(rightLobe, imgW, imgH, selectedEarringImage);
    drawEarring(leftLobe, imgW, imgH, selectedEarringImage);
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
  // 雲朵顏色改為純白色，增加一點透明度更有質感
  let cloudColors = [
    color(255, 255, 255, 230), 
    color(255, 255, 255, 230), 
    color(255, 255, 255, 230)
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
  // 兔子從左往右平移，不再跳躍
  let bX = (frameCount * 2.5) % (width + 200) - 100;
  let bY = height * 0.88;
  drawCuteBunny(bX, bY);
}

// 精細版的長頸鹿形狀
function drawCuteGiraffe(x, y) {
  push();
  translate(x, y);
  scale(0.7); // 稍微縮小整體比例，讓它看起來更可愛
  // 身體 (馬卡龍粉)
  fill(255, 209, 220); 
  ellipse(0, 0, 80, 65);

  // 尾巴 (白色圓球)
  fill(255);
  circle(-40, 15, 18);

  // 頭部
  fill(255, 209, 220);
  ellipse(35, -15, 55, 50);

  // 耳朵 (長長的馬卡龍粉)
  ellipse(25, -55, 18, 55);
  ellipse(45, -55, 18, 55);
  
  // 內耳 (淺淺的粉白色)
  fill(255, 235, 240);
  ellipse(25, -55, 10, 40);
  ellipse(45, -55, 10, 40);

  // 兩顆有神的眼睛
  fill(0);
  circle(33, -22, 6); // 左眼
  circle(57, -22, 6); // 右眼
  // 眼神光
  fill(255);
  circle(34, -23, 2);
  circle(58, -23, 2);

  // 鼻子 (可愛的深粉紅)
  fill(255, 150, 170);
  triangle(45, -10, 51, -10, 48, -5);

  // 腮紅 (馬卡龍紅)
  fill(255, 180, 190, 150);
  circle(25, -10, 12);
  circle(65, -10, 12);

  pop();
}

// 繪製馬卡龍粉紅小兔子
function drawCuteBunny(x, y) {
  push();
  translate(x, y);
  scale(0.8);
  noStroke();
  
  // 身體 (馬卡龍粉)
  fill(255, 209, 220); 
  ellipse(0, 0, 80, 65);

  // 尾巴 (白色圓球)
  fill(255);
  circle(-40, 15, 18);

  // 頭部
  fill(255, 209, 220);
  ellipse(35, -15, 55, 50);

  // 耳朵 (長長的馬卡龍粉)
  ellipse(25, -55, 18, 55);
  ellipse(45, -55, 18, 55);
  
  // 內耳 (淺淺的粉白色)
  fill(255, 235, 240);
  ellipse(25, -55, 10, 40);
  ellipse(45, -55, 10, 40);

  // 兩顆有神的眼睛
  fill(0);
  circle(33, -22, 6); // 左眼
  circle(57, -22, 6); // 右眼
  // 眼神光
  fill(255);
  circle(34, -23, 2);
  circle(58, -23, 2);

  // 鼻子 (可愛的深粉紅)
  fill(255, 150, 170);
  triangle(45, -10, 51, -10, 48, -5);

  // 腮紅 (馬卡龍紅)
  fill(255, 180, 190, 150);
  circle(25, -10, 12);
  circle(65, -10, 12);

  pop();
}

// 當視窗大小改變時，重新調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 繪製耳環的輔助函式
function drawEarring(kp, imgW, imgH, selectedEarringImage) {
  if (kp && selectedEarringImage) {
    // 將偵測點映射到中央影像區域 (ml5 預設輸入通常為 640x480)
    let x = map(kp.x, 0, 640, -imgW / 2, imgW / 2);
    let y = map(kp.y, 0, 480, -imgH / 2, imgH / 2);

    // 設定耳環圖片大小比率 (影像高度的 8%)
    let earringSize = imgH * 0.08; 

    // 計算比率位移：
    // 往上：減去影像高度的 3%
    let moveUp = imgH * 0.03;
    // 往外：根據 x 座標正負判斷（在目前的鏡像座標系下，x > 0 是視覺右側，x < 0 是視覺左側）
    let moveOut = imgW * 0.02;
    
    let offsetX = (x > 0 ? moveOut : -moveOut);
    let offsetY = -moveUp;

    push();
    imageMode(CENTER);
    // 考慮到 scale(-1, 1) 的影響，直接在座標上加上偏移量
    image(selectedEarringImage, x + offsetX, y + offsetY, earringSize, earringSize);
    pop();
  }
}
