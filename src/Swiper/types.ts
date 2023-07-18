export interface InstanceVariables {
	/** timer used during animation */
	animationInterval?: NodeJS.Timer
	/** true after swiper has been initialized */
	initialized: boolean
	/** user is swiping - moving while touching */
	isSwiping: boolean
	/** mouse or touch down inside container */
	isTouching: boolean
	/** stack of final user touch movements to calculate velocity after letting go */
	movements: Movement[]
}

export interface Movement {
	/** touch position */
	pagePosition: number
	/** ms at position */
	time: number
}

export interface Dimensions {
	container: Omit<Dimension, 'startPosition'>
	slides: Dimension[]
}

export interface Dimension {
	/** position needed to get to start of the slide */
	startPosition: number
	/** width (or height if vertical) */
	span: number
	/** height (or width if vertical) */
	thick: number
}

export interface Snap {
	index: number
	distance: number
}
