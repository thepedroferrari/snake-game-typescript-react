import React, { useRef } from 'react'

import {
  BASE_GAME_BOX,
  BASE_GAME_HEIGHT,
  BASE_GAME_SPEED,
  BASE_GAME_WIDTH,
  KEYBOARD
} from '../lib/gameDefaults'
import { IPosition } from '../lib/interfaces'

import appleImage from '../img/apple.png'
import gameBackground from '../img/game-background.png'

const deadAudioFile = require('../audio/dead.mp3')
const eatAudioFile = require('../audio/eat.mp3')
const leftAudioFile = require('../audio/left.mp3')
const upAudioFile = require('../audio/up.mp3')
const rightAudioFile = require('../audio/right.mp3')
const downAudioFile = require('../audio/down.mp3')


// INTERFACES
interface ICanvasProps {
  width: number
  height: number
}


// VARIABLES
let score: number = 0
const snake: IPosition[] = []
snake[0] = {
  x: 9 * BASE_GAME_BOX,
  y: 9 * BASE_GAME_BOX
}
let level: number = 1
let xDown: number | null = null;
let yDown: number | null = null;

// adds 1 level every 16 apples eaten
const updateLevel = (s: number) => {
  return level = Math.floor(s * 0.0625) + 1
}

const spawnApple = (): IPosition => ({
  x: Math.floor(Math.random() * BASE_GAME_WIDTH + 1) * BASE_GAME_BOX,
  y: Math.floor(Math.random() * BASE_GAME_HEIGHT + 3) * BASE_GAME_BOX
})

let apple: IPosition = spawnApple();

const Canvas = ({ width, height }: ICanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ground: HTMLImageElement = new Image()
  ground.src = gameBackground

  const foodImage: HTMLImageElement = new Image()
  foodImage.src = appleImage

  // Load Audio
  const dead: HTMLAudioElement = new Audio(deadAudioFile);
  const eat: HTMLAudioElement = new Audio(eatAudioFile);
  const left: HTMLAudioElement = new Audio(leftAudioFile);
  const up: HTMLAudioElement = new Audio(upAudioFile);
  const right: HTMLAudioElement = new Audio(rightAudioFile);
  const down: HTMLAudioElement = new Audio(downAudioFile);

  // Player Control

  let playerDirection: 'LEFT' | 'UP' | 'RIGHT' | 'DOWN';
  const changeDirection = (event: KeyboardEvent) => {
    const key = event.keyCode;

    if (key === KEYBOARD.LEFT && playerDirection !== 'RIGHT') {
      left.play()
      playerDirection = 'LEFT'
    }
    else if (key === KEYBOARD.UP && playerDirection !== 'DOWN') {
      up.play()
      playerDirection = 'UP'
    }
    else if (key === KEYBOARD.RIGHT && playerDirection !== 'LEFT') {
      right.play()
      playerDirection = 'RIGHT'
    }
    else if (key === KEYBOARD.DOWN && playerDirection !== 'UP') {
      down.play()
      playerDirection = 'DOWN'
    }
  }

  // Add support for Touch
  const getTouches = (event: TouchEvent): TouchList => {
    return event.touches
  }

  const handleTouchStart = (event: TouchEvent): void => {
    const firstTouch = getTouches(event)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  };

  const handleTouchMove = (event: TouchEvent): void => {
    if (!xDown || !yDown) {
      return;
    }

    let xUp = event.touches[0].clientX;
    let yUp = event.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    // check for the most significant direction
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0 && playerDirection !== 'RIGHT') {
        left.play()
        playerDirection = 'LEFT'
      }
      if (xDiff < 0 && playerDirection !== 'LEFT') {
        right.play()
        playerDirection = 'RIGHT'
      }
    } else {
      if (yDiff > 0 && playerDirection !== 'DOWN') {
        up.play()
        playerDirection = 'UP'
      }
      if (yDiff < 0 && playerDirection !== 'UP') {
        up.play()
        playerDirection = 'DOWN'
      }
    }
    // reset values
    xDown = null;
    yDown = null;
  }

  // Add Event Listeners
  if (window.PointerEvent) {
    // Add Pointer Event Listener
    document.addEventListener('keydown', changeDirection)
  } else {
    // Add Touch Listener
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
  }

  // Dificulty Management
  const gameDificulty = (): void => {
    level = updateLevel(score)
    // speeds up the game every level (16 points) by 10%
    const levelDificulty = BASE_GAME_SPEED / (1 + ((level - 1) / 10))

    clearInterval(game)
    game = setInterval(draw, levelDificulty)
  }

  // Canvas Draw
  const draw = () => {
    // Check if the canvas has been loaded
    if (!canvasRef.current) {
      return
    }
    // Access the canvas and context
    const canvas: HTMLCanvasElement = canvasRef.current
    const context = canvas.getContext('2d')

    // Check if we have everything ready before drawing
    if (context) {
      context.drawImage(ground, 0, 0)

      // Iterate through the snake, cache the length.
      for (let i = 0, length = snake.length; i < length; ++i) {
        context.fillStyle = (i === 0) ? 'green' : 'white'
        context.fillRect(snake[i].x, snake[i].y, BASE_GAME_BOX, BASE_GAME_BOX)

        context.strokeStyle = 'red'
        context.strokeRect(snake[i].x, snake[i].y, BASE_GAME_BOX, BASE_GAME_BOX)
      }

      // Draw the Apple
      context.drawImage(foodImage, apple.x, apple.y)

      // Player Head IPosition, we're going to move it depending on the direction
      let snakeX = snake[0].x
      let snakeY = snake[0].y

      // Eat the Apple
      if (snakeX === apple.x && snakeY === apple.y) {

        // Spawn new Apple
        apple = spawnApple()

        // Add score
        ++score

        // Play Eating sound
        eat.play()

        // increase Snake Tail
        snake.push({
          x: snakeX + BASE_GAME_BOX,
          y: snakeY + BASE_GAME_BOX
        })

        // Call the difficulty management
        gameDificulty()
      }

      // Remove Snake Tail (otherwise it will increase in size at every draw)
      snake.pop()

      // Move the Head in the correct direction
      if (playerDirection === 'LEFT') { snakeX -= BASE_GAME_BOX }
      if (playerDirection === 'UP') { snakeY -= BASE_GAME_BOX }
      if (playerDirection === 'RIGHT') { snakeX += BASE_GAME_BOX }
      if (playerDirection === 'DOWN') { snakeY += BASE_GAME_BOX }

      // Add New Head
      const newHead: IPosition = {
        x: snakeX,
        y: snakeY
      }

      // Check collision within Snake body
      const snakeAteItsBody = (): boolean => {
        let collided = false
        for (const bodypart of snake) {
          if (bodypart.x === newHead.x && bodypart.y === newHead.y) {
            collided = true
            break
          }
        }
        return collided
      }

      // Game Over
      if (
        (snakeX < BASE_GAME_BOX) ||
        (snakeX > BASE_GAME_WIDTH * BASE_GAME_BOX) ||
        (snakeY < 3 * BASE_GAME_BOX) ||
        (snakeY > BASE_GAME_HEIGHT * BASE_GAME_BOX + BASE_GAME_BOX * 2) ||
        snakeAteItsBody()
      ) {
        dead.play()
        clearInterval(game)
      }

      // Move Head at the new snake Position
      snake.unshift(newHead)

      // Write the Score
      context.fillStyle = 'white'
      context.font = '45px Changa one'
      context.fillText(String(score), 2 * BASE_GAME_BOX, 1.6 * BASE_GAME_BOX)
    }
  }

  // Start the game
  let game = setInterval(draw, BASE_GAME_SPEED)

  // Draw the Canvas
  return <canvas ref={canvasRef} height={height} width={width} />
}

Canvas.defaultProps = {
  height: window.innerHeight,
  width: window.innerWidth
}

export default Canvas
