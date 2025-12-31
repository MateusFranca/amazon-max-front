import { ref, onMounted, getCurrentInstance } from "vue";
import { getAuthHeader, getCargoUsuario, getUserId } from "../../../utils/tokenUtils.ts";
import { formatarDataBrasileira, formatarDocumento, formatarTelefone } from "../../../utils/formatters.ts";
import { requisicaoAPI } from '../../../api/comunicador';

export function consultaScriptOrcamento() {
  const instance = getCurrentInstance();
  const proxy = instance?.proxy as any;
  const items = ref<any[]>([]);
  const meta = ref({
    total_itens: 0,
    total_paginas: 1,
    pagina_atual: 1,
    itens_por_pagina: 10,
  });
  const loading = ref(false);
  const cargoUsuario = getCargoUsuario();
  const userId = getUserId();

  const columns = [
    { header: '', value: 'checkbox' },
    { header: 'Cliente', value: 'cliente' },
    { header: 'Documento', value: 'documento' },
    { header: 'Telefone', value: 'telefone' },
    { header: 'Data Emissão', value: 'data_emissao' },
    { header: 'Data Prazo', value: 'data_prazo' },
    { header: 'Valor Final', value: 'valor_final' },
    { header: 'Ações', value: 'acoes' },
  ];

  const buscar = async ({ pagina = 1, limite = meta.value.itens_por_pagina, filtro: filtroBusca = "" } = {}) => {
    loading.value = true;
    try {
      const params = new URLSearchParams({
        pagina: pagina.toString(),
        limite: limite.toString(),
        textoBusca: filtroBusca,
        usuarioId: userId,
        cargo: cargoUsuario
      });
      const data = await requisicaoAPI(`orcamentos?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      let fetchedItems = Array.isArray(data.dado) ? data.dado.map((item: any) => {
        const clienteNome = item.cliente?.nome || 'N/A';
        const clienteDocumento = item.cliente?.documento || 'N/A';
        const clienteTelefone = item.cliente?.telefone || 'N/A';
        const clienteNascimento = item.cliente?.nascimento || 'N/A';

        return {
          ...item,
          data_criacao: formatarDataBrasileira(item.criadoEm),
          documento: clienteDocumento !== 'N/A' ? formatarDocumento(clienteDocumento) : 'N/A',
          telefone: clienteTelefone !== 'N/A' ? formatarTelefone(clienteTelefone) : 'N/A',
          cliente: clienteNome,
          cliente_nascimento: clienteNascimento,
          status: item.deletadoEm ? 'Inativo' : 'Ativo',
          produtosOrcamento: item.produtosOrcamento?.map((produto: any) => ({
            modelo: produto?.produto?.modelo || 'N/A',
            quantidade: produto?.quantidade || 0,
            valor_unitario: produto?.valor_unitario || '0.00',
            valor_final_unitario: produto?.valor_final_unitario || '0.00',
            produto: produto?.produto || null,
            id_pro_fk: produto.id_pro_fk
          })) || [],
        };
      }) : [];

      if (filtroBusca) {
        fetchedItems = fetchedItems.filter((item: any) => 
          (item.cliente || "").toLowerCase().includes(filtroBusca.toLowerCase()) ||
          (item.documento || "").toLowerCase().includes(filtroBusca.toLowerCase()) ||
          (item.telefone || "").toLowerCase().includes(filtroBusca.toLowerCase()) ||
          (item.forma_pagamento || "").toLowerCase().includes(filtroBusca.toLowerCase()) ||
          (item.valor_final || "").toString().includes(filtroBusca)
        );
      }

      const totalItems = fetchedItems.length;
      const start = (pagina - 1) * limite;
      const paginatedItems = fetchedItems.slice(start, start + limite);

      items.value = paginatedItems;
      meta.value = {
        total_itens: totalItems,
        total_paginas: Math.ceil(totalItems / limite),
        pagina_atual: pagina,
        itens_por_pagina: limite,
      };
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
      proxy?.$toast.error("Erro ao carregar orçamentos.");
      items.value = [];
      meta.value = {
        total_itens: 0,
        total_paginas: 1,
        pagina_atual: pagina,
        itens_por_pagina: limite,
      };
    } finally {
      loading.value = false;
    }
  };

  const excluir = async (id: string) => {
    try {
       await requisicaoAPI(`orcamentos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      items.value = items.value.filter((item) => item.id !== id);
      meta.value.total_itens -= 1;
      await buscar();
      proxy?.$toast.success("Orçamento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir orçamento:", error);
      proxy?.$toast.error("Falha ao excluir o orçamento. Tente novamente.");
    }
  };

  const ativar = async (id: string) => {
    try {
      await requisicaoAPI(`orcamentos/ativar/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        data: {}
      });
      await buscar();
      proxy?.$toast.success("Orçamento ativado com sucesso!");
    } catch (error) {
      console.error("Erro ao ativar orçamento:", error);
      proxy?.$toast.error("Falha ao ativar o orçamento. Tente novamente.");
    }
  };

  const visualizar = (orcamento: any) => {
    proxy?.$emit?.('visualizar-orcamento', orcamento);
  };

  onMounted(() => {
    buscar();
    window.addEventListener('online', () => {
      buscar();
    });
  });

  return { columns, items, meta, loading, buscar, excluir, ativar, cargoUsuario , visualizar };
}