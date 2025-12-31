import { reactive, computed, getCurrentInstance, onMounted, watch, toRef } from "vue";
import useValidate from '@vuelidate/core';
import { required, helpers, maxLength, minLength } from '@vuelidate/validators';
import { useRouter, useRoute } from 'vue-router';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import { useEnderecoUtils } from '../../../utils/useEnderecoUtils.ts';
import { useDocumentoMask } from '../../../utils/useDocumentoMask';
import { requisicaoAPI } from '../../../api/comunicador'; 
import { getAuthHeader } from "../../../utils/tokenUtils.ts";

export function cadastroScriptCliente(id: string | number | null) {
  const route = useRoute();
  const router = useRouter();
  const { proxy } = getCurrentInstance()!;

  const isEditing = computed(() => !!id);

  const {
    estados: listarEstados,
    cidades,
    carregarEstados,
    carregarCidades,
    carregarCidadesPorEstado,
    pesquisarCep,
    skipCityLoad
  } = useEnderecoUtils();

  const state = reactive({
    formularioCliente: {
      nome: "",
      documento: "",
      telefone: "",
      nascimento: null as string | null,
      id_end_fk: "",
    },
    endereco: {
      id_est_fk: "",
      id_cid_fk: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cep: "",
    },
    isLoad: false,
  });

  const { mascaraDocumento } = useDocumentoMask(toRef(state.formularioCliente, 'documento'));

  const telefoneValido = helpers.withMessage(
    'Telefone deve ter 11 dígitos numéricos',
    (value: string) => !!value && value.replace(/\D/g, '').length === 11
  );

  const rawDocumento = toRef(state.formularioCliente, 'documento');
  const apenasDigitos = computed(() => rawDocumento.value.replace(/\D/g, ''));
  const isCPF = computed(() => apenasDigitos.value.length === 11);
  const isCNPJ = computed(() => apenasDigitos.value.length === 14);

  const rules = computed(() => ({
    formularioCliente: {
      nome: {
        required: helpers.withMessage('Nome é obrigatório', required),
        minLength: helpers.withMessage('Nome deve ter pelo menos 3 caracteres', minLength(3)),
        maxLength: helpers.withMessage('Nome deve ter no máximo 100 caracteres', maxLength(100))
      },
      documento: {
        required: helpers.withMessage('Documento é obrigatório', required),
        cpf: helpers.withMessage('O CPF informado é inválido', (value: string) => {
          if (!value) return false;
          const onlyNumbers = String(value).replace(/\D/g, '');
          if (onlyNumbers.length === 11) {
            return cpf.isValid(onlyNumbers);
          }
          return true;
        }),
        cnpj: helpers.withMessage('O CNPJ informado é inválido', (value: string) => {
          if (!value) return false;
          const onlyNumbers = String(value).replace(/\D/g, '');
          if (onlyNumbers.length === 14) {
            return cnpj.isValid(onlyNumbers);
          }
          return true;
        }),
      },
      telefone: {
        required: helpers.withMessage('Telefone é obrigatório', required),
        telefoneValido
      },
       nascimento: {
      required: helpers.withMessage('Data de nascimento é obrigatória', (value) => {
        return isCPF.value ? !!value : true;
      }),
      nascimentoValido: helpers.withMessage('Data deve estar no formato YYYY-MM-DD', (value) => {
        return isCPF.value ? /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? '')) : true;
      })
    }
    },
    endereco: {
      rua: {
        required: helpers.withMessage('Rua é obrigatória', required),
        minLength: helpers.withMessage('Rua deve ter pelo menos 2 caracteres', minLength(2)),
        maxLength: helpers.withMessage('Rua deve ter no máximo 255 caracteres', maxLength(255))
      },
      bairro: {
        required: helpers.withMessage('Bairro é obrigatório', required),
        minLength: helpers.withMessage('Bairro deve ter pelo menos 2 caracteres', minLength(2)),
        maxLength: helpers.withMessage('Bairro deve ter no máximo 100 caracteres', maxLength(100))
      },
      cep: {
        required: helpers.withMessage('CEP é obrigatório', required),
        minLength: helpers.withMessage('CEP deve ter pelo menos 8 caracteres', minLength(8)),
        maxLength: helpers.withMessage('CEP deve ter no máximo 10 caracteres', maxLength(10))
      },
      numero: {
        required: helpers.withMessage('Número é obrigatório', required),
        minLength: helpers.withMessage('Número deve ter pelo menos 1 caractere', minLength(1)),
        maxLength: helpers.withMessage('Número deve ter no máximo 10 caracteres', maxLength(10))
      },
      complemento: {
        maxLength: helpers.withMessage('Complemento deve ter no máximo 255 caracteres', maxLength(255))
      },
      id_est_fk: {
        required: helpers.withMessage('Estado é obrigatório', required)
      },
      id_cid_fk: {
        required: helpers.withMessage('Cidade é obrigatória', required)
      }
    }
  }));

  const carregarCliente = async () => {
    try {
      const data = await requisicaoAPI(`clientes/${id}`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      if (!data) {
        proxy?.$toast.error("Cliente não encontrado");
        router.push('/consultar/clientes');
        return;
      }
      state.formularioCliente = {
        nome: data.nome,
        documento: data.documento,
        telefone: data.telefone,
        nascimento: data.nascimento,
        id_end_fk: data.id_end_fk,
      };
      state.endereco.cep = data.endereco.cep;
      state.endereco.bairro = data.endereco.bairro;
      state.endereco.rua = data.endereco.rua;
      state.endereco.numero = data.endereco.numero;
      state.endereco.complemento = data.endereco.complemento;
      skipCityLoad.value = true;
      state.endereco.id_est_fk = data.endereco.cidade.id_est_fk;
      await carregarCidadesPorEstado(data.endereco.cidade.id_est_fk);
      state.endereco.id_cid_fk = data.endereco.id_cid_fk;
      skipCityLoad.value = false;
      proxy?.$toast.success("Dados do cliente carregados");
    } catch (error) {
      console.error(error);
      proxy?.$toast.error("Erro ao carregar cliente");
    }
  };

  const enviarFormularioEndereco = async () => {
    try {
      const dados = {
        ...state.endereco,
        cep: state.endereco.cep.replace(/\D/g, ''),
      };
      const enderecoResposta = await requisicaoAPI('enderecos', {
        method: 'POST',
        headers: getAuthHeader(),
        data: dados
      });
      return enderecoResposta.id;
    } catch (error) {
      proxy?.$toast.error("Erro ao cadastrar endereço");
    }
  };

  const enviarFormularioCliente = async () => {
    try {
      const enderecoIdCriar = await enviarFormularioEndereco();
      const dados = {
        ...state.formularioCliente,
        id_end_fk: enderecoIdCriar,
        documento: state.formularioCliente.documento.replace(/\D/g, ''),
        telefone: state.formularioCliente.telefone.replace(/\D/g, ''),
      };
      await requisicaoAPI('clientes', {
        method: 'POST',
        headers: getAuthHeader(),
        data: dados
      });
      proxy?.$toast.success("Cliente cadastrado com sucesso");
      reiniciarFormulario();
    } catch (error) {
      proxy?.$toast.error("Erro ao cadastrar cliente");
    }
  };

  const editarEndereco = async () => {
    try {
      const dados = {
        cep: state.endereco.cep.replace(/\D/g, ''),
        rua: state.endereco.rua,
        numero: state.endereco.numero,
        complemento: state.endereco.complemento,
        bairro: state.endereco.bairro,
        id_cid_fk: state.endereco.id_cid_fk,
      };
      const enderecoId = state.formularioCliente.id_end_fk;
      await requisicaoAPI(`enderecos/${enderecoId}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        data: dados
      });
      proxy?.$toast.success("Endereço editado com sucesso");
      proxy?.$router.push('/consultar/cliente');
      return enderecoId;
    } catch (error) {
      proxy?.$toast.error("Erro ao editar endereço");
    }
  };

  const editarCliente = async () => {
    try {
      const enderecoIdEditar = await editarEndereco();
      const dados = {
        ...state.formularioCliente,
        id_end_fk: enderecoIdEditar,
        documento: state.formularioCliente.documento.replace(/\D/g, ''),
        telefone: state.formularioCliente.telefone.replace(/\D/g, ''),
      };
      await requisicaoAPI(`clientes/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        data: dados
      });
      proxy?.$toast.success("Cliente editado com sucesso");
      reiniciarFormulario();
      proxy?.$router.push('/consultar/cliente');
    } catch (error) {
      proxy?.$toast.error("Erro ao editar cliente");
    }
  };
  
  const reiniciarFormulario = () => {
    state.formularioCliente = {
      nome: "",
      documento: "",
      telefone: "",
      nascimento: null,
      id_end_fk: "",
    };
    state.endereco = {
      id_est_fk: "",
      id_cid_fk: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cep: "",
    };
    v$.value.$reset();
  };

  const save = async () => {
    v$.value.formularioCliente.$touch();
    v$.value.endereco.$touch();
    if (v$.value.formularioCliente.$invalid || v$.value.endereco.$invalid) {
      proxy?.$toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    try {
      if (isEditing.value) {
        state.isLoad = true;
        await editarCliente().finally(() => {
          state.isLoad = false;
        });
      } else {
        state.isLoad = true;
        await enviarFormularioCliente().finally(() => {
          state.isLoad = false;
        });
      }
    } catch (error) {
      console.error(error);
      proxy?.$toast.error('Erro ao salvar cliente');
    }
  };

  onMounted(() => {
    if (isEditing.value) carregarCliente();
    carregarEstados();
    carregarCidades();
  });

  watch(() => route.params.id, (newId) => {
    if (newId) {
      id = Array.isArray(newId) ? newId[0] : newId;
      carregarCliente();
    } else {
      id = null;
      reiniciarFormulario();
      window.location.reload();
    }
  });

  watch(() => state.endereco.id_est_fk, async (novoEstado, velhoEstado) => {
    if (novoEstado && novoEstado !== velhoEstado && !skipCityLoad.value) {
      state.endereco.id_cid_fk = '';
      await carregarCidadesPorEstado(novoEstado);
    }
    if (!novoEstado) {
      state.endereco.id_cid_fk = '';
      await carregarCidades();
    }
  });

  const v$ = useValidate(rules, state);

  return {
    state,
    v$,
    isCNPJ,
    save,
    pesquisarCep,
    listarEstados,
    cidades,
    mascaraDocumento
  };
}
