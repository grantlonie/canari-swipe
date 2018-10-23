import React, { Component } from 'react'
import Swiper from '../Swiper'

class Controlled extends Component {
	state = {
		desiredSelectionTime: 0,
		desiredSelection: 0,
	}

	changeDesiredSelectionTime(e) {
		this.setState({ desiredSelectionTime: e.target.value })
	}

	handleStartSwiping() {
		this.setState({ startSwiping: true })
	}

	handleSelectionChange(e) {
		this.setState({ desiredSelection: parseInt(e.target.value) })
	}

	handleUpdatingSelection(selection) {
		this.setState({ desiredSelection: selection })
	}

	render() {
		return (
			<div>
				<h3>Swiper with controlling option</h3>
				<p>
					<select
						style={{ width: '50px', marginRight: '5px' }}
						value={this.state.desiredSelection}
						onChange={this.handleSelectionChange.bind(this)}>
						{[...Array(5)].map((iter, page) => {
							return (
								<option value={page} key={page}>
									{page}
								</option>
							)
						})}
					</select>
					desiredSelection
				</p>
				<p>
					<input
						type="text"
						style={{ width: '45px', marginRight: '5px' }}
						value={this.state.desiredSelectionTime}
						onChange={this.changeDesiredSelectionTime.bind(this)}
					/>
					desiredSelectionTime
				</p>
				<Swiper
					startSwiping={this.handleStartSwiping.bind(this)}
					desiredSelectionTime={parseFloat(this.state.desiredSelectionTime)}
					updateCurrentSelection={this.handleUpdatingSelection.bind(this)}
					desiredSelection={this.state.desiredSelection}>
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

export default Controlled
