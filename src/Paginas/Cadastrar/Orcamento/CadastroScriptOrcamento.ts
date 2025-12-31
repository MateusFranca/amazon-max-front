import { reactive, onMounted, computed, nextTick, getCurrentInstance, ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, decimal, minValue, maxValue, helpers, maxLength } from "@vuelidate/validators";
import { requisicaoAPI } from "../../../api/comunicador.ts";
import { getAuthHeader, getIdFromToken } from '../../../utils/tokenUtils.ts';
import { gerarPdfOrcamento } from "./gerarPdfOrcamento.ts";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

export function cadastroScriptOrcamento(id?: string | number) {
  const { proxy } = getCurrentInstance()!;
  const state = reactive({
    orcamento: {
      id_cli_fk: "",
      id_usu_fk: "",
      valor_final: "",
      forma_pagamento: "nao_selecionado",
      prazo: "",
      observacao: "",
      percentual_comissao: 0,
      parcelas: 1,
      codigo_finame: "",
    },
    listaClientes: [] as Array<{
      id: string;
      nome: string;
      documento: string;
      telefone: string;
    }>,
    produtosOrcamento: [] as Array<{
      id_pro_fk: string;
      valor_unitario: string;
      valor_final_unitario: number;
      quantidade: number;
    }>,
    listaProdutos: [] as Array<{
      id: string;
      nome: string;
      valor_unitario: number;
      foto: string[];
      descricao_tecnica: string;
    }>,
    isLoad: false,
  });

  const produtoForm = reactive({
    id_pro_fk: "",
    valor_unitario: "",
    valor_final_unitario: "",
    quantidade: 1,
    prazo: "",
    observacao: "",
  });

  const produtoFormError = reactive({
    id_pro_fk: "",
    valor_unitario: "",
    valor_final_unitario: "",
    quantidade: "",
  });

  // const itemEmEdicao = reactive({
  //   id_pro_fk: "",
  //   valor_unitario: "",
  //   quantidade: 1,
  //   indice: -1
  // });

  // const showEditModal = ref(false);
  const comissaoMaxima = ref(0);

  const validadorDescontoMaximo = helpers.withMessage(
    "O desconto não pode exceder 100%",
    maxValue(100)
  );

  const validadorDescontoMinimo = helpers.withMessage(
    "O desconto não pode ser negativo",
    minValue(0)
  );

  const validadorDecimal20_2 = helpers.withMessage(
    "O valor deve ter no máximo 20 dígitos com até 2 casas decimais",
    (value) => {
      if (!value) return true;
      const strValue = String(value).replace(',', '.');
      const parts = strValue.split('.');
      const integerPart = parts[0] || '';
      const decimalPart = parts[1] || '';
      return integerPart.length <= 18 && decimalPart.length <= 2;
    }
  );

  const validadorDecimal5_2 = helpers.withMessage(
    "O valor deve ter no máximo 5 dígitos com até 2 casas decimais",
    (value) => {
      if (!value) return true;
      const strValue = String(value).replace(',', '.');
      const parts = strValue.split('.');
      const integerPart = parts[0] || '';
      const decimalPart = parts[1] || '';
      return integerPart.length <= 3 && decimalPart.length <= 2;
    }
  );

  const rules = {
    orcamento: {
      id_cli_fk: { 
        required: helpers.withMessage("O cliente é obrigatório", required),
        maxLength: helpers.withMessage("O identificador do cliente não pode ter mais de 36 caracteres", maxLength(36))
      },
      valor_final: { 
        required: helpers.withMessage("O valor final é obrigatório", required),
        decimal: helpers.withMessage("O valor final deve ser um número decimal", decimal),
        minValue: helpers.withMessage("O valor final deve ser maior ou igual a 0", minValue(0)),
        decimal20_2: validadorDecimal20_2
      },
      forma_pagamento: {
        maxLength: helpers.withMessage("A forma de pagamento não pode ter mais de 100 caracteres", maxLength(100))
      },
      prazo: {
        required: helpers.withMessage("O prazo é obrigatório", required),
        maxLength: helpers.withMessage("O prazo não pode ter mais de 100 caracteres", maxLength(100))
      },
      observacao: {
        maxLength: helpers.withMessage("A observação não pode ter mais de 100 caracteres", maxLength(100))
      },
      percentual_comissao: {
        decimal: helpers.withMessage("O percentual de comissão deve ser um número decimal", decimal),
        minValue: helpers.withMessage("O percentual de comissão não pode ser negativo", validadorDescontoMinimo),
        maxValue: helpers.withMessage("O percentual de comissão não pode exceder 100%", validadorDescontoMaximo),
        decimal5_2: validadorDecimal5_2
      }
    },
  };

  const produtoRules = {
    id_pro_fk: { 
      required: helpers.withMessage("Selecione o produto", required),
      maxLength: helpers.withMessage("O identificador do produto não pode ter mais de 36 caracteres", maxLength(36))
    },
    valor_unitario: { 
      required: helpers.withMessage("O valor unitário é obrigatório", required),
      minValue: helpers.withMessage("O valor unitário deve ser maior que zero", minValue(0.01)),
      decimal20_2: validadorDecimal20_2
    },
    quantidade: { 
      required: helpers.withMessage("A quantidade é obrigatória", required),
      minValue: helpers.withMessage("A quantidade mínima é 1", minValue(1))
    }
  };

  const v$ = useVuelidate(rules, state);
  const produtoV$ = useVuelidate(produtoRules, produtoForm);

  let loadingToastShown = false;
  if (!loadingToastShown) {
      loadingToastShown = true;
    }
    
  async function carregarClientes() {    
    try {
      const response = await requisicaoAPI('clientes/buscar/nome', {
        method: 'GET',
        headers: getAuthHeader()
      });
      state.listaClientes = response;
    } catch {
      state.listaClientes = [];
    }
  }

  async function carregarProdutos() {
    try {
        const response = await requisicaoAPI('produtos', {
          method: 'GET',
          headers: getAuthHeader()
        });
        state.listaProdutos = response.dado.map((prod: any) => ({
          id: prod.id,
          nome: `${prod.marca || "Sem Marca"} - ${prod.modelo || "Sem Modelo"}`,
          valor_completo: parseFloat(prod.valor_completo) || 0,
          valor_medio: parseFloat(prod.valor_medio) || 0,
          valor_reduzido: parseFloat(prod.valor_reduzido) || 0,
          valor_exclusivo: parseFloat(prod.valor_exclusivo) || 0,
          foto: (() => {
              try {
                  return JSON.parse(prod.foto || "[]");
              } catch {
                  return [];
              }
          })(),
          descricao_tecnica: prod.descricao_tecnica || "Sem descrição",
        }));
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        state.listaProdutos = [];
    }
  }

  async function carregarOrcamento() {
    if (!id) return;
    state.isLoad = true;

    try {
      const data = await requisicaoAPI(`orcamentos/${id}`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      state.orcamento = {
        id_cli_fk: data.id_cli_fk,
        id_usu_fk: getIdFromToken(),
        valor_final: data.valor_final,
        forma_pagamento: data.forma_pagamento ?? "nao_selecionado",
        prazo: ajustarDataLocalUTC(data.prazo),
        observacao: data.observacao,
        percentual_comissao: Number(data.percentual_comissao),
        parcelas: data.parcelas || 1,
        codigo_finame: data.codigo_finame || "",
      };

      state.produtosOrcamento = data.produtosOrcamento.map((produto: any) => ({
        id_pro_fk: produto.produto.id,
        valor_unitario: produto.valor_unitario,
        valor_final_unitario: produto.valor_final_unitario,
        quantidade: produto.quantidade,
      }));

      const cliente = data.cliente;
      if (cliente) {
        const existingClient = state.listaClientes.find(cli => cli.id === cliente.id);
        if (!existingClient) {
          state.listaClientes.push({
            id: cliente.id,
            nome: cliente.nome,
            documento: cliente.documento,
            telefone: cliente.telefone,
          });
        } else {
          existingClient.documento = cliente.documento;
        }
      }
    } catch (error) {
      console.error("Erro ao carregar orçamento:", error);
      proxy?.$toast.error("Erro ao carregar dados.");
    } finally {
      state.isLoad = false;
    }
  }

  async function carregarComissaoVendedor() {
    try {
      const idUsuario = getIdFromToken();
      if (!idUsuario) return;
      const data = await requisicaoAPI(`usuarios/${idUsuario}`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      if (data && data.percentual_comissao !== undefined && data.percentual_comissao !== null) {
        state.orcamento.percentual_comissao = Number(data.percentual_comissao);
        comissaoMaxima.value = Number(data.percentual_comissao);
      }
    } catch (error) {
      state.orcamento.percentual_comissao = 0;
      comissaoMaxima.value = 0;
    }
  }

  function ajustarDataLocalUTC(dataString: string): string {
    if (!dataString) return "";
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
      return dataString;
    }
    
    try {
      const data = new Date(dataString);
      
      const ano = data.getUTCFullYear();
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const dia = String(data.getUTCDate()).padStart(2, '0');
      
      return `${ano}-${mes}-${dia}`;
    } catch (e) {
      console.error("Erro ao ajustar data:", e);
      return dataString;
    }
  }

  async function enviarFormularioOrcamento() {
    v$.value.$touch();

    if (v$.value.$invalid) {
      proxy?.$toast.error("Preencha todos os campos obrigatórios");
      return null;
    }

    if (state.produtosOrcamento.length === 0) {
      proxy?.$toast.error("Adicione pelo menos um produto ao orçamento");
      return null;
    }

    if (state.orcamento.observacao && state.orcamento.observacao.length > 100) {
      proxy?.$toast.error("A observação não pode ter mais de 100 caracteres");
      return null;
    }

    try {
      state.isLoad = true;
      calcularValores();

      const clienteSelecionado = state.listaClientes.find(
        cli => cli.id === state.orcamento.id_cli_fk
      );

      let idClienteParaSalvar = "";
      if (clienteSelecionado) {
        idClienteParaSalvar = clienteSelecionado.id;
      } else {
        idClienteParaSalvar = state.orcamento.id_cli_fk;
      }

      const payload = {
        ...state.orcamento,
        id_cli_fk: idClienteParaSalvar,
        id_usu_fk: getIdFromToken(),
        valor_final: String(state.orcamento.valor_final),
        forma_pagamento: state.orcamento.forma_pagamento || "nao_selecionado",
        criadoEm: new Date().toISOString(),
        prazo: state.orcamento.prazo,
        observacao: state.orcamento.observacao,
        percentual_comissao: Number(state.orcamento.percentual_comissao),
        parcelas: state.orcamento.parcelas,
        codigo_finame: state.orcamento.codigo_finame,
      };

      let orcamentoId;
      const headers = getAuthHeader();

      if (id) {
        await requisicaoAPI(`orcamentos/${id}`, {
          method: 'PATCH',
          headers,
          data: payload
        });
        orcamentoId = id;
      } else {
        const response = await requisicaoAPI('orcamentos', {
          method: 'POST',
          headers,
          data: payload
        });
        orcamentoId = response.id;
      }

      return orcamentoId;
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      proxy?.$toast.error(`Erro ao ${id ? 'atualizar' : 'cadastrar'} orçamento.`);
      return null;
    } finally {
      state.isLoad = false;
    }
  }

  async function enviarFormularioProdutosOrcamento(orcamentoId: string | number) {
    try {
      state.isLoad = true;
      const headers = getAuthHeader();

      if (id) {
        const orcamentoExistente = await requisicaoAPI(`orcamentos/${id}`, {
          method: 'GET',
          headers
        });
        if (orcamentoExistente.produtosOrcamento && orcamentoExistente.produtosOrcamento.length > 0) {
          await Promise.all(
            orcamentoExistente.produtosOrcamento.map((produto: { id: string | number }) =>
              requisicaoAPI(`orcamentos/produtos/${produto.id}`, {
                method: 'DELETE',
                headers
              })
            )
          );
        }
      }

      await Promise.all(
        state.produtosOrcamento.map(produto => {
          const produtoPayload = {
            valor_unitario: String(produto.valor_unitario),
            valor_final_unitario: String(produto.valor_final_unitario),
            quantidade: produto.quantidade,
            id_pro_fk: produto.id_pro_fk,
          };
          return requisicaoAPI(`orcamentos/${orcamentoId}/produtos`, {
            method: 'POST',
            headers,
            data: produtoPayload
          });
        })
      );

      return true;
    } catch (error) {
      console.error("Erro ao salvar produtos do orçamento:", error);
      proxy?.$toast.error(`Erro ao ${id ? 'atualizar' : 'cadastrar'} produtos do orçamento.`);
      return false;
    } finally {
      state.isLoad = false;
    }
  }

  const reiniciarFormulario = () => {
    state.orcamento = {
      id_cli_fk: "",
      id_usu_fk: "",
      valor_final: "",
      forma_pagamento: "nao_selecionado",
      prazo: "",
      observacao: "",
      percentual_comissao: 0,
      parcelas: 1,
      codigo_finame: "",
    };
    state.produtosOrcamento = [];
    v$.value.$reset();
  }

  const save = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) {
      proxy?.$toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (state.produtosOrcamento.length === 0) {
      proxy?.$toast.error("Adicione pelo menos um produto ao orçamento");
      return;
    }
    try {
      state.isLoad = true;
      const orcamentoId = await enviarFormularioOrcamento();
      if (!orcamentoId) {
        state.isLoad = false;
        proxy?.$toast.error('Erro ao salvar orçamento');
        return;
      }
      const produtosOk = await enviarFormularioProdutosOrcamento(orcamentoId);
      state.isLoad = false;
      if (!produtosOk) {
        proxy?.$toast.error('Erro ao salvar produtos do orçamento');
        return;
      }
      proxy?.$toast.success(id ? "Orçamento atualizado com sucesso!" : "Orçamento cadastrado com sucesso!");
      reiniciarFormulario();
      
      proxy?.$router.push({ name: 'consultar-orcamento' });
    } catch (error) {
      state.isLoad = false;
      console.error(error);
      proxy?.$toast.error('Erro ao salvar orçamento');
    }
  }

  function adicionarProduto() {
    produtoV$.value.$touch();
    if (produtoV$.value.$invalid) {
      Object.keys(produtoFormError).forEach(k => {
        const field = produtoV$.value[k];
        produtoFormError[k as keyof typeof produtoFormError] = field.$errors.length > 0 ? field.$errors[0].$message : "";
      });
      return;
    }

    const valorUnitario = Number(produtoForm.valor_unitario) || 0;
    const stringValorUnitario = String(valorUnitario);
    const partsValorUnitario = stringValorUnitario.split('.');
    if (partsValorUnitario[0].length > 18 || (partsValorUnitario[1] && partsValorUnitario[1].length > 2)) {
      produtoFormError.valor_unitario = "O valor unitário deve ter no máximo 20 dígitos com até 2 casas decimais";
      return;
    }

    Object.keys(produtoFormError).forEach(k => {
      const key = k as keyof typeof produtoFormError;
      produtoFormError[key] = "";
    });

    const valorFinalUnitario = (Number(produtoForm.valor_unitario) || 0);
    
    state.produtosOrcamento.push({
      ...produtoForm,
      valor_final_unitario: valorFinalUnitario,
    });
    
    calcularValores();
    
    produtoForm.id_pro_fk = "";
    produtoForm.valor_unitario = "";
    produtoForm.valor_final_unitario = "";
    produtoForm.quantidade = 1;
  }

  function removerProduto(idx: number) {
    state.produtosOrcamento.splice(idx, 1);
    proxy?.$toast.success("Produto removido com sucesso!");
  }

  function nomeProduto(id: string) {
    const produto = state.listaProdutos.find(p => p.id === id);
    return produto ? produto.nome : "";
  }

  function atualizarValorUnitario() {
    nextTick(() => {
        const produtoSelecionado = state.listaProdutos.find(
            (pro) => pro.id === produtoForm.id_pro_fk
        );
        if (produtoSelecionado) {
            produtoForm.quantidade = 1;
        } else {
            produtoForm.valor_unitario = "";
        }
        state.orcamento.forma_pagamento = "nao_selecionado";
        state.orcamento.parcelas = 1;
    });
  }

  function calcularValores() {
    let valorFinal = state.produtosOrcamento.reduce((sum, prod) => {
      const valorPorUnidade = parseFloat(String(prod.valor_final_unitario)) || 0;
      return sum + valorPorUnidade * (prod.quantidade || 1);
    }, 0);

    state.orcamento.valor_final = valorFinal.toFixed(2);
  }

  function gerarPdfBlob() {
    calcularValores();
    const { blob } = gerarPdfOrcamento({
      orcamento: state.orcamento,
      produtosOrcamento: state.produtosOrcamento,
      listaClientes: state.listaClientes,
      listaProdutos: state.listaProdutos,
      nomeProduto,
    });
    return blob;
  }

  function gerarNomeArquivoPDF() {
    const cliente = state.listaClientes.find(cli => cli.id === state.orcamento.id_cli_fk);
    const nomeCliente = cliente?.nome || 'Cliente';
    const dataFormatada = new Date().toISOString().split('T')[0];
    return `Orcamento_${nomeCliente.replace(/\s+/g, '_')}_${dataFormatada}.pdf`;
  }

  const totalProdutos = computed(() => {
    return state.produtosOrcamento.reduce((sum, p) => {
      const valor = Number(p.valor_final_unitario) || 0;
      return sum + valor * p.quantidade;
    }, 0);
  });

  onMounted(() => {
    loadingToastShown = false;
    
    carregarComissaoVendedor();
    carregarClientes();
    carregarProdutos();
    if (id) carregarOrcamento();
    carregarComissaoVendedor();
    calcularValores();
  });

  return {
    state,
    v$,
    produtoV$,
    save,
    produtoForm,
    produtoFormError,
    adicionarProduto,
    removerProduto,
    nomeProduto,
    totalProdutos,
    atualizarValorUnitario,
    calcularValores,
    gerarPdfBlob,
    gerarNomeArquivoPDF,
    carregarOrcamento,
    carregarClientes, 
    carregarProdutos,
    comissaoMaxima
  };
}