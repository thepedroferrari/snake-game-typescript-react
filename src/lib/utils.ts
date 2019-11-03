import { AREA, GAME, gameBox } from './gameDefaults'
import { IPosition } from './interfaces'

export const getBoxMultiplier = (value: number) => {
  const floorValue = Math.floor(value)
  const remainder = floorValue % gameBox
  const multiplier = (floorValue - remainder) / gameBox

  return multiplier
}

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.round(Math.random() * (max - min) + min)
}

export const spawnRandomApple = (): IPosition => {
  const appleX =
    getRandomInt(AREA.X_START, GAME.WIDTH_MULTIPLIER - AREA.X_END) * gameBox
  const appleY =
    getRandomInt(AREA.Y_START, GAME.HEIGHT_MULTIPLIER - AREA.Y_END) * gameBox

  return { x: appleX, y: appleY }
}
