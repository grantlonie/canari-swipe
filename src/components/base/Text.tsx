import { FontSize, SxProp, convertSx } from '../../theme'
import { HTMLProps } from 'react'

interface Props extends HTMLProps<HTMLParagraphElement> {
	sx?: SxProp
	/** (default md) Font size */
	fontSize?: keyof typeof FontSize
}

export default function Text({ fontSize = 'md', sx, ...rest }: Props) {
	const css = convertSx(sx)
	return <p css={{ ...css, fontSize: FontSize[fontSize] }} {...rest} />
}
