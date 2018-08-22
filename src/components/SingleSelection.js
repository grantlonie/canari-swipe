import React, { Component } from 'react'
import Swiper from '../Swiper'

class SingleSelection extends Component {
	state = {
		wrapAround: false,
	}

	changeWrapAround = () => {
		this.setState({ wrapAround: !this.state.wrapAround })
	}

	handleStartSwiping() {
		this.setState({ startSwiping: true })
	}

	render() {
		return (
			<div>
				<h3>Single Selections w/ wrapAround Option</h3>
				<p>
					<input type="checkbox" checked={this.state.wrapAround} onChange={this.changeWrapAround} />
					wrapAround
				</p>
				<Swiper
					wrapAround={this.state.wrapAround}
					startSwiping={this.handleStartSwiping.bind(this)}>
					{[...Array(5)].map((iter, page) => {
						return (
							<div key={page} style={this.props.selectionStyle}>
								Page {page}
							</div>
						)
					})}
				</Swiper>
			</div>
		)
	}
}

export default SingleSelection
