var penWidth = 3
var penColor = '#000000'

var previousPosition
var pointerDown = false

drawCanvas.addEventListener('pointermove', function(event) {
	if(state != 'annotate') {
		return
	}

        var x = event.offsetX + 3
        var y = event.offsetY + 3

	var pressure = event.pressure

        if(pressure > 0 && previousPosition && pointerDown) {
		dc.lineWidth = penWidth
		var alpha = Math.floor(event.pressure * 256).toString(16)
		dc.strokeStyle = penColor + alpha
		dc.fillStyle = penColor + alpha

		dc.beginPath()
		dc.moveTo(previousPosition.x, previousPosition.y)
		dc.lineTo(x, y)
		dc.stroke()
	}

        //drawCanvas.style.cursor = "url(/static/images/blackpen.png) 1 32"

        previousPosition = {
            x: x,
            y: y,
        }
})

drawCanvas.addEventListener('pointerdown', function(event) {
	if(state != 'annotate') {
		return
	}

	var x = event.offsetX + 3
	var y = event.offsetY + 3

	dc.beginPath()
	dc.arc(x, y, c.lineWidth / 2, 0, 2 * Math.PI)
	dc.fill()

	previousPosition = {
		x: x,
		y: y,
	}

	pointerDown = true
})

drawCanvas.addEventListener('pointerup', function(event) {
	if(state != 'annotate') {
		return
	}

	saveDrawing()
	delete previousPosition
	pointerDown = false
})

function saveDrawing() {
	design.drawings.push({
		zoom: zoom,
		imageData: dataURL,
		img: img,
		x: cameraX,
		y: cameraY,
	})
}

function drawDrawings() {
	design.drawings.forEach(function(drawing) {
		if(drawing.zoom == zoom) {
			c.drawImage(drawing.img, (drawing.x - cameraX) * gridSize, (drawing.y - cameraY) * gridSize)
		}
	})
}

//})()
