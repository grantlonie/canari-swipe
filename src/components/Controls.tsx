import { ControlProps } from '../helpers'
import ContainerWithHelp from './ContainerWithHelp'
import { Box, Checkbox } from './base'
import Select, { Option } from './base/Select'

interface Props {
	value: ControlProps
	onUpdate: (body: Partial<ControlProps>) => void
}

export default function Controls({ value, onUpdate }: Props) {
	return (
		<Box sx={{ mt: 2 }}>
			<ContainerWithHelp
				sx={{ mb: 2 }}
				tooltipLabel="Fit the number of slides in the container setting slide widths or leaving them unset to be at different widths"
			>
				<Select value={value.fit} label="Fit" onChange={fit => onUpdate({ fit })}>
					{fitOptions}
				</Select>
			</ContainerWithHelp>

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
				<Select value={value.goTo} label="Go to" onChange={goTo => onUpdate({ goTo })}>
					{goToOptions}
				</Select>
			</ContainerWithHelp>

			<ContainerWithHelp tooltipLabel="How long it takes to get to the desired slide">
				<Select value={value.goToTime} label="Go to time" onChange={goToTime => onUpdate({ goToTime })}>
					{[
						{ value: 0, label: 'Immediate' },
						{ value: 500, label: '500' },
						{ value: 1000, label: '1000' },
					]}
				</Select>
			</ContainerWithHelp>

			<ContainerWithHelp tooltipLabel="Align the slides inside the container">
				<Select value={value.align} label="Align" onChange={align => onUpdate({ align })}>
					{alignOptions}
				</Select>
			</ContainerWithHelp>

			<ContainerWithHelp tooltipLabel="Overlay controls or fade effects over content">
				<Select value={value.overlayType} label="Overlay" onChange={overlayType => onUpdate({ overlayType })}>
					{overlayTypeOptions}
				</Select>
			</ContainerWithHelp>
		</Box>
	)
}

const goToOptions: Option<number>[] = [
	{ value: 0, label: 'One' },
	{ value: 1, label: 'Two' },
	{ value: 2, label: 'Three' },
	{ value: 3, label: 'Four' },
	{ value: 4, label: 'Five' },
	{ value: 5, label: 'Six' },
	{ value: 6, label: 'Seven' },
	{ value: 7, label: 'Eight' },
	{ value: 8, label: 'Nine' },
	{ value: 9, label: 'Ten' },
]

const fitOptions: Option<ControlProps['fit']>[] = [
	{ value: 0, label: 'Different sizes' },
	{ value: 1, label: 'One' },
	{ value: 2, label: 'Two' },
	{ value: 3, label: 'Three' },
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

const alignOptions: Option<ControlProps['align']>[] = [
	{ value: 'start', label: 'Start' },
	{ value: 'center', label: 'Center' },
]

const overlayTypeOptions: Option<ControlProps['overlayType']>[] = [
	{ value: 'controls', label: 'Controls' },
	{ value: 'none', label: 'None' },
]
