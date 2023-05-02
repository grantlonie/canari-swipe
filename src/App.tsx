import { useState } from 'react'

import Swiper from './Swiper/Swiper'
import Controls from './components/Controls'
import { Box, Text } from './components/base'
import { ControlProps, SLIDE_COUNT } from './helpers'
const canary1 = new URL('./assets/images/canary1.jpg', import.meta.url).toString()

export default function App() {
	const [controlProps, setControlProps] = useState(initialControlProps)

	function handleUpdate(body: Partial<ControlProps>) {
		setControlProps(s => ({ ...s, ...body }))
	}

	return (
		<Box sx={{ fontFamily: 'Arial, Geneva, Helvetica' }}>
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Box sx={{ display: 'flex', justifyContent: 'center' }}>
					<Swiper css={{ width: '600px', maxWidth: '90vw' }} {...controlProps}>
						{slides}
					</Swiper>
				</Box>
			</Box>
			<Box sx={{ width: '500px', maxWidth: '90%', margin: 'auto' }}>
				<Text fontSize="xl">Options</Text>
				<Controls value={controlProps} onUpdate={handleUpdate} />
			</Box>
		</Box>
	)
}

const slides = new Array(SLIDE_COUNT).fill(null).map((_, i) => (
	<Box
		key={i}
		sx={{
			height: '200px',
			backgroundColor: 'gray',
			border: '1px solid black',
			display: 'flex',
			justifyContent: 'center',
			color: 'white',
			userSelect: 'none',
		}}
	>
		<Text>Slide {i + 1}</Text>
	</Box>
))
// .map(() => <img css={{ pointerEvents: 'none' }} src={canary1} />)

const initialControlProps: ControlProps = {
	braking: 'medium',
	center: false,
	endMode: 'elastic',
	goTo: 0,
	goToTime: 500,
	stopMode: 'single',
	scale: 1,
	visible: 2,
}
