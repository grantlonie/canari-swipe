export default function addStyle() {
	const STYLE_ID = 'canari-swipe-style'
	const existing = document.getElementById(STYLE_ID)
	if (existing) return

	const style = document.createElement('style')
	style.id = STYLE_ID
	style.innerHTML = styleText

	document.head.appendChild(style)
}

export const containerClass = 'canari-swipe__container'
export const overlayClass = 'canari-swipe__overlay'
export const slideClass = 'canari-swipe__slide'
export const actionClass = 'canari-swipe__action'

const styleText = `
.${containerClass} {
	align-content: flex-start;
	flex: 1;
	overflow: hidden;
	position: relative;
	user-select: none;
	width: 100%;
}
.${containerClass} img {
	-webkit-user-drag: none;
}
.${overlayClass} {
	height: 100%;
	pointer-events: none;
	position: absolute;
	width: 100%;
	z-index: 1;
}
.${actionClass} {
	pointer-events: auto;
}
.${slideClass} {
	position: absolute !important;
}
`
