export interface SwiperProps {
	/** (default medium) how hard to brake swiping animation after letting go  */
	braking?: 'soft' | 'medium' | 'hard'
	children: JSX.Element[]
	/** prevent dragging slides */
	disabled?: boolean
	/** (default 0) used to set initial slide and to control externally */
	goTo?: number
	/** (default 500ms) time it takes to transition to desired slide */
	goToTime?: number
	/** loop the slides (i.e. go back to the beginning) */
	loop?: boolean
	/** (default snap) snap slides within visible region, freely spin slides per braking, or freely spin them snapping to final slide  */
	mode?: 'snap' | 'free' | 'free-snap'
	/** only render visible and neighbor slides */
	lazy?: boolean
	/** called when swiping starts */
	onSwipeStart?: () => void
	/** called when swiping ends with current slide*/
	onSwipeEnd?: (slide: number) => void
	/** return callable methods */
	onLoad?: (methods: Methods) => void
	/** (default 1) helpful when applying transform scale to swiper to match swipe movements */
	scale?: number
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
	/** timer used during animation */
	animationInterval?: NodeJS.Timer
	/** the desired slide to stop at */
	desiredSlide?: number
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
