import { reactive, computed, getCurrentInstance, onMounted, watch, nextTick } from "vue";
import useValidate from '@vuelidate/core';
import { required, email, minLength, maxLength, helpers, numeric, minValue, maxValue } from '@vuelidate/validators';
import { getAuthHeader } from '../../../utils/tokenUtils.ts';
import { useRouter, useRoute } from 'vue-router';
import { useTogglePasswordVisibility } from '../../../utils/useTogglePasswordVisibility';
import { requisicaoAPI } from '../../../api/comunicador';

export function useCadastroUsuario(id: string | number | null) {
  const route = useRoute();
  const router = useRouter();
  const { proxy } = getCurrentInstance()!
  const isEditing = computed(() => !!id)
  const { exibirSenha, alternarVisibilidadeSenha } = useTogglePasswordVisibility();

  const state = reactive({
    usuario: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      cargo: "",
      percentual_comissao: 10,
    },
    isLoad: false,
  });

  const rules = computed(() => {
    const base = {
      nome: {
        required: helpers.withMessage("Por favor, preencha o nome", required),
        minLength: helpers.withMessage("Nome deve ter no mínimo 10 caracteres", minLength(10)),
        maxLength: helpers.withMessage("Nome deve ter no máximo 100 caracteres", maxLength(100))
      },
      email: {
        required: helpers.withMessage("Por favor, preencha o email", required),
        email: helpers.withMessage("Por favor, insira um email válido", email)
      },
      senha: {
        required: helpers.withMessage("Por favor, preencha a senha", required),
        minLength: helpers.withMessage("Senha deve ter no mínimo 8 caracteres", minLength(8)),
        maxLength: helpers.withMessage("Senha deve ter no máximo 200 caracteres", maxLength(200)),
      },
      confirmarSenha: {
        required: helpers.withMessage("Por favor, confirme a senha", required),
        minLength: helpers.withMessage("Senha deve ter no mínimo 8 caracteres", minLength(8)),
        maxLength: helpers.withMessage("Senha deve ter no máximo 200 caracteres", maxLength(200)),
        sameAsPassword: helpers.withMessage("As senhas não coincidem", (value) => value === state.usuario.senha)
      },
      cargo: { required: helpers.withMessage("Por favor, selecione um cargo", required) },
      percentual_comissao: state.usuario.cargo === 'Vendedor'
        ? {
            required: helpers.withMessage("Percentual de comissão é obrigatório", required),
            numeric: helpers.withMessage("Apenas números são permitidos", numeric),
            minValue: helpers.withMessage("Percentual de comissão deve ser no mínimo 1", minValue(1)),
            maxValue: helpers.withMessage("Percentual de comissão deve ser no máximo 100", maxValue(100)),
          }
        : {}
    };
    return { usuario: base };
  });

  const v$ = useValidate(rules, state);

  const carregarUsuario = async () => {
    try {
      const response = await requisicaoAPI(`usuarios/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
      });
      const data = response;
      if (data) {
        state.usuario = {
          nome: data.nome,
          email: data.email,
          cargo: data.cargo,
          senha: "",
          confirmarSenha: "",
          percentual_comissao: Number(data.percentual_comissao),
        };
      } else {
        proxy?.$toast.error("Usuário não encontrado");
        router.push('/consultar/usuario');
      }
    } catch (error) {
      proxy?.$toast.error("Erro ao carregar usuário");
    }
  }

  const enviarFormularioUsuario = async () => {
    const { confirmarSenha, ...dados } = state.usuario;
    if (dados.percentual_comissao !== undefined) {
      dados.percentual_comissao = Number(dados.percentual_comissao);
    }

    try {
      await requisicaoAPI('usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        data: dados
      });
      proxy?.$toast.success('Usuário cadastrado com sucesso!');
      reiniciarFormulario();
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      proxy?.$toast.error("Erro ao cadastrar usuário");
    }
  };

  const editarUsuario = async () => {
    const { confirmarSenha, ...dados } = state.usuario;
    if (dados.percentual_comissao !== undefined) {
      dados.percentual_comissao = Number(dados.percentual_comissao);
    }

    try {
      await requisicaoAPI(`usuarios/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        data: dados
      });
      proxy?.$toast.success("Usuário atualizado com sucesso!");
      reiniciarFormulario();
      proxy?.$router.push('/consultar/usuario');
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      proxy?.$toast.error("Erro ao editar usuário");
    }
  }

  const save = async () => {
    v$.value.usuario.$touch()
    if (v$.value.usuario.$invalid) {
      proxy?.$toast.error('Preencha todos os campos obrigatórios');
      return
    }
    try {
      if (isEditing.value) {
        state.isLoad = true;
        await editarUsuario().finally(() => {
          state.isLoad = false;
        });
      } else {
        state.isLoad = true;
        await enviarFormularioUsuario().finally(() => {
          state.isLoad = false;
        });
      }
    } catch (error) {
      console.error(error)
      proxy?.$toast.error('Erro ao salvar produto');
    }
  };

  const reiniciarFormulario = () => {
    state.usuario = {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      cargo: "",
      percentual_comissao: 10,
    };
    v$.value.$reset();
  };

  const limitPercentualComissao = () => {
    if (state.usuario.percentual_comissao > 100) {
      state.usuario.percentual_comissao = 100;
    } else if (state.usuario.percentual_comissao < 0) {
      state.usuario.percentual_comissao = 0;
    }
  };

  onMounted(() => {
    if (isEditing.value) {
      carregarUsuario();
    } else {
      reiniciarFormulario();
    }
  });

  watch(() => route.params.id, (newId) => {
    if (newId) {
      id = Array.isArray(newId) ? newId[0] : newId;
      carregarUsuario();
    } else {
      id = null;
      reiniciarFormulario();
    }
  });

  watch(
    () => state.usuario.cargo,
    async (novoCargo) => {
      if (novoCargo !== 'Vendedor') {
        state.usuario.percentual_comissao = 0;

        await nextTick();

        v$.value.usuario.percentual_comissao?.$reset();
      }
    }
  );

  return {
    state,
    v$,
    save,
    alternarVisibilidadeSenha,
    exibirSenha,
    limitPercentualComissao,
  };
}
