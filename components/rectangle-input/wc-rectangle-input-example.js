const input = document.querySelector("wc-rectangle-input");
const value = document.querySelector(".value");

input.addEventListener("rectangle-input", (e) => {
    value.textContent = JSON.stringify(e.target.value);
});