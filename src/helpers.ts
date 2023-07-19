import { SwiperProps } from './Swiper/Swiper'

export const SLIDE_COUNT = 10

export type ControlProps = WithRequired<
	Omit<SwiperProps, 'onLoad' | 'children' | 'Overlay'>,
	'align' | 'braking' | 'goTo' | 'goToTime' | 'easingFunction' | 'endMode' | 'scale' | 'fit' | 'stopMode' | 'vertical'
> & { overlayType: OverlayType }

export type OverlayType = 'none' | 'controls' | 'fade'

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export function randomIntFromInterval(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}
