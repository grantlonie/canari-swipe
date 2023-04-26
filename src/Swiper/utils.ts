import { InstanceVariables, SwiperProps } from './types'

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
	touchStartPosition: 0,
	touchEndPosition: 0,
	velocity: 0,
	desiredOffset: 0,
	nextSlide: 0,
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
