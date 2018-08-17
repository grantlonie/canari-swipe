import React, { Component } from 'react'
import Swiper from '../../Swiper'

class Vertical extends Component {
  
  state = {
    currentSelection: 0
  }

	changeSelection = (currentSelection) => {
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
					updateCurrentSelection={this.changeSelection}>
					{[...Array(20)].map((iter, page) => {
						return (
							<div key={page} style={this.props.selectionStyle}>
								<p>Page {page}</p>
							</div>
						)
					})}
				</Swiper>
			</div>
		)
	}
}

export default Vertical