import { ref, getCurrentInstance } from 'vue';
import { getAuthHeader } from '../utils/tokenUtils.ts';
import { requisicaoAPI } from '../api/comunicador.ts';

interface Estado {
  id_est_fk: number | string;
  nome: string;
  uf_sta: string;
}

interface Cidade {
  id: number | string;
  id_est_fk: number | string;
  nome: string;
}

interface EnderecoShape {
  id_est_fk: string | number;
  id_cid_fk: string | number;
  rua: string;
  bairro: string;
  complemento: string;
  cep: string;
}

export function useEnderecoUtils() {
  const { proxy } = getCurrentInstance()!;

  const estados = ref<Estado[]>([]);
  const cidades = ref<Cidade[]>([]);
  const skipCityLoad = ref(false);

  async function carregarEstados() {
    try {
      const data = await requisicaoAPI('estados', {
        method: 'GET',
        headers: getAuthHeader()
      });
      estados.value = data.map((e: any) => ({
        id_est_fk: e.id,
        nome: e.nome,
        uf_sta: e.uf,
      }));
    } catch (err) {
      proxy?.$toast.error('Erro ao carregar estados');
    }
  }

  async function carregarCidades() {
    try {
      const data = await requisicaoAPI('cidades', {
        method: 'GET',
        headers: getAuthHeader()
      });
      cidades.value = data.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        id_est_fk: c.id_est_fk,
      }));
    } catch (err) {
      proxy?.$toast.error('Erro ao carregar cidades');
    }
  }

  async function carregarCidadesPorEstado(idEstado: string | number) {
    try {
      const data = await requisicaoAPI(`cidades/estado/${idEstado}`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      cidades.value = data.map((c: any) => ({ id: c.id, nome: c.nome, id_est_fk: c.id_est_fk }));
    } catch (err) {
      proxy?.$toast.error('Erro ao carregar cidades do estado');
    }
  }

  async function pesquisarCep(endereco: EnderecoShape) {
    skipCityLoad.value = true;
    try {
      const cepLimpo = endereco.cep.replace(/\D/g, '');
      const data = await requisicaoAPI(`cep/${cepLimpo}`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (!data) {
        proxy?.$toast.error('CEP não encontrado');
        return;
      }

      const { state: ufApi, city: cityName, neighborhood_add, street_add, complemento } = data;

      const est = estados.value.find(e => e.uf_sta.toUpperCase() === ufApi.toUpperCase());
      if (est) {
        endereco.id_est_fk = est.id_est_fk;
      } else {
        proxy?.$toast.warning('Estado retornado pelo CEP não está na lista');
      }

      await carregarCidadesPorEstado(endereco.id_est_fk);

      const cid = cidades.value.find(
        c => c.nome.toUpperCase() === cityName.toUpperCase() && c.id_est_fk === endereco.id_est_fk
      );
      if (cid) {
        endereco.id_cid_fk = cid.id;
      } else {
        proxy?.$toast.warning('Cidade retornada pelo CEP não está na lista');
      }

      endereco.bairro = neighborhood_add || '';
      endereco.rua = street_add || '';
      endereco.complemento = complemento || '';

      proxy?.$toast.success('CEP encontrado e dados preenchidos');
    } catch (err) {
      console.error('Erro em pesquisarCep:', err);
      proxy?.$toast.error('Erro ao buscar CEP');
    } finally {
      skipCityLoad.value = false;
    }
  }

  return {
    estados,
    cidades,
    carregarEstados,
    carregarCidades,
    carregarCidadesPorEstado,
    pesquisarCep,
    skipCityLoad
  };
}
