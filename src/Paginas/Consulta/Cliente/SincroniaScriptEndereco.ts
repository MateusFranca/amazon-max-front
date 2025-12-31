import axios from "axios";
import { getAuthHeader } from "../../../utils/tokenUtils";
import { API_BASE_URL, API_REMOTA_URL } from "../../../../api-config";

export async function buscarDessincronizadosLocalEndereco() {
  // 1. Buscar endereços locais sem versão (não sincronizados)
  const responseEnderecosLocaisNaoSincronizados = await axios.get(
    `${API_BASE_URL}/enderecos/sincronizar/buscar-dessincronizados/local?versao=false`,
    { headers: getAuthHeader() }
  );

  if (responseEnderecosLocaisNaoSincronizados.data.length >= 1) {
    // 2. Criar esses endereços no servidor remoto
    const responseEnderecosCriadosNoServidor = await axios.post(
      `${API_REMOTA_URL}/enderecos/sincronizar/local?modo=criar`,
      responseEnderecosLocaisNaoSincronizados.data,
      { headers: getAuthHeader() }
    );

    // 3. Atualizar local com os dados vindos do servidor (com versão)
    await axios.post(
      `${API_BASE_URL}/enderecos/sincronizar/local?modo=atualizar`,
      responseEnderecosCriadosNoServidor.data,
      { headers: getAuthHeader() }
    );
  }

  // 4. Buscar endereços locais com versão (possivelmente desatualizados)
  const responseVersoesLocais = await axios.get(
    `${API_BASE_URL}/enderecos/sincronizar/buscar-dessincronizados/local?versao=true`,
    { headers: getAuthHeader() }
  );

  // 5. Verificar com o servidor quais dessas versões estão desatualizadas
  const responseEnderecosDesatualizados = await axios.post(
    `${API_REMOTA_URL}/enderecos/sincronizar/dessincronizados/servidor`,
    responseVersoesLocais.data,
    { headers: getAuthHeader() }
  );

  // 6. Atualizar local com os dados corrigidos do servidor
  if (responseEnderecosDesatualizados.data.length >= 1) {
    const enderecosParaAtualizar = responseEnderecosDesatualizados.data.map((end: any) => ({
      id: end.id,
      rua: end.rua,
      bairro: end.bairro,
      cep: end.cep,
      numero: end.numero,
      complemento: end.complemento,
      id_cid_fk: end.id_cid_fk,
      criadoEm: end.criadoEm,
      atualizadoEm: end.atualizadoEm,
      deletadoEm: end.deletadoEm,
      versao: end.versao,
    }));

    await axios.post(
      `${API_BASE_URL}/enderecos/sincronizar/local?modo=atualizar`,
     enderecosParaAtualizar,
      { headers: getAuthHeader() }
    );
  }

  // 7. Buscar endereços locais modificados após a última sincronização
  const responseEnderecosLocaisAtualizados = await axios.get(
    `${API_BASE_URL}/enderecos/sincronizar/atualizacoes/local`,
    { headers: getAuthHeader() }
  );

  // 8. Enviar esses endereços atualizados do local para o servidor remoto
  if (responseEnderecosLocaisAtualizados.data.length > 0) {
    await axios.post(
      `${API_REMOTA_URL}/enderecos/sincronizar/local?modo=atualizar`,
      responseEnderecosLocaisAtualizados.data,
      { headers: getAuthHeader() }
    );
  }

  // 9. Buscar os mesmos endereços do servidor (com nova versão) para atualizar localmente
  const responseVersoesAposAtualizacao = await axios.get(
    `${API_REMOTA_URL}/enderecos/sincronizar/buscar-dessincronizados/local?versao=true`,
    { headers: getAuthHeader() }
  );

  const responseEnderecosComVersoesAtualizadas = await axios.post(
    `${API_REMOTA_URL}/enderecos/sincronizar/dessincronizados/servidor`,
    responseVersoesAposAtualizacao.data,
    { headers: getAuthHeader() }
  );

  await axios.post(
    `${API_BASE_URL}/enderecos/sincronizar/local?modo=atualizar`,
    responseEnderecosComVersoesAtualizadas.data,
    { headers: getAuthHeader() }
  );

  return true;
}