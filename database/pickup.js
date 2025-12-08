/* eslint-disable no-console */
/* global fetch */

const BASE_URL = './';

async function fetchPickupData() {
  try {
    const res = await fetch(`./database/pickup.json`);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // ここを修正！💡
    const data = await res.json(); // res.text() -> res.json()

    return data.items;
  } catch (error) {
    console.error('Error loading pickup data:', error);
    return [];
  }
}

function createPickupItem(item) {
  const itemEl = document.createElement('div');
  itemEl.classList.add('pickup-item');
  itemEl.innerHTML = `
    <a ondblclick="window.open('${item.url}', '_blank');" style="background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/media/icon/${item.img}'); background-size: cover; background-position: center;" target="_blank" rel="noopener noreferrer">
      <div class="pickup-text">
        <h3 class="pickup-title">${item.tags}</h3>
      </div>
    </a>
  `;
  return itemEl;
}

async function displayPickupItems() {
  const pickupData = await fetchPickupData();
  const container = document.querySelector('#pickup-container');

  if (pickupData.length === 0) {
    container.innerHTML = '<p>ピックアップデータが見つかりませんでした。</p>';
    return;
  }

  pickupData.forEach(item => {
    const pickupItem = createPickupItem(item);
    container.appendChild(pickupItem);
  });
}

document.addEventListener('DOMContentLoaded', displayPickupItems);


// Side scroll by mouse drag
function mousedragscrollable(element){
  let target;
  const elms = document.querySelectorAll(element);
  for(let i=0; i<elms.length; i++){
    elms[i].addEventListener('mousedown', function(evt){
      evt.preventDefault();
      target = elms[i];
      target.dataset.down = 'true';
      target.dataset.move = 'false';
      target.dataset.x = evt.clientX;
      target.dataset.y = evt.clientY;
      target.dataset.scrollleft = target.scrollLeft;
      target.dataset.scrolltop = target.scrollTop;
      evt.stopPropagation();
    });
    elms[i].addEventListener('click', function(evt){
      if(elms[i].detaset != null && elms[i].detaset.move == 'true') evt.stopPropagation();
    });
  }
  document.addEventListener('mousemove', function(evt){
    if(target != null && target.dataset.down == 'true'){
      evt.preventDefault();
      let move_x = parseInt(target.dataset.x) - evt.clientX;
      let move_y = parseInt(target.dataset.y) - evt.clientY;
      if (move_x !== 0 || move_y !== 0) {
        target.dataset.move = 'true';
      } else {
        return;
      }
      target.scrollLeft = parseInt(target.dataset.scrollleft) + move_x;
      target.scrollTop = parseInt(target.dataset.scrolltop) + move_y;
      evt.stopPropagation();
    }
  });
  document.addEventListener('mouseup', function(evt){
    if(target != null && target.dataset.down == 'true'){
      target.dataset.down = 'false';
      evt.stopPropagation();
    }
  });
}
    
window.addEventListener('DOMContentLoaded', function(){
  mousedragscrollable('.wrap');
});