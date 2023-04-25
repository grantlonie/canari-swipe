import { HTMLProps } from 'react'
import { Box } from '.'
import { SxProp } from '../../theme'

interface Props extends Omit<HTMLProps<HTMLInputElement>, 'onChange'> {
	label?: string
	onChange: (check: boolean) => void
	sx?: SxProp
}

export default function Checkbox(props: Props) {
	const { label, checked, onChange, sx, ...rest } = props
	return (
		<Box
			onClickCapture={() => onChange(!checked)}
			sx={{ display: 'flex', alignItems: 'center', gap: 2, ...sx }}
		>
			<input
				checked={checked}
				type="checkbox"
				onChange={e => e.preventDefault()}
				{...rest}
			/>
			{label && <p>{label}</p>}
		</Box>
	)
}
