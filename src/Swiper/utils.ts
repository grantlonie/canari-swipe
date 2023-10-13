import { CSSProperties } from 'react'
import { EasingFunction, SwiperProps } from './Swiper'
import { Dimension, Dimensions, InstanceVariables, Movement, Snap } from './types'
import { overlayClass, slideClass } from './style'

export const initialInstanceVariables: InstanceVariables = {
	initialized: false,
	isTouching: false,
	isSwiping: false,
	movements: [{ pagePosition: 0, scrollPosition: 0, time: 0 }],
}

/** return px/sec^2 deceleration */
export function getDeceleration(braking?: SwiperProps['braking']) {
	const min = 1
	const max = 100

	const corrected = Math.max(Math.min(braking || 50, max), min)
	const converted = ((20000 - 2000) / (max - min)) * corrected
	return Math.round(converted)
}

/** Return distance between current and next positions, and if looping, the other direction if faster */
export function getDelta(currentPosition: number, nextPosition: number, loop: boolean, totalSpan: number) {
	const delta = nextPosition - currentPosition
	if (!loop || !delta) return delta

	const otherDelta = delta + totalSpan * (nextPosition > currentPosition ? -1 : 1)
	return Math.abs(otherDelta) < Math.abs(delta) ? otherDelta : delta
}

/** Determine when swiping starts based on minimum required movement */
export function startedSwiping(position: number, startPosition: number, scale: number) {
	const amount = Math.abs(position - startPosition) / scale
	return amount > 5
}

/** get current time in ms */
export const getCurrentClock = () => new Date().getTime()

export function velocityFromMovements(movements: Movement[]) {
	const start = movements[0]
	const end = movements[movements.length - 1]
	const velocity = (end.pagePosition - start.pagePosition) / (end.time - start.time)
	return velocity * 1000 * -1
}

/** determine how many pixels can be covered before coming to rest */
export function howFar(velocity: number, deceleration: number) {
	return Math.round(Math.pow(velocity, 2) / (2 * deceleration)) * Math.sign(velocity)
}

/** determine how long is should take to come to rest in ms */
export function howLong(velocity: number, deceleration: number) {
	if (!deceleration) return 0
	return Math.round((Math.abs(velocity) / deceleration) * 1000)
}

/** get updated deceleration */
export function calculateDeceleration(velocity: number, distance: number) {
	if (!Math.abs(distance)) return 0
	return Math.round(Math.abs(Math.pow(velocity, 2) / (2 * distance)))
}

/** update startPosition of each slide based to carousel around current slide */
export function carouselSlides(dimensions: Dimensions | undefined, currentIndex: number, center: boolean) {
	if (!dimensions) return

	const { slides } = dimensions

	const totalSpan = getEndPosition(slides[slides.length - 1])
	const firstIndex = getFirstIndex(dimensions, currentIndex, center)

	let i = firstIndex
	let flipper = i <= currentIndex ? 0 : -1
	let adjusted: Dimension[] = new Array(slides.length)

	while (true) {
		const startPosition = slides[i].startPosition + flipper * totalSpan
		adjusted[i] = { ...slides[i], startPosition }
		i++
		if (i > slides.length - 1) {
			i = 0
			flipper++
		}
		if (i === firstIndex) break
	}

	return adjusted
}

/** get first slide index based on how much overhang should be on each side of container span */
function getFirstIndex({ container, slides }: Dimensions, currentIndex: number, center: boolean) {
	const count = slides.length
	const lastSlide = slides[count - 1]
	const overhangDistance = (getEndPosition(lastSlide) - container.span) / 2

	let index = currentIndex
	let distance = center ? slides[currentIndex].span / 2 : 0
	while (true) {
		let nextIndex = carousel(index - 1, count)
		distance += slides[nextIndex].span
		if (distance > overhangDistance + (center ? container.span / 2 : 0)) break
		index = nextIndex
	}

	return index
}

/** apply easing function to stop swiping */
export function easyDoesIt(ratio: number, easingFunction: EasingFunction) {
	switch (easingFunction) {
		case 'linear':
			return ratio
		case 'quad':
			return 1 - Math.pow(1 - ratio, 2)
		case 'quart':
			return 1 - Math.pow(1 - ratio, 4)
		case 'overshoot':
			const c1 = 1
			const c3 = c1 + 1
			return 1 + c3 * Math.pow(ratio - 1, 3) + c1 * Math.pow(ratio - 1, 2)
	}
}

export const carousel = (value: number, maxValue: number) => (value + maxValue * 100) % maxValue

export const clamp = (num: number, max: number, min = 0) => Math.min(Math.max(num, min), max)

export function getEndPosition(slide?: Dimension) {
	if (!slide) return 0
	return slide.startPosition + slide.span
}

export function makeSlideStyle(offset: number, span: number, vertical: boolean, size: boolean): CSSProperties {
	const xOffset = vertical ? 0 : offset
	const yOffset = vertical ? offset : 0
	const dimensionKey = vertical ? 'Height' : 'Width'

	return {
		transform: `translate3d(${xOffset}px, ${yOffset}px, 0)`,
		...(size && { [`max${dimensionKey}`]: `${span}px`, [`min${dimensionKey}`]: `${span}px` }),
	}
}

export function makeDimensions(
	containerElement: HTMLDivElement,
	gap: number,
	vertical: boolean,
	hasOverlay: boolean,
	fit?: number
): Dimensions {
	const { children, offsetHeight, offsetWidth } = containerElement
	const containerSpan = vertical ? offsetHeight : offsetWidth

	let slideElements = Array.from(children ?? []) as HTMLElement[]
	if (hasOverlay) {
		const overlayElement = slideElements.shift()
		if (overlayElement) addClassToOverlay(overlayElement)
	}
	const fixedSlideSpan = fit ? (containerSpan - gap * (fit - 1)) / fit : undefined

	addClassToSlides(slideElements)

	let currentCumSpan = gap
	const slides = slideElements.map(c => {
		const [width, height] = getDimensionsWithMargins(c)
		const span = fixedSlideSpan || (vertical ? height : width)
		const thick = vertical ? width : height
		const startPosition = currentCumSpan
		currentCumSpan += span + gap
		return { startPosition, span, thick }
	})

	const maxSlideThickness = slides.reduce((acc, cur) => Math.max(acc, cur.thick), 0)
	const container = { span: containerSpan, thick: maxSlideThickness }

	return { container, slides }
}

function addClassToOverlay(element: Element) {
	if (element.classList.contains(overlayClass)) return

	element.className = `${overlayClass}${element.className ? ' ' + element.className : ''}`
}

function addClassToSlides(slideElements: Element[]) {
	if (slideElements[0].classList.contains(slideClass)) return

	for (let element of slideElements) {
		element.className = `${element.className ? element.className + ' ' : ''}${slideClass}`
	}
}

function getDimensionsWithMargins(element: HTMLElement): [number, number] {
	const style = window.getComputedStyle(element)

	function getDimension(baseDimension: number, sides: [string, string]) {
		return sides.map(side => parseInt(style[`margin-${side}`])).reduce((total, side) => total + side, baseDimension)
	}

	const width = getDimension(element.offsetWidth, ['left', 'right'])
	const height = getDimension(element.offsetHeight, ['top', 'bottom'])
	return [width, height]
}

/** get current slide index from position (if center, from middle of current slide to middle of next) */
export function indexFromPosition(position: number, slides: Dimension[], center: boolean) {
	if (!slides.length) return 0

	for (let i = 0; i < slides.length; i++) {
		const endPosition = getEndPosition(slides[i])
		if (center) {
			const nextIndex = carousel(i + 1, slides.length)
			if (position < endPosition + centerCorrection(slides, nextIndex)) return i
		} else {
			if (position < endPosition) return i
		}
	}

	return 0
}

export const isPastHalfway = (distance: number, span: number) => (distance + span) % span > span / 2

/** based on current position and desiredDistance (positive or negative), determine the next slide and final slide */
export function snapDistance(
	position: number,
	slides: Dimension[],
	desiredDistance: number,
	center: boolean
): { next: Snap; prev: Snap; total?: Snap } {
	const currentIndex = indexFromPosition(position, slides, center)
	const { startPosition, span } = slides[currentIndex]
	const direction = Math.sign(desiredDistance) || 1
	const forward = direction > 0
	const gap = gapFromSlides(slides)
	const forwardIndex = carousel(currentIndex + 1, slides.length)

	let backwardDistance = startPosition - position
	let forwardDistance = backwardDistance + span + gap
	if (center) {
		forwardDistance += centerCorrection(slides, forwardIndex)
		backwardDistance += centerCorrection(slides, currentIndex)
	}

	let distance = forward ? forwardDistance : backwardDistance
	let i = forward ? forwardIndex : currentIndex
	const next = { distance, index: i }
	const prev = {
		distance: forward ? backwardDistance : forwardDistance,
		index: forward ? currentIndex : forwardIndex,
	}
	const stayOnCurrentSlide = !desiredDistance || Math.abs(distance) > Math.abs(desiredDistance)
	if (stayOnCurrentSlide) return { next, prev }

	let snapped = { next, prev, total: { ...next } }

	while (true) {
		const nextIndex = carousel(i + (forward ? 1 : -1), slides.length)
		const previousSpan = slides[i].span
		if (!forward) i = nextIndex
		let span = slides[i].span
		if (center) span = (span + (forward ? slides[nextIndex].span : previousSpan)) / 2
		distance += (span + gap) * direction
		if (Math.abs(distance) > Math.abs(desiredDistance)) return snapped

		if (forward) i = nextIndex
		snapped.total.distance = distance
		snapped.total.index = i
	}
}

function gapFromSlides(slides: Dimension[]) {
	return slides?.[0].startPosition ?? 0
}

/** for center alignment, create position correction */
export function centerCorrection(slides: Dimension[], index: number) {
	const firstSpan = slides[0].span
	const currentSpan = slides[index].span
	return (currentSpan - firstSpan) / 2
}

export function getContainerStyle(containerThickness = 0, vertical = false): CSSProperties {
	if (vertical) return { width: containerThickness }
	else return { height: containerThickness }
}

export function getTotalSpan(dimensions: Dimensions | undefined, center: boolean) {
	if (!dimensions) return { totalSpan: 0, overflowDistance: 0 }

	const { container, slides } = dimensions
	const lastSlide = slides[slides.length - 1]
	const totalSpan = getEndPosition(lastSlide)
	const overflowDistance = totalSpan - ((center ? lastSlide?.span : container?.span) ?? 0)
	return { totalSpan, overflowDistance }
}

export const handlePreventDefault = e => e.preventDefault()

/** Simple deep isEqual function comparing strings */
export function isEqual(a, b) {
	return JSON.stringify(a) === JSON.stringify(b)
}
