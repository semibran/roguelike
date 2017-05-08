import { Cell } from './index'

export default { create }

function create(size) {

  let canvas = document.createElement('canvas')
  canvas.width = canvas.height = size

  let context = canvas.getContext('2d')

  let display = {
    size, context,
    mount, render
  }

  return display

  function mount(element) {

    if (typeof element === 'string')
      element = document.querySelector(element)

    if (!element)
      throw new TypeError(`Cannot mount display on element '${element}'`)

    element.appendChild(canvas)

    return display

  }

  function render(worldData) {

    let cells = Object.keys(worldData).map(Cell.fromString)

    let imageData = context.createImageData(size, size)
    let data = imageData.data

    for (let cell of cells) {
      let index = Cell.toIndex(cell, size)
      let i = index * 4
      let color = worldData[cell]
      if (!color)
        continue
      let [red, green, blue] = color
      data[i]     = red
      data[i + 1] = green
      data[i + 2] = blue
      data[i + 3] = 255
    }

    context.putImageData(imageData, 0, 0)

  }

}
