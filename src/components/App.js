import React, { Component, useState } from 'react'

import SingleSelection from './SingleSelection'
import Carousel from './Carousel'
import Vertical from './Vertical'
import Responsive from './Responsive'
import Controlled from './Controlled'

export default class App extends Component {
	render() {
		const pageStyle = {
			maxWidth: '800px',
			margin: 'auto',
			fontFamily: 'Calibri',
		}

		const selectionStyle = {
			height: this.props.pageHeight + 'px',
			width: this.props.pageWidth + 'px',
			backgroundColor: 'gray',
			display: 'inline-block',
			border: '3px solid white',
			color: 'white',
			textAlign: 'center',
			verticalAlign: 'middle',
			lineHeight: this.props.pageHeight + 'px',
			userSelect: 'none',
			fontFamily: 'calibri',
		}

		return (
			<div style={pageStyle}>
				<h1>canari-swipe examples</h1>
				<p>A few basic examples for canari-swipe</p>
				<a href="https://github.com/GeeDollaHolla/canari-swipe/tree/master/src/components">
					Source Code
				</a>
				<SingleSelection selectionStyle={selectionStyle} />
				<Carousel selectionStyle={selectionStyle} />
				<Vertical selectionStyle={selectionStyle} />
				<Responsive selectionStyle={selectionStyle} />
				<Controlled selectionStyle={selectionStyle} />
				<div style={{ display: 'inline-block', height: '200px' }} />
			</div>
		)
	}
}

App.defaultProps = {
	pageWidth: 300,
	pageHeight: 100,
}
