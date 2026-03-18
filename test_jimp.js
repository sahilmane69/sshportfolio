const { Jimp } = require('jimp');

async function test() {
  try {
    console.log('Jimp version:', Jimp ? 'found' : 'not found');
    const image = await Jimp.read('image.png');
    console.log('Image dimensions:', image.bitmap.width, 'x', image.bitmap.height);
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
