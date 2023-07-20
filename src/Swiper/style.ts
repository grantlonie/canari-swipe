export default function addStyle() {
	const STYLE_ID = 'canari-swipe-style'
	const existing = document.getElementById(STYLE_ID)
	if (existing) return

	const style = document.createElement('style')
	style.id = STYLE_ID
	style.innerHTML = styleText

	document.head.appendChild(style)
}

const styleText = `
.canari-swipe__container {
	align-content: flex-start;
	flex: 1;
	overflow: hidden;
	position: relative;
	user-select: none;
	width: 100%;
}
.canari-swipe__container img {
	-webkit-user-drag: none;
}
.canari-swipe__overlay {
	height: 100%;
	pointer-events: none;
	position: absolute;
	width: 100%;
	z-index: 1;
}
.canari-swipe__control {
	pointer-events: auto;
}
.canari-swipe__slide {
	position: absolute !important;
}
`
