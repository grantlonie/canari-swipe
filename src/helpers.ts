import { SwiperProps } from './Swiper/types'

export const SLIDE_COUNT = 10

export type ControlProps = WithRequired<
	Omit<SwiperProps, 'onLoaded' | 'children'>,
	'braking' | 'center' | 'goTo' | 'goToTime' | 'endMode' | 'scale' | 'fit' | 'stopMode'
>

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export function randomIntFromInterval(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}
