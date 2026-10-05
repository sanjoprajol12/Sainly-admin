<script setup lang="ts">
import type { NavLinkItem } from '@/types/site-setting/SiteSetting'

interface Props {
  modelValue?: NavLinkItem[]
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: 'Navigation links',
})

const emit = defineEmits<{ (e: 'update:modelValue', value: NavLinkItem[]): void }>()

const update = (links: NavLinkItem[]) => emit('update:modelValue', links)

const updateLink = (index: number, field: keyof NavLinkItem, value: string) => {
  update(props.modelValue.map((link, i) => (i === index ? { ...link, [field]: value } : link)))
}

const addLink = () => update([...props.modelValue, { label: '', href: '#' }])

const removeLink = (index: number) => update(props.modelValue.filter((_, i) => i !== index))

const moveLink = (index: number, direction: -1 | 1) => {
  const target = index + direction
  if (target < 0 || target >= props.modelValue.length) return

  const links = [...props.modelValue]
  const [moved] = links.splice(index, 1)

  links.splice(target, 0, moved!)
  update(links)
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-body-1 text-high-emphasis">
        {{ props.label }}
      </div>
      <VBtn
        size="small"
        variant="tonal"
        prepend-icon="plus"
        @click="addLink"
      >
        Add link
      </VBtn>
    </div>

    <div
      v-if="!props.modelValue.length"
      class="text-body-2 text-disabled py-4 text-center border rounded"
    >
      No links yet
    </div>

    <VRow
      v-for="(link, index) in props.modelValue"
      :key="index"
      class="align-center"
      dense
    >
      <VCol
        cols="12"
        sm="5"
      >
        <VTextField
          :model-value="link.label"
          label="Label"
          density="compact"
          @update:model-value="(val: string) => updateLink(index, 'label', val)"
        />
      </VCol>
      <VCol
        cols="12"
        sm="5"
      >
        <VTextField
          :model-value="link.href"
          label="Link (e.g. #services)"
          density="compact"
          @update:model-value="(val: string) => updateLink(index, 'href', val)"
        />
      </VCol>
      <VCol
        cols="12"
        sm="2"
        class="d-flex justify-end"
      >
        <IconBtn
          size="small"
          :disabled="index === 0"
          @click="moveLink(index, -1)"
        >
          <VIcon icon="arrow-up" />
        </IconBtn>
        <IconBtn
          size="small"
          :disabled="index === props.modelValue.length - 1"
          @click="moveLink(index, 1)"
        >
          <VIcon icon="arrow-down" />
        </IconBtn>
        <IconBtn
          size="small"
          color="error"
          @click="removeLink(index)"
        >
          <VIcon icon="trash-2" />
        </IconBtn>
      </VCol>
    </VRow>
  </div>
</template>
