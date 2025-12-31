import { ref, onMounted, getCurrentInstance } from "vue";
import { getAuthHeader, getCargoUsuario } from "../../../utils/tokenUtils.ts";
import { requisicaoAPI } from "../../../api/comunicador.ts";

export function consultaScriptUsuario() {
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

  const columns = ref([
    { header: 'Nome',  value: 'nome' },
    { header: 'Email', value: 'email' },
    { header: 'Cargo', value: 'cargo' },
    { header: 'Ações', value: 'acoes' },
  ]);

  const buscar = async ({ pagina = 1, limite = meta.value.itens_por_pagina, filtro = '' } = {}) => {
    loading.value = true;
    try {
      const usuarios = await requisicaoAPI('usuarios', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
      });

      let listaUsuarios = Array.isArray(usuarios.dado) ? usuarios.dado : [];

      if (filtro) {
        listaUsuarios = listaUsuarios.filter((item: any) =>
          (item.nome || "").toLowerCase().includes(filtro.toLowerCase()) ||
          (item.email || "").toLowerCase().includes(filtro.toLowerCase())
        );
      }

      items.value = listaUsuarios;

      const m = usuarios.meta || {};
      meta.value = {
        total_itens:       m.total_itens     ?? listaUsuarios.length,
        total_paginas:     m.total_paginas   ?? 1,
        pagina_atual:      m.pagina_atual    ?? pagina,
        itens_por_pagina:  m.itens_por_pagina?? limite,
      };
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      proxy?.$toast.error("Erro ao carregar usuários");
    } finally {
      loading.value = false;
    }
  };

  const excluir = async (id: string) => {
    try {
      await requisicaoAPI(`usuarios/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      await buscar();
      proxy?.$toast.success("Usuário excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      proxy?.$toast.error("Falha ao excluir o usuário. Tente novamente.");
    }
  };

  const ativar = async (id: string) => {
    try {
      await requisicaoAPI(`usuarios/ativar/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });

      await buscar();
      proxy?.$toast.success("Usuário ativado com sucesso!");
    } catch (error) {
      console.error("Erro ao ativar usuário:", error);
      proxy?.$toast.error("Falha ao ativar o usuário. Tente novamente.");
    }
  };

  onMounted(async () => {
    await buscar();
  });

  return { columns, items, meta, loading, filtro, buscar, excluir, ativar, cargoUsuario };
}
