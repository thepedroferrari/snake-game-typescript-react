import React, { useRef } from 'react'

import appleImage from '../img/apple.png'
import gameBackground from '../img/game-background.png'

const deadAudioFile = require('../audio/dead.mp3')
const eatAudioFile = require('../audio/eat.mp3')
const leftAudioFile = require('../audio/left.mp3')
const upAudioFile = require('../audio/up.mp3')
const rightAudioFile = require('../audio/right.mp3')
const downAudioFile = require('../audio/down.mp3')


// ENUMS
enum KEYBOARD {
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40
}

// INTERFACES
interface CanvasProps {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
}

// GAME DEFAULTS
const BASE_GAME_SPEED: number = 150 // milliseconds. 10% faster every level.
const BASE_GAME_BOX: number = 32
const BASE_GAME_WIDTH: number = 17
const BASE_GAME_HEIGHT: number = 15

// VARIABLES
let groundLoaded: boolean = false
let foodLoaded: boolean = false
let score: number = 0
let snake: Position[] = []
snake[0] = {
  x: 9 * BASE_GAME_BOX,
  y: 9 * BASE_GAME_BOX
}
let level: number = 1
let xDown: number | null = null;
let yDown: number | null = null;

// adds 1 level every 16 apples eaten
const updateLevel = (score: number): number => {
  return level = Math.floor(score * 0.0625) + 1
}

const spawnApple = (): Position => ({
  x: Math.floor(Math.random() * BASE_GAME_WIDTH + 1) * BASE_GAME_BOX,
  y: Math.floor(Math.random() * BASE_GAME_HEIGHT + 3) * BASE_GAME_BOX
})

let apple: Position = spawnApple();

const Canvas = ({ width, height }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ground: HTMLImageElement = new Image()
  ground.src = gameBackground
  ground.onload = function () {
    groundLoaded = true
  }

  const foodImage: HTMLImageElement = new Image()
  foodImage.src = appleImage
  foodImage.onload = function () {
    foodLoaded = true
  }

  // Load Audio
  const dead: HTMLAudioElement = new Audio();
  const eat: HTMLAudioElement = new Audio();
  const left: HTMLAudioElement = new Audio();
  const up: HTMLAudioElement = new Audio();
  const right: HTMLAudioElement = new Audio();
  const down: HTMLAudioElement = new Audio();

  dead.src = deadAudioFile
  eat.src = eatAudioFile
  left.src = leftAudioFile
  up.src = upAudioFile
  right.src = rightAudioFile
  down.src = downAudioFile

  // Player Control

  let playerDirection: 'LEFT' | 'UP' | 'RIGHT' | 'DOWN' | undefined = undefined
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
    if (context && groundLoaded && foodLoaded) {
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

      // Player Head Position, we're going to move it depending on the direction
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
      if (playerDirection === 'LEFT') snakeX -= BASE_GAME_BOX
      if (playerDirection === 'UP') snakeY -= BASE_GAME_BOX
      if (playerDirection === 'RIGHT') snakeX += BASE_GAME_BOX
      if (playerDirection === 'DOWN') snakeY += BASE_GAME_BOX

      // Add New Head
      let newHead: Position = {
        x: snakeX,
        y: snakeY
      }

      // Check collision within Snake body
      const snakeAteItsBody = (): boolean => {
        let collided = false
        snake.forEach(bodypart => {
          if (bodypart.x === newHead.x && bodypart.y === newHead.y) {
            collided = true
            return
          }
        })
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

      // Move Head at the new snake position
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
  width: window.innerWidth,
  height: window.innerHeight
}

export default Canvas
