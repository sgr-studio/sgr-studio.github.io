async function sendData() {
    const name = document.getElementById("name").value;
    const text = document.getElementById("text").value;

    const url = "https://script.google.com/macros/s/AKfycbxQT5KY4CBgueg6DszNkVnozXBaoMGDi_dtYw3jzNzYXNx0a5yOKMuO-PGE8hH2eBEiYA/exec";

    await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, text })
    });

    document.getElementById("contactForm").textContent = "✔ 送信が完了しました。ありがとうございました！";
}