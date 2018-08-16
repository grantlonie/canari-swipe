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
				<Responsive selectionStyle={selectionStyle} />
				<div style={{ display: 'inline-block', height: '200px' }} />
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

class Responsive extends React.Component {
	constructor(props) {
		super(props)

		this.borderWidth = parseInt(this.props.selectionStyle.border)

		this.state = {
			width: parseInt(this.props.selectionStyle.width),
			height: parseInt(this.props.selectionStyle.height),
		}
	}

	changeHeight(e) {
		this.setState({ height: e.target.value })
	}

	changeWidth(e) {
		this.setState({ width: e.target.value })
	}

	render() {
		const swipeAmount = Math.max(this.state.width, 100) + this.borderWidth * 2

		const updatedStyle = {
			...this.props.selectionStyle,
			width: Math.max(this.state.width, 100) + 'px',
			height: this.state.height + 'px',
		}

		return (
			<div>
				<h3>Responsive to child size changes</h3>
				<input type="input" onChange={this.changeWidth.bind(this)} value={this.state.width} />
				width
				<br />
				<br />
				<Swiper swipeAmount={swipeAmount} wrapAround={this.state.wrapAround}>
					{[...Array(5)].map((iter, page) => {
						return (
							<div key={page} style={updatedStyle}>
								Page {page}
							</div>
						)
					})}
				</Swiper>
			</div>
		)
	}
}
