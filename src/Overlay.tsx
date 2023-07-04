import { HTMLAttributes } from 'react'
import { Methods } from './Swiper/Swiper'
import { OverlayType } from './helpers'

interface Props extends HTMLAttributes<HTMLDivElement> {
	methods: Methods
	type: OverlayType
}

export default function Overlay({ methods, type, ...rest }: Props) {
	if (type === 'none') return null

	return <div {...rest}></div>
}
