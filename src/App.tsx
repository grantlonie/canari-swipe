import { useState } from 'react'

import Swiper from './Swiper/Swiper'
import Controls from './components/Controls'
import { Box, Text } from './components/base'
import { ControlProps, SLIDE_COUNT, randomIntFromInterval } from './helpers'
import Overlay from './components/Overlay'
import Docs from './Docs.mdx'
const canary1 = new URL('./assets/images/canary1.jpg', import.meta.url).toString()

export default function App() {
	const [controlProps, setControlProps] = useState(initialControlProps)

	function handleUpdate(body: Partial<ControlProps>) {
		setControlProps(s => ({ ...s, ...body }))
	}

	const { overlayType, ...rest } = controlProps
	const overlay = overlayType === 'none' ? undefined : (p, m) => <Overlay {...p} methods={m} type={overlayType} />

	return (
		<Box sx={{ fontFamily: 'Arial, Geneva, Helvetica' }}>
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Box sx={{ display: 'flex', justifyContent: 'center' }}>
					<Swiper
						css={{ width: '600px', maxWidth: '90vw', border: '1px solid black' }}
						gap={20}
						overlay={overlay}
						{...rest}
					>
						{slides}
					</Swiper>
				</Box>
			</Box>
			<Box sx={{ width: '500px', maxWidth: '90%', margin: 'auto' }}>
				<Text fontSize="xl">Options</Text>
				<Controls value={controlProps} onUpdate={handleUpdate} />
				<Docs />
			</Box>
		</Box>
	)
}

const slides = new Array(SLIDE_COUNT).fill(null).map((_, i) => (
	<Box
		key={`${i}${randomIntFromInterval(0, 9999)}`}
		sx={{
			backgroundColor: 'gray',
			color: 'white',
			display: 'flex',
			height: '200px',
			justifyContent: 'center',
			width: `${randomIntFromInterval(100, 400)}px`,
		}}
	>
		<Text>Slide {i + 1}</Text>
	</Box>
))
// .map(() => <img css={{ pointerEvents: 'none' }} src={canary1} />)

const initialControlProps: ControlProps = {
	align: 'center',
	braking: 50,
	endMode: 'carousel',
	fit: 0,
	goTo: 0,
	goToTime: 500,
	stopMode: 'multiple',
	scale: 1,
	overlayType: 'controls',
}
