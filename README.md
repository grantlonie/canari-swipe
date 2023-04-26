# canari-swipe

100% React-based library used to swipe pages and other content. Multiple exposed properties for customizing the behavior.

Check out these [examples](https://geedollaholla.github.io/canari-swipe/)!

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [Properties](#properties)

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

### Null selections

If you want to not show a selection, pass `[]` as the child. Null and undefined will not work. For example:

```
<Swiper>
	<div id="selection1">
	{someProp ? <div id="selection2 /> : []}
	<div id="selection3">
</Swiper>
```

## Properties

| Property          | Type     | Default | Details                                                                                                                        |
| ----------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| swipeAmount       | Number   |         | The amount, in pixels, that the selection will swipe. By default it is the width or height of the firstSelection element       |
| firstSelection    | Number   | 0       | First selection on mounting                                                                                                    |
| desiredSelection  | Number   | 0       | Specify the selection for controlling the Swiper externally                                                                    |
| goToTime          | Number   | 0       | The time it will take to swipe to the desiredSelection from the current. 0 is immediate                                        |
| vertical          | Bool     | false   | true - swipe vertically instead of horizontally                                                                                |
| minimumSwipeSpeed | Number   | 500     | Minimum speed required to flick to next selection and that swiping will go after releasing touch/mouse                         |
| carousel          | Bool     | false   | true - load all selections and swipe through multiple selections, false - load only current selection and immediate neighbors, |
| loop              | Bool     | false   | If !carousel, true - wrap selection around to front, false - stop swiping at the beginning and end of selection list           |
| neighborsOnly     | Bool     | false   | If !carousel, true - only render selection and immediate neighbors                                                             |
| visibleCount      | Number   | 1       | If carousel, amount of visible selections in the swiper                                                                        |
| detent            | Number   | false   | If carousel, true - stop swiping exactly on edge of selection, false - swiping can stop mid-selection                          |
| deceleration      | Number   | 3       | If carousel, how quickly the carousel slows down                                                                               |
| scaleSwipe        | Number   | 1       | An amount to scale the swiping down or up                                                                                      |
| resetSwiper       | Bool     | false   | If true, reset the swiper back to firstSelection                                                                               |
| onSwipeStart      | Callback | NA      | Callback function once swiping has started                                                                                     |
| onSwipeEnd        | Callback | NA      | Callback function after a selection has changed                                                                                |
