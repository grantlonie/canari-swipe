import React, { Component } from 'react'
import Swiper from './Swiper'

const pageWidth = 400
const pageHeight = 400
export default class App extends Component {
	render() {
		const wrapperStyle = {
			height: pageHeight + 'px',
			width: pageWidth + 'px',
			overflow: 'hidden',
			display: 'inline-block',
			margin: 'auto',
			left: 0,
			right: 0,
		}

		const pageStyle = {
			height: pageHeight + 'px',
			width: pageWidth + 'px',
			backgroundColor: 'gray',
			display: 'inline-block',
			border: '3px solid white',
			color: 'white',
			textAlign: 'center',
			verticalAlign: 'middle',
			lineHeight: pageHeight + 'px',
			userSelect: 'none',
		}

		return (
			<div>
				<h1>Single Page Swiper</h1>
				<div style={wrapperStyle}>
					<Swiper
						swipeAmount={pageWidth}
						visibleCount={1}
						horizontal={true}
						neighborsOnly={true}
						minimumSwipeSpeed={2000}
						wrapAround={true}
						desiredIndex={0}
						startIndex={0}>
						{[...Array(5)].map((iter, page) => {
							return (
								<div key={page}>
									<div style={pageStyle}>Page {page}</div>
								</div>
							)
						})}
					</Swiper>
				</div>
			</div>
		)
	}
}
