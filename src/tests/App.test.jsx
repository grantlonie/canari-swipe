import React from 'react'
import { shallow } from 'enzyme'
import App from '../App'

describe('App', () => {
	it('should render a div', () => {
		const wrap = shallow(<App />)

		expect(wrap.find('div').exists).toBeTruthy
	})
})
