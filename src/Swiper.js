import React, { Component } from 'react'

const startSwipeAmount = 15 // Number of pixels to move before swiping starts
// const swipeSpeedThreshold = 3000			// Swipe speed needed to continue to next page irrespective of threshold

class Swiper extends React.Component {
	constructor(props) {
		super(props)

		const { minimumSwipeSpeed, deceleration, firstSelection } = this.props

		this.minimumSwipeSpeed = minimumSwipeSpeed || 500 // Minimum speed that swiping will go after releasing finger
		// isControlled desc. If isControlled, swiper will not swipe/fade to desired index
		this.deceleration = deceleration || 3 // if carousel, then apply velocity deceleration
		this.stopVelocity = 300 // if carousel, then determine what velocity to stopSwiping
		this.selectionCount = this.childCount()
		this.currentSelection = firstSelection || 0
		this.isTouching = false
		this.isSwiping = false
		this.swipeStart = 0
		this.swipeTimer = 0
		this.swipeVelocity = 0
		this.coast = false // don't deccelerate when true

		this.currentSelectionRef = React.createRef()

		this.state = { swipePosition: this.currentSelection * this.swipeAmount }
	}

	childCount() {
		return React.Children.count(this.props.children)
	}

	setWrapperStyle(swipeAmount) {
		const { vertical, visibleCount, carousel, overflow } = this.props
		const {
			current: { offsetWidth: width, offsetHeight: height },
		} = this.currentSelectionRef

		this.swipeAmount = swipeAmount || (vertical ? height : width)

		this.wrapperStyle = {
			overflow: overflow ? 'visible' : 'hidden',
			position: 'relative',
			display: 'inline-block',
			// border: '1px solid black',
			width: vertical ? width : (carousel ? visibleCount || 1 : 1) * this.swipeAmount,
			height: vertical ? (carousel ? visibleCount || 1 : 1) * this.swipeAmount : height,
		}

		this.setState({ swipePosition: this.currentSelection * this.swipeAmount })
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		const {
			firstSelection,
			desiredSelection,
			resetSwiper,
			isControlled,
			children,
			swipeAmount,
		} = nextProps

		this.selectionCount = this.childCount() // update count if children change

		if (resetSwiper) this.setState({ swipePosition: (firstSelection || 0) * this.swipeAmount })
		else if (
			desiredSelection !== this.currentSelection &&
			desiredSelection !== this.props.desiredSelection
		) {
			// See if the user requests a new selection without swiping (ex. clicking home button)

			// Find fastest swipe direction
			const selectionDelta = this.currentSelection - desiredSelection
			this.desiredSelection = desiredSelection
			this.desiredOffset = desiredSelection * this.swipeAmount

			// If swiper isControlled, go straight to index w/o transition
			if (isControlled) {
				this.currentSelection = this.desiredSelection
				this.stopSwiping()
			} else if (
				Math.abs(selectionDelta) > 1 &&
				Math.abs(selectionDelta) < this.selectionCount - 1
			) {
				// If desired selection is more than one away, go straight to next
				this.currentSelection = this.desiredSelection
				this.stopSwiping()
			} else {
				// Set swipe speed looking for wrap around conditions
				let speedSwap = 1
				if (this.selectionCount > 2) {
					if (this.currentSelection == 0 && this.desiredSelection == this.selectionCount - 1)
						speedSwap = -1
					else if (this.currentSelection == this.selectionCount - 1 && this.desiredSelection == 0)
						speedSwap = -1
				}
				this.swipeVelocity = (-this.swipeAmount / 0.75) * Math.sign(selectionDelta) * speedSwap

				this.swipeTimer = new Date().getMilliseconds()
				this.isSwiping = true
			}
		}
	}

	handleTouchDown(e) {
		this.handleMouseDown({ pageX: e.targetTouches[0].pageX, pageY: e.targetTouches[0].pageY })
	}

	handleMouseDown(e) {
		const { carousel, vertical } = this.props

		// For neighbors only, only allow swiping if at rest
		if (carousel || !this.isSwiping) {
			this.isTouching = true
			this.swipeStart = vertical ? e.pageY : e.pageX
			this.lastSwipeTouch = this.swipeStart
			this.onSwipeSpace = true
		}
	}

	handleMouseUp() {
		this.doneSwiping()
	}

	handleMouseLeave() {
		this.onSwipeSpace = false // signify letting go outside swipe space
		this.doneSwiping()
	}

	doneSwiping() {
		const { wrapAround, detent, carousel } = this.props

		const updatedSwipeVelocity =
			Math.abs(this.swipeVelocity) < this.minimumSwipeSpeed
				? Math.sign(this.swipeVelocity) * this.minimumSwipeSpeed
				: this.swipeVelocity

		if (this.isSwiping) {
			if (this.swipeVelocity == 0) this.stopSwiping()
			// If swipe is faster than minimum speed, swipe in that direction
			else if (Math.abs(this.swipeVelocity) > this.minimumSwipeSpeed) {
				this.desiredSelection =
					Math.floor(this.state.swipePosition / this.swipeAmount) + (this.swipeVelocity > 0 ? 1 : 0)
				this.clampDesiredSelection()
				this.currentSelection = this.desiredSelection - Math.sign(this.swipeVelocity)
				this.swipeVelocity = updatedSwipeVelocity

				// If swipe offset is past 50%, swipe in that direction, else go back to current selection
			} else if (!carousel || detent) {
				const goNext =
					(this.state.swipePosition + this.swipeAmount) % this.swipeAmount > this.swipeAmount / 2
				this.desiredSelection =
					Math.floor(this.state.swipePosition / this.swipeAmount) + (goNext ? 1 : 0)
				this.clampDesiredSelection()
				this.currentSelection = this.desiredSelection + (goNext ? -1 : 1)

				this.swipeVelocity = this.minimumSwipeSpeed * (goNext ? 1 : -1)
				this.coast = true
			}

			if (wrapAround && !carousel) {
				if (this.currentSelection > this.selectionCount - 1) {
					this.currentSelection = 0
					this.setState(prevState => {
						return {
							swipePosition: prevState.swipePosition - this.swipeAmount * this.selectionCount,
						}
					})
				} else if (this.currentSelection < 0) {
					this.currentSelection = this.selectionCount - 1
					this.setState(prevState => {
						return {
							swipePosition: prevState.swipePosition + this.swipeAmount * this.selectionCount,
						}
					})
				}

				if (this.desiredSelection > this.selectionCount - 1) this.desiredSelection = 0
				else if (this.desiredSelection < 0) this.desiredSelection = this.selectionCount - 1
			}

			this.currentOffset = this.desiredOffset
			this.desiredOffset = this.swipeAmount * this.desiredSelection
			this.swipeTimer = new Date().getMilliseconds()
		}
		this.setState({ render: true }) // needed only for carousel??
		this.isTouching = false
	}

	clampDesiredSelection() {
		const { wrapAround, visibleCount, carousel } = this.props

		if (!wrapAround)
			this.desiredSelection = Math.min(
				Math.max(this.desiredSelection, 0),
				Math.max(this.selectionCount - (visibleCount || 1), 0)
			)
	}

	handleTouchMove(e) {
		this.handleMouseMove({ pageX: e.targetTouches[0].pageX, pageY: e.targetTouches[0].pageY })
	}

	handleMouseMove(e) {
		const { vertical, swipeRatio, startSwiping, wrapAround, visibleCount, carousel } = this.props

		if (!this.props.disabled && true) {
			if (this.isTouching && this.selectionCount > 1) {
				// only consider movements when touching and more than one selection
				const touchLocation = vertical ? e.pageY : e.pageX

				// Determine when swiping begins
				if (!this.isSwiping) {
					if (Math.abs(touchLocation - this.swipeStart) / (swipeRatio || 1) > startSwipeAmount) {
						this.isSwiping = true
						if (startSwiping) startSwiping(this.isTouching)
					}

					// Swiping in progress
				} else {
					const swipeMovement = (this.lastSwipeTouch - touchLocation) / (swipeRatio || 1)
					this.lastSwipeTouch = touchLocation
					let newSwipePosition = this.state.swipePosition + swipeMovement

					// Prevent wrap around swiping if not wanted
					if (!wrapAround || carousel) {
						if (this.state.swipePosition <= 0 && swipeMovement < 0) newSwipePosition = 0 //this.state.swipePosition
						if (
							this.state.swipePosition >=
								this.swipeAmount * (this.selectionCount - (visibleCount || 1)) &&
							swipeMovement > 0
						)
							newSwipePosition = this.swipeAmount * (this.selectionCount - (visibleCount || 1)) //this.state.swipePosition
					}

					// Calculate swipe velocity and update position
					const newSwipeTimer = new Date().getMilliseconds()
					let correctedSwipeTimer = newSwipeTimer + (newSwipeTimer < this.swipeTimer ? 1000 : 0)
					this.swipeVelocity = Math.round(
						(swipeMovement * 1000) / (correctedSwipeTimer - this.swipeTimer)
					)
					this.swipeTimer = newSwipeTimer

					this.setState({ swipePosition: newSwipePosition })
				}
			}
		} else if (this.isSwiping) this.doneSwiping()
	}

	componentDidUpdate(prevProps, prevState) {
		const { carousel, wrapAround, visibleCount, detent, swipeAmount } = this.props
		if (!this.isTouching && this.isSwiping) {
			const swipeUpdateTime = 10
			setTimeout(() => {
				// Calculate next swipe offset based on velocity
				const newSwipeTimer = new Date().getMilliseconds()
				let correctedSwipeTimer = newSwipeTimer + (newSwipeTimer < this.swipeTimer ? 1000 : 0)
				let newSwipePosition = Math.round(
					this.state.swipePosition +
						(this.swipeVelocity * (correctedSwipeTimer - this.swipeTimer)) / 1000
				)

				// Slow velocity down if carousel
				if (carousel && !this.coast) {
					const newVelocity =
						this.swipeVelocity -
						this.deceleration *
							(correctedSwipeTimer - this.swipeTimer) *
							Math.sign(this.swipeVelocity)

					// prevent sign change
					if (this.swipeVelocity / newVelocity < 0) {
						if (detent) {
							this.coast = true
							this.swipeVelocity = this.stopVelocity * Math.sign(this.swipeVelocity)
						} else {
							this.stopSwiping()
							return
						}
					} else this.swipeVelocity = newVelocity
				}

				// if (!wrapAround) {
				// 	if (this.desiredSelection > this.selectionCount - (visibleCount || 1)-1) {
				// 		this.swipeVelocity = this.stopVelocity * Math.sign(this.swipeVelocity)
				// 	}
				// 	else if (this.desiredSelection <= 0) this.swipeVelocity = this.minimumSwipeSpeed * Math.sign(this.swipeVelocity)
				// 	// this.currentSelection = Math.min(Math.max(this.currentSelection, 0), this.selectionCount-(visibleCount || 1))
				// }

				this.swipeTimer = newSwipeTimer

				// Correct selection and offsets for overflow condition
				let correctedDesiredSelection = this.desiredSelection
				let correctedOffset = this.desiredOffset
				if (wrapAround) {
					if (
						this.currentSelection == 0 &&
						this.desiredSelection == this.selectionCount - 1 &&
						newSwipePosition < correctedOffset
					) {
						correctedDesiredSelection = -1
						correctedOffset = -this.swipeAmount
					} else if (
						this.currentSelection == this.selectionCount - 1 &&
						this.desiredSelection == 0 &&
						newSwipePosition > correctedOffset
					) {
						correctedDesiredSelection = this.selectionCount
						correctedOffset = this.selectionCount * this.swipeAmount
					}
				}

				// If current selection got to desired selection
				if (
					(this.currentSelection > correctedDesiredSelection &&
						newSwipePosition < correctedOffset) ||
					(this.currentSelection < correctedDesiredSelection && newSwipePosition > correctedOffset)
				) {
					this.currentSelection = this.desiredSelection

					// Check conditions to stop swiping

					// one neighbor
					if (!carousel) this.stopSwiping()
					// Beginning and end of selections
					else if (this.currentSelection == 0 && this.swipeVelocity < 0) this.stopSwiping()
					else if (
						this.currentSelection >= this.selectionCount - (visibleCount || 1) &&
						this.swipeVelocity > 0
					)
						this.stopSwiping()
					else {
						let finalVelocity = this.stopVelocity
						if (carousel && detent) {
							// Check if velocity is too slow to make it through next selection w/ constant acceleration formula
							finalVelocity =
								Math.sqrt(
									Math.pow(this.swipeVelocity, 2) -
										2 * this.deceleration * 1000 * this.swipeAmount +
										100
								) || 0
						}

						if (finalVelocity < this.stopVelocity) {
							this.stopSwiping()
						} else {
							// Continue swiping to the next selection
							this.desiredSelection += Math.sign(this.swipeVelocity)
							this.desiredOffset = this.desiredSelection * this.swipeAmount
							this.setState({ swipePosition: newSwipePosition })
						}
					}
				} else if (this.isSwiping) {
					this.setState({ swipePosition: newSwipePosition })
				}
			}, swipeUpdateTime)
		}

		if (swipeAmount !== prevProps.swipeAmount) this.setWrapperStyle(swipeAmount)
	}

	// Stop swiping method
	stopSwiping() {
		const { detent, updateCurrentSelection, carousel } = this.props

		this.swipeVelocity = 0
		// carousel = this.props.carousel
		this.isSwiping = false
		this.coast = false

		if (!carousel || detent || this.desiredOffset <= 0) {
			this.setState({ swipePosition: this.desiredOffset })
		}

		if (updateCurrentSelection)
			setTimeout(() => updateCurrentSelection(this.currentSelection, this.onSwipeSpace), 100)
	}

	childTranslator(child, offsetAmount, selection) {
		const { vertical, noSelectionWrapper } = this.props

		let xOffset = 0
		let yOffset = 0
		if (vertical) yOffset = offsetAmount
		else xOffset = offsetAmount

		const style = {
			position: 'absolute',
			transform: `translate3d(${xOffset}px, ${yOffset}px, 0)`,
		}

		let ref = null
		if (selection === this.currentSelection) ref = this.currentSelectionRef

		if (noSelectionWrapper) {
			const clonedStyle = Object.assign({}, child.props.style, style)
			return React.cloneElement(child, { style: clonedStyle, ref })
		}

		return (
			<div style={style} ref={ref}>
				{child}
			</div>
		)
	}

	componentDidMount() {
		if (this.selectionCount > 0) this.setWrapperStyle(this.props.swipeAmount)
	}

	render() {
		const { wrapAround, children, carousel } = this.props

		const pageWithStyle = React.Children.map(children, (child, index) => {
			if (!child) return null

			// Adjust the index to allow for wrap around if wanted
			let adjustedIndex = index

			if (wrapAround && !carousel) {
				// only two selections
				if (this.selectionCount === 2) {
					if (this.currentSelection == 0) {
						if (this.state.swipePosition < 0 && index == 1) adjustedIndex = -1
					} else if (this.currentSelection == 1) {
						if (this.state.swipePosition > this.swipeAmount && index == 0) adjustedIndex = 2
					}

					// more than two selections
				} else if (this.selectionCount > 2) {
					if (this.currentSelection == 0) {
						if (index == this.selectionCount - 1) adjustedIndex = -1
					} else if (this.currentSelection == this.selectionCount - 1) {
						if (index == 0) adjustedIndex = this.selectionCount
					}
				}
			}

			const totalSwipeAmount = adjustedIndex * this.swipeAmount - this.state.swipePosition

			if (!carousel) {
				// -- ONLY PUT CURRENT PAGE AND NEIGHBORS ON DOM --
				if (
					adjustedIndex > this.currentSelection - 2 &&
					adjustedIndex < this.currentSelection + 2
				) {
					return this.childTranslator(child, totalSwipeAmount, adjustedIndex)
				} else if (index == 0 && this.currentSelection == this.selectionCount - 1) {
					return this.childTranslator(child, totalSwipeAmount, adjustedIndex)
				} else if (index == this.selectionCount - 1 && this.currentSelection == 0) {
					return this.childTranslator(child, totalSwipeAmount, adjustedIndex)
				} else {
					// Don't move other selections
					return null //this.childTranslator(child,  totalSwipeAmount,adjustedIndex)
				}
			} else {
				return this.childTranslator(child, totalSwipeAmount, adjustedIndex)
			}
		})

		return (
			<div
				style={this.wrapperStyle}
				onMouseDown={this.handleMouseDown.bind(this)}
				onTouchStart={this.handleTouchDown.bind(this)}
				onMouseMove={this.handleMouseMove.bind(this)}
				onTouchMove={this.handleTouchMove.bind(this)}
				onMouseUp={this.handleMouseUp.bind(this)}
				onTouchEnd={this.handleMouseUp.bind(this)}
				onMouseLeave={this.handleMouseLeave.bind(this)}
				onTouchCancel={this.handleMouseLeave.bind(this)}>
				{pageWithStyle}
			</div>
		)
	}
}

export default Swiper
