import React from 'react'
import './App.css'

interface Position {
  x: number
  y: number
}

const HOOK_SVG = 'M0 0h290v290H0V0z'
const HOOK_PATH = new Path2D(HOOK_SVG)
const SCALE = 2
const OFFSET = 80

function draw(ctx: CanvasRenderingContext2D, location: Position) {
  ctx.fillStyle = 'deepskyblue'
  ctx.shadowColor = 'dodgerblue'
  ctx.shadowBlur = 20
  ctx.save()
  ctx.scale(SCALE, SCALE)
  ctx.translate(location.x / SCALE - OFFSET, location.y / SCALE - OFFSET)
  ctx.fill(HOOK_PATH)
  ctx.restore()
}

const App: React.FC = () => {
  const canvasRef = React.useRef(null)
  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onClick={e => {
        const canvas: HTMLCanvasElement = canvasRef.current!
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!
        draw(ctx, { x: e.clientX, y: e.clientY })
      }}
    />
  )
}

export default App
