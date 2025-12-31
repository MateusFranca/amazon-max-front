import { ref } from 'vue';

export function useTogglePasswordVisibility() {
  const visibilidade = ref<Record<string, boolean>>({});

  const alternarVisibilidadeSenha = (campo: string) => {
    visibilidade.value[campo] = !visibilidade.value[campo];
  };

  const exibirSenha = (campo: string) => {
    return visibilidade.value[campo] || false;
  };

  return {
    alternarVisibilidadeSenha,
    exibirSenha,
  };
}
