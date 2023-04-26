import Tooltip, { Props as TooltipProps } from './base/Tooltip'
import { HelpIcon } from './icons'

type Props = Omit<TooltipProps, 'children'>

export default function HelpTooltip(props: Props) {
	return (
		<Tooltip {...props}>
			<HelpIcon />
		</Tooltip>
	)
}
