import React from 'react'
import { shallow } from 'enzyme'
import App from './App'

describe('App', () => {

	let component

	beforeEach(() => {
		component = shallow(<App/>)
	})

	it('should render a div', () => {
		component = shallow(<App />)

		expect(component.find('div').exists).toBeTruthy
	})
})
