import React, { useRef } from 'react'

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

  const ground = new Image()
  ground.src =
    'data:image/png;base64,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'
  ground.onload = function () {
    groundLoaded = true
  }

  const foodImage = new Image()
  foodImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABDlBMVEUAAADoSB3pSBzsQxxJxifrRBvoSB3oSB3gVSHoSB1Lxyi9kzbeVyJHxiboSB3mUSPDhTLoSB1QyCrkTR7wWDzoSB3nQRNKxifoSB3oSB1SxyplyTLpRhzoSB3oSB3rQRvgVCHtQRroSB3dXiTaXCTSZynbYCTWYSbmTR3QdizmSBroRRnLdCi/gzHsRBrHgjDIgzBKxifcWCK/mTfoSB2rnjvoSB1uzTdgyzHcWSLyOxjyOBjwNBPeWyPoSB3vcVfcWSKesUrNjS2uuUHSZinRZimhxknoSB3vdl5Jxifwe2ToRxvvdFvsYkLqUSpOxynub1SPclGXbkyWaEyuYz/qSR7sPxqesUrqWDPYZyebyZHYAAAAR3RSTlMAmp7swbuvp4o5GBER/vGSCPry8u3m5tjVysnBwbOgn5qVi4J9e3ZxcVtQTEtBPTszMh0aGBYK8vLy6ebm4dzTyJFpUTo6JELOXCQAAAEzSURBVDjLtdLHdoJQFIXhIyII9t577930Xi6igj3J+79IshC4gFdn+ab/npy1DhDw/FUweM3zQPLph4E8U3gGQPD1AjH5L3pmMzkGBNstQIqmk0maTgHJZgOXrdeX++tu93a+clzvB6GHHscRc7Mdjd4f9vvDXSTSbp7kUcsXXi4ldHRLtUbm3q+Gn0RRXCHVo7faN3aX0y6IgiCISGd3ugAr2VeCAhkWJdzrOSQqXUIGuTpoKC9S+nJuHHgprTeyCH0vFgsJmWUb6sAXQIr53DwI+NSBTal6xmx4gP3PgDo30O7Mx8k9nlcH70XyoPgBKiZB6gkGNN0CaVDogq6SPu3piukfHNbuMP0DDMsOSy8PwcTdyTA4M5mOG6zcNZY9Zpat4Wzgn07GN6HQ83gy9YPuF4P3iw2jEFN9AAAAAElFTkSuQmCC'
  foodImage.onload = function () {
    foodLoaded = true
  }

  // Player Control

  let playerDirection: 'LEFT' | 'UP' | 'RIGHT' | 'DOWN' | undefined = undefined
  const changeDirection = (event: KeyboardEvent) => {
    const key = event.keyCode;

    if (key === KEYBOARD.LEFT && playerDirection !== 'RIGHT') {
      playerDirection = 'LEFT'
    }
    else if (key === KEYBOARD.UP && playerDirection !== 'DOWN') {
      playerDirection = 'UP'
    }
    else if (key === KEYBOARD.RIGHT && playerDirection !== 'LEFT') {
      playerDirection = 'RIGHT'
    }
    else if (key === KEYBOARD.DOWN && playerDirection !== 'UP') {
      playerDirection = 'DOWN'
    }
  }

  document.addEventListener('keydown', changeDirection)

  // Dificulty Management
  const gameDificulty = (): void => {
    level = updateLevel(score)
    // speeds up the game every level (16 points) by 10%
    const levelDificulty = BASE_GAME_SPEED / (1 + ((level - 1) / 10))

    clearInterval(game)
    game = setInterval(draw, levelDificulty)

    console.log({ levelDificulty, level, score, snake })
  }

  // Canvas Draw
  const draw = () => {
    if (!canvasRef.current) {
      return
    }
    const canvas: HTMLCanvasElement = canvasRef.current
    const context = canvas.getContext('2d')
    if (context && groundLoaded && foodLoaded) {
      context.drawImage(ground, 0, 0)

      for (let i = 0; i < snake.length; i++) {
        context.fillStyle = (i === 0) ? 'green' : 'white'
        context.fillRect(snake[i].x, snake[i].y, BASE_GAME_BOX, BASE_GAME_BOX)

        context.strokeStyle = 'red'
        context.strokeRect(snake[i].x, snake[i].y, BASE_GAME_BOX, BASE_GAME_BOX)
      }

      context.drawImage(foodImage, apple.x, apple.y)

      // Previous Player Head Position
      let snakeX = snake[0].x
      let snakeY = snake[0].y

      // Eat the Apple
      if (snakeX === apple.x && snakeY === apple.y) {

        // Spawn new Apple
        apple = spawnApple()

        // Add score
        ++score

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
        console.log({ snakeX, snakeY, hpb: BASE_GAME_HEIGHT * BASE_GAME_BOX, wpb: BASE_GAME_WIDTH * BASE_GAME_BOX })
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
