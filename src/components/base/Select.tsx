import { ChangeEvent, HTMLProps } from 'react'
import { Box, Text } from '.'
import { SxProp } from '../../theme'

interface Props<V extends string | number> extends Omit<HTMLProps<HTMLDivElement>, 'onChange' | 'children' | 'value'> {
	children: Option<V>[]
	label?: string
	onChange: (value: V, e: ChangeEvent<HTMLSelectElement>) => void
	sx?: SxProp
	selectProps?: HTMLProps<HTMLSelectElement>
	value: V
}

export interface Option<V = string | number> {
	label: string
	value: V
}

export default function Select<V extends string | number>(props: Props<V>) {
	const { children, label, value, selectProps, onChange, sx, ...rest } = props

	function handleChange(e: ChangeEvent<HTMLSelectElement>) {
		const isNumber = getIsNumber(children)
		const value = e.target.value
		//@ts-ignore
		const formatted: V = isNumber ? Number(value) : value
		onChange(formatted, e)
	}

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
			<select value={String(value)} onChange={handleChange} {...selectProps}>
				{children.map((c, i) => (
					<option key={i} value={String(c.value)}>
						{c.label}
					</option>
				))}
			</select>
		</Box>
	)
}

function getIsNumber(options: Option[]) {
	for (let { value } of options) {
		if (typeof value === 'number') return true
		if (typeof value === 'string') return false
	}
	return false
}
