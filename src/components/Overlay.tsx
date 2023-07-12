import { HTMLAttributes, SVGAttributes, SVGProps } from 'react'
import { SwiperMethods } from '../Swiper/Swiper'
import { OverlayType, SLIDE_COUNT } from '../helpers'
import { Box } from './base'

interface Props extends HTMLAttributes<HTMLDivElement> {
	currentIndex: number
	methods: SwiperMethods
	type: OverlayType
	vertical: boolean
}

export default function Overlay({ currentIndex, methods, type, vertical, ...rest }: Props) {
	switch (type) {
		case 'none':
			return null
		case 'controls':
			const flexDirection = vertical ? 'column' : 'row'
			const gridProp = vertical ? 'gridTemplateColumns' : 'gridTemplateRows'
			return (
				<Box sx={{ display: 'grid', [gridProp]: '50px auto 50px' }} {...rest}>
					<Box />
					<Box
						sx={{
							alignItems: 'center',
							display: 'flex',
							flexDirection,
							justifyContent: 'space-between',
							m: 2,
						}}
					>
						<NextIcon style={{ transform: `rotate(${vertical ? -90 : 180}deg)` }} onClick={methods.prev} />
						<Box />
						<NextIcon style={{ transform: `rotate(${vertical ? 90 : 0}deg)` }} onClick={methods.next} />
					</Box>
					<Dots currentIndex={currentIndex} goTo={methods.goTo} flexDirection={flexDirection} />
				</Box>
			)
	}
}

const NextIcon = (props: SVGAttributes<SVGElement>) => (
	<svg
		cursor="pointer"
		fill="transparent"
		height="24"
		stroke="white"
		strokeWidth={2}
		width="24"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path d="M6 2 l12 10 l-12 10" />
	</svg>
)

function Dots({ currentIndex, goTo, flexDirection }) {
	return (
		<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', flexDirection }}>
			{new Array(SLIDE_COUNT).fill(null).map((_, i) => (
				<Box
					key={i}
					onClick={() => goTo(i)}
					style={{ background: currentIndex === i ? 'blue' : 'white' }}
					sx={{ height: '20px', width: '20px', borderRadius: '10px', cursor: 'pointer' }}
				/>
			))}
		</Box>
	)
}
