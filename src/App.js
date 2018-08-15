import React, { Component } from 'react'
import Swiper from './Swiper'

const pageWidth = 300
const pageHeight = 100
export default class App extends Component {
	render() {
		const pageStyle = {
			maxWidth: '800px',
			margin: 'auto',
			fontFamily: 'Calibri',
		}

		const selectionStyle = {
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
			fontFamily: 'calibri',
		}

		return (
			<div style={pageStyle}>
				<h1>canari-swipe examples</h1>
				<p>A few basic examples for canari-swipe</p>
				<a href="https://github.com/GeeDollaHolla/canari-swipe/blob/master/src/App.js">
					Source Code
				</a>
				<SingleSelection selectionStyle={selectionStyle} />
				<Carousel selectionStyle={selectionStyle} />
				<Vertical selectionStyle={selectionStyle} />
			</div>
		)
	}
}

class SingleSelection extends React.Component {
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

class Carousel extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			detent: false,
		}
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
				<Swiper swipeAmount={pageWidth} visibleCount={2} detent={this.state.detent} carousel={true}>
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

class Vertical extends React.Component {
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
					swipeAmount={pageHeight}
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
