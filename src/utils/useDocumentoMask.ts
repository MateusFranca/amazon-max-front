import { ref, watch, Ref } from 'vue';

export function useDocumentoMask(documento: Ref<string>) {
  const mascaraDocumento = ref('###.###.###-##');

  watch(
    documento,
    (newValue) => {
      const somenteNumeros = newValue.replace(/\D/g, '');
      mascaraDocumento.value = somenteNumeros.length > 11
        ? '##.###.###/####-##'
        : '###.###.###-##';
    },
    { immediate: true }
  );

  return {
    mascaraDocumento
  };
}
