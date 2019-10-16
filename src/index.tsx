import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

const root: HTMLElement = document.getElementById('root')!
const canvas: HTMLCanvasElement = document.createElement('canvas')
const context: CanvasRenderingContext2D = canvas.getContext('2d')!

ReactDOM.render(<App canvas={canvas} context={context} />, root)
