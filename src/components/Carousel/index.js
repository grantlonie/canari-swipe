import React, { Component } from 'react'
import Swiper from '../../Swiper'


class Carousel extends Component {

  state = {
    detent: false
  }

	changeDetent() {
		this.setState({ detent: !this.state.detent })
	}

	render() {
		return (
			<div>
				<h3>Carousel w/ Detent Option</h3>
				<input
					type="checkbox"
					checked={this.state.detent}
					onChange={this.changeDetent.bind(this)}
				/>
				detent
				<br />
				<Swiper visibleCount={2} detent={this.state.detent} carousel={true}>
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

export default Carousel