# canari-swipe

100% React-based library used to swipe pages and other content. Multiple exposed properties for customizing the behavior.

Check out these [examples](https://geedollaholla.github.io/canari-swipe/)!

## Installation

`$ npm install --save canari-swipe`

## Basic Usage

```
import Swiper from 'canari-swipe'

const slideStyle = {
	height: '200px',
	backgroundColor: 'gray',
	display: 'inline-block',
	textAlign: 'center',
	verticalAlign: 'middle',
}

function SimpleSwiper() {
	return (
		<Swiper fit={1} gap={20}>
			{[...Array(5)].map((_, index) => (
				<div key={index} style={slideStyle}>
					Page {index}
				</div>
			))}
		</Swiper>
	)
}
```
