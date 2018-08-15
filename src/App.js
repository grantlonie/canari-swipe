import React, { Component } from 'react'
import Swiper from './Swiper'

const pageWidth = 300
const pageHeight = 200
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
				<SingleSelection pageStyle={pageStyle} />
				<Carousel pageStyle={pageStyle} />
			</div>
		)
	}
}

const SingleSelection = ({ pageStyle }) => (
	<div>
		<h3>Single Selections</h3>

		<Swiper
			swipeAmount={pageWidth}
			visibleCount={1}
			horizontal={true}
			carousel={false}
			minimumSwipeSpeed={2000}
			wrapAround={true}
			desiredSelection={0}
			firstSelection={0}>
			{[...Array(5)].map((iter, page) => {
				return (
					<div key={page}>
						<div style={pageStyle}>Page {page}</div>
					</div>
				)
			})}
		</Swiper>
	</div>
)

const Carousel = ({ pageStyle }) => (
	<div>
		<h3>Carousel</h3>

		<Swiper
			swipeAmount={pageWidth}
			visibleCount={1}
			horizontal={true}
			carousel={true}
			minimumSwipeSpeed={2000}
			wrapAround={false}
			desiredSelection={0}
			firstSelection={0}>
			{[...Array(5)].map((iter, page) => {
				return (
					<div key={page}>
						<div style={pageStyle}>Page {page}</div>
					</div>
				)
			})}
		</Swiper>
	</div>
)
