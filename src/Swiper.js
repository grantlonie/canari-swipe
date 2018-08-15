import React, { Component } from 'react'
import clamp from 'lodash/clamp'

const startSwipeAmount = 15 // Number of pixels to move before swiping starts
// const swipeSpeedThreshold = 3000			// Swipe speed needed to continue to next page irrespective of threshold

class Swiper extends React.Component {
	constructor(props) {
		super(props)

		const {
			minimumSwipeSpeed,
			deceleration,
			children,
			startIndex,
			neighborsOnly,
			detent,
			swipeAmount,
			swipeRatio,
		} = this.props

		this.minimumSwipeSpeed = minimumSwipeSpeed || 3000 // Minimum speed that swiping will go after releasing finger
		// isControlled desc. If isControlled, swiper will not swipe/fade to desired index
		this.deceleration = deceleration || 1 // if carousel (!neighborsOnly), then apply velocity deceleration
		this.stopVelocity = 300 // if carousel (!neighborsOnly), then determine what velocity to stopSwiping
		this.selectionCount = React.Children.count(children)
		this.currentSelection = startIndex || 0
		this.neighborsOnly = neighborsOnly || false
		this.isTouching = false
		this.isSwiping = false
		this.swipeStart = 0
		this.swipeTimer = 0
		this.swipeVelocity = 0
		this.coast = false // don't deccelerate when trun
		this.detent = detent || false // if carousel (!neighborsOnly), if you want to stop on a whole selection

		this.state = { swipePosition: startIndex * swipeAmount }
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		const {
			startIndex,
			desiredIndex,
			swipeAmount,
			resetSwiper,
			isControlled,
			children,
			swipeRatio,
		} = nextProps

		this.selectionCount = React.Children.count(children) // update count if children change

		if (resetSwiper) this.setState({ swipePosition: startIndex * swipeAmount })
		else if (
			(desiredIndex !== this.currentSelection && desiredIndex !== this.props.desiredIndex) ||
			swipeAmount !== this.props.swipeAmount
		) {
			// See if the user requests a new selection without swiping (ex. clicking home button) or if they change swipeAmount

			// Find fastest swipe direction
			const selectionDelta = this.currentSelection - desiredIndex
			this.desiredSelection = desiredIndex
			this.desiredOffset = desiredIndex * swipeAmount

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
				this.swipeVelocity =
					(-this.props.swipeAmount / 0.75) * Math.sign(selectionDelta) * speedSwap

				this.swipeTimer = new Date().getMilliseconds()
				this.isSwiping = true
			}
		}
	}

	handleTouchDown(e) {
		this.handleMouseDown({ pageX: e.targetTouches[0].pageX, pageY: e.targetTouches[0].pageY })
	}

	handleMouseDown(e) {
		// For neighbors only, only allow swiping if at rest
		if (!this.props.neighborsOnly || !this.isSwiping) {
			this.isTouching = true
			this.swipeStart = this.props.horizontal ? e.pageX : e.pageY
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
		const { swipeAmount, wrapAround } = this.props

		const updatedSwipeVelocity =
			Math.abs(this.swipeVelocity) < this.minimumSwipeSpeed
				? Math.sign(this.swipeVelocity) * this.minimumSwipeSpeed
				: this.swipeVelocity

		if (this.isSwiping) {
			if (this.swipeVelocity == 0) this.stopSwiping()
			// If swipe is faster than minimum speed, swipe in that direction
			else if (Math.abs(this.swipeVelocity) > this.minimumSwipeSpeed) {
				this.desiredSelection =
					Math.floor(this.state.swipePosition / swipeAmount) + (this.swipeVelocity > 0 ? 1 : 0)
				this.clampDesiredSelection()
				this.currentSelection = this.desiredSelection - Math.sign(this.swipeVelocity)
				this.swipeVelocity = updatedSwipeVelocity

				// If swipe offset is past 50%, swipe in that direction, else go back to current selection
			} else if (this.neighborsOnly || this.detent) {
				let correctedDesiredSelction = this.desiredSelection

				const goNext = (this.state.swipePosition + swipeAmount) % swipeAmount > swipeAmount / 2
				this.desiredSelection =
					Math.floor(this.state.swipePosition / swipeAmount) + (goNext ? 1 : 0)
				this.clampDesiredSelection()
				this.currentSelection = this.desiredSelection + (goNext ? -1 : 1)

				this.swipeVelocity = this.minimumSwipeSpeed * (goNext ? 1 : -1)
				this.coast = true
			}

			if (wrapAround) {
				if (this.currentSelection > this.selectionCount - 1) {
					this.currentSelection = 0
					this.setState(prevState => {
						return {
							swipePosition: prevState.swipePosition - swipeAmount * this.selectionCount,
						}
					})
				} else if (this.currentSelection < 0) {
					this.currentSelection = this.selectionCount - 1
					this.setState(prevState => {
						return {
							swipePosition: prevState.swipePosition + swipeAmount * this.selectionCount,
						}
					})
				}

				if (this.desiredSelection > this.selectionCount - 1) this.desiredSelection = 0
				else if (this.desiredSelection < 0) this.desiredSelection = this.selectionCount - 1
			}

			this.currentOffset = this.desiredOffset
			this.desiredOffset = swipeAmount * this.desiredSelection
			this.swipeTimer = new Date().getMilliseconds()
		}
		this.setState({ render: true }) // needed only for !neighborsOnly??
		this.isTouching = false
	}

	clampDesiredSelection() {
		if (!this.props.wrapAround)
			this.desiredSelection = Math.min(
				Math.max(this.desiredSelection, 0),
				Math.max(this.selectionCount - this.props.visibleCount, 0)
			)
	}

	handleTouchMove(e) {
		this.handleMouseMove({ pageX: e.targetTouches[0].pageX, pageY: e.targetTouches[0].pageY })
	}

	handleMouseMove(e) {
		const {
			horizontal,
			swipeRatio,
			startSwiping,
			swipeAmount,
			wrapAround,
			visibleCount,
		} = this.props

		if (!this.props.disabled && true) {
			if (this.isTouching && this.selectionCount > 1) {
				// only consider movements when touching and more than one selection
				const touchLocation = horizontal ? e.pageX : e.pageY

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
					if (!wrapAround) {
						if (this.state.swipePosition <= 0 && swipeMovement < 0) newSwipePosition = 0 //this.state.swipePosition
						if (
							this.state.swipePosition >= swipeAmount * (this.selectionCount - visibleCount) &&
							swipeMovement > 0
						)
							newSwipePosition = swipeAmount * (this.selectionCount - visibleCount) //this.state.swipePosition
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

				// Slow velocity down if !neighborsOnly
				if (!this.props.neighborsOnly && !this.coast) {
					const newVelocity =
						this.swipeVelocity -
						this.deceleration *
							(correctedSwipeTimer - this.swipeTimer) *
							Math.sign(this.swipeVelocity)

					// prevent sign change
					if (this.swipeVelocity / newVelocity < 0) {
						if (this.detent) {
							this.coast = true
							this.swipeVelocity = this.stopVelocity * Math.sign(this.swipeVelocity)
						} else {
							this.stopSwiping()
							return
						}
					} else this.swipeVelocity = newVelocity
				}

				// if (!this.props.wrapAround) {
				// 	if (this.desiredSelection > this.selectionCount - this.props.visibleCount-1) {
				// 		this.swipeVelocity = this.stopVelocity * Math.sign(this.swipeVelocity)
				// 	}
				// 	else if (this.desiredSelection <= 0) this.swipeVelocity = this.minimumSwipeSpeed * Math.sign(this.swipeVelocity)
				// 	// this.currentSelection = Math.min(Math.max(this.currentSelection, 0), this.selectionCount-this.props.visibleCount)
				// }

				this.swipeTimer = newSwipeTimer

				// Correct selection and offsets for overflow condition
				let correctedDesiredSelection = this.desiredSelection
				let correctedOffset = this.desiredOffset
				if (this.props.wrapAround) {
					if (
						this.currentSelection == 0 &&
						this.desiredSelection == this.selectionCount - 1 &&
						newSwipePosition < correctedOffset
					) {
						correctedDesiredSelection = -1
						correctedOffset = -this.props.swipeAmount
					} else if (
						this.currentSelection == this.selectionCount - 1 &&
						this.desiredSelection == 0 &&
						newSwipePosition > correctedOffset
					) {
						correctedDesiredSelection = this.selectionCount
						correctedOffset = this.selectionCount * this.props.swipeAmount
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
					if (this.props.neighborsOnly) this.stopSwiping()
					// Beginning and end of selections
					else if (this.currentSelection == 0 && this.swipeVelocity < 0) this.stopSwiping()
					else if (
						this.currentSelection >= this.selectionCount - this.props.visibleCount &&
						this.swipeVelocity > 0
					)
						this.stopSwiping()
					else {
						let finalVelocity = this.stopVelocity
						if (!this.props.neighborsOnly && this.detent) {
							// Check if velocity is too slow to make it through next selection w/ constant acceleration formula
							finalVelocity =
								Math.sqrt(
									Math.pow(this.swipeVelocity, 2) -
										2 * this.deceleration * 1000 * this.props.swipeAmount +
										100
								) || 0
						}

						if (finalVelocity < this.stopVelocity) {
							this.stopSwiping()
						} else {
							// Continue swiping to the next selection
							this.desiredSelection += Math.sign(this.swipeVelocity)
							this.desiredOffset = this.desiredSelection * this.props.swipeAmount
							this.setState({ swipePosition: newSwipePosition })
						}
					}
				} else if (this.isSwiping) {
					this.setState({ swipePosition: newSwipePosition })
				}
			}, swipeUpdateTime)
		}
	}

	// Stop swiping method
	stopSwiping() {
		this.swipeVelocity = 0
		// this.neighborsOnly = this.props.neighborsOnly
		this.isSwiping = false
		this.coast = false

		if (this.neighborsOnly || this.detent || this.desiredOffset <= 0) {
			this.setState({ swipePosition: this.desiredOffset })
		}

		if (this.props.updateCurrentSelection)
			setTimeout(
				() => this.props.updateCurrentSelection(this.currentSelection, this.onSwipeSpace),
				100
			)
	}

	render() {
		const { wrapAround, children, swipeAmount, horizontal } = this.props

		const pageWithStyle = React.Children.map(children, (child, index) => {
			// Adjust the index to allow for wrap around if wanted
			let adjustedIndex = index

			if (wrapAround) {
				// only two selections
				if (this.selectionCount === 2) {
					if (this.currentSelection == 0) {
						if (this.state.swipePosition < 0 && index == 1) adjustedIndex = -1
					} else if (this.currentSelection == 1) {
						if (this.state.swipePosition > swipeAmount && index == 0) adjustedIndex = 2
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

			const totalSwipeAmount = adjustedIndex * swipeAmount - this.state.swipePosition

			if (this.neighborsOnly) {
				// -- ONLY PUT CURRENT PAGE AND NEIGHBORS ON DOM --
				if (adjustedIndex == this.currentSelection) {
					return childTranslator(child, horizontal, totalSwipeAmount)
				}

				if (adjustedIndex == this.currentSelection - 1) {
					return childTranslator(child, horizontal, totalSwipeAmount)
				} else if (adjustedIndex == this.currentSelection + 1) {
					return childTranslator(child, horizontal, totalSwipeAmount)
				} else if (adjustedIndex == this.currentSelection) {
					return childTranslator(child, horizontal, totalSwipeAmount)
				} else if (index == 0 && this.currentSelection == this.selectionCount - 1) {
					return childTranslator(child, horizontal, totalSwipeAmount)
				} else if (index == this.selectionCount - 1 && this.currentSelection == 0) {
					return childTranslator(child, horizontal, totalSwipeAmount)
				} else {
					// Don't move other selections
					return null //childTranslator(child, horizontal, totalSwipeAmount)
				}
			} else {
				return childTranslator(child, horizontal, totalSwipeAmount)
			}
		})

		return (
			<div
				style={this.selectStyle}
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

function childTranslator(child, horizontal, offsetAmount) {
	let xOffset = 0
	let yOffset = 0
	if (horizontal) {
		xOffset = offsetAmount
	} else {
		yOffset = offsetAmount
	}

	const style = Object.assign({}, child.props.style, {
		transform: `translate3d(${xOffset}px, ${yOffset}px, 0)`,
		position: 'absolute',
	})

	return React.cloneElement(child, { style })
}

export default Swiper
