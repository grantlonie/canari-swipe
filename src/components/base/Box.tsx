import { SxProp, convertSx } from '../../theme'
import { HTMLProps } from 'react'

interface Props extends HTMLProps<HTMLDivElement> {
	sx: SxProp
}

export default function Box({ sx, ...rest }: Props) {
	const css = convertSx(sx)
	return <div css={css} {...rest} />
}
