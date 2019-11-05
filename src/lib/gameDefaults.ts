import { IPosition } from './interfaces'

import { getBoxMultiplier } from './utils'

export enum KEYBOARD {
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  SPACE = 32
}

export enum AREA {
  X_START = 1,
  X_END = 1,
  Y_START = 3,
  Y_END = 2
}

export const gameBox =
  Math.ceil((window.innerWidth + window.innerHeight) / 2000) * 32

const gameBoxes: IPosition = {
  x: getBoxMultiplier(window.innerWidth),
  y: getBoxMultiplier(window.innerHeight)
}

export enum GAME {
  BOX = gameBox,
  HEIGHT_MULTIPLIER = gameBoxes.y,
  WIDTH_MULTIPLIER = gameBoxes.x,
  HEIGHT_AREA = gameBoxes.y * gameBox - gameBox * AREA.Y_END,
  WIDTH_AREA = gameBoxes.x * gameBox - gameBox * AREA.X_END,
  SPEED = 150
}

// Load Audio
const deadAudioFile = require('../audio/dead.mp3')
const eatAudioFile = require('../audio/eat.mp3')
const leftAudioFile = require('../audio/left.mp3')
const upAudioFile = require('../audio/up.mp3')
const rightAudioFile = require('../audio/right.mp3')
const downAudioFile = require('../audio/down.mp3')

export const deadSound: HTMLAudioElement = new Audio(deadAudioFile)
export const eatSound: HTMLAudioElement = new Audio(eatAudioFile)
export const leftSound: HTMLAudioElement = new Audio(leftAudioFile)
export const upSound: HTMLAudioElement = new Audio(upAudioFile)
export const rightSound: HTMLAudioElement = new Audio(rightAudioFile)
export const downSound: HTMLAudioElement = new Audio(downAudioFile)
