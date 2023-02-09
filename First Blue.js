/**
 * First Blue Strategy: Finds the first blue line from the top and aims for the mid point of that at all times.
 * Other strategies in play: 
 * Wall - if there is black below the mid point, you might be aiming thru a wall. Shift 10 pixes
 * Throttle Control - Throttle is inverse of steering scale. Higher the steering, lesser the throttle
 **/
let tick = 0
let lastTurnAngle = 0
let steeringHistory = []
let throttleHistory = []

function decide(frame) {
  // console.info(frame)
  tick++

  let throttle = 1
  let steering = 0
  let angle = 0

  // Find angle of first and last blue.
  let xBlueBegin = -1
  let xBlueEnd = -1
  let yBlue = -1
  let xBlueMid = 0
  let wall = 0
  let pastThrottle = []

  for(let y = 0; y < FRAME_HEIGHT  ; y++) {
    for(let x = 0; x < FRAME_WIDTH ; x++) {
      if(sameColor(frame[y][x], BLUE ) && xBlueBegin == -1) {
        xBlueBegin = x
        yBlue = y
      }

      if(xBlueBegin != -1 && !sameColor(frame[y][x], BLUE)) {
        xBlueEnd = x - 1
        break
      }
    }

    if(xBlueEnd != -1) break
  }
  if(xBlueEnd == -1) xBlueEnd = 60

  // If we can't find blue at all, maximize turn in last direction.
  if(xBlueBegin == -1) {
    if(lastTurnAngle > 0) steering = 1
    else steering = -1
    throttle = 0.1
  } else {

    // Target the middle point of blue
    xBlueMid = parseInt((xBlueBegin + xBlueEnd) / 2)

    // Check if the target point don't have a wall.
    if(
      xBlueBegin > 6 && yBlue < 35 &&
      sameColor(frame[yBlue][xBlueBegin - 2], BLACK) && sameColor(frame[yBlue][xBlueBegin - 4], BLACK)
        && sameColor(frame[yBlue + 2][xBlueBegin - 2], BLACK)
        && sameColor(frame[yBlue + 4][xBlueBegin - 2], BLACK)
      ) {
        xBlueMid += 10
        wall = -1
    } else if(
      xBlueEnd < 55 && yBlue < 35 &&
      sameColor(frame[yBlue][xBlueEnd + 2], BLACK) && sameColor(frame[yBlue][xBlueEnd + 4], BLACK)
        && sameColor(frame[yBlue + 2][xBlueEnd + 2], BLACK)
        && sameColor(frame[yBlue + 4][xBlueEnd + 2], BLACK)
      ) {
        xBlueMid -= 10
        wall = 1
    }

    // yBlue scaler 0 -> 40 : 100 -> 1
    // if(yBlue == -1) yBlue = 40
    // topBlue = 10 // There is no blue above this line, genrally
    // yScale = parseInt( ( 40 - yBlue + topBlue ) / 40 * 100 ) / 100

    // Scale 0 -> 32 -> 64 : 1 -> 0 -> -1
    let target = (xBlueMid - 32) * -1
    angle = target / 32 * 100

    steering = angle / 100

    // Steep turns
    if(yBlue > 25 && steering > 0) steering = 1
    else if(yBlue > 25 && steering < 0) steering = -1

    let throttleUpperLimit = 1
    let filteredThrottle = [...throttleHistory]
    pastThrottle = filteredThrottle.splice(-60,10).filter(x => x)
    // throttleUpperLimit = 1 - Math.max(...pastThrottle)

    throttle = (throttleUpperLimit - Math.abs( steering )) // More steeper the turn, the less the throttle
 
    lastTurnAngle = angle
  }

  let maxThrottle = 1
  let minThrottle = .1

  // What is the maximum turn angle a second ago
  let filteredSteering = [...steeringHistory]
  let turnsInPast = filteredSteering.splice(-30, 10).filter( x => x ).map( x => Math.abs( x ))
  // turnsInPast.push(.1) // If this is not there, there is a chance that turnsInPast is an empty array, and maxPastTurn will be Infinity
  let maxPastTurn = Math.abs(Math.max(...turnsInPast))

  // :TODO: Use Average of turns in past, not the max.
  avgPastTurn = turnsInPast.reduce((a, b) => Math.abs(a) + Math.abs(b), 0) / turnsInPast.length
  avgPastThrottle = pastThrottle.reduce((a, b) => a + b, 0) / pastThrottle.length

  lenTurn = steeringHistory.length
  lenThrottle = throttleHistory.length

  if(avgPastTurn > .6) throttle = minThrottle
  if(avgPastTurn < .2) throttle = maxThrottle
    // throttle = maxThrottle - maxPastTurn - .2

  if(throttle > maxThrottle) throttle = maxThrottle
  else if(throttle <= 0) throttle = minThrottle

  // Once in a while, its giving me a invalid decison error. This corrects for that. 
  if(steering > 1) steering = 1
  else if(steering < -1) steering -1

  steeringHistory.push(steering)
  throttleHistory.push(throttle)

  return {
    throttle, steering, 
    avgPastThrottle, avgPastTurn
    //, xBlueBegin, xBlueEnd, xBlueMid, yBlue, angle, wall
  }

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
/* /
function preprocess(frame) {
  const threshold = 10;
  return frame.map((row, rowIndex) =>
    row.map((pixel) => {
      if (pixel.r - Math.max(pixel.g, pixel.b) > threshold) return RED;
      if (pixel.g - Math.max(pixel.r, pixel.b) > threshold) return GREEN;
      if (pixel.b - Math.max(pixel.g, pixel.r) > threshold && rowIndex > 7) return BLUE;
      return BLACK;
    })
  );
}
// */

const RED = { r: 255, g: 0, b: 0 } 
const GREEN = { r: 0, g: 255, b: 0 } 
const BLUE = { r: 0, g: 0, b: 255 } 
const BLACK = { r: 0, g: 0, b: 0 }
const WHITE = { r: 255, g: 255, b: 255 }

const FRAME_WIDTH = 64
const FRAME_HEIGHT = 40


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