import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HabitCard from '../HabitCard.vue'

test('эмитит toggle при клике', async () => {
  const wrapper = mount(HabitCard, {
    props: { id: '1', name: 'Бег', frequency: 'daily', doneToday: false },
    global: { stubs: { RouterLink: true } },
  })
  await wrapper.find('input[type=checkbox]').trigger('change')
  expect(wrapper.emitted('toggle')).toEqual([['1']])
})
