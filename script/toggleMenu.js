const menu = document.getElementById('menu');
const hamF = document.getElementById('hamburgerMenuV2');
hamF.style.position = "relative";
var toggleFlagMenu = 0;

function flagMenu() {
  toggleFlagMenu++;
  menu.style.display="block";
  hamF.innerHTML = "<i class='bx bx-x' ></i>";
  document.querySelector("#hamburgerMenuV2 i").classList.add('locationAnimationV3');
  document.querySelector("#hamburgerMenuV2 i").classList.remove('locationAnimationV4');
  document.querySelector("#hamburgerMenuV2").classList.add('btnMenu');
  hamF.style.position = "fixed";
  if(toggleFlagMenu > 1) {
    toggleFlagMenu = 0;
    menu.style.display="none";
    hamF.style.position = "relative";
    hamF.innerHTML = "<i class='bx bx-menu'></i>";
    document.querySelector("#hamburgerMenuV2 i").classList.remove('locationAnimationV3');
    document.querySelector("#hamburgerMenuV2 i").classList.add('locationAnimationV4');
    document.querySelector("#hamburgerMenuV2").classList.remove('btnMenu');
  }
}