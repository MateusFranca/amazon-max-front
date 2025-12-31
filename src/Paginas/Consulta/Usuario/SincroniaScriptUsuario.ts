import axios from "axios";
import { getAuthHeader } from "../../../utils/tokenUtils";
import { API_BASE_URL, API_REMOTA_URL } from "../../../../api-config";

export async function buscarDessincronizadosLocal() {
  // 1. Buscar usuários locais sem versão (não sincronizados)
  const responseUsuariosLocaisNaoSincronizados = await axios.get(
    `${API_BASE_URL}/usuarios/sincronizar/buscar-dessincronizados/local?versao=false`,
    { headers: getAuthHeader() }
  );

  if (responseUsuariosLocaisNaoSincronizados.data.length >= 1) {
    // 2. Criar esses usuários no servidor remoto
    const responseUsuariosCriadosNoServidor = await axios.post(
      `${API_REMOTA_URL}/usuarios/sincronizar/local?modo=criar`,
      responseUsuariosLocaisNaoSincronizados.data,
      { headers: getAuthHeader() }
    );

    // 3. Atualizar local com os dados vindos do servidor (com versão)
    await axios.post(
      `${API_BASE_URL}/usuarios/sincronizar/local?modo=atualizar`,
      responseUsuariosCriadosNoServidor.data,
      { headers: getAuthHeader() }
    );
  }

  // 4. Buscar usuários locais com versão (possivelmente desatualizados)
  const responseVersoesLocais = await axios.get(
    `${API_BASE_URL}/usuarios/sincronizar/buscar-dessincronizados/local?versao=true`,
    { headers: getAuthHeader() }
  );

  // 5. Verificar com o servidor quais dessas versões estão desatualizadas
  const responseUsuariosDesatualizados = await axios.post(
    `${API_REMOTA_URL}/usuarios/sincronizar/dessincronizados/servidor`,
    responseVersoesLocais.data,
    { headers: getAuthHeader() }
  );

  // 6. Atualizar local com os dados corrigidos do servidor
  if (responseUsuariosDesatualizados.data.length >= 1) {
    const usuariosParaAtualizar = responseUsuariosDesatualizados.data.map((usu: any) => ({
      id: usu.id,
      nome: usu.nome,
      email: usu.email,
      cargo: usu.cargo,
      ativo: usu.ativo,
      criadoEm: usu.criadoEm,
      atualizadoEm: usu.atualizadoEm,
      deletadoEm: usu.deletadoEm,
      versao: usu.versao,
    }));

    await axios.post(
      `${API_BASE_URL}/usuarios/sincronizar/local?modo=atualizar`,
      usuariosParaAtualizar,
      { headers: getAuthHeader() }
    );
  }

  // 7. Buscar usuários locais modificados após a última sincronização
  const responseUsuariosLocaisAtualizados = await axios.get(
    `${API_BASE_URL}/usuarios/sincronizar/atualizacoes/local`,
    { headers: getAuthHeader() }
  );

  // 8. Enviar esses usuários atualizados do local para o servidor remoto
  if (responseUsuariosLocaisAtualizados.data.length > 0) {
    await axios.post(
      `${API_REMOTA_URL}/usuarios/sincronizar/local?modo=atualizar`,
      responseUsuariosLocaisAtualizados.data,
      { headers: getAuthHeader() }
    );
  }

  // 9. Buscar os mesmos usuários do servidor (com nova versão) para atualizar localmente
  const responseVersoesAposAtualizacao = await axios.get(
    `${API_REMOTA_URL}/usuarios/sincronizar/buscar-dessincronizados/local?versao=true`,
    { headers: getAuthHeader() }
  );

  const responseUsuariosComVersoesAtualizadas = await axios.post(
    `${API_REMOTA_URL}/usuarios/sincronizar/dessincronizados/servidor`,
    responseVersoesAposAtualizacao.data,
    { headers: getAuthHeader() }
  );

  await axios.post(
    `${API_BASE_URL}/usuarios/sincronizar/local?modo=atualizar`,
    responseUsuariosComVersoesAtualizadas.data,
    { headers: getAuthHeader() }
  );

  return true;
}