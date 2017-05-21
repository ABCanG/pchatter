export function getMousePosition(e, options = {}) {
  const { target, scale = 1, left = 0, top = 0 } = options;
  const rect = (target || e.target).getBoundingClientRect();
  const original = {
    x: (e.clientX - rect.left) - 1,
    y: (e.clientY - rect.top) - 1,
  };

  return {
    original,
    transformed: {
      x: left + (original.x / scale),
      y: top + (original.y / scale),
    }
  };
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.src = url;
  });
}
