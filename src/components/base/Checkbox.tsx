import { HTMLProps } from 'react'
import { Box, Text } from '.'
import { SxProp } from '../../theme'

interface Props extends Omit<HTMLProps<HTMLDivElement>, 'onChange'> {
	label?: string
	onChange: (check: boolean) => void
	sx?: SxProp
}

export default function Checkbox(props: Props) {
	const { label, checked, onChange, sx, ...rest } = props
	return (
		<Box
			onClickCapture={() => onChange(!checked)}
			sx={{
				cursor: 'pointer',
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				...sx,
			}}
			{...rest}
		>
			<input
				checked={checked}
				css={{ cursor: 'pointer' }}
				type="checkbox"
				onChange={e => e.preventDefault()}
			/>
			{label && <Text>{label}</Text>}
		</Box>
	)
}
