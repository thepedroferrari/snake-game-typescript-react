export interface IPosition {
  x: number
  y: number
}

export interface ICanvasProps {
  width: number
  height: number
}

export type PlayerDirection = 'LEFT' | 'UP' | 'RIGHT' | 'DOWN' | undefined
export type XYDown = number | null

export type GameStatus = 'LOADED' | 'PAUSED' | 'STARTED' | 'OVER'
