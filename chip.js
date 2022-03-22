var canvas = document.querySelector('canvas#main-canvas')
var c = canvas.getContext('2d')

var w
var h
var x = -10

function resize() {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	w = canvas.width
	h = canvas.height
}
window.addEventListener('resize', resize)
resize()

var errorMessage = ''

function tick() {
	var statusString = cameraX + ' ' + cameraY + ' | ' + cursorX + ' ' + cursorY + ' | ' + state + ' | ' + errorMessage
	if(state == 'placeCell') {
		statusString += ' ' + cellType
	}
	document.querySelector('#state-string').textContent = statusString

	c.clearRect(0, 0, w, h)

	drawGrid()
	drawCells()
	drawWires()
	drawMarkers()
	drawOverlay()
	drawDrawings()

	c.fillStyle = '#f9ce16'
	c.fillRect(x, 0, 10, 5)
	x += 1
	if(x > w) {
		x = -10
	}

	requestAnimationFrame(tick)
}
requestAnimationFrame(tick)

addEventListener('keydown', function(event) {
	if(event.key == 'Escape') {
		handleEsc()
	}
	else if(event.key == 'i') {
		handleInverter()
	}
	else if(event.key == 'a') {
		handleAnd()
	}
	else if(event.key == 'o') {
		handleOr()
	}
	else if(event.key == 'x') {
		handleXor()
	}
	else if(event.key == 'm') {
		handleMux()
	}
	else if(event.key == 'f') {
		handleRegister()
	}
	else if(event.key == '+') {
		handleAdder()
	}
	else if(event.key == 'w') {
		handleWire()
	}
	else if(event.key == 'b') {
		handleStatic()
	}
	else if(event.key == 'v') {
		handleVia()
	}
	else if(event.key == 'd') {
		handleDelete()
	}
	else if(event.key == '1') {
		handleZoom(2)
	}
	else if(event.key == '2') {
		handleZoom(3)
	}
	else if(event.key == '3') {
		handleZoom(4)
	}
	else if(event.key == '4') {
		handleZoom(5)
	}
	else if(event.key == '5') {
		handleZoom(6)
	}
	else if(event.key == '6') {
		handleZoom(7)
	}
	else if(event.key == '7') {
		handleCenter()
	}
	else if(event.key == 'ArrowUp') {
		handleArrow('up', event.ctrlKey)
	}
	else if(event.key == 'ArrowDown') {
		handleArrow('down', event.ctrlKey)
	}
	else if(event.key == 'ArrowLeft') {
		handleArrow('left', event.ctrlKey)
	}
	else if(event.key == 'ArrowRight') {
		handleArrow('right', event.ctrlKey)
	}
	else if(event.key == 's' && event.ctrlKey) {
		event.preventDefault()
		handleSave()
	}
	else if(event.key == 'l' && event.ctrlKey) {
		event.stopPropagation()
		event.preventDefault()
		handleOpen()
	}
	else if(event.key == 'n') {
		handleDraw()
	}

})

var cursorX
var cursorY

addEventListener('pointermove', function(event) {
	cursorX = Math.floor(event.clientX / gridSize)
	cursorY = Math.floor(event.clientY / gridSize)

	handlePenInput(event)
})

addEventListener('click', function(event) {
	cursorX = Math.floor(event.clientX / gridSize)
	cursorY = Math.floor(event.clientY / gridSize)

	handleClick()
})

///

var nTracks = 6

var gridScale = {
	2: 60,
	3: 20,
	4: 5,
	5: 2,
	6: 0.5,
	7: 0.2,
}

var zoom = 3
var gridSize = gridScale[zoom]

var cameraX = 0
var cameraY = 0

function drawGrid() {
	if(gridSize > 1) {
		for(var y = 0; y < h / gridSize; y++) {
			if(y % 6 == 0) {
				if(y % 12 == 0) {
					c.fillStyle = '#f88'
				} else {
					c.fillStyle = '#888'
				}
				c.fillRect(0, y * gridSize - 1, w, 2)
			}

			if(gridSize < 10) {
				continue
			}

			c.fillStyle = '#bbb'
			for(var x = 0; x < w / gridSize; x++) {
				c.fillRect(x * gridSize - 1, y * gridSize - 1, 2, 2)
			}
		}
	}

	else {
		c.fillStyle = '#bbb'
		c.fillRect(w/2 - cameraX * gridSize, 0, 1, h)
		c.fillRect(0, h/2 - cameraY * gridSize, w, 1)
	}
}


function drawOverlay() {
	if(state == 'placeCell') {
		var img = document.querySelector('#cells' + zoom + ' [name="' + cellType + '"')
		var mirrorY = (Math.floor(cursorY / nTracks) * nTracks + nTracks / 2) * gridSize

		c.globalAlpha = 0.2
		c.save()
		c.translate(0, mirrorY)

		if(Math.floor(cursorY / nTracks) % 2 != 0 ) {
			c.scale(1, -1)
			c.drawImage(img, (cursorX - 0.25) * gridSize, (-0.25 - (nTracks / 2)) * gridSize, img.naturalWidth, img.naturalHeight)
		} else {
			c.drawImage(img, (cursorX - 0.25) * gridSize, (-0.25 - (nTracks / 2)) * gridSize, img.naturalWidth, img.naturalHeight)
		}

		c.restore()
		c.globalAlpha = 1.0
	}

	else if(state == 'wireStart') {
		c.fillStyle = '#f9ce16b0'
		c.fillRect((cursorX + 0.25) * gridSize, (cursorY + 0.25) * gridSize, gridSize * 0.5, gridSize * 0.5)
	}

	else if(state == 'wireContinue') {
		c.fillStyle = '#f9ce1680'

		var dx = cursorX + cameraX - wireX
		var dy = cursorY + cameraY - wireY

		if(isHorizontal(wireX, wireY, cursorX + cameraX, cursorY + cameraY)) {
			if(wireX - cameraX < cursorX) {
				c.fillRect((wireX - cameraX + 0.25) * gridSize, (wireY - cameraY + 0.25) * gridSize, (dx + 0.5) * gridSize, gridSize * 0.5)
			}
			else if(cursorX < wireX - cameraX) {
				c.fillRect((wireX - cameraX + 0.75) * gridSize, (wireY - cameraY + 0.25) * gridSize, (dx - 0.5) * gridSize, gridSize * 0.5)
			}
			else {
				c.fillRect((cursorX - cameraX + 0.25) * gridSize, (cursorY - cameraY + 0.25) * gridSize, gridSize * 0.5, gridSize * 0.5)
			}
		}
		else {  // vertical
			if(wireY - cameraY < cursorY) {
				c.fillRect((wireX - cameraX + 0.25) * gridSize, (wireY - cameraY + 0.25) * gridSize, gridSize * 0.5, (dy + 0.5) * gridSize)
			}
			else if(cursorY < wireY - cameraY) {
				c.fillRect((wireX - cameraX + 0.25) * gridSize, (wireY - cameraY + 0.75) * gridSize, gridSize * 0.5, (dy - 0.5) * gridSize)
				//c.fillRect(wireX * gridSize + gridSize * 0.25, wireY * gridSize + gridSize * 0.25, gridSize * 0.5, (dy - 0.5) * gridSize)
			}
			else {
				c.fillRect((cursorX - cameraX + 0.25) * gridSize, (cursorY - cameraY + 0.25) * gridSize, gridSize * 0.5, gridSize * 0.5)
			}
		}
	}

	else if(state == 'static') {
		if(cursorY % (2 * nTracks) == 0) {
			c.fillStyle = '#e449'
			c.fillRect((cursorX + 0.25) * gridSize, (cursorY) * gridSize, gridSize * 0.5, gridSize * 0.75)
		} else if((cursorY + 1) % (2 * nTracks) == 0) {
			c.fillStyle = '#e449'
			c.fillRect((cursorX + 0.25) * gridSize, (cursorY + 0.25) * gridSize, gridSize * 0.5, gridSize * 0.75)
		} else if(cursorY % (2 * nTracks) == nTracks) {
			c.fillStyle = '#4449'
			c.fillRect((cursorX + 0.25) * gridSize, (cursorY) * gridSize, gridSize * 0.5, gridSize * 0.75)
		} else if((cursorY + 1) % (2 * nTracks) == nTracks) {
			c.fillStyle = '#4449'
			c.fillRect((cursorX + 0.25) * gridSize, (cursorY + 0.25) * gridSize, gridSize * 0.5, gridSize * 0.75)
		}
	}

	else if(state == 'via') {
		c.fillStyle = '#66f9'
		c.fillRect((cursorX + 0.35) * gridSize, (cursorY + 0.35) * gridSize, gridSize * 0.3, gridSize * 0.3)
	}

	else if(state == 'delete') {
		c.fillStyle = '#f004'
		c.fillRect((cursorX - 0.25) * gridSize, (cursorY - 0.25) * gridSize, gridSize * 1.5, gridSize * 1.5)
		c.fillStyle = '#f008'
		c.fillRect((cursorX) * gridSize, (cursorY) * gridSize, gridSize * 1, gridSize * 1)
	}
}

function drawCells() {
	if(gridSize < 1) {
		return
	}

	design.cells.forEach(function(cell) {
		var img = document.querySelector('#cells' + zoom + ' [name="' + cell.t + '"')
		var mirrorY = (cell.y - cameraY + (nTracks / 2)) * gridSize

		c.save()
		c.translate(0, mirrorY)

		if(Math.floor((cell.y) / nTracks) % 2 != 0 ) {
			c.scale(1, -1)
		}

		c.drawImage(img, (cell.x - cameraX - 0.25) * gridSize, (-nTracks / 2 - 0.25) * gridSize)

		c.restore()

		if(state == 'delete') {
			c.fillStyle = '#f004'
			c.fillRect((cell.x - cameraX + 0.25) * gridSize, (cell.y - cameraY + 0.25) * gridSize, gridSize * 0.5, gridSize * 0.5)
		}
	})
}

function drawWires() {
	if(gridSize < 1) {
		c.fillStyle = '#860d'
	} else {
		c.fillStyle = '#f9ce1660'
	}

	design.horizontal.forEach(function(wire) {
		var dx = wire.x2 - wire.x1
		var dy = wire.y2 - wire.y1

		if(wire.x1 < wire.x2) {
			c.fillRect((wire.x1 + 0.25 - cameraX) * gridSize, (wire.y1 + 0.25 - cameraY) * gridSize, (dx + 0.5) * gridSize, gridSize * 0.5)
		} else if(wire.x2 < wire.x1) {
			c.fillRect((wire.x1 + 0.75 - cameraX) * gridSize, (wire.y1 + 0.25 - cameraY) * gridSize, (dx - 0.5) * gridSize, gridSize * 0.5)
		}
	})

	if(gridSize < 1) {
		c.fillStyle = '#860d'
	} else {
		c.fillStyle = '#f9ce16a0'
	}

	design.vertical.forEach(function(wire) {
		var dx = wire.x2 - wire.x1
		var dy = wire.y2 - wire.y1

		if(wire.y1 < wire.y2) {
			c.fillRect((wire.x1 + 0.25 - cameraX) * gridSize, (wire.y1 + 0.25 - cameraY) * gridSize, gridSize * 0.5, (dy + 0.5) * gridSize)
		} else if(wire.y2 < wire.y1) {
			c.fillRect((wire.x1 + 0.25 - cameraX) * gridSize, (wire.y1 + 0.75 - cameraY) * gridSize, gridSize * 0.5, (dy - 0.5) * gridSize)
		}
	})
}

function drawMarkers() {
	Object.values(design.vias).forEach(function(marker) {
		c.fillStyle = '#66fd'
		c.fillRect((marker.x - cameraX + 0.35) * gridSize, (marker.y - cameraY + 0.35) * gridSize, gridSize * 0.3, gridSize * 0.3)
	})

	Object.values(design.static).forEach(function(marker) {
		if(marker.y % (2 * nTracks) == 0) {
			c.fillStyle = '#e44d'
			c.fillRect((marker.x - cameraX + 0.25) * gridSize, (marker.y - cameraY) * gridSize, gridSize * 0.5, gridSize * 0.75)
		} else if((marker.y + 1) % (2 * nTracks) == 0) {
			c.fillStyle = '#e44d'
			c.fillRect((marker.x - cameraX + 0.25) * gridSize, (marker.y - cameraY + 0.25) * gridSize, gridSize * 0.5, gridSize * 0.75)
		} else if(Math.abs(marker.y % (2 * nTracks)) == nTracks) {
			c.fillStyle = '#444d'
			c.fillRect((marker.x - cameraX + 0.25) * gridSize, (marker.y - cameraY) * gridSize, gridSize * 0.5, gridSize * 0.75)
		} else if(Math.abs((marker.y + 1) % (2 * nTracks)) == nTracks) {
			c.fillStyle = '#444d'
			c.fillRect((marker.x - cameraX + 0.25) * gridSize, (marker.y - cameraY + 0.25) * gridSize, gridSize * 0.5, gridSize * 0.75)
		}
	})
}
///

var state = 'start'
function handleEsc() {
	state = 'start'
}

var cellType = 'inv'
var wireX = 0
var wireY = 0

function handleInverter() {
	state = 'placeCell'
	cellType = 'inv'
}

function handleAnd() {
	state = 'placeCell'
	cellType = 'and2'
}

function handleOr() {
	state = 'placeCell'
	cellType = 'or2'
}

function handleXor() {
	state = 'placeCell'
	cellType = 'xor2'
}

function handleMux() {
	state = 'placeCell'
	cellType = 'mux2'
}

function handleRegister() {
	state = 'placeCell'
	//cellType = 'dfxtp'
	cellType = 'sdfrtp'
}

function handleAdder() {
	state = 'placeCell'
	cellType = 'fa'
}

function handleWire() {
	state = 'wireStart'
}

function handleStatic() {
	state = 'static'
}

function handleVia() {
	state = 'via'
}

function handleDelete() {
	state = 'delete'
}

function handleDraw() {
	state = 'annotate'
	//drawCanvas.style.cursor = "url(/static/images/blackpen.png) 1 32"
}


function handleClick() {
	if(state == 'placeCell') {
		var cell = Cell(cellType, cursorX + cameraX, Math.floor((cursorY + cameraY) / nTracks) * nTracks)
		design.cells.push(cell)
		state = 'start'
	}

	else if(state == 'wireStart') {
		state = 'wireContinue'
		wireX = cursorX + cameraX
		wireY = cursorY + cameraY

		var key = wireX + ' ' + wireY
                if(!design.vias[key]) {
                        var viaMarker = Marker('via', wireX, wireY)
                        design.vias[key] = viaMarker
		}
	}

	else if(state == 'wireContinue') {
		var wire
		if(isHorizontal(wireX, wireY, cursorX + cameraX, cursorY + cameraY)) {
			wire = Wire(wireX, wireY, cursorX + cameraX, wireY)
			design.horizontal.push(wire)
			wireX = cursorX + cameraX
		} else {
			wire = Wire(wireX, wireY, wireX, cursorY + cameraY)
			design.vertical.push(wire)
			wireY = cursorY + cameraY
		}

		var key = wireX + ' ' + wireY
                if(!design.vias[key]) {
                        var viaMarker = Marker('via', wireX, wireY)
                        design.vias[key] = viaMarker
		}
	}

	else if(state == 'static') {
		var key = (cursorX + cameraX) + ' ' + (cursorY + cameraY)
		if(!design.static[key]) {
			var staticMarker = Marker('static', cursorX + cameraX, cursorY + cameraY)
			design.static[key] = staticMarker
		} else {
			delete design.static[key]
		}
	}

	else if(state == 'via') {
		var key = (cursorX + cameraX) + ' ' + (cursorY + cameraY)
		if(!design.vias[key]) {
			var viaMarker = Marker('via', cursorX + cameraX, cursorY + cameraY)
			design.vias[key] = viaMarker
		} else {
			delete design.vias[key]
		}
	}

	else if(state == 'delete') {
		var key = (cursorX + cameraX) + ' ' + (cursorY + cameraY)

		design.cells.forEach(function(cell, i) {
			if(cell.x == cursorX + cameraX && cell.y == cursorY + cameraY) {
				design.cells.splice(i, 1)
			}
		})

		design.horizontal.forEach(function(wire, i) {
			if(((wire.x1 >= cursorX + cameraX && wire.x2 <= cursorX + cameraX) ||
				(wire.x1 <= cursorX + cameraX && wire.x2 >= cursorX + cameraX)) &&
				wire.y1 == cursorY + cameraY) {

				design.horizontal.splice(i, 1)
			}
		})

		design.vertical.forEach(function(wire, i) {
			if(((wire.y1 >= cursorY + cameraY && wire.y2 <= cursorY + cameraY) ||
				(wire.y1 <= cursorY + cameraY && wire.y2 >= cursorY + cameraY)) &&
				wire.x1 == cursorX + cameraX) {

				design.vertical.splice(i, 1)
			}
		})

		delete design.static[key]
		delete design.vias[key]
	}


	else if(state == 'loadedDesign') {
		cursorX = Math.round(cursorX / (2 * nTracks)) * 2 * nTracks
		cursorY = Math.round(cursorY / (2 * nTracks)) * 2 * nTracks

		loadedDesign.cells.forEach(function(cell) {
			cell.x += cursorX + cameraX
			cell.y += cursorY + cameraY
			design.cells.push(cell)
		})
		loadedDesign.horizontal.forEach(function(wire) {
			wire.x1 += cursorX + cameraX
			wire.y1 += cursorY + cameraY
			wire.x2 += cursorX + cameraX
			wire.y2 += cursorY + cameraY

			design.horizontal.push(wire)
		})
		loadedDesign.vertical.forEach(function(wire) {
			wire.x1 += cursorX + cameraX
			wire.y1 += cursorY + cameraY
			wire.x2 += cursorX + cameraX
			wire.y2 += cursorY + cameraY

			design.vertical.push(wire)
		})
		Object.keys(loadedDesign.static).forEach(function(key) {
			var marker = loadedDesign.static[key]
			marker.x += cursorX + cameraX
			marker.y += cursorY + cameraY

			var translatedKey = marker.x + ' ' + marker.y

			design.static[translatedKey] = marker
		})
		Object.keys(loadedDesign.vias).forEach(function(key) {
			var marker = loadedDesign.vias[key]
			marker.x += cursorX + cameraX
			marker.y += cursorY + cameraY

			var translatedKey = marker.x + ' ' + marker.y

			design.vias[translatedKey] = marker
		})
		loadedDesign.drawings.forEach(function(drawing) {
			drawing.x += cursorX + cameraX
			drawing.y += cursorY + cameraY

			drawing.penStroke.forEach(function(point) {
				point.x += (cursorX + cameraX) * gridScale[drawing.zoom]
				point.y += (cursorY + cameraY) * gridScale[drawing.zoom]
			})

			design.drawings.push(drawing)
		})

		state = 'start'
	}
}

function handleZoom(level) {
	//cameraX += cursorX - centerX
	//cameraY += cursorY - centerY

	var centerX = cursorX + cameraX
	var centerY = cursorY + cameraY

	centerX = Math.floor(centerX / (2 * nTracks)) * 2 * nTracks
	centerY = Math.floor(centerY / (2 * nTracks)) * 2 * nTracks

	var mouseX = (cursorX + 0.5) * gridSize
	var mouseY = (cursorY + 0.5) * gridSize

	zoom = level
	gridSize = gridScale[zoom]

	var halfWidth = Math.floor((0.5 * w / gridSize) / (2 * nTracks)) * 2 * nTracks
	var halfHeight = Math.floor((0.5 * h / gridSize) / (2 * nTracks)) * 2 * nTracks

	cameraX = centerX - halfWidth
	cameraY = centerY - halfHeight

	cursorX = Math.floor(mouseX / gridSize)
	cursorY = Math.floor(mouseY / gridSize)
}

function handleCenter() {
	handleZoom(6)

	var halfWidth = Math.floor((0.5 * w / gridSize) / (2 * nTracks)) * 2 * nTracks
	var halfHeight = Math.floor((0.5 * h / gridSize) / (2 * nTracks)) * 2 * nTracks

	cameraX = -halfWidth
	cameraY = -halfHeight

}

function handleArrow(direction, ctrlKey) {
	var speed = 2

	if(ctrlKey) {
		speed *= 5
	}

	if(direction == 'up') {
		cameraY -= speed * nTracks
	}
	else if(direction == 'down') {
		cameraY += speed * nTracks
	}
	else if(direction == 'left') {
		cameraX -= speed * nTracks
	}
	else if(direction == 'right') {
		cameraX += speed * nTracks
	}
}

function handleSave() {
	cleanDesign(design)

	var data = btoa(JSON.stringify(design, null, 2))
	downloadDataURL('data:application/json;base64,' + data, 'chip-' + (new Date()).toString().slice(0, 21) + '.json')
}

function cleanDesign(d) {
	d.cells.forEach(function(cell) {
		if(cell.t == 'dfxtp') {
			cell.t = 'sdfrtp'
		}
	})
}

function handleOpen() {
	var uploadElement = document.createElement('input')
	uploadElement.setAttribute('type', 'file')
	document.body.appendChild(uploadElement)

	uploadElement.addEventListener('change', function(event) {
		event.stopPropagation()
		event.preventDefault()

		uploadElement.files[0].text().then(function(data) {
			loadedDesign = JSON.parse(data)
			cleanDesign(loadedDesign)
			state = 'loadedDesign'
		})

		return false
	}, false)

	uploadElement.click()
}

///

var design = {}
design.cells = []
design.horizontal = []
design.vertical = []
design.static = {}
design.vias = {}
design.drawings = []

function Cell(t, x, y) {
	var cell = {
		t: t,
		x: x,
		y: y,
	}

	return cell
}

function Wire(x1, y1, x2, y2) {
	var wire = {
		x1: x1,
		y1: y1,
		x2: x2,
		y2: y2,
	}

	return wire
}

function Marker(name, x, y) {
	var marker = {
		name: name,
		x: x,
		y: y,
	}

	return marker
}

//

function isHorizontal(x1, y1, x2, y2) {
	var dx = x2 - x1
	var dy = y2 - y1
	return Math.abs(Math.atan2(dy, dx)) < Math.PI / 4 || Math.abs(Math.atan2(dy, dx)) > 3 * Math.PI / 4
}

function downloadDataURL(uri, name) {
	var link = document.createElement('a')
	link.download = name
	link.href = uri
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}


//

var penWidth = 3
var penColor = '#222'

var previousPosition
var pointerDown = false
var penStroke = []

function handlePenInput(event) {
	if(state != 'annotate') {
		return
	}

        var x = event.offsetX + 3
        var y = event.offsetY + 3

        if(event.pressure > 0 && pointerDown && penStroke.length > 0) {
		penStroke.push({
			x: cameraX * gridSize + x,
			y: cameraY * gridSize + y,
			pressure: event.pressure,
		})
	}

        //drawCanvas.style.cursor = "url(/static/images/blackpen.png) 1 32, pointer"
}

document.addEventListener('pointerdown', function(event) {
	if(state != 'annotate') {
		return
	}

	var x = event.offsetX + 3
	var y = event.offsetY + 3

	penStroke.push({
		x: cameraX * gridSize + x,
		y: cameraY * gridSize + y,
		pressure: 1.0, // event.pressure,
	})

	pointerDown = true
})

document.addEventListener('pointerup', function(event) {
	if(state != 'annotate') {
		return
	}

	var minX = null
	var minY = null

	penStroke.forEach(function(point) {
		if(minX === null || point.x < minX) {
			minX = point.x
		}
		if(minY === null || point.y < minY) {
			minY = point.y
		}
	})

	design.drawings.push({
		zoom: zoom,
		penStroke: penStroke,
		x: Math.floor(minX / gridSize),
		y: Math.floor(minY / gridSize),
	})

	penStroke = []
	pointerDown = false
})

function drawDrawings() {
	c.lineWidth = penWidth

	design.drawings.forEach(function(drawing) {
		if(drawing.zoom >= zoom - 1 && drawing.zoom <= zoom + 1) {
			var gridRatio = gridScale[zoom] / gridScale[drawing.zoom]

			if(drawing.zoom > zoom) {
				c.strokeStyle = '#4442'
				c.fillStyle = '#4442'
			} else if(drawing.zoom < zoom) {
				c.strokeStyle = '#888a'
				c.fillStyle = '888a'
			} else {
				c.strokeStyle = '#222f'
				c.fillStyle = '222f'
			}
			c.lineWidth = penWidth * gridRatio

			drawing.penStroke.forEach(function(point, i) {
				if(i == 0 || i == drawing.penStroke.length - 1) {
					c.beginPath()
					c.arc(gridRatio * (drawing.penStroke[i].x - (cameraX * gridScale[drawing.zoom])), gridRatio * (drawing.penStroke[i].y - (cameraY * gridScale[drawing.zoom])), c.lineWidth / 2, 0, 2 * Math.PI)
					c.fill()
				}

				if(i > 0) {
					c.beginPath()
					c.moveTo(gridRatio * (drawing.penStroke[i-1].x - (cameraX * gridScale[drawing.zoom])), gridRatio * (drawing.penStroke[i-1].y - (cameraY * gridScale[drawing.zoom])))
					c.lineTo(gridRatio * (point.x - (cameraX * gridScale[drawing.zoom])), gridRatio * (point.y - (cameraY * gridScale[drawing.zoom])))
					c.stroke()
				}
			})
		}
	})

	penStroke.forEach(function(point, i) {
		var pressure = 1.0 // point.pressure
		var alpha = (255).toString(16)
		c.strokeStyle = penColor + alpha
		c.fillStyle = penColor + alpha

		if(i == 0 || i == penStroke.length - 1) {
			c.beginPath()
			c.arc(penStroke[i].x - (cameraX * gridSize), penStroke[i].y - (cameraY * gridSize), c.lineWidth / 2, 0, 2 * Math.PI)
			c.fill()
		}

		if(i > 0) {
			c.beginPath()
			c.moveTo(penStroke[i-1].x - (cameraX * gridSize),  penStroke[i-1].y - (cameraY * gridSize))
			c.lineTo(point.x - (cameraX * gridSize), point.y - (cameraY * gridSize))
			c.stroke()
		}
	})
}
