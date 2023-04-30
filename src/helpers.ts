import { SwiperProps } from './Swiper/types'

export const SLIDE_COUNT = 10

export type ControlProps = WithRequired<
	Omit<SwiperProps, 'onLoad' | 'children'>,
	'braking' | 'goTo' | 'goToTime' | 'endMode' | 'scale' | 'visible' | 'stopMode'
>

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
