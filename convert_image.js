const { Jimp } = require('jimp');
const fs = require('fs');

async function convert(path, targetWidth) {
  try {
    const image = await Jimp.read(path);
    
    const pixelWidth = targetWidth;
    const heightRatio = image.bitmap.height / image.bitmap.width;
    const pixelHeightRaw = Math.round(pixelWidth * heightRatio);
    // Ensure even height so we process 2 rows per character cell
    const pixelHeight = pixelHeightRaw + (pixelHeightRaw % 2);
    
    // We do NOT greyscale this time. We want actual colors/pixels.
    image.resize({ w: pixelWidth, h: pixelHeight });
    
    const { data, width: w, height: h } = image.bitmap;
    let ansi = '';
    
    for (let cy = 0; cy < h; cy += 2) {
      for (let cx = 0; cx < w; cx++) {
          
          const idxTop = (cy * w + cx) * 4;
          const rTop = data[idxTop];
          const gTop = data[idxTop+1];
          const bTop = data[idxTop+2];
          const aTop = data[idxTop+3];

          const idxBot = ((cy + 1) * w + cx) * 4;
          const rBot = data[idxBot];
          const gBot = data[idxBot+1];
          const bBot = data[idxBot+2];
          const aBot = data[idxBot+3];

          if (aTop < 128 && aBot < 128) {
              // Completely transparent = space without background
              ansi += '\x1b[0m ';
          } else if (aTop < 128) {
              // Top transparent, bot opaque: output lower half block ▄
              ansi += `\x1b[0m\x1b[38;2;${rBot};${gBot};${bBot}m▄\x1b[0m`;
          } else if (aBot < 128) {
              // Top opaque, bot transparent: output upper half block ▀
              ansi += `\x1b[0m\x1b[38;2;${rTop};${gTop};${bTop}m▀\x1b[0m`;
          } else {
              // Both opaque: upper half block ▀ using top color as Foreground and bot color as Background
              ansi += `\x1b[38;2;${rTop};${gTop};${bTop}m\x1b[48;2;${rBot};${gBot};${bBot}m▀\x1b[0m`;
          }
      }
      ansi += '\n'; // new line
    }
    
    fs.writeFileSync('image.txt', ansi);
    console.log(`Saved true-color pixel block image to image.txt (Width: ${targetWidth})`);
  } catch (err) {
    console.error(err);
  }
}

// 70 width maintains the perfect size for the layout
convert('image copy.png', 70);
