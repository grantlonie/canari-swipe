import { ChangeEventHandler, HTMLProps } from 'react'
import { Box, Text } from '.'
import { SxProp } from '../../theme'

interface Props extends Omit<HTMLProps<HTMLDivElement>, 'onChange'> {
	label?: string
	onChange: ChangeEventHandler<HTMLInputElement>
	sx?: SxProp
	inputProps?: HTMLProps<HTMLInputElement>
}

export default function Input(props: Props) {
	const { label, value, inputProps, onChange, sx, ...rest } = props
	return (
		<Box
			sx={{
				cursor: 'pointer',
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				...sx,
			}}
			{...rest}
		>
			{label && <Text>{label}: </Text>}
			<input value={value} onChange={onChange} {...inputProps} />
		</Box>
	)
}
