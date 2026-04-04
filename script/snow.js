const SNOW_NUM = 80;
const snow_list = [];

class Snow{
    constructor(snow, speed){
        this.snow = snow;
        this.speed = speed;
    }
}

function getRandom(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); 
}

function getRandomSnowSpeed(){
    return Math.random()*2 + 1;
}

// "100px"のような文字列から数字部分だけを抜き出す
function getPxNum(px_str){
    var i;
    for(i = 0; i < px_str.length; i++){
        if(isNaN(px_str[i]) && px_str[i] != ".") break;
    }
    const num_str = px_str.substring(0, i);
    
    return Number(num_str);
}

function moveSnow(){
    for(let i = 0; i < SNOW_NUM; i++){
        // 雪が画面外に出る前に一番上に戻す
        let top_num = getPxNum(snow_list[i].snow.style.top) + snow_list[i].speed;
        if(top_num >= document.documentElement.clientHeight - 10){
            // 雪を初期化
            top_num = 0;
            const random_size = String(getRandom(2, 7)) + "px";
            snow_list[i].snow.style.width = random_size;
            snow_list[i].snow.style.height = random_size;
            snow_list[i].speed = getRandomSnowSpeed();
        }

        // 各雪を1px下にずらす
        snow_list[i].snow.style.top = String(top_num) + "px";
    }
}

function createSnow(){
    const snow = document.createElement("div");
    
    // 位置の設定(下左右の10px端を除く))
    snow.style.position = "absolute";
    snow.style.top = String(getRandom(0, document.documentElement.clientHeight - 10)) + "px";
    snow.style.left = String(getRandom(10, document.documentElement.clientWidth - 10)) + "px";
    snow.style.zIndex = "99999";

    // サイズの設定(ランダムに2～7px)
    const random_size = String(getRandom(4, 12)) + "px";
    snow.style.width = random_size;
    snow.style.height = random_size;
    
    // 円にする
    snow.style.borderRadius = "50%";

    // 背景を白に
    snow.style.backgroundColor = "#eee";

    return snow;
}

function initSnow(){
    const snow_div = document.createElement("div");
    snow_div.id = "snow_div";
    document.body.appendChild(snow_div);

    // 雪を10個生成
    for(let i = 0; i < SNOW_NUM; i++){
        let snow = createSnow();
        snow_div.appendChild(snow);
        
        snow_list.push(new Snow(snow, getRandomSnowSpeed()));
    }

    // moveSnowを10msごとに定期実行
    setInterval(moveSnow, 10);
}

const today = new Date();
today.setHours(today.getHours() + 9); // 日本時間に調整
alert(today.getMonth() && "/" && today.getDate() == 22)
if(today.getMonth() == 11 && today.getDate() == 22){
    window.onload = initSnow;
    return;
}