// JavaScript
const CONFIG_text = {
    POINT_COUNT: 850,          // 点の数（テキスト表現のため増やしました）
    MORPH_INTERVAL: 2000,       // 形状変化間隔（ミリ秒）
    SIZE: 80,                  // オブジェクトの基本サイズ
    ROTATION_SPEED: 0.0005      // 回転速度
};

class TextPointCloud {
    constructor() {
        this.container = document.getElementById('container-text');
        this.points = [];
        this.currentShape = 0;
        // 回転を無効化するため、角度は常に0
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.pointPositions = [];
        this.lastTime = 0;
        this.targetPositions = [];

        // マウスインタラクション用のプロパティ
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
        this.lastMouseX = window.innerWidth / 2;
        this.lastMouseY = window.innerHeight / 2;
        this.shapes = [
            this.generateText.bind(this),
        ];
        
        this.init();
    }
    
    init() {
        this.createPoints();
        this.startMorphing();
        // マウスイベントのリスナーを追加
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.animate(0);
    }
    
    createPoints() {
        for (let i = 0; i < CONFIG_text.POINT_COUNT; i++) {
            const point = document.createElement('div');
            point.className = 'point';
            this.container.appendChild(point);
            this.points.push(point);
            this.pointPositions.push({ x: 0, y: 0, z: 0, repulsionX: 0, repulsionY: 0 }); // 反発エフェクト用のプロパティを追加
            this.targetPositions.push({ x: 0, y: 0, z: 0 });
        }
    }

    // --- 図形生成メソッド ---

    generateText() {
        const positions = [];
        const text = "Making makes us happy";
        const fontSize = 40;
        const fontFamily = "sans-serif";
        const canvasWidth = 1000; // 文字列が収まるように幅を広げる
        const canvasHeight = 120;

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        // テキストの描画設定
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
        const sampledCoords = [];

        // テキストが描画されているピクセル座標をサンプリング
        for (let y = 0; y < canvasHeight; y += 2) { // 2ピクセルごとにサンプリング
            for (let x = 0; x < canvasWidth; x += 2) {
                const alpha = data[(y * canvasWidth + x) * 4 + 3];
                if (alpha > 128) { // ある程度濃い部分のみ
                    sampledCoords.push({ 
                        x: x - canvasWidth / 2, 
                        y: y - canvasHeight / 2 
                    });
                }
            }
        }

        // サンプリングした座標からランダムに点を選ぶ
        for (let i = 0; i < CONFIG_text.POINT_COUNT; i++) {
            if (sampledCoords.length > 0) {
                const coord = sampledCoords[Math.floor(Math.random() * sampledCoords.length)];
                // Zに少し厚みを持たせる
                positions.push({ x: coord.x, y: coord.y, z: (Math.random() - 0.5) * 20 }); 
            }
        }
        return positions;
    }
    
    // --- マウスイベント処理 ---
    onMouseMove(event) {
        // 前回のマウス位置からの移動量を計算
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        // 移動量の1/4をオフセットに加える
        this.mouseOffsetX += deltaX * 0.25;
        this.mouseOffsetY += deltaY * 0.25;

        // 現在のマウス位置を保存
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    // --- アニメーション関連メソッド ---

    rotatePoint(x, y, z, rotX, rotY, rotZ) {
        let newY = y * Math.cos(rotX) - z * Math.sin(rotX);
        let newZ = y * Math.sin(rotX) + z * Math.cos(rotX);
        y = newY; z = newZ;
        
        let newX = x * Math.cos(rotY) + z * Math.sin(rotY);
        newZ = -x * Math.sin(rotY) + z * Math.cos(rotY);
        x = newX; z = newZ;
        
        newX = x * Math.cos(rotZ) - y * Math.sin(rotZ);
        newY = x * Math.sin(rotZ) + y * Math.cos(rotZ);
        
        return { x: newX, y: newY, z: newZ };
    }
    
    calculatePointColor(pos, timestamp) {
        // HSL色空間を使用して、紫と黄緑を基調とした柔らかいグラデーションを生成

        // 1. 時間と位置に基づいてゆっくり変化する値を計算
        // 速度を落として、より緩やかな変化にする
        const waveValue = timestamp * 0.0005 + pos.x * 0.01 + pos.y * 0.01;

        // 2. sin関数で-1から1の範囲の値を取得し、色相の範囲をマッピング
        // 黄緑(約90)から紫(約270)の間を振動させる
        const oscillation = Math.sin(waveValue); // -1 to 1
        const hue = 180 + oscillation * 90;      // 90 (黄緑) から 270 (紫) の範囲にマッピング

        // 3. 彩度を少し下げて、柔らかい色合いにする
        const saturation = 75; // 100%から下げてソフトに

        // 4. 明度を奥行き(Z)によって変化させる
        const normalizedZ = Math.max(0, Math.min(1, (pos.z + CONFIG_text.SIZE) / (CONFIG_text.SIZE * 2)));
        const lightness = (1 - normalizedZ) * 30 + 45; // 45%〜75%の範囲で、少し明るめに調整
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // マウスによるオフセットを徐々に減衰させる（元の位置に戻る動き）
        this.mouseOffsetX *= 0.95;
        this.mouseOffsetY *= 0.95;

        this.points.forEach((point, i) => {
            const currentPos = this.pointPositions[i];
            const targetPos = this.targetPositions[i];

            // モーフィング：目標座標に滑らかに近づける
            currentPos.x += (targetPos.x - currentPos.x) * 0.05;
            currentPos.y += (targetPos.y - currentPos.y) * 0.05;
            currentPos.z += (targetPos.z - currentPos.z) * 0.05;

            // マウスの移動速度に応じて揺れを大きくする
            const mouseSpeed = Math.sqrt(this.mouseOffsetX * this.mouseOffsetX + this.mouseOffsetY * this.mouseOffsetY);
            const baseWobbleFactor = 0.5; // 基本の揺れの大きさ
            const speedWobbleMultiplier = 0.05; // 速度に応じた揺れの追加量
            const wobbleFactor = baseWobbleFactor + mouseSpeed * speedWobbleMultiplier;

            const wobbleSpeed = 0.002; // 揺れの速さ
            const wobbleX = Math.sin(timestamp * wobbleSpeed + i) * wobbleFactor;
            const wobbleY = Math.cos(timestamp * wobbleSpeed + i * 0.5) * wobbleFactor;
            const wobbleZ = Math.sin(timestamp * wobbleSpeed * 0.5 + i * 0.25) * wobbleFactor;

            // 揺れを適用した座標で回転計算（現在は回転停止中）
            const rotatedPos = this.rotatePoint(currentPos.x + wobbleX, currentPos.y + wobbleY, currentPos.z + wobbleZ, this.rotationX, this.rotationY, this.rotationZ);
            
            // マウスからの反発力を計算
            const repulsionRadius = 20; // マウスからこの半径内にある点が影響を受ける (100から80へ変更)
            const repulsionStrength = 10; // 弾け飛ぶ強さ
            const mouseX = this.lastMouseX - window.innerWidth / 2;
            const mouseY = this.lastMouseY - window.innerHeight / 2;

            const dx = rotatedPos.x - mouseX;
            const dy = rotatedPos.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 反発力を徐々に減衰させる（元の位置に戻る動き）
            currentPos.repulsionX *= 0.9;
            currentPos.repulsionY *= 0.9;

            if (distance < repulsionRadius) {
                const force = (1 - distance / repulsionRadius) * repulsionStrength;
                currentPos.repulsionX += (dx / distance) * force;
                currentPos.repulsionY += (dy / distance) * force;
            }

            // scaleの基本値を大きくして、点のサイズを全体的に大きくする
            const scale = 1.1 + Math.max(0, (rotatedPos.z + CONFIG_text.SIZE) / (CONFIG_text.SIZE * 2));
            const color = this.calculatePointColor(rotatedPos, timestamp);

            point.style.backgroundColor = color;
            const finalX = rotatedPos.x + currentPos.repulsionX + this.mouseOffsetX;
            const finalY = rotatedPos.y + currentPos.repulsionY + this.mouseOffsetY;
            point.style.transform = `translate3d(${finalX}px, ${finalY}px, ${rotatedPos.z}px) scale(${scale})`;
        });

        requestAnimationFrame(this.animate.bind(this));
    }
    
    morphToShape(positions) {
        this.targetPositions = positions;
    }
    
    startMorphing() {
        const morph = () => {
            // 常に最初の形状（テキスト）をターゲットにする
            const positions = this.shapes[this.currentShape]();
            this.morphToShape(positions);
        };
        morph();
    }
}

// アニメーション開始
new TextPointCloud();