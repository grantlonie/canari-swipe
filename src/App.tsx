import { useState } from 'react'

import { ControlProps } from './types'
import Controls from './components/Controls'

export default function App() {
	const [controlProps, setControlProps] = useState(initialControlProps)

	function handleUpdate(body: Partial<ControlProps>) {
		setControlProps(s => ({ ...s, ...body }))
	}

	return <Controls value={controlProps} onUpdate={handleUpdate} />
}

const initialControlProps: ControlProps = {
	visibleCount: 3,
	detent: false,
}
