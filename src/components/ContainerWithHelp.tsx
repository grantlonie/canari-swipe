import HelpTooltip from './HelpTooltip'
import Box, { BoxProps } from './base/Box'

interface Props extends BoxProps {
	tooltipLabel: string
}

export default function ContainerWithHelp({ children, tooltipLabel, sx, ...rest }: Props) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }} {...rest}>
			{children}
			<HelpTooltip label={tooltipLabel} />
		</Box>
	)
}
