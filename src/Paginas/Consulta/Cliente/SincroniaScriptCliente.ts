import axios from "axios";
import { getAuthHeader } from "../../../utils/tokenUtils";
import { API_BASE_URL, API_REMOTA_URL } from "../../../../api-config";

export async function buscarDessincronizadosLocal() {
  // 1. Buscar clientes locais sem versão (não sincronizados)
  const responseClientesLocaisNaoSincronizados = await axios.get(
    `${API_BASE_URL}/clientes/sincronizar/buscar-dessincronizados/local?versao=false`,
    { headers: getAuthHeader() }
  );

  if (responseClientesLocaisNaoSincronizados.data.length >= 1) {
    // 2. Criar esses clientes no servidor remoto
    const responseClientesCriadosNoServidor = await axios.post(
      `${API_REMOTA_URL}/clientes/sincronizar/local?modo=criar`,
      responseClientesLocaisNaoSincronizados.data,
      { headers: getAuthHeader() }
    );

    // 3. Atualizar local com os dados vindos do servidor (com versão)
    await axios.post(
      `${API_BASE_URL}/clientes/sincronizar/local?modo=atualizar`,
      responseClientesCriadosNoServidor.data,
      { headers: getAuthHeader() }
    );
  }

  // 4. Buscar clientes locais com versão (possivelmente desatualizados)
  const responseVersoesLocais = await axios.get(
    `${API_BASE_URL}/clientes/sincronizar/buscar-dessincronizados/local?versao=true`,
    { headers: getAuthHeader() }
  );

  // 5. Verificar com o servidor quais dessas versões estão desatualizadas
  const responseClientesDesatualizados = await axios.post(
    `${API_REMOTA_URL}/clientes/sincronizar/dessincronizados/servidor`,
    responseVersoesLocais.data,
    { headers: getAuthHeader() }
  );

  // 6. Atualizar local com os dados corrigidos do servidor
  if (responseClientesDesatualizados.data.length >= 1) {
    const clientesParaAtualizar = responseClientesDesatualizados.data.map((cli: any) => ({
      id: cli.id,
      nome: cli.nome,
      documento: cli.documento,
      telefone: cli.telefone,
      nascimento: cli.nascimento,
      criadoEm: cli.criadoEm,
      atualizadoEm: cli.atualizadoEm,
      deletadoEm: cli.deletadoEm,
      versao: cli.versao,
      id_end_fk: cli.id_end_fk,
    }));

    await axios.post(
      `${API_BASE_URL}/clientes/sincronizar/local?modo=atualizar`,
      clientesParaAtualizar,
      { headers: getAuthHeader() }
    );
  }

  // 7. Buscar clientes locais modificados após a última sincronização
  const responseClientesLocaisAtualizados = await axios.get(
    `${API_BASE_URL}/clientes/sincronizar/atualizacoes/local`,
    { headers: getAuthHeader() }
  );

  // 8. Enviar esses clientes atualizados do local para o servidor remoto
  if (responseClientesLocaisAtualizados.data.length > 0) {
    await axios.post(
      `${API_REMOTA_URL}/clientes/sincronizar/local?modo=atualizar`,
      responseClientesLocaisAtualizados.data,
      { headers: getAuthHeader() }
    );
  }

  // 9. Buscar os mesmos clientes do servidor (com nova versão) para atualizar localmente
  const responseVersoesAposAtualizacao = await axios.get(
    `${API_REMOTA_URL}/clientes/sincronizar/buscar-dessincronizados/local?versao=true`,
    { headers: getAuthHeader() }
  );

  const responseClientesComVersoesAtualizadas = await axios.post(
    `${API_REMOTA_URL}/clientes/sincronizar/dessincronizados/servidor`,
    responseVersoesAposAtualizacao.data,
    { headers: getAuthHeader() }
  );

  await axios.post(
    `${API_BASE_URL}/clientes/sincronizar/local?modo=atualizar`,
    responseClientesComVersoesAtualizadas.data,
    { headers: getAuthHeader() }
  );

  return true;
}