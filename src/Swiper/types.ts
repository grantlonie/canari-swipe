export interface SwiperProps {
	/** (default med) how hard to brake swiping animation after letting go */
	braking?: 'soft' | 'medium' | 'hard'
	children: JSX.Element[]
	/** prevent dragging slides */
	disabled?: boolean
	/** (default 0) used to set initial slide and to control externally */
	goTo?: number
	/** (default 500) Time it takes to transition to desired slide */
	goToTime?: number
	/** loop the slides (i.e. go back to the beginning) */
	loop?: boolean
	/** TODO - get rid of this in favor of calculating if fast enough based on braking */
	minimumSwipeSpeed?: number
	/** do not render slides that are not visible nor neighbors of visible */
	neighborsOnly?: boolean
	/** let slides stop freely (do not snap to edge) */
	noDetent?: boolean
	/** called when swiping starts */
	onSwipeStart?: () => void
	/** called when swiping ends with current slide*/
	onSwipeEnd?: (slide: number) => void
	/** return callable methods */
	onLoad?: (methods: Methods) => void
	/** (default 1) helpful when applying transform scale to swiper to match swipe movements */
	scaleSwipe?: number
	/** (default 1) show multiple slides at the same time */
	visible?: number
	/** change to vertical swiper */
	vertical?: boolean
}

interface Methods {
	/** go to a slide */
	goTo: (slide: number) => void
	/** go to next slide */
	next: () => void
	/** go to previous slide */
	prev: () => void
}

export interface InstanceVariables {
	/** used to calculate velocity and changes in position */
	clock: number
	/** active slide */
	currentSlide: number
	/** mouse or touch down inside container */
	isTouching: boolean
	/** user is swiping - moving while touching */
	isSwiping: boolean
	/** stack of final user touch movements to calculate velocity after letting go */
	movements: Movement[]
	/** current velocity  */
	velocity: number
	desiredOffset: number
	nextSlide: number
}

export interface Movement {
	/** touch position */
	position: number
	/** ms at position */
	time: number
}
