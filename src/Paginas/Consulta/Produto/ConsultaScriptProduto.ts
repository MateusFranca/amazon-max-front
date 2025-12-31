import { ref,  onMounted, getCurrentInstance } from "vue";
import { requisicaoAPI } from "../../../api/comunicador.ts";
import { getAuthHeader, getCargoUsuario } from "../../../utils/tokenUtils.ts";
import { API_REMOTA_URL } from "../../../../api-config.ts"
import { formatToBRL } from '../../../utils/currencyMaskUtils.ts';

export function consultaScriptProduto() {
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
    { header: 'Marca', value: 'marca' },
    { header: 'Modelo', value: 'modelo' },
    { header: 'Valor Completo', value: 'valor_completo' },
    { header: 'Descrição Técnica', value: 'descricao_tecnica' },
    { header: 'Ações', value: 'acoes' },
  ];

  const buscar = async ({ pagina = 1, limite = 10, filtro = '' } = {}) => {
      loading.value = true;
      try {
        const data = await requisicaoAPI('produtos', {
          method: 'GET',
          headers: getAuthHeader(),
          params: { pagina, limite, filtro }
        });

        let produtos = data.dado || [];

        if (filtro) {
          produtos = produtos.filter((item: any) =>
            (item.marca || "").toLowerCase().includes(filtro.toLowerCase()) ||
            (item.modelo || "").toLowerCase().includes(filtro.toLowerCase())
          );
        }
  
        items.value = (produtos || []).map((prod: any) => {
          let fotoArray: any[] = [];
          if (Array.isArray(prod.foto)) {
            fotoArray = prod.foto;
          } else if (typeof prod.foto === "string") {
            try {
              fotoArray = JSON.parse(prod.foto);
            } catch {
              fotoArray = [];
            }
          }
  
          return {
            ...prod,
            valor_completo: formatToBRL(prod.valor_completo),
            valor_parcelado: formatToBRL(prod.valor_parcelado),
            fotosURLs: fotoArray.map((f: any) => `${API_REMOTA_URL}${f.linkFoto}`),
          };
        });
  
        const m = data.meta || {};
        meta.value = {
          total_itens: m.total_itens || items.value.length,
          total_paginas: m.total_paginas || 1,
          pagina_atual: m.pagina_atual || pagina,
          itens_por_pagina: m.itens_por_pagina || limite,
        };
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      } finally {
        loading.value = false;
      }
  };

  const excluir = async (id: string) => {
      try {
          const response = await requisicaoAPI(`produtos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
          });

          if (response.status === 204 || response.status === 200 || response === true) {
            items.value = items.value.filter((item) => item.id !== id);
            meta.value.total_itens -= 1;
            await buscar();
            proxy?.$toast.success("Produto excluído com sucesso!");
          }
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        proxy?.$toast.error("Falha ao excluir o produto. Tente novamente.");
      }
  };

  const ativar = async (id: string) => {
    try {
      const response = await requisicaoAPI(`produtos/ativar/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });

      if (response.status === 200 || response === true) {
        await buscar();
        proxy?.$toast.success("Produto ativado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao ativar produto:", error);
      proxy?.$toast.error("Falha ao ativar o produto. Tente novamente.");
    }
  };

  onMounted(() => buscar());

  return { columns, items, meta, loading, filtro, buscar, excluir, ativar, cargoUsuario };
}
