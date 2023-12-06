import { jsx } from '@emotion/react'
import { SxProp, convertSx } from '../../theme'
import { ElementType, HTMLProps, createElement } from 'react'

export interface BoxProps extends HTMLProps<HTMLDivElement> {
	component?: ElementType
	sx?: SxProp
}

export default function Box({ component = 'div', sx, ...rest }: BoxProps) {
	const css = convertSx(sx)
	return jsx(component, { css, ...rest })
}
