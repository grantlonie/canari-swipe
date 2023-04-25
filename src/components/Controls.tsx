import { ControlProps } from '../types'
import Checkbox from './base/Checkbox'

interface Props {
	value: ControlProps
	onUpdate: (body: Partial<ControlProps>) => void
}

export default function Controls({ value, onUpdate }: Props) {
	return (
		<Checkbox
			checked={value.detent}
			label="nicer!"
			onChange={detent => onUpdate({ detent })}
		/>
	)
}
