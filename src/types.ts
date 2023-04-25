export interface SwiperProps {
	children: JSX.Element[]
	swipeAmount?: number
	/** (default 0) */
	firstSelection?: number
	desiredSelection?: number
	desiredSelectionTime?: number
	vertical?: boolean
	/** (default 500) */
	minimumSwipeSpeed?: number
	wrapAround?: boolean
	/** (optional) do not render items that are not visible nor neighbors of visible */
	neighborsOnly?: boolean
	/** (default 1) Set this to make it a carousel */
	visibleCount?: number
	detent?: boolean
	/** (default 3) */
	deceleration?: number
	/** (default 1) */
	swipeRatio?: number
	/** (default 15) */
	startSwipeAmount?: number
	noSelectionWrapper?: boolean
	overflow?: boolean
	startSwiping?: () => void
	updateCurrentSelection?: (
		currentSelection: number,
		isOnSwipeSpace: boolean
	) => void
	/** (optional) return callable methods */
	onLoad?: (methods: Methods) => void
	disabled?: boolean
}

interface Methods {
	/** reset swiper to original selection */
	reset: () => void
}

export type ControlProps = Omit<SwiperProps, 'onLoad' | 'children'>
