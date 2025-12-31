<template>
  <div class="flex md:justify-start justify-center">
    <button :type="type || 'button'" :class="[
      'flex justify-center items-center gap-3 text-white py-[.5rem] px-[1.5rem] rounded-lg w-full transition-all duration-300',
      color ? color : 'bg-[#e44c25] hover:bg-[#c43d1f]',
      { 'opacity-50 cursor-not-allowed': disabled }
    ]" :disabled="disabled">
      {{ title }}
      <slot></slot>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    color: { type: String, default: null },
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false },
  },
};
</script>
