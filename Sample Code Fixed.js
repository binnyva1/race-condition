// This is the sample code of the Race Codition - but fixed for functionality. Not optimized in any way.

/**
* The brain of your bot. Makes decisions based on the incoming "frame" of pixels.
**/
function decide(frame) {
  // Choose the center row
  const height = frame.length
  const midRow = frame[parseInt(height / 2)]

  const bottomRow = frame[parseInt(height / 2)]
  // Choose a pixel at the center of this row
  const width = bottomRow.length
  const pixel = bottomRow[width / 2]

  const leftPixel = midRow[0]
  const beforeLeftPixel = midRow[5]

  // :TODO: Don't get one pixel - get a block of 5x5, if all are matching color.


  if (sameColor(leftPixel, BLACK)) {            
      // Red side of track -> turn right
      return { throttle: 0.1, steering: -1 }
  } else if (sameColor(pixel, GREEN)) {
      return { throttle: 0.1, steering: 1 }
  } else if(sameColor(pixel, BLUE)) {
      return { throttle: 1, steering: 0}
  }

  return { throttle: 0.1, steering: 0 }
}

/**
* Pixel frame preprocessor. The example implementation simplifies each pixel
to either RED, GREEN, BLUE or BLACK. Your implementation may do something more
advanced, including changing the dimensions of this frame. The result always
needs to be a 2 dimensional array of RGB color objects though.
**/
function preprocess(frame) {
  let threshold = 5;
  return frame.map((row, rowIndex) => 
    row.map((pixel) => {
      if(rowIndex < 8) threshold = 20

      if (pixel.r - Math.max(pixel.g, pixel.b) > threshold) return RED;
      if (pixel.g - Math.max(pixel.r, pixel.b) > threshold) return GREEN;
      if (pixel.b - Math.max(pixel.g, pixel.r) > threshold) return BLUE;

      if (pixel.b < 50 && pixel.r < 50 && pixel.g < 50 & rowIndex < 8) return BLACK;
      if (pixel.b < 150 && pixel.r < 150 && pixel.g < 150 & rowIndex > 7) return BLACK;
      
      return WHITE;
    })
  );
}

const RED = { r: 255, g: 0, b: 0 } 
const GREEN = { r: 0, g: 255, b: 0 } 
const BLUE = { r: 0, g: 0, b: 255 } 
const BLACK = { r: 0, g: 0, b: 0 }
const WHITE = { r: 255, g: 255, b: 255 }

/**
 *  Helper function for comparing colors
 */
function sameColor(x, y) {
  return x.r === y.r && x.g === y.g && x.b === y.b;
}
