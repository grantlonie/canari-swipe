import React from 'react'
import { shallow, mount } from 'enzyme'

import Swiper from '../Swiper'

describe('Swiper no props', () => {
	test('Render with no children', () => {
		const wrapper = shallow(<Swiper />)

		expect(wrapper).toBeDefined()
	})

	test('Render with one child', () => {
		const wrapper = mount(
			<Swiper>
				<div />
			</Swiper>
		)

		expect(wrapper).toBeDefined()
	})

	test('Render with 100 children', () => {
		const wrapper = mount(
			<Swiper>
				{[...Array(100)].map((item, index) => (
					<div key={index} />
				))}
			</Swiper>
		)

		expect(wrapper).toBeDefined()
	})
})
