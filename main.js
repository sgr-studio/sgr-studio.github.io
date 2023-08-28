function load() {
  var x = 1;
  var e = document.getElementById("logo");
  d = d + x;
  e.style.transform = "rotate(" + d + "deg)";
}

let Numbers = []  // 初期化
for(let i = 0; i < 5 ; i++) {
  Numbers.push(10)
}

console.log(Numbers)  //  [10, 10, 10, 10, 10]


function load2() {
  var ow = window.outerWidth; // ウインドウ全体の横幅
  var oh = window.outerHeight; // ウインドウ全体の高さ
  // alert("横" + ow  + "高さ" + oh);
  
  // var divwhite = document.getElementById("white");
  // var ow2 = divwhite.width;
  // var oh2 = divwhite.height;
  // alert("div 横" + ow2  + "高さ" + oh2);
  
  // const el = document.querySelector("#white");
  // const styleEl = getComputedStyle(el);
  
  // console.log(styleEl.width); // 150px
  // console.log(styleEl.height); // 100px
  // alert("div 横" + styleEl.width  + "高さ" + styleEl.height);
}
load2();

while(Infinity) {
  const h2 = document.documentElement.scrollHeight;
  const black = document.getElementById("black");
  console.log(h2);
  var px = h2 + "px";
  console.log(px);
  black.style.top = px;
}