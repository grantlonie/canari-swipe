import { InstanceVariables, Movement, SwiperProps } from './types'

export function getDeceleration(braking?: SwiperProps['braking']) {
	switch (braking) {
		case 'soft':
			return 2
		case 'hard':
			return 10
		default:
			return 5
	}
}

export const initialInstanceVariables: InstanceVariables = {
	clock: 0,
	currentSlide: 0,
	isTouching: false,
	isSwiping: false,
	velocity: 0,
	desiredOffset: 0,
	nextSlide: 0,
	movements: [],
}

/** Return slides between current and next, and if looping, the other direction if faster */
export function getDelta(currentSlide: number, nextSlide: number, loop: boolean, slideCount: number) {
	const delta = nextSlide - currentSlide
	if (!loop || !delta) return delta

	const otherDelta =
		nextSlide > currentSlide ? nextSlide - currentSlide - slideCount : slideCount - currentSlide + nextSlide

	return Math.abs(otherDelta) < Math.abs(delta) ? otherDelta : delta
}

/** Determine when swiping starts based on minimum required movement */
export function startedSwiping(position: number, startPosition: number, scale: number) {
	const amount = Math.abs(position - startPosition) / scale
	return amount > 5
}

/** get current time in ms */
export const getCurrentClock = () => new Date().getTime()

export function getVelocityMovements(movements: Movement[]) {
	const start = movements[0]
	const end = movements[movements.length - 1]
	const velocity = (end.position - start.position) / (end.time - start.time)
	return velocity * 1000 * -1
}

/** given number of slides and which slide is current, generate an array that indicates if a slide should carousel (0: no, 1: yes, small slide to the end, -1: yes, large index to the start) */
export function carouselIndexes(count: number, visible: number, currentSlide: number) {
	const overhang = (count - visible) / 2
	const minIndex = -Math.floor(overhang)
	const maxIndex = visible - 1 + Math.ceil(overhang)

	let index = -currentSlide
	let carousel = 0
	if (index < minIndex) {
		index += count
		carousel = 1
	}

	return new Array(count).fill(null).map(() => {
		if (index > maxIndex) {
			carousel = carousel ? 0 : -1
			index -= count
		}
		index++
		return carousel
	})
}

export function correctPosition(position: number, maxPosition: number, loop: boolean) {
	// TODO - add spring back effect

	if (position < 0) {
		return loop ? position + maxPosition : 0
	} else if (position > maxPosition) {
		return loop ? position - maxPosition : maxPosition
	}

	return position
}
