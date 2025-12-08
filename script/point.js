// 設定変数
const CONFIG = {
    POINT_COUNT: 500,           // 点の数
    MORPH_INTERVAL: 4000,       // 形状変化間隔（ミリ秒）
    SIZE: 150,                  // オブジェクトの基本サイズ (例: 150から200へ変更)
    ROTATION_SPEED: 0.0005      // 回転速度
};

class PointCloud {
    constructor() {
        this.container = document.getElementById('container');
        this.points = [];
        this.currentShape = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.pointPositions = []; // 各点の現在の3D座標
        this.lastTime = 0;
        this.targetPositions = []; // モーフィングの目標座標
        
        this.shapes = [
            this.generateCube.bind(this),
            this.generateSphere.bind(this),
            this.generateTetrahedron.bind(this),
            // this.generatePyramid.bind(this)
        ];
        
        this.init();
    }
    
    init() {
        this.createPoints();
        this.startMorphing();
        this.animate(0);
    }
    
    createPoints() {
        for (let i = 0; i < CONFIG.POINT_COUNT; i++) {
            const point = document.createElement('div');
            point.className = 'point';
            this.container.appendChild(point);
            this.points.push(point);
            // 初期位置と目標位置を原点に設定
            this.pointPositions.push({ x: 0, y: 0, z: 0 });
            this.targetPositions.push({ x: 0, y: 0, z: 0 });
        }
    }
    
    generateCube() {
        const positions = [];
        const size = CONFIG.SIZE;
        
        for (let i = 0; i < CONFIG.POINT_COUNT; i++) {
            const face = Math.floor(Math.random() * 6);
            let x, y, z;
            
            switch(face) {
                case 0: // 前面
                    x = (Math.random() - 0.5) * size;
                    y = (Math.random() - 0.5) * size;
                    z = size / 2;
                    break;
                case 1: // 背面
                    x = (Math.random() - 0.5) * size;
                    y = (Math.random() - 0.5) * size;
                    z = -size / 2;
                    break;
                case 2: // 右面
                    x = size / 2;
                    y = (Math.random() - 0.5) * size;
                    z = (Math.random() - 0.5) * size;
                    break;
                case 3: // 左面
                    x = -size / 2;
                    y = (Math.random() - 0.5) * size;
                    z = (Math.random() - 0.5) * size;
                    break;
                case 4: // 上面
                    x = (Math.random() - 0.5) * size;
                    y = -size / 2;
                    z = (Math.random() - 0.5) * size;
                    break;
                case 5: // 下面
                    x = (Math.random() - 0.5) * size;
                    y = size / 2;
                    z = (Math.random() - 0.5) * size;
                    break;
            }
            positions.push({ x, y, z });
        }
        return positions;
    }
    
    generateSphere() {
        const positions = [];
        const radius = CONFIG.SIZE;
        
        for (let i = 0; i < CONFIG.POINT_COUNT; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions.push({ x, y, z });
        }
        return positions;
    }
    
    generateTetrahedron() {
        const positions = [];
        const size = CONFIG.SIZE;
        const s = size / 2;

        // 正四面体の4つの頂点
        const v1 = { x: s, y: s, z: s };
        const v2 = { x: s, y: -s, z: -s };
        const v3 = { x: -s, y: s, z: -s };
        const v4 = { x: -s, y: -s, z: s };

        const faces = [
            [v1, v2, v3], // 面1
            [v1, v2, v4], // 面2
            [v1, v3, v4], // 面3
            [v2, v3, v4]  // 面4
        ];

        for (let i = 0; i < CONFIG.POINT_COUNT; i++) {
            // 4つの面からランダムに1つ選択
            const face = faces[Math.floor(Math.random() * 4)];
            const [p1, p2, p3] = face;

            // 三角形内のランダムな点を生成
            let r1 = Math.random();
            let r2 = Math.random();

            // 点が三角形の外側にはみ出さないように調整
            if (r1 + r2 > 1) {
                r1 = 1 - r1;
                r2 = 1 - r2;
            }

            const x = p1.x * (1 - r1 - r2) + p2.x * r1 + p3.x * r2;
            const y = p1.y * (1 - r1 - r2) + p2.y * r1 + p3.y * r2;
            const z = p1.z * (1 - r1 - r2) + p2.z * r1 + p3.z * r2;
            
            positions.push({ x, y, z });
        }
        return positions;
    }

    generatePyramid() {
        const positions = [];
        const size = CONFIG.SIZE;
        
        for (let i = 0; i < CONFIG.POINT_COUNT; i++) {
            if (Math.random() < 0.1) {
                // 頂点付近
                const x = (Math.random() - 0.5) * 5;
                const y = -size;
                const z = (Math.random() - 0.5) * 5;
                positions.push({ x, y, z });
            } else {
                // 底面と側面
                const t = Math.random();
                const height = t * size * 2;
                const baseSize = (1 - t) * size;
                
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.sqrt(Math.random()) * baseSize;
                
                const x = radius * Math.cos(angle);
                const y = height - size;
                const z = radius * Math.sin(angle);
                
                positions.push({ x, y, z });
            }
        }
        return positions;
    }
    
    rotatePoint(x, y, z, rotX, rotY, rotZ) {
        // X軸回転
        let newY = y * Math.cos(rotX) - z * Math.sin(rotX);
        let newZ = y * Math.sin(rotX) + z * Math.cos(rotX);
        y = newY;
        z = newZ;
        
        // Y軸回転
        let newX = x * Math.cos(rotY) + z * Math.sin(rotY);
        newZ = -x * Math.sin(rotY) + z * Math.cos(rotY);
        x = newX;
        z = newZ;
        
        // Z軸回転
        newX = x * Math.cos(rotZ) - y * Math.sin(rotZ);
        newY = x * Math.sin(rotZ) + y * Math.cos(rotZ);
        x = newX;
        y = newY;
        
        return { x, y, z };
    }
    
    calculateDepthColor(z) {
        // Z座標に基づいて奥行きを色で表現
        // -SIZE (奥) から +SIZE (手前) の範囲を 0 から 1 に正規化
        const normalizedZ = Math.max(0, Math.min(1, (z + CONFIG.SIZE) / (CONFIG.SIZE * 2)));
        
        // 奥（小さいZ）を白、手前（大きいZ）を黒に反転
        const brightness = Math.floor((1 - normalizedZ) * 255);
        return `rgb(${brightness}, ${brightness}, ${brightness})`;
    }

    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // 回転角度を更新
        this.rotationX += CONFIG.ROTATION_SPEED * deltaTime;
        this.rotationY += CONFIG.ROTATION_SPEED * deltaTime;
        this.rotationZ += CONFIG.ROTATION_SPEED * deltaTime / 2;

        // 各点の位置とスタイルを更新
        this.points.forEach((point, i) => {
            const currentPos = this.pointPositions[i];
            const targetPos = this.targetPositions[i];

            // モーフィング：目標座標に滑らかに近づける (線形補間)
            currentPos.x += (targetPos.x - currentPos.x) * 0.05;
            currentPos.y += (targetPos.y - currentPos.y) * 0.05;
            currentPos.z += (targetPos.z - currentPos.z) * 0.05;

            // 現在位置を回転させる
            const rotatedPos = this.rotatePoint(currentPos.x, currentPos.y, currentPos.z, this.rotationX, this.rotationY, this.rotationZ);
            
            // 回転後のZ座標に基づいて色とサイズを計算
            const scale = 0.5 + Math.max(0, (rotatedPos.z + CONFIG.SIZE) / (CONFIG.SIZE * 2));
            const color = this.calculateDepthColor(rotatedPos.z);

            // スタイルを適用
            point.style.backgroundColor = color;
            point.style.transform = `translate3d(${rotatedPos.x}px, ${rotatedPos.y}px, ${rotatedPos.z}px) scale(${scale})`;
        });

        requestAnimationFrame(this.animate.bind(this));
    }
    
    morphToShape(positions) {
        // 新しい目標座標をセットする
        this.targetPositions = positions;
    }
    
    startMorphing() {
        const morph = () => {
            const positions = this.shapes[this.currentShape]();
            this.morphToShape(positions);
            
            this.currentShape = (this.currentShape + 1) % this.shapes.length;
            setTimeout(morph, CONFIG.MORPH_INTERVAL);
        };
        
        morph();
    }
}

// 点群オブジェクト作成
new PointCloud();