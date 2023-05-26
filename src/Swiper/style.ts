function addStyle() {
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
	display: flex;
	overflow: hidden;
	position: relative;
	user-select: none;
	width: 100%;
}
.canari-swipe__slide {
	position: absolute;
}
`

addStyle()
