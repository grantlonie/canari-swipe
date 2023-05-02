import HelpTooltip from './HelpTooltip'
import { Box, Checkbox, Text } from './base'
import Slider from 'rc-slider'
import Select, { Option } from './base/Select'
import { ControlProps } from '../helpers'

interface Props {
	value: ControlProps
	onUpdate: (body: Partial<ControlProps>) => void
}

export default function Controls({ value, onUpdate }: Props) {
	return (
		<Box sx={{ mt: 2 }}>
			<Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
				<Text>Visible: </Text>
				<Slider
					min={1}
					max={5}
					marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }}
					value={value.visible}
					onChange={val => onUpdate({ visible: val as number })}
				/>
			</Box>

			<ContainerWithHelp tooltipLabel="Apply elastic effect or rigid at the end of the slides or carousel them back around">
				<Select value={value.endMode} label="End mode" onChange={endMode => onUpdate({ endMode })}>
					{endModeOptions}
				</Select>
			</ContainerWithHelp>

			<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
				<ContainerWithHelp tooltipLabel="Stop after a single slide, or animate slides per braking stopping on whole slide (multiple) or wherever it lies (free)">
					<Select value={value.stopMode} label="Stop mode" onChange={stopMode => onUpdate({ stopMode })}>
						{stopModeOptions}
					</Select>
				</ContainerWithHelp>
				{value.stopMode !== 'single' && (
					<ContainerWithHelp tooltipLabel="How hard to brake animation effect">
						<Select value={value.braking} label="Braking" onChange={braking => onUpdate({ braking })}>
							{brakingOptions}
						</Select>
					</ContainerWithHelp>
				)}
			</Box>

			<ContainerWithHelp tooltipLabel="Control selected slide externally">
				<Select value={String(value.goTo)} label="Go to" onChange={val => onUpdate({ goTo: Number(val) })}>
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
						{ value: '500', label: '500' },
						{ value: '1000', label: '1000' },
					]}
				</Select>
			</ContainerWithHelp>

			<ContainerWithHelp tooltipLabel="Center current slide in container">
				<Checkbox label="Center" checked={value.center} onChange={center => onUpdate({ center })} />
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

const endModeOptions: Option<ControlProps['endMode']>[] = [
	{ value: 'elastic', label: 'Elastic' },
	{ value: 'rigid', label: 'Rigid' },
	{ value: 'carousel', label: 'Carousel' },
]

const stopModeOptions: Option<ControlProps['stopMode']>[] = [
	{ value: 'single', label: 'Single' },
	{ value: 'multiple', label: 'Multiple' },
	{ value: 'free', label: 'Free' },
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
