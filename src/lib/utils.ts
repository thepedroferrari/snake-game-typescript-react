import { AREA, GAME, gameBox } from './gameDefaults'
import { IPosition, PlayerDirection, XYDown } from './interfaces'

import {
  // deadSound,
  downSound,
  // eatSound,
  leftSound,
  rightSound,
  upSound
} from './gameDefaults'

export const handleTouchMove = (
  event: TouchEvent,
  playerDirection: PlayerDirection,
  xDown: XYDown,
  yDown: XYDown
): void => {
  if (!xDown || !yDown) {
    return
  }

  const xUp = event.touches[0].clientX
  const yUp = event.touches[0].clientY

  const xDiff = xDown - xUp
  const yDiff = yDown - yUp

  // check for the most significant direction
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0 && playerDirection !== 'RIGHT') {
      leftSound.play()
      playerDirection = 'LEFT'
    }
    if (xDiff < 0 && playerDirection !== 'LEFT') {
      rightSound.play()
      playerDirection = 'RIGHT'
    }
  } else {
    if (yDiff > 0 && playerDirection !== 'DOWN') {
      upSound.play()
      playerDirection = 'UP'
    }
    if (yDiff < 0 && playerDirection !== 'UP') {
      downSound.play()
      playerDirection = 'DOWN'
    }
  }
  // reset values
  xDown = null
  yDown = null
}

export const getBoxMultiplier = (value: number) => {
  const floorValue = Math.floor(value)
  const remainder = floorValue % gameBox
  const multiplier = (floorValue - remainder) / gameBox

  return multiplier
}

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  const randomInt = Math.round(Math.random() * (max - min) + min)
  window.console.log(
    `RANDOM INT = min: ${min}, max: ${max}, Result: ${randomInt}`
  )
  return randomInt
}

export const spawnRandomApple = (): IPosition => {
  const appleX =
    getRandomInt(AREA.X_START, GAME.WIDTH_MULTIPLIER - AREA.X_END) * gameBox
  const appleY =
    getRandomInt(AREA.Y_START, GAME.HEIGHT_MULTIPLIER - AREA.Y_END) * gameBox

  return { x: appleX, y: appleY }
}
