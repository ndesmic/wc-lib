const picker = document.querySelector("wc-directory-picker");

picker.addEventListener("directory-selected", e => {
    console.log(e.detail.handle);
});