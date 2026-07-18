import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HabitList from '../HabitList.vue'

test('doneTodayCount пересчитывается при изменении пропа', async () => {
  const wrapper = mount(HabitList, {
    props: { habits: [], isWorkdayToday: true },
    global: { stubs: { RouterLink: true } },
  })
  expect(wrapper.text()).toContain('Отмечено сегодня: 0')

  await wrapper.setProps({
    habits: [
      {
        id: '1',
        name: 'Бег',
        frequency: 'daily',
        doneToday: true,
        scheduledToday: true,
      },
    ],
  })
  expect(wrapper.text()).toContain('Отмечено сегодня: 1')
})
