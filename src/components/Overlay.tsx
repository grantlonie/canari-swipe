import { SVGAttributes } from 'react'
import { SwiperOverlayProps } from '../Swiper/Swiper'
import { OverlayType, SLIDE_COUNT } from '../helpers'
import { theme } from '../theme'
import { Box } from './base'

interface Props extends SwiperOverlayProps {
	type: OverlayType
	vertical: boolean
}

export default function Overlay({ type, vertical, ...rest }: Props) {
	switch (type) {
		case 'none':
			return null
		case 'controls':
			const flexDirection = vertical ? 'column' : 'row'
			const gridProp = vertical ? 'gridTemplateColumns' : 'gridTemplateRows'
			return (
				<Box sx={{ display: 'grid', [gridProp]: '50px auto 50px' }}>
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
						<NextIcon
							className={rest.actionClass}
							style={{ transform: `rotate(${vertical ? -90 : 180}deg)` }}
							onClick={rest.methods.prev}
						/>
						<Box />
						<NextIcon
							className={rest.actionClass}
							style={{ transform: `rotate(${vertical ? 90 : 0}deg)` }}
							onClick={rest.methods.next}
						/>
					</Box>
					<Dots {...rest} goTo={rest.methods.goTo} flexDirection={flexDirection} />
				</Box>
			)
		case 'fade':
			const angle = vertical ? '0deg' : '90deg'
			const background = theme.palette.grey[100]
			return (
				<Box
					sx={{
						background: `linear-gradient(${angle}, ${background} 5%, rgba(0,0,0,0) 30%,rgba(0,0,0,0) 70%, ${background} 95%)`,
					}}
				/>
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

function Dots({ actionClass, currentIndex, goTo, flexDirection }) {
	return (
		<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', flexDirection }}>
			{new Array(SLIDE_COUNT).fill(null).map((_, i) => (
				<Box
					className={actionClass}
					key={i}
					onClick={() => goTo(i)}
					style={{ background: currentIndex === i ? 'blue' : 'white' }}
					sx={{ height: '20px', width: '20px', borderRadius: '10px', cursor: 'pointer' }}
				/>
			))}
		</Box>
	)
}
