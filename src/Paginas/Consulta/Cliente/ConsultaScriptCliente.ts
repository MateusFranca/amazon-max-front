import { ref, onMounted, getCurrentInstance } from "vue";
import { getAuthHeader, getCargoUsuario } from "../../../utils/tokenUtils.ts";
import { requisicaoAPI } from "../../../api/comunicador";
import { formatarEndereco, formatarDocumentoCpfCnpj, formatarTelefone, formatarDataBrasileira } from "../../../utils/formattersUtils.ts";

export function consultaScriptCliente() {
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
  const filtro = ref("");
  const cargoUsuario = getCargoUsuario();

  const columns = [
    { header: 'Nome',    value: 'nome'    },
    { header: 'Documento',   value: 'documento'   },
    { header: 'Telefone',   value: 'telefone'   },
    { header: 'Data de Nascimento',   value: 'nascimento'   },
    { header: 'Endereço', value: 'enderecoCompleto' },
    { header: 'Ações',   value: 'acoes'   },
  ];

  const buscar = async ({ pagina = 1, limite = meta.value.itens_por_pagina, filtro = '' } = {}) => {
    loading.value = true;
    try {
      const data = await requisicaoAPI('clientes', {
        method: 'GET',
        headers: getAuthHeader(),
        params: { pagina, limite, filtro }
      });

      let fetchedItems = Array.isArray(data.dado)
        ? data.dado.map((item: any) => ({
            ...item,
            telefone: formatarTelefone(item.telefone),
            documento: formatarDocumentoCpfCnpj(item.documento),
            nascimento: formatarDataBrasileira(item.nascimento),
            enderecoCompleto: formatarEndereco(item),
          })) : [];

      if (filtro) {
        fetchedItems = fetchedItems.filter((item: any) =>
          (item.nome || "").toLowerCase().includes(filtro.toLowerCase()) ||
          (item.documento || "").toLowerCase().includes(filtro.toLowerCase())
        );
      }

      items.value = fetchedItems;

      const m = data.meta || {};
      meta.value = {
        total_itens:       m.total_itens     ?? fetchedItems.length,
        total_paginas:     m.total_paginas   ?? 1,
        pagina_atual:      m.pagina_atual    ?? pagina,
        itens_por_pagina:  m.itens_por_pagina?? limite,
      };
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      proxy?.$toast.error("Erro ao carregar clientes. Tente novamente.");
    } finally {
      loading.value = false;
    }
  };

  const excluir = async (id: string) => {
    try {
      const response = await requisicaoAPI(`clientes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (response.status === 204 || response.status === 200 || response === true) {
        items.value = items.value.filter((item) => item.id !== id);
        meta.value.total_itens -= 1;
        await buscar();
        proxy?.$toast.success("Cliente excluído com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      proxy?.$toast.error("Falha ao excluir o cliente. Tente novamente.");
    }
  };

  const ativar = async (id: string) => {
    try {
      const response = await requisicaoAPI(`clientes/ativar/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });

      if (response.status === 200 || response === true) {
        await buscar();
        proxy?.$toast.success("Cliente ativado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao ativar cliente:", error);
      proxy?.$toast.error("Falha ao ativar o cliente. Tente novamente.");
    }
  };

  onMounted(() => { buscar(); });

  return { columns, items, meta, loading, filtro, buscar, excluir, ativar, cargoUsuario };
}
