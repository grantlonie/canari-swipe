# canari-swipe

100% React-based library used to swipe pages and other content. Multiple exposed properties for customizing the behavior.

Check out these [examples](https://geedollaholla.github.io/canari-swipe/)!

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
* [Properties](#properties)

## Installation

`$ npm install --save canari-swipe`

## Usage
```
import Swiper from 'canari-swipe'

const SimpleSwiper = () => {
	const selectionStyle = {
		height: pageHeight + 'px',
		width: pageWidth + 'px',
		backgroundColor: 'gray',
		display: 'inline-block',
		border: '1px solid white',
		color: 'white',
		textAlign: 'center',
		verticalAlign: 'middle',
		lineHeight: pageHeight + 'px',
		userSelect: 'none',
		fontFamily: 'calibri',
	}

	return (
		<Swiper>
			{[...Array(5)].map((iter, page) => {
				return (
					<div key={page} style={selectionStyle}>
						Page {page}
					</div>
				)
			})}
		</Swiper>
	)
}

```


## Properties

| Property               | Type     | Default | Details                                                                                                                        |
| ---------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| swipeAmount            | Number   |         | The amount, in pixels, that the selection will swipe. By default it is the width or height of the firstSelection element       |
| firstSelection         | Number   | 0       | First selection on mounting                                                                                                    |
| desiredSelection       | Number   | 0       | Specify the selection for controlling the Swiper externally                                                                    |
| vertical               | Bool     | false   | true - swipe vertically instead of horizontally                                                                                |
| minimumSwipeSpeed      | Number   | 500     | Minimum speed that swiping will go after releasing touch/mouse                                                                 |
| carousel               | Bool     | false   | true - load all selections and swipe through multiple selections, false - load only current selection and immediate neighbors, |
| wrapAround             | Bool     | false   | If !carousel, true - wrap selection around to front, false - stop swiping at the beginning and end of selection list           |
| visibleCount           | Number   | 1       | If carousel, amount of visible selections in the swiper                                                                        |
| detent                 | Number   | false   | If carousel, true - stop swiping exactly on edge of selection, false - swiping can stop mid-selection                          |
| deceleration           | Number   | 3       | If carousel, how quickly the carousel slows down                                                                               |
| swipeRatio             | Number   | 1       | An amount to scale the swiping down or up                                                                                      |
| isControlled           | Bool     | false   | Remove transition between selection changes                                                                                    |
| resetSwiper            | Bool     | false   | If true, reset the swiper back to firstSelection                                                                               |
| overflow               | Bool     | false   | true - allow overflow of selections, false - prevent overflow                                                                  |
| startSwiping           | Callback | NA      | Callback function once swiping has started                                                                                     |
| updateCurrentSelection | Callback | NA      | Callback function after a selection has changed                                                                                |
