// Initial implementation just to understand the game. Got it around 11ish seconds.
// Depricated in favor of the First blue startegy.

/**
* The brain of your bot. Makes decisions based on the incoming "frame" of pixels.
**/
// Frame Size: 64 x 40
let tick = 0;
function decide(frame) {
  // console.info(frame)
  tick++

  // :TODO: Don't get one pixel - get a block of 5x5, if all are matching color.
  let lm = blockColor(frame, posLeftMiddle)
  let cm = blockColor(frame, posCenterMiddle)
  let rm = blockColor(frame, posRightMiddle)

  let lb = blockColor(frame, posLeftBottom)
  let cb = blockColor(frame, posCenterBottom)
  let rb = blockColor(frame, posRightBottom)

  let lt = blockColor(frame, posLeftTop)
  let ct = blockColor(frame, posCenterTop)
  let rt = blockColor(frame, posRightTop)

  let throttle = 0.1
  let steering = 0

  if(cm == BLUE) {
    throttle = 1
    steering = 0
  }

  else if(cm == GREEN ) {
    throttle = 0.1
    steering = 1
  }

  else if(lm == RED || cm == RED) {
    steering = -0.5
    throttle = .5
  }
  else if(rm == GREEN || cm == GREEN)  {
    steering = 0.5
    throttle = 1
  }

  else if(rm == BLACK && cb == GREEN) {
    steering = 1
    throttle = 0.1
  }

  else if(lb == BLACK || lm == BLACK && cm != GREEN) {
    steering = -1
    throttle = 0.1
  }
  else if(rb == BLACK || rm == BLACK && cm != RED) {
    steering = -1
    throttle = 0.1
  } 
  else {
    steering = 0
    throttle = 1
  }

  return { throttle: throttle, steering: steering,
          tick: tick }
}

/**
* Pixel frame preprocessor. The example implementation simplifies each pixel
to either RED, GREEN, BLUE or BLACK. Your implementation may do something more
advanced, including changing the dimensions of this frame. The result always
needs to be a 2 dimensional array of RGB color objects though.
** /
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
*/
function preprocess(frame) {
  const threshold = 10;
  return frame.map((row) =>
    row.map((pixel) => {
      if (pixel.r - Math.max(pixel.g, pixel.b) > threshold) return RED;
      if (pixel.g - Math.max(pixel.r, pixel.b) > threshold) return GREEN;
      if (pixel.b - Math.max(pixel.g, pixel.r) > threshold) return BLUE;
      return BLACK;
    })
  );
}

const RED = { r: 255, g: 0, b: 0 } 
const GREEN = { r: 0, g: 255, b: 0 } 
const BLUE = { r: 0, g: 0, b: 255 } 
const BLACK = { r: 0, g: 0, b: 0 }
const WHITE = { r: 255, g: 255, b: 255 }

const FRAME_WIDTH = 64
const FRAME_HEIGHT = 40

const blockSize = 5
const halfB = parseInt(blockSize / 2)


let posLeftMiddle = [ 0, parseInt((FRAME_HEIGHT / 2) - halfB)]
let posCenterMiddle = [ parseInt((FRAME_WIDTH / 2) - halfB), parseInt((FRAME_HEIGHT / 2) - halfB)]
let posRightMiddle = [ FRAME_WIDTH - blockSize - 1, parseInt((FRAME_HEIGHT / 2) - halfB)]

let posLeftBottom = [ 0, FRAME_HEIGHT - blockSize - 1]
let posCenterBottom = [ parseInt((FRAME_WIDTH / 2) - halfB), FRAME_HEIGHT - blockSize - 1]
let posRightBottom = [ FRAME_WIDTH - blockSize - 1, FRAME_HEIGHT - blockSize - 1]

let posLeftTop = [ 0, 0 ]
let posCenterTop = [ parseInt((FRAME_WIDTH / 2) - halfB), 0]
let posRightTop = [ FRAME_WIDTH - blockSize - 1, 0]


// console.info(posLeftMiddle, posCenterMiddle, posRightMiddle)

/**
 *  Helper function for comparing colors
 */
function sameColor(x, y) {
  return x.r === y.r && x.g === y.g && x.b === y.b;
}

function blockColor(frame, blockPosition) {
  let r = 0
  let g = 0
  let b = 0
  let black = 0

  // console.info(blockPosition)
  for(let x = blockPosition[0]; x <= blockPosition[0] + blockSize; x++) {
    for(let y = blockPosition[1]; y <= blockPosition[1] + blockSize; y++) {
      if(frame[y][x] === undefined) continue // was causing issues otherwise

      let p = frame[y][x] // Yeah, some major issue here.

      if(sameColor(p, BLUE)) b++
      if(sameColor(p, RED)) r++
      if(sameColor(p, GREEN)) g++
      if(sameColor(p, BLACK)) black++
    }
  }

  let max = Math.max(r, g, b, black)

  if(max == r) return RED
  if(max == g) return GREEN
  if(max == b) return BLUE
  if(max == black) return BLACK

  return WHITE
}