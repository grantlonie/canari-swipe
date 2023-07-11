import { HTMLAttributes } from 'react'
import { SwiperMethods } from '../Swiper/Swiper'
import { OverlayType } from '../helpers'

interface Props extends HTMLAttributes<HTMLDivElement> {
	methods: SwiperMethods
	type: OverlayType
}

export default function Overlay({ methods, type, ...rest }: Props) {
	if (type === 'none') return null

	return <div {...rest}></div>
}
