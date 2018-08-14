'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _clamp = require('lodash/clamp');

var _clamp2 = _interopRequireDefault(_clamp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var startSwipeAmount = 15; // Number of pixels to move before swiping starts
// const swipeSpeedThreshold = 3000			// Swipe speed needed to continue to next page irrespective of threshold

var Swiper = function (_React$Component) {
	_inherits(Swiper, _React$Component);

	function Swiper(props) {
		_classCallCheck(this, Swiper);

		var _this = _possibleConstructorReturn(this, (Swiper.__proto__ || Object.getPrototypeOf(Swiper)).call(this, props));

		var _this$props = _this.props,
		    minimumSwipeSpeed = _this$props.minimumSwipeSpeed,
		    deceleration = _this$props.deceleration,
		    children = _this$props.children,
		    startIndex = _this$props.startIndex,
		    neighborsOnly = _this$props.neighborsOnly,
		    detent = _this$props.detent,
		    swipeAmount = _this$props.swipeAmount,
		    swipeRatio = _this$props.swipeRatio;


		_this.minimumSwipeSpeed = minimumSwipeSpeed || 3000; // Minimum speed that swiping will go after releasing finger
		// isControlled desc. If isControlled, swiper will not swipe/fade to desired index
		_this.deceleration = deceleration || 1; // if carousel (!neighborsOnly), then apply velocity deceleration
		_this.stopVelocity = 300; // if carousel (!neighborsOnly), then determine what velocity to stopSwiping
		_this.selectionCount = _react2.default.Children.count(children);
		_this.currentSelection = startIndex;
		_this.neighborsOnly = neighborsOnly;
		_this.isTouching = false;
		_this.isSwiping = false;
		_this.swipeStart = 0;
		_this.swipeTimer = 0;
		_this.swipeVelocity = 0;
		_this.coast = false; // don't deccelerate when trun
		_this.detent = detent || false; // if carousel (!neighborsOnly), if you want to stop on a whole selection

		_this.state = { swipePosition: startIndex * swipeAmount };
		return _this;
	}

	_createClass(Swiper, [{
		key: 'UNSAFE_componentWillReceiveProps',
		value: function UNSAFE_componentWillReceiveProps(nextProps) {
			var startIndex = nextProps.startIndex,
			    desiredIndex = nextProps.desiredIndex,
			    swipeAmount = nextProps.swipeAmount,
			    resetSwiper = nextProps.resetSwiper,
			    isControlled = nextProps.isControlled,
			    children = nextProps.children,
			    swipeRatio = nextProps.swipeRatio;


			this.selectionCount = _react2.default.Children.count(children); // update count if children change

			if (resetSwiper) this.setState({ swipePosition: startIndex * swipeAmount });else if (desiredIndex !== this.currentSelection && desiredIndex !== this.props.desiredIndex || swipeAmount !== this.props.swipeAmount) {
				// See if the user requests a new selection without swiping (ex. clicking home button) or if they change swipeAmount

				// Find fastest swipe direction
				var selectionDelta = this.currentSelection - desiredIndex;
				this.desiredSelection = desiredIndex;
				this.desiredOffset = desiredIndex * swipeAmount;

				// If swiper isControlled, go straight to index w/o transition
				if (isControlled) {
					this.currentSelection = this.desiredSelection;
					this.stopSwiping();
				} else if (Math.abs(selectionDelta) > 1 && Math.abs(selectionDelta) < this.selectionCount - 1) {
					// If desired selection is more than one away, go straight to next
					this.currentSelection = this.desiredSelection;
					this.stopSwiping();
				} else {
					// Set swipe speed looking for wrap around conditions
					var speedSwap = 1;
					if (this.selectionCount > 2) {
						if (this.currentSelection == 0 && this.desiredSelection == this.selectionCount - 1) speedSwap = -1;else if (this.currentSelection == this.selectionCount - 1 && this.desiredSelection == 0) speedSwap = -1;
					}
					this.swipeVelocity = -this.props.swipeAmount / 0.75 * Math.sign(selectionDelta) * speedSwap;

					this.swipeTimer = new Date().getMilliseconds();
					this.isSwiping = true;
				}
			}
		}
	}, {
		key: 'handleTouchDown',
		value: function handleTouchDown(e) {
			this.handleMouseDown({ pageX: e.targetTouches[0].pageX, pageY: e.targetTouches[0].pageY });
		}
	}, {
		key: 'handleMouseDown',
		value: function handleMouseDown(e) {
			// For neighbors only, only allow swiping if at rest
			if (!this.props.neighborsOnly || !this.isSwiping) {
				this.isTouching = true;
				this.swipeStart = this.props.horizontal ? e.pageX : e.pageY;
				this.lastSwipeTouch = this.swipeStart;
				this.onSwipeSpace = true;
			}
		}
	}, {
		key: 'handleMouseUp',
		value: function handleMouseUp() {
			this.doneSwiping();
		}
	}, {
		key: 'handleMouseLeave',
		value: function handleMouseLeave() {
			this.onSwipeSpace = false; // signify letting go outside swipe space
			this.doneSwiping();
		}
	}, {
		key: 'doneSwiping',
		value: function doneSwiping() {
			var _this2 = this;

			var _props = this.props,
			    swipeAmount = _props.swipeAmount,
			    wrapAround = _props.wrapAround;


			var updatedSwipeVelocity = Math.abs(this.swipeVelocity) < this.minimumSwipeSpeed ? Math.sign(this.swipeVelocity) * this.minimumSwipeSpeed : this.swipeVelocity;

			if (this.isSwiping) {
				if (this.swipeVelocity == 0) this.stopSwiping();
				// If swipe is faster than minimum speed, swipe in that direction
				else if (Math.abs(this.swipeVelocity) > this.minimumSwipeSpeed) {
						this.desiredSelection = Math.floor(this.state.swipePosition / swipeAmount) + (this.swipeVelocity > 0 ? 1 : 0);
						this.clampDesiredSelection();
						this.currentSelection = this.desiredSelection - Math.sign(this.swipeVelocity);
						this.swipeVelocity = updatedSwipeVelocity;

						// If swipe offset is past 50%, swipe in that direction, else go back to current selection
					} else if (this.neighborsOnly || this.detent) {
						var correctedDesiredSelction = this.desiredSelection;

						var goNext = (this.state.swipePosition + swipeAmount) % swipeAmount > swipeAmount / 2;
						this.desiredSelection = Math.floor(this.state.swipePosition / swipeAmount) + (goNext ? 1 : 0);
						this.clampDesiredSelection();
						this.currentSelection = this.desiredSelection + (goNext ? -1 : 1);

						this.swipeVelocity = this.minimumSwipeSpeed * (goNext ? 1 : -1);
						this.coast = true;
					}

				if (wrapAround) {
					if (this.currentSelection > this.selectionCount - 1) {
						this.currentSelection = 0;
						this.setState(function (prevState) {
							return {
								swipePosition: prevState.swipePosition - swipeAmount * _this2.selectionCount
							};
						});
					} else if (this.currentSelection < 0) {
						this.currentSelection = this.selectionCount - 1;
						this.setState(function (prevState) {
							return {
								swipePosition: prevState.swipePosition + swipeAmount * _this2.selectionCount
							};
						});
					}

					if (this.desiredSelection > this.selectionCount - 1) this.desiredSelection = 0;else if (this.desiredSelection < 0) this.desiredSelection = this.selectionCount - 1;
				}

				this.currentOffset = this.desiredOffset;
				this.desiredOffset = swipeAmount * this.desiredSelection;
				this.swipeTimer = new Date().getMilliseconds();
			}
			this.setState({ render: true }); // needed only for !neighborsOnly??
			this.isTouching = false;
		}
	}, {
		key: 'clampDesiredSelection',
		value: function clampDesiredSelection() {
			if (!this.props.wrapAround) this.desiredSelection = Math.min(Math.max(this.desiredSelection, 0), Math.max(this.selectionCount - this.props.visibleCount, 0));
		}
	}, {
		key: 'handleTouchMove',
		value: function handleTouchMove(e) {
			this.handleMouseMove({ pageX: e.targetTouches[0].pageX, pageY: e.targetTouches[0].pageY });
		}
	}, {
		key: 'handleMouseMove',
		value: function handleMouseMove(e) {
			var _props2 = this.props,
			    horizontal = _props2.horizontal,
			    swipeRatio = _props2.swipeRatio,
			    startSwiping = _props2.startSwiping,
			    swipeAmount = _props2.swipeAmount,
			    wrapAround = _props2.wrapAround,
			    visibleCount = _props2.visibleCount;


			if (!this.props.disabled && true) {
				if (this.isTouching && this.selectionCount > 1) {
					// only consider movements when touching and more than one selection
					var touchLocation = horizontal ? e.pageX : e.pageY;

					// Determine when swiping begins
					if (!this.isSwiping) {
						if (Math.abs(touchLocation - this.swipeStart) / (swipeRatio || 1) > startSwipeAmount) {
							this.isSwiping = true;
							if (startSwiping) startSwiping(this.isTouching);
						}

						// Swiping in progress
					} else {
						var swipeMovement = (this.lastSwipeTouch - touchLocation) / (swipeRatio || 1);
						this.lastSwipeTouch = touchLocation;
						var newSwipePosition = this.state.swipePosition + swipeMovement;

						// Prevent wrap around swiping if not wanted
						if (!wrapAround) {
							if (this.state.swipePosition <= 0 && swipeMovement < 0) newSwipePosition = 0; //this.state.swipePosition
							if (this.state.swipePosition >= swipeAmount * (this.selectionCount - visibleCount) && swipeMovement > 0) newSwipePosition = swipeAmount * (this.selectionCount - visibleCount); //this.state.swipePosition
						}

						// Calculate swipe velocity and update position
						var newSwipeTimer = new Date().getMilliseconds();
						var correctedSwipeTimer = newSwipeTimer + (newSwipeTimer < this.swipeTimer ? 1000 : 0);
						this.swipeVelocity = Math.round(swipeMovement * 1000 / (correctedSwipeTimer - this.swipeTimer));
						this.swipeTimer = newSwipeTimer;

						this.setState({ swipePosition: newSwipePosition });
					}
				}
			} else if (this.isSwiping) this.doneSwiping();
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate(prevProps, prevState) {
			var _this3 = this;

			if (!this.isTouching && this.isSwiping) {
				var swipeUpdateTime = 10;
				setTimeout(function () {
					// Calculate next swipe offset based on velocity
					var newSwipeTimer = new Date().getMilliseconds();
					var correctedSwipeTimer = newSwipeTimer + (newSwipeTimer < _this3.swipeTimer ? 1000 : 0);
					var newSwipePosition = Math.round(_this3.state.swipePosition + _this3.swipeVelocity * (correctedSwipeTimer - _this3.swipeTimer) / 1000);

					// Slow velocity down if !neighborsOnly
					if (!_this3.props.neighborsOnly && !_this3.coast) {
						var newVelocity = _this3.swipeVelocity - _this3.deceleration * (correctedSwipeTimer - _this3.swipeTimer) * Math.sign(_this3.swipeVelocity);

						// prevent sign change
						if (_this3.swipeVelocity / newVelocity < 0) {
							if (_this3.detent) {
								_this3.coast = true;
								_this3.swipeVelocity = _this3.stopVelocity * Math.sign(_this3.swipeVelocity);
							} else {
								_this3.stopSwiping();
								return;
							}
						} else _this3.swipeVelocity = newVelocity;
					}

					// if (!this.props.wrapAround) {
					// 	if (this.desiredSelection > this.selectionCount - this.props.visibleCount-1) {
					// 		this.swipeVelocity = this.stopVelocity * Math.sign(this.swipeVelocity)
					// 	}
					// 	else if (this.desiredSelection <= 0) this.swipeVelocity = this.minimumSwipeSpeed * Math.sign(this.swipeVelocity)
					// 	// this.currentSelection = Math.min(Math.max(this.currentSelection, 0), this.selectionCount-this.props.visibleCount)
					// }

					_this3.swipeTimer = newSwipeTimer;

					// Correct selection and offsets for overflow condition
					var correctedDesiredSelection = _this3.desiredSelection;
					var correctedOffset = _this3.desiredOffset;
					if (_this3.props.wrapAround) {
						if (_this3.currentSelection == 0 && _this3.desiredSelection == _this3.selectionCount - 1 && newSwipePosition < correctedOffset) {
							correctedDesiredSelection = -1;
							correctedOffset = -_this3.props.swipeAmount;
						} else if (_this3.currentSelection == _this3.selectionCount - 1 && _this3.desiredSelection == 0 && newSwipePosition > correctedOffset) {
							correctedDesiredSelection = _this3.selectionCount;
							correctedOffset = _this3.selectionCount * _this3.props.swipeAmount;
						}
					}

					// If current selection got to desired selection
					if (_this3.currentSelection > correctedDesiredSelection && newSwipePosition < correctedOffset || _this3.currentSelection < correctedDesiredSelection && newSwipePosition > correctedOffset) {
						_this3.currentSelection = _this3.desiredSelection;

						// Check conditions to stop swiping

						// one neighbor
						if (_this3.props.neighborsOnly) _this3.stopSwiping();
						// Beginning and end of selections
						else if (_this3.currentSelection == 0 && _this3.swipeVelocity < 0) _this3.stopSwiping();else if (_this3.currentSelection >= _this3.selectionCount - _this3.props.visibleCount && _this3.swipeVelocity > 0) _this3.stopSwiping();else {
								var finalVelocity = _this3.stopVelocity;
								if (!_this3.props.neighborsOnly && _this3.detent) {
									// Check if velocity is too slow to make it through next selection w/ constant acceleration formula
									finalVelocity = Math.sqrt(Math.pow(_this3.swipeVelocity, 2) - 2 * _this3.deceleration * 1000 * _this3.props.swipeAmount + 100) || 0;
								}

								if (finalVelocity < _this3.stopVelocity) {
									_this3.stopSwiping();
								} else {
									// Continue swiping to the next selection
									_this3.desiredSelection += Math.sign(_this3.swipeVelocity);
									_this3.desiredOffset = _this3.desiredSelection * _this3.props.swipeAmount;
									_this3.setState({ swipePosition: newSwipePosition });
								}
							}
					} else if (_this3.isSwiping) {
						_this3.setState({ swipePosition: newSwipePosition });
					}
				}, swipeUpdateTime);
			}
		}

		// Stop swiping method

	}, {
		key: 'stopSwiping',
		value: function stopSwiping() {
			var _this4 = this;

			this.swipeVelocity = 0;
			// this.neighborsOnly = this.props.neighborsOnly
			this.isSwiping = false;
			this.coast = false;

			if (this.neighborsOnly || this.detent || this.desiredOffset <= 0) {
				this.setState({ swipePosition: this.desiredOffset });
			}

			if (this.props.updateCurrentSelection) setTimeout(function () {
				return _this4.props.updateCurrentSelection(_this4.currentSelection, _this4.onSwipeSpace);
			}, 100);
		}
	}, {
		key: 'render',
		value: function render() {
			var _this5 = this;

			var _props3 = this.props,
			    wrapAround = _props3.wrapAround,
			    children = _props3.children,
			    swipeAmount = _props3.swipeAmount,
			    desiredIndex = _props3.desiredIndex,
			    horizontal = _props3.horizontal;


			var pageWithStyle = _react2.default.Children.map(children, function (child, index) {
				// Adjust the index to allow for wrap around if wanted
				var adjustedIndex = index;

				if (wrapAround) {
					// only two selections
					if (_this5.selectionCount === 2) {
						if (_this5.currentSelection == 0) {
							if (_this5.state.swipePosition < 0 && index == 1) adjustedIndex = -1;
						} else if (_this5.currentSelection == 1) {
							if (_this5.state.swipePosition > swipeAmount && index == 0) adjustedIndex = 2;
						}

						// more than two selections
					} else if (_this5.selectionCount > 2) {
						if (_this5.currentSelection == 0) {
							if (index == _this5.selectionCount - 1) adjustedIndex = -1;
						} else if (_this5.currentSelection == _this5.selectionCount - 1) {
							if (index == 0) adjustedIndex = _this5.selectionCount;
						}
					}
				}

				var totalSwipeAmount = adjustedIndex * swipeAmount - _this5.state.swipePosition;

				if (_this5.neighborsOnly) {
					console.log(adjustedIndex, desiredIndex);
					// -- ONLY PUT CURRENT PAGE AND NEIGHBORS ON DOM --
					if (adjustedIndex == desiredIndex) {
						return childTranslator(child, horizontal, totalSwipeAmount);
					}

					if (adjustedIndex == desiredIndex - 1) {
						return childTranslator(child, horizontal, totalSwipeAmount);
					} else if (adjustedIndex == desiredIndex + 1) {
						return childTranslator(child, horizontal, totalSwipeAmount);
					} else if (adjustedIndex == _this5.currentSelection) {
						return childTranslator(child, horizontal, totalSwipeAmount);
					} else if (index == 0 && _this5.currentSelection == _this5.selectionCount - 1) {
						return childTranslator(child, horizontal, totalSwipeAmount);
					} else if (index == _this5.selectionCount - 1 && _this5.currentSelection == 0) {
						return childTranslator(child, horizontal, totalSwipeAmount);
					} else {
						// Don't move other selections
						return null; //childTranslator(child, horizontal, totalSwipeAmount)
					}
				} else {
					return childTranslator(child, horizontal, totalSwipeAmount);
				}
			});

			return _react2.default.createElement(
				'div',
				{
					style: this.selectStyle,
					onMouseDown: this.handleMouseDown.bind(this),
					onTouchStart: this.handleTouchDown.bind(this),
					onMouseMove: this.handleMouseMove.bind(this),
					onTouchMove: this.handleTouchMove.bind(this),
					onMouseUp: this.handleMouseUp.bind(this),
					onTouchEnd: this.handleMouseUp.bind(this),
					onMouseLeave: this.handleMouseLeave.bind(this),
					onTouchCancel: this.handleMouseLeave.bind(this) },
				pageWithStyle
			);
		}
	}]);

	return Swiper;
}(_react2.default.Component);

function childTranslator(child, horizontal, offsetAmount) {
	var xOffset = 0;
	var yOffset = 0;
	if (horizontal) {
		xOffset = offsetAmount;
	} else {
		yOffset = offsetAmount;
	}

	var style = Object.assign({}, child.props.style, {
		transform: 'translate3d(' + xOffset + 'px, ' + yOffset + 'px, 0)',
		position: 'absolute'
	});

	return _react2.default.cloneElement(child, { style: style });
}

exports.default = Swiper;
