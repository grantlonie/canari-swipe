import React from 'react'
import { shallow, mount } from 'enzyme'

import Swiper from '../Swiper'

const testDiv = <div style={{ display: 'inline-block', width: '100px', height: '100px' }} />

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

describe('Swiper callbacks', () => {
	test('Not enough to swipe', () => {
		const mock = jest.fn()
		const wrapper = mount(
			<Swiper startSwiping={() => mock()}>
				{testDiv}
				{testDiv}
			</Swiper>
		)

		wrapper.simulate('mousedown', { pageX: 0 })
		wrapper.simulate('mousemove', { pageX: 10 })

		expect(mock).not.toHaveBeenCalled()
	})

	test('Start Swiping', () => {
		const mock = jest.fn()
		const wrapper = mount(
			<Swiper startSwiping={() => mock()}>
				{testDiv}
				{testDiv}
			</Swiper>
		)

		wrapper.simulate('mousedown', { pageX: 0 })
		wrapper.simulate('mousemove', { pageX: 20 })

		expect(mock).toHaveBeenCalled()
	})
})
