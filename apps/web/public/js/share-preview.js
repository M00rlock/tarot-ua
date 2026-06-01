const previewWidth = 1200;
const previewHeight = 630;

export async function buildSharePreview(shared) {
  const canvas = document.createElement('canvas');
  canvas.width = previewWidth;
  canvas.height = previewHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const gradient = ctx.createLinearGradient(0, 0, previewWidth, previewHeight);
  gradient.addColorStop(0, '#110b22');
  gradient.addColorStop(0.52, '#281638');
  gradient.addColorStop(1, '#120d1f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, previewWidth, previewHeight);

  const orb = ctx.createRadialGradient(610, 280, 30, 610, 280, 520);
  orb.addColorStop(0, 'rgba(140,104,255,0.42)');
  orb.addColorStop(0.55, 'rgba(230,182,106,0.14)');
  orb.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, previewWidth, previewHeight);

  drawStars(ctx);
  drawPreviewText(ctx, shared.title, shared.interpretation?.summary || 'Розклад Таро з цілісним тлумаченням карт, позицій і взаємодій.');
  drawPreviewCards(ctx, shared.cards);

  return canvas.toDataURL('image/png');
}

function drawStars(ctx) {
  const stars = [
    [150, 120], [245, 72], [1030, 92], [980, 510], [1080, 420], [92, 500], [650, 96], [780, 545]
  ];
  ctx.fillStyle = 'rgba(244,211,139,0.78)';
  for (const [x, y] of stars) {
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPreviewText(ctx, title, summary) {
  ctx.fillStyle = '#f4d38b';
  ctx.font = '800 24px Inter, Arial, sans-serif';
  ctx.fillText('ТАРО ЧЕРІОТ', 80, 88);

  ctx.fillStyle = '#fff8e7';
  ctx.font = '900 52px Inter, Arial, sans-serif';
  wrapCanvasText(ctx, title, 80, 154, 880, 58, 2);

  ctx.fillStyle = 'rgba(255,248,231,0.82)';
  ctx.font = '400 23px Inter, Arial, sans-serif';
  wrapCanvasText(ctx, summary, 80, 210, 880, 32, 2);
}

function drawPreviewCards(ctx, cards) {
  const shown = cards.slice(0, 5);
  const startX = shown.length === 3 ? 255 : 135;
  const gap = shown.length === 3 ? 230 : 186;

  shown.forEach((item, index) => {
    const x = startX + index * gap;
    const y = 280;
    const cardGradient = ctx.createLinearGradient(x, y, x + 132, y + 214);
    cardGradient.addColorStop(0, '#241739');
    cardGradient.addColorStop(1, '#6d3f77');

    roundRect(ctx, x, y, 132, 214, 18);
    ctx.fillStyle = cardGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(244,211,139,0.58)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(244,211,139,0.55)';
    ctx.beginPath();
    ctx.arc(x + 66, y + 76, 34, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f4d38b';
    ctx.font = '34px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', x + 66, y + 91);

    ctx.fillStyle = '#fff8e7';
    ctx.font = '800 18px Inter, Arial, sans-serif';
    ctx.fillText(String(index + 1), x + 66, y + 142);

    ctx.fillStyle = '#f4d38b';
    ctx.font = '700 13px Inter, Arial, sans-serif';
    ctx.fillText(item.position.slice(0, 18), x + 66, y + 174);

    ctx.fillStyle = '#fff8e7';
    ctx.font = '700 12px Inter, Arial, sans-serif';
    wrapCanvasText(ctx, `${item.reversed ? '↻ ' : ''}${item.card.name}`, x + 14, y + 194, 104, 16, 2, 'center');
    ctx.textAlign = 'start';
  });

  ctx.fillStyle = '#f4d38b';
  ctx.font = '800 22px Inter, Arial, sans-serif';
  ctx.fillText('Поділись своїм розкладом ✦', 80, 560);

  ctx.fillStyle = 'rgba(255,248,231,0.72)';
  ctx.font = '400 18px Inter, Arial, sans-serif';
  wrapCanvasText(ctx, cards.map((item) => item.card.name).join(' · '), 80, 594, 1040, 24, 1);
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3, align = 'start') {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  const previousAlign = ctx.textAlign;
  ctx.textAlign = align;
  const drawX = align === 'center' ? x + maxWidth / 2 : x;

  for (let i = 0; i < words.length; i += 1) {
    const testLine = `${line}${words[i]} `;
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), drawX, y + lineCount * lineHeight);
      line = `${words[i]} `;
      lineCount += 1;
      if (lineCount >= maxLines) break;
    } else {
      line = testLine;
    }
  }
  if (lineCount < maxLines && line.trim()) {
    ctx.fillText(line.trim(), drawX, y + lineCount * lineHeight);
  }
  ctx.textAlign = previousAlign;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}
