import { ChangeEvent, HTMLProps } from 'react'
import { Box, Text } from '.'
import { SxProp } from '../../theme'

interface Props<V extends string>
	extends Omit<HTMLProps<HTMLDivElement>, 'onChange' | 'children' | 'value'> {
	children: Option<V>[]
	label?: string
	onChange: (value: V, e: ChangeEvent<HTMLSelectElement>) => void
	sx?: SxProp
	selectProps?: HTMLProps<HTMLSelectElement>
	value: V
}

export interface Option<V = string> {
	label: string
	value: V
}

export default function Select<V extends string>(props: Props<V>) {
	const { children, label, value, selectProps, onChange, sx, ...rest } = props
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
			<select
				value={value}
				onChange={e => onChange(e.target.value as V, e)}
				{...selectProps}
			>
				{children.map((c, i) => (
					<option key={i} value={c.value}>
						{c.label}
					</option>
				))}
			</select>
		</Box>
	)
}
