import React, { Component } from 'react'
import SingleSelection from '../components/SingleSelection'
import Carousel from '../components/Carousel'
import Vertical from '../components/Vertical'
import Responsive from '../components/Responsive'

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








