import { InstanceVariables, Movement, SwiperProps } from './types'

/** return deceleration in px/sec^2 */
export function getDeceleration(braking?: SwiperProps['braking']) {
	switch (braking) {
		case 'soft':
			return 2000
		case 'hard':
			return 10000
		default:
			return 5000
	}
}

export const initialInstanceVariables: InstanceVariables = {
	initialized: false,
	isTouching: false,
	isSwiping: false,
	movements: [{ pagePosition: 0, time: 0 }],
}

/** Return distance between current and next positions, and if looping, the other direction if faster */
export function getDelta(currentPosition: number, nextPosition: number, loop: boolean, totalDistance: number) {
	const delta = nextPosition - currentPosition
	if (!loop || !delta) return delta

	const otherDelta =
		nextPosition > currentPosition
			? nextPosition - currentPosition - totalDistance
			: totalDistance - currentPosition + nextPosition

	return Math.abs(otherDelta) < Math.abs(delta) ? otherDelta : delta
}

/** Determine when swiping starts based on minimum required movement */
export function startedSwiping(position: number, startPosition: number, scale: number) {
	const amount = Math.abs(position - startPosition) / scale
	return amount > 5
}

/** get current time in ms */
export const getCurrentClock = () => new Date().getTime()

export function getVelocityFromMovements(movements: Movement[]) {
	const start = movements[0]
	const end = movements[movements.length - 1]
	const velocity = (end.pagePosition - start.pagePosition) / (end.time - start.time)
	return velocity * 1000 * -1
}

export function getPositionFromVelocity(position: number, velocity: number, timeChange: number) {
	const newPosition = position + (velocity * timeChange) / 1000
	return Math.round(newPosition)
}

export function getVelocityFromDeceleration(velocity: number, deceleration: number, timeChange: number) {
	const newVelocity = velocity - (Math.sign(velocity) * deceleration * timeChange) / 1000
	return Math.round(newVelocity)
}

/** determine the minimum velocity to travel a specified distance with deceleration */
export function minVelocityToTravel(distance: number, deceleration: number) {
	return Math.round(Math.sqrt(2 * deceleration * distance))
}

/** determine how many pixels (absolute) can be covered before coming to rest */
export function howFar(velocity: number, deceleration: number) {
	return Math.round(Math.pow(velocity, 2) / (2 * deceleration))
}

/** determine how long is should take to come to rest in ms */
export function howLong(velocity: number, deceleration: number) {
	return Math.round((Math.abs(velocity) / deceleration) * 1000)
}

/** get updated deceleration */
export function updateDeceleration(velocity: number, distance: number) {
	return Math.round(Math.abs(Math.pow(velocity, 2) / (2 * distance)))
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

export function correctPosition(position: number, totalDistance: number) {
	if (position < 0) return position + totalDistance
	else if (position > totalDistance) return position - totalDistance
	return position
}

/** returns a promise that sleeps for specified time in ms. default 0 */
export default function sleep(ms: number = 0) {
	return new Promise(resolve => setTimeout(() => resolve(null), ms))
}

/** easing function to stop swiping */
export function easeOutSine(ratio: number) {
	return Math.sin(ratio * (Math.PI / 2))
}

export function clamp(num: number, min: number, max: number) {
	return Math.min(Math.max(num, min), max)
}
