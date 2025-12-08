const langSelect = document.getElementById("langSelect");
const pageName = document.body.dataset.page;

langSelect.addEventListener("change", (e) => {
  const selected = e.target.value;
  localStorage.setItem("lang", selected);
  applyLanguage();
});

async function applyLanguage() {
  let lang = localStorage.getItem("lang") || "auto";

  if (lang === "auto") {
    lang = getBrowserLanguage();
  }

  const response = await fetch(`./lang/${lang}.json`);
  const translations = await response.json();

  document.querySelectorAll("[data-tr]").forEach((el) => {
    const key = el.getAttribute("data-tr");
    el.innerHTML = translations[pageName][key] || `[missing: ${key}]`;
  });
}

function getBrowserLanguage() {
  const userLang = navigator.language || navigator.userLanguage;

  if (userLang.startsWith("ja")) return "jp";
  if (userLang.startsWith("en")) return "en";

  // デフォルト
  return "en";
}

// 初期ロード
langSelect.value = localStorage.getItem("lang") || "auto";
applyLanguage();
