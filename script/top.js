const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));//timeはミリ秒
const typed = document.getElementById('typed');
const clear = document.getElementById('clear');
const cursor = document.getElementById('cursor_text');

let text = '';
typeText = [
  "Making makes us happy", // top Title
]

async function type() {
  for(let i = 0; i < typeText[0].length; i++) {
    await sleep(50);
    text = text + typeText[0][i];
    typed.textContent = text;
    clear.textContent = typeText[0].replace(text, '');
    // console.log(text);
  }
  await sleep(250);
  cursor.style.background = '#8ec830';
  await sleep(250);
  cursor.style.background = 'white';
  cursor.style.display = 'none';
}

type();