import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HabitLogList from '../HabitLogList.vue'

const logs = [
  { id: 'a', date: '2026-07-17' },
  { id: 'b', date: '2026-07-18' },
]

test('рендерит все записи из пропа', () => {
  const wrapper = mount(HabitLogList, { props: { logs } })
  expect(wrapper.findAll('li')).toHaveLength(2)
  expect(wrapper.text()).toContain('2026-07-17')
})

test('эмитит remove с корректным id', async () => {
  const wrapper = mount(HabitLogList, { props: { logs } })
  await wrapper.findAll('button')[1].trigger('click')
  expect(wrapper.emitted('remove')).toEqual([['b']])
})

test('logsCount пересчитывается при изменении пропа', async () => {
  const wrapper = mount(HabitLogList, { props: { logs: [] } })
  expect(wrapper.text()).toContain('Всего отметок: 0')
  await wrapper.setProps({ logs })
  expect(wrapper.text()).toContain('Всего отметок: 2')
})
