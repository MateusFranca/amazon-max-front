import axios from "axios";
import { getAuthHeader } from "../../../utils/tokenUtils";
import { API_BASE_URL, API_REMOTA_URL } from "../../../../api-config";

export async function buscarDessincronizadosLocal() {
  // 🟡 Passo 1 - Buscar orçamentos locais que ainda não têm versão (ou seja, nunca foram sincronizados)
  const responseOrcamentosLocaisNaoSincronizados = await axios.get(
    `${API_REMOTA_URL}/orcamentos/sincronizar/buscar-dessincronizados/local?versao=false`,
    { headers: getAuthHeader() }
  );

  if (responseOrcamentosLocaisNaoSincronizados.data.length >= 1) {
    // 🟢 Passo 2 - Criar esses orçamentos no servidor remoto
    const responseOrcamentosCriadosNoServidor = await axios.post(
      `${API_REMOTA_URL}/orcamentos/sincronizar/local?modo=criar`,
      responseOrcamentosLocaisNaoSincronizados.data,
      { headers: getAuthHeader() }
    );

    // 🔄 Passo 3 - Atualizar local com os dados vindos do servidor (já com versão atribuída)
    await axios.post(
      `${API_BASE_URL}/orcamentos/sincronizar/local?modo=atualizar`,
      responseOrcamentosCriadosNoServidor.data,
      { headers: getAuthHeader() }
    );
  }

  // 🔍 Passo 4 - Buscar orçamentos locais que já possuem versão (possivelmente desatualizados)
  const responseVersoesLocais = await axios.get(
    `${API_BASE_URL}/orcamentos/sincronizar/buscar-dessincronizados/local?versao=true`,
    { headers: getAuthHeader() }
  );

  // 🔁 Passo 5 - Verificar com o servidor quais dessas versões estão desatualizadas
  const responseOrcamentosDesatualizados = await axios.post(
    `${API_REMOTA_URL}/orcamentos/sincronizar/dessincronizados/servidor`,
    responseVersoesLocais.data,
    { headers: getAuthHeader() }
  );

  // 📝 Passo 6 - Atualizar local com os dados corrigidos do servidor
  if (responseOrcamentosDesatualizados.data.length >= 1) {
    const orcamentosParaAtualizar = responseOrcamentosDesatualizados.data.map((orc: any) => ({
      id: orc.id,
      percentual_comissao: orc.percentual_comissao,
      valor_final: orc.valor_final,
      forma_pagamento: orc.forma_pagamento,
      prazo: orc.prazo,
      observacao: orc.observacao,
      parcelas: orc.parcelas,
      codigo_finame: orc.codigo_finame,
      id_cli_fk: orc.id_cli_fk,
      id_usu_fk: orc.id_usu_fk,
      versao: orc.versao,
      criadoEm: orc.criadoEm,
      atualizadoEm: orc.atualizadoEm,
      deletadoEm: orc.deletadoEm,
    }));

    await axios.post(
      `${API_BASE_URL}/orcamentos/sincronizar/local?modo=atualizar`,
      orcamentosParaAtualizar,
      { headers: getAuthHeader() }
    );
  }

  // 🧠 Passo 7 - Buscar orçamentos locais que foram modificados após a última sincronização
  const responseOrcamentosLocaisAtualizados = await axios.get(
    `${API_BASE_URL}/orcamentos/sincronizar/atualizacoes/local`,
    { headers: getAuthHeader() }
  );

  // 📤 Passo 8 - Enviar esses orçamentos atualizados do local para o servidor remoto
  if (responseOrcamentosLocaisAtualizados.data.length > 0) {
    await axios.post(
      `${API_REMOTA_URL}/orcamentos/sincronizar/local?modo=atualizar`,
      responseOrcamentosLocaisAtualizados.data,
      { headers: getAuthHeader() }
    );
  }

  // 🔄 Passo 9 - Buscar os mesmos orçamentos do servidor (com nova versão) para atualizar localmente
  const responseVersoesAposAtualizacao = await axios.get(
    `${API_REMOTA_URL}/orcamentos/sincronizar/buscar-dessincronizados/local?versao=true`,
    { headers: getAuthHeader() }
  );

  
  const responseOrcamentosComVersoesAtualizadas = await axios.post(
    `${API_REMOTA_URL}/orcamentos/sincronizar/dessincronizados/servidor`,
    responseVersoesAposAtualizacao.data,
    { headers: getAuthHeader() }
  );

  
    await axios.post(
      `${API_BASE_URL}/orcamentos/sincronizar/local?modo=atualizar`,
      responseOrcamentosComVersoesAtualizadas.data,
      { headers: getAuthHeader() }
    );

  return true;
}
