//(function() {
var drawCanvas = document.querySelector('canvas#draw-canvas')
var dc = drawCanvas.getContext('2d')

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
	drawCanvas.toBlob(function(blob) {
		var reader = new FileReader()

		reader.addEventListener('load', function () {
	                var dataURL = reader.result

			var img = document.createElement('img')
			img.src = dataURL

			design.drawings.push({
				zoom: zoom,
				imageData: dataURL,
				img: img,
				x: cameraX,
				y: cameraY,
			})
		}, false)

		if (blob) {
			reader.readAsDataURL(blob)
		}
	}, 'image/jpg', 0.5)

	dc.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
}

function drawDrawings() {
	design.drawings.forEach(function(drawing) {
		if(drawing.zoom == zoom) {
			c.drawImage(drawing.img, (drawing.x - cameraX) * gridSize, (drawing.y - cameraY) * gridSize)
		}
	})
}

//})()
