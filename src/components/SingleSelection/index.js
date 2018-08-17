import React, { Component } from 'react'
import Swiper from '../../Swiper'

class SingleSelection extends Component {
	constructor(props) {
		super(props)

		this.state = {
			wrapAround: false,
		}
	}

	changeWrapAround() {
		this.setState({ wrapAround: !this.state.wrapAround })
	}

	render() {
		return (
			<div>
				<h3>Single Selections w/ wrapAround Option</h3>
				<input
					type="checkbox"
					checked={this.state.wrapAround}
					onChange={this.changeWrapAround.bind(this)}
				/>
				wrapAround
				<br />
				<Swiper wrapAround={this.state.wrapAround}>
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