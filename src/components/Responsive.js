import React, { Component } from 'react'
import Swiper from '../Swiper'

class Responsive extends Component {
	constructor(props) {
		super(props)

		this.borderWidth = parseInt(this.props.selectionStyle.border)

		this.state = {
			width: parseInt(this.props.selectionStyle.width),
			height: parseInt(this.props.selectionStyle.height),
		}
	}

	changeHeight = e => {
		this.setState({ height: e.target.value })
	}

	changeWidth = e => {
		this.setState({ width: e.target.value })
	}

	render() {
		const swipeAmount = Math.max(this.state.width, 100) + this.borderWidth * 2

		const updatedStyle = {
			...this.props.selectionStyle,
			width: Math.max(this.state.width, 100) + 'px',
			height: this.state.height + 'px',
		}

		return (
			<div>
				<h3>Responsive to child size changes</h3>
				<p>
					<input type="input" onChange={this.changeWidth} value={this.state.width} />
					width
				</p>

				<Swiper swipeAmount={swipeAmount} wrapAround={this.state.wrapAround}>
					{[...Array(5)].map((iter, page) => {
						return (
							<div key={page} style={updatedStyle}>
								Page {page}
							</div>
						)
					})}
				</Swiper>
			</div>
		)
	}
}

export default Responsive
