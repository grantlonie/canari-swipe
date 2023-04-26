import { ReactNode, useId } from 'react'
import {
	Tooltip as ReactTooltip,
	ITooltip as ReactTooltipProps,
} from 'react-tooltip'

export interface Props extends ReactTooltipProps {
	children: ReactNode
	label: string
}

export default function Tooltip({ children, label, ...rest }: Props) {
	const id = useId().replaceAll(':', '')

	return (
		<>
			<a id={id}>{children}</a>
			<ReactTooltip anchorSelect={`#${id}`} content={label} {...rest} />
		</>
	)
}
