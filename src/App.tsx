import { useMemo, useState } from 'react'

import Controls from './components/Controls'
import { Box, Text } from './components/base'
import Swiper from './Swiper/Swiper'
import { SLIDE_COUNT, ControlProps } from './helpers'
const canary1 = new URL('./assets/images/canary1.jpg', import.meta.url).toString()

export default function App() {
	const [controlProps, setControlProps] = useState(initialControlProps)

	function handleUpdate(body: Partial<ControlProps>) {
		setControlProps(s => ({ ...s, ...body }))
	}

	const slides = useMemo(() => makeSlides(controlProps.visible), [controlProps.visible])

	return (
		<Box sx={{ fontFamily: 'Arial, Geneva, Helvetica' }}>
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Swiper {...controlProps}>{slides}</Swiper>
			</Box>
			<Box sx={{ width: '500px', maxWidth: '90%', margin: 'auto' }}>
				<Text fontSize="xl">Options</Text>
				<Controls value={controlProps} onUpdate={handleUpdate} />
			</Box>
		</Box>
	)
}

function makeSlides(count: number) {
	const totalWidth = 800
	return new Array(SLIDE_COUNT).fill(null).map((_, i) => (
		<Box
			key={i}
			sx={{
				height: '400px',
				width: totalWidth / count,
				backgroundColor: 'gray',
				border: '1px solid black',
				display: 'flex',
				justifyContent: 'center',
				mt: 4,
				color: 'white',
				userSelect: 'none',
			}}
		>
			<Text>Slide {i + 1}</Text>
		</Box>
	))
}
// .map(() => <img css={{ pointerEvents: 'none' }} src={canary1} />)

const initialControlProps: ControlProps = {
	braking: 'medium',
	endMode: 'elastic',
	goTo: 0,
	goToTime: 500,
	stopMode: 'single',
	scale: 1,
	visible: 2,
}
