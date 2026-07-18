import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HabitCard from '../HabitCard.vue'

test('эмитит toggle при клике', async () => {
  const wrapper = mount(HabitCard, {
    props: {
      id: '1',
      name: 'Бег',
      frequency: 'daily',
      doneToday: false,
      scheduledToday: true,
      isWorkdayToday: true,
    },
    global: { stubs: { RouterLink: true } },
  })
  await wrapper.find('input[type=checkbox]').trigger('change')
  expect(wrapper.emitted('toggle')).toEqual([['1']])
})

test('блокирует уже отмеченную привычку: снять галочку из списка нельзя', () => {
  const wrapper = mount(HabitCard, {
    props: {
      id: '1',
      name: 'Бег',
      frequency: 'daily',
      doneToday: true,
      scheduledToday: true,
      isWorkdayToday: true,
    },
    global: { stubs: { RouterLink: true } },
  })

  const checkbox = wrapper.find('input[type=checkbox]')
  expect(checkbox.attributes('disabled')).toBeDefined()
  expect(checkbox.element.checked).toBe(true)
})

test('отключает отметку рабочей привычки в выходной', () => {
  const wrapper = mount(HabitCard, {
    props: {
      id: '1',
      name: 'Бег',
      frequency: 'workdays',
      doneToday: false,
      scheduledToday: false,
      isWorkdayToday: false,
    },
    global: { stubs: { RouterLink: true } },
  })

  expect(wrapper.find('input[type=checkbox]').attributes('disabled')).toBeDefined()
  expect(wrapper.text()).toContain('сегодня выходной')
})
