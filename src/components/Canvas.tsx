import React, { useRef } from 'react'

import {
  GAME,
  KEYBOARD
} from '../lib/gameDefaults'
import { GameStatus, IPosition } from '../lib/interfaces'
import { spawnRandomApple } from '../lib/utils'

import appleImage from '../img/apple.png'
import gameBackground from '../img/game-background.png'

import {
  deadSound,
  downSound,
  eatSound,
  leftSound,
  rightSound,
  upSound,
} from '../lib/gameDefaults'

interface ICanvasProps {
  width: number
  height: number
}

// VARIABLES
let gameStatus: GameStatus = 'LOADED'
const snake: IPosition[] = []
snake[0] = {
  x: Math.floor(GAME.WIDTH_MULTIPLIER / 2) * GAME.BOX,
  y: Math.floor(GAME.HEIGHT_MULTIPLIER / 2) * GAME.BOX
}

let score = 0
let level = 1
let xDown: number | null = null
let yDown: number | null = null

// adds 1 level every 16 apples eaten
const updateLevel = (s: number) => {
  return Math.round(Math.floor(s * 0.0625) + 1)
}

let apple = spawnRandomApple();

const Canvas = ({ width, height }: ICanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ground: HTMLImageElement = new Image()
  ground.src = gameBackground

  const foodImage: HTMLImageElement = new Image()
  foodImage.src = appleImage

  // Player Control

  let playerDirection: 'LEFT' | 'UP' | 'RIGHT' | 'DOWN';
  const changeDirection = (event: KeyboardEvent) => {
    if (gameStatus === 'OVER' || gameStatus === 'PAUSED') {
      return
    }
    const key = event.keyCode;

    if (key === KEYBOARD.LEFT && playerDirection !== 'RIGHT') {
      leftSound.play()
      playerDirection = 'LEFT'
    }
    else if (key === KEYBOARD.UP && playerDirection !== 'DOWN') {
      upSound.play()
      playerDirection = 'UP'
    }
    else if (key === KEYBOARD.RIGHT && playerDirection !== 'LEFT') {
      rightSound.play()
      playerDirection = 'RIGHT'
    }
    else if (key === KEYBOARD.DOWN && playerDirection !== 'UP') {
      downSound.play()
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

    const xUp = event.touches[0].clientX;
    const yUp = event.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

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
    }
    else {
      if (yDiff > 0 && playerDirection !== 'DOWN') {
        upSound.play()
        playerDirection = 'UP'
      }
      if (yDiff < 0 && playerDirection !== 'UP') {
        upSound.play()
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
    const levelDificulty = (GAME.SPEED) / (1 + ((level - 1) / 10))

    clearInterval(game)
    game = setInterval(draw, levelDificulty)
  }

  function drawBoard(ctx: CanvasRenderingContext2D) {
    for (let x = 0; x <= GAME.WIDTH_AREA; x += GAME.BOX) {
      ctx.moveTo(0.5 + x + GAME.BOX, GAME.BOX);
      ctx.lineTo(0.5 + x + GAME.BOX, GAME.HEIGHT_AREA + GAME.BOX);
    }

    for (let x = 0; x <= GAME.HEIGHT_AREA; x += GAME.BOX) {
      ctx.moveTo(GAME.BOX, 0.5 + x + GAME.BOX);
      ctx.lineTo(GAME.WIDTH_AREA + GAME.BOX, 0.5 + x + GAME.BOX);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();
  }

  const eatTheApple = (x: number, y: number) => {
    // Spawn new Apple
    apple = spawnRandomApple()

    // Add score
    ++score

    // Play Eating sound
    eatSound.play()

    // increase Snake Tail
    snake.push({
      x: x + GAME.BOX,
      y: y + GAME.BOX
    })
    // Call the difficulty management
    gameDificulty()
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
    if (context && gameStatus !== 'PAUSED') {
      // Player Head IPosition, we're going to move it depending on the direction
      let snakeX = snake[0].x
      let snakeY = snake[0].y

      context.drawImage(ground, 0, 0)
      context.fillStyle = 'rgba(0,0,0,.4)'
      drawBoard(context)
      context.fillRect(0, 0, GAME.WIDTH_AREA, GAME.HEIGHT_AREA);

      // Iterate through the snake, cache the length.
      for (let i = 0, length = snake.length; i < length; ++i) {
        context.fillStyle = (i === 0) ? 'green' : 'white'
        context.fillRect(snake[i].x, snake[i].y, GAME.BOX, GAME.BOX)

        context.strokeStyle = 'black'
        context.strokeRect(snake[i].x, snake[i].y, GAME.BOX, GAME.BOX)
      }

      // Draw the Apple
      context.drawImage(foodImage, apple.x, apple.y)

      // Eat the Apple
      if (snakeX === apple.x && snakeY === apple.y) {
        eatTheApple(snakeX, snakeY)
      }
      // Remove Snake Tail (otherwise it will increase in size at every draw)
      snake.pop()

      // Move the Head in the correct direction
      if (playerDirection === 'LEFT') { snakeX -= GAME.BOX }
      if (playerDirection === 'UP') { snakeY -= GAME.BOX }
      if (playerDirection === 'RIGHT') { snakeX += GAME.BOX }
      if (playerDirection === 'DOWN') { snakeY += GAME.BOX }

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
        (snakeX < GAME.BOX) ||
        (snakeX > GAME.WIDTH_AREA) ||
        (snakeY < 3 * GAME.BOX) ||
        (snakeY > GAME.HEIGHT_AREA) ||
        snakeAteItsBody()
      ) {
        deadSound.play()
        clearInterval(game)
        gameStatus = 'OVER';
      }

      // Move Head at the new snake Position
      snake.unshift(newHead)

      // Write the HUD
      context.fillStyle = 'white'
      context.font = '45px Changa one'
      context.fillText(String(score), 2 * GAME.BOX, 1.6 * GAME.BOX)
      context.fillText(String(level), 4 * GAME.BOX, 1.6 * GAME.BOX)
    }
  }

  // Start the game
  let game = setInterval(draw, GAME.SPEED)

  // Draw the Canvas
  return <canvas ref={canvasRef} height={height} width={width} />
}

Canvas.defaultProps = {
  height: window.innerHeight,
  width: window.innerWidth
}

export default Canvas
