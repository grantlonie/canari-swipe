import React, { Component } from 'react'
import Swiper from '../Swiper'

class Carousel extends Component {
	state = {
		detent: false,
	}

	changeDetent = () => {
		this.setState({ detent: !this.state.detent })
	}

	render() {
		return (
			<div>
				<h3>Carousel w/ Detent Option</h3>
				<p>
					<input type="checkbox" checked={this.state.detent} onChange={this.changeDetent} />
					detent
				</p>
				<Swiper visibleCount={2} detent={this.state.detent} carousel={true}>
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

export default Carousel
