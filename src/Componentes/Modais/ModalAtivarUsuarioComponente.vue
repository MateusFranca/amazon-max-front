<template>
  <div v-if="isModalControllerAtivar" class="fixed inset-0 z-10 flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">

  <div class="fixed inset-0 bg-black opacity-50" @click="$emit('close-modal')"></div>
  
  <div class="relative z-10 w-full max-w-lg overflow-y-auto">
    <div class="flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6 text-green-600">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-base font-semibold leading-6 text-gray-900 break-words max-w-[400px]" id="modal-title">Você está prestes a ativar o usuario {{ activateData[activateDataName] ? activateData[activateDataName] : 'N/A' }}</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500"> Tem certeza que deseja ativar o usuário {{ usuario.nome_usu }}?</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-100 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button @click="$emit('alter-request')" type="button" class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto">Ativar</button>
            <button @click="$emit('close-modal')" type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</template>

<script>
export default {
  props: {
    isModalControllerAtivar: Boolean,
    activateDataName: String,
    activateData: Object,
  },
};
</script>