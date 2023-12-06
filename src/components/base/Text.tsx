import { jsx } from '@emotion/react'
import { FontSize, SxProp, convertSx } from '../../theme'
import { ElementType, HTMLProps } from 'react'

interface Props extends HTMLProps<HTMLParagraphElement> {
	component?: ElementType
	sx?: SxProp
	/** (default md) Font size */
	fontSize?: keyof typeof FontSize
}

export default function Text({ component = 'p', fontSize, sx, ...rest }: Props) {
	const css = convertSx(sx)
	const cssFontSize = component === 'p' || fontSize ? FontSize[fontSize || 'md'] : undefined
	return jsx(component, { css: { marginBlock: 0, fontSize: cssFontSize, ...css }, ...rest })
}
