import { SxProp, convertSx } from '../../theme'
import { HTMLProps } from 'react'

export interface BoxProps extends HTMLProps<HTMLDivElement> {
	sx?: SxProp
}

export default function Box({ sx, ...rest }: BoxProps) {
	const css = convertSx(sx)
	return <div css={css} {...rest} />
}
