import React, { Component } from 'react'
import Swiper from '../../Swiper'

class Vertical extends Component {
	constructor(props) {
		super(props)

		this.state = {
			currentSelection: 0,
		}
	}

	changeSelection(currentSelection) {
		this.setState({ currentSelection })
	}

	render() {
		return (
			<div>
				<h3>Vertical Carousel w/ external listening</h3>
				<p>Currently on Page {this.state.currentSelection}</p>
				<br />
				<Swiper
					visibleCount={3}
					detent={true}
					carousel={true}
					vertical={true}
					updateCurrentSelection={this.changeSelection.bind(this)}>
					{[...Array(20)].map((iter, page) => {
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

export default Vertical