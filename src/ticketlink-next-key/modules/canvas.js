

canvas1 = $('#main_view canvas')[3];
canvas = $('#main_view canvas')[0];
  ctx = canvas.getContext('2d');





  canvas1.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left; // 鼠标在 Canvas 内的坐标
    const y = e.clientY - rect.top;

    // 获取当前像素颜色
    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b, a] = imageData.data;

  

    console.log(`当前像素颜色: rgba(${r}, ${g}, ${b}, ${a})`);
  });

