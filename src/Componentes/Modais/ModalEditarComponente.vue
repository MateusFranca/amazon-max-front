<template>
  <div v-if="isModalControllerEdit" class="fixed inset-0 z-10 flex items-center justify-center"
    aria-labelledby="modal-title" role="dialog" aria-modal="true">

    <div class="fixed inset-0 bg-black opacity-50" @click="$emit('close-modal')"></div>

    <div class="relative z-10 w-full max-w-lg overflow-y-auto">
      <div class="flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-gray-100 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 rounded-t-lg flex items-center justify-center gap-2">
            <div class="text-lg font-semibold leading-6 text-black" id="modal-title">{{ title }}</div>
            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center sm:mx-0 sm:h-10 sm:w-10">
              <img class="h-7 w-7" src="../../../Publico/Imagens/Icones/iconeEditar.svg" alt="">
            </div>
          </div>
          <div class="p-4">
            <slot name="content"></slot>
          </div>
          <div class="bg-gray-100 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-lg">
            <button @click="$emit('edit-request')" type="button"
              class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto">Salvar</button>
            <button @click="$emit('close-modal')" type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isModalControllerEdit: Boolean,
    editedData: Object,
    title: String,
    modalWidth: String,
  },
};
</script>