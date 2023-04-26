import HelpTooltip from './HelpTooltip'
import { Box } from './base'
import Checkbox from './base/Checkbox'
import Slider from 'rc-slider'
import Select, { Option } from './base/Select'
import { ControlProps } from '../helpers'

interface Props {
	value: ControlProps
	onUpdate: (body: Partial<ControlProps>) => void
}

export default function Controls({ value, onUpdate }: Props) {
	return (
		<Box>
			<Slider
				min={1}
				max={3}
				marks={{ 1: '1', 2: '2', 3: '3' }}
				value={value.visible}
				onChange={val => onUpdate({ visible: val as number })}
			/>
			<ContainerWithHelp tooltipLabel="Smooth braking stopping between slides">
				<Checkbox
					checked={value.noDetent}
					label="No detent"
					onChange={noDetent => onUpdate({ noDetent })}
				/>
			</ContainerWithHelp>
			<ContainerWithHelp tooltipLabel="Loop slides back to the beginning">
				<Checkbox
					checked={value.loop}
					label="Loop around"
					onChange={loop => onUpdate({ loop })}
				/>
			</ContainerWithHelp>
			<ContainerWithHelp tooltipLabel="Control selected slide externally">
				<Select
					value={String(value.goTo)}
					label="Go to"
					onChange={val => onUpdate({ goTo: Number(val) })}
				>
					{goToOptions}
				</Select>
			</ContainerWithHelp>
			<ContainerWithHelp tooltipLabel="How long it takes to get to the desired slide">
				<Select
					value={String(value.goToTime)}
					label="Go to time"
					onChange={val => onUpdate({ goToTime: Number(val) })}
				>
					{[
						{ value: '0', label: 'Immediate' },
						{ value: '0.5', label: '0.5' },
						{ value: '1', label: '1' },
					]}
				</Select>
			</ContainerWithHelp>
			<ContainerWithHelp tooltipLabel="How hard to brake after letting go">
				<Select
					value={value.braking}
					label="Braking"
					onChange={braking => onUpdate({ braking })}
				>
					{brakingOptions}
				</Select>
			</ContainerWithHelp>
		</Box>
	)
}

const goToOptions: Option[] = [
	{ value: '0', label: 'One' },
	{ value: '1', label: 'Two' },
	{ value: '2', label: 'Three' },
	{ value: '3', label: 'Four' },
	{ value: '4', label: 'Five' },
	{ value: '5', label: 'Six' },
	{ value: '6', label: 'Seven' },
	{ value: '7', label: 'Eight' },
	{ value: '8', label: 'Nine' },
	{ value: '9', label: 'Ten' },
]

const brakingOptions: Option<ControlProps['braking']>[] = [
	{ value: 'soft', label: 'Soft' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'hard', label: 'Hard' },
]

function ContainerWithHelp({ tooltipLabel, children }) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			{children}
			<HelpTooltip label={tooltipLabel} />
		</Box>
	)
}
