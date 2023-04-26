import { SwiperProps } from './types'

export function getDeceleration(braking?: SwiperProps['braking']) {
	switch (braking) {
		case 'soft':
			return 2
		case 'hard':
			return 10
		default:
			return 5
	}
}
