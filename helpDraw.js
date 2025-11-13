function roundToNearestMultiple(value, multiple) { return Math.round(value / multiple) * multiple; }

function roundy(value, f) { return Math.round(value * f)/f; }

function rangeCheck(value, max, min) {return min <= value && value <= max}

function _clampy(v, max, min, e) {return rangeCheck(v, max, min) ? e : v} // strange clamp hehe

function normalClamp(v, max, min) {return rangeCheck(v, max, min) ? v : Math.max(min, Math.min(max, v))}

function toRadians(x) {return x * Math.PI / 180}

function gcd(a, b) {
	if (!b) return a;
	return gcd(b, Math.floor(a % b));
}

function toRatio(fraction) {
	let length = fraction.toString().length - 2
	let denominator = Math.pow(10, length)
	let numerator = fraction * denominator
	let divisor = gcd(numerator, denominator)
	numerator /= divisor
	denominator /= divisor
	divisor = null
	length = null
	return {width: numerator, height: denominator}
}

function drawText(ctx, x, y, text, font, color, lineWidth=0) {
    ctx.font = font
    ctx.fillStyle = color
    ctx.strokeStyle = color
    if (lineWidth > 0) {ctx.lineWidth = lineWidth; ctx.strokeText(text, x, y)} else {ctx.fillText(text, x, y)}
}

function drawCircle(ctx, x, y, radius, lineWidth=0, startAngle=0, endAngle=Math.PI*2) {
	ctx.beginPath()
	ctx.arc(x, y, radius, startAngle, endAngle)
	if (lineWidth==0) {
		ctx.fill()
	} else {
		ctx.lineWidth = lineWidth
		ctx.stroke()
	}
}

function drawLine(ctx, x, y, ex, ey) {
	ctx.beginPath()
	ctx.moveTo(x, y)
	ctx.lineTo(ex, ey)
	ctx.stroke()
}

function drawRect(context, x, y, w, h, lineWidth=0) {
	if (lineWidth == 0) {
		context.fillRect(x, y, w, h)
	} else {
		context.lineWidth = lineWidth
		context.strokeRect(x, y, w, h)
	}
}
