export function loadImage(url) {
  return new Promise((res, rej) => {
    const image = new Image();
    image.src = url;
    image.onload = () => res(image);
    image.onerror = rej;
  });
}