import localforage from 'localforage';
import axios from 'axios';
import { API_BASE_URL } from '../../api-config.ts';
import { getAuthHeader, getCargoUsuario} from './tokenUtils';
import { gerarUUID } from './gerarUUID.ts';

const armazenamentoFila = localforage.createInstance({
  name: 'app',
  storeName: 'filaOffline'
});

interface ItemFila {
  url: string;
  metodo: 'POST' | 'PATCH' | 'DELETE' | 'GET';
  dados?: any;
  params?: Record<string, any>;
  cabecalhos?: Record<string, any>;
}

export async function verificarBackendOnline(): Promise<boolean> {
  try {
    const resposta = await axios.get(`${API_BASE_URL}/health`);
    return resposta.status === 200;
  } catch (erro) {
    return false;
  }
}

export async function adicionarProdutoNaFila(produtoNovo: any) {
  const response = await axios.get(`${API_BASE_URL}/produtos/sem-paginacao`, {
    headers: getAuthHeader(),
  });

  const listaProdutos = [...response.data, produtoNovo];

  for (const produto of listaProdutos) {
    if (!produto || !produto.id || !Array.isArray(produto.foto)) continue;

    for (const imagem of produto.foto) {
      if (!imagem?.urlImagem || !imagem?.nomeImagem) continue;

      try {
        const fotoResponse = await axios.get(imagem.urlImagem, {
          responseType: 'blob',
        });

        imagem.blob = fotoResponse.data;

      } catch (err) {
      }
    }
  }

  await armazenamentoFila.setItem('produtos', listaProdutos);
}

export async function adicionarClienteNaFila(clienteParaAdicionar: any) {
  try {
    const clientesOfflineRaw = await armazenamentoFila.getItem('clientes');
    let clientesOfflineExistentes: any[] = Array.isArray(clientesOfflineRaw) ? clientesOfflineRaw : [];
    
    const clienteLimpo = JSON.parse(JSON.stringify({
      nome: clienteParaAdicionar.nome || '',
      documento: clienteParaAdicionar.documento || '',
      telefone: clienteParaAdicionar.telefone || '',
      nascimento: clienteParaAdicionar.nascimento || null,
      id: clienteParaAdicionar.id || null,
      id_local: clienteParaAdicionar.id_local || gerarUUID(),
      id_end_fk: clienteParaAdicionar.id_end_fk || null,
      id_local_endereco: clienteParaAdicionar.id_local_endereco || null,
    }));
    
    if (clienteParaAdicionar.endereco) {
      clienteLimpo.endereco = {
        id: clienteParaAdicionar.endereco.id || null,
        id_local: clienteParaAdicionar.endereco.id_local || null,
        id_est_fk: clienteParaAdicionar.endereco.id_est_fk || null,
        id_cid_fk: clienteParaAdicionar.endereco.id_cid_fk || null,
        rua: clienteParaAdicionar.endereco.rua || '',
        numero: clienteParaAdicionar.endereco.numero || '',
        complemento: clienteParaAdicionar.endereco.complemento || '',
        bairro: clienteParaAdicionar.endereco.bairro || '',
        cep: clienteParaAdicionar.endereco.cep || ''
      };
      
      if (!clienteLimpo.id_local_endereco && clienteLimpo.endereco.id_local) {
        clienteLimpo.id_local_endereco = clienteLimpo.endereco.id_local;
      }
    }

    const idx = clientesOfflineExistentes.findIndex(c => 
      (c.id && clienteLimpo.id && c.id === clienteLimpo.id) ||
      (c.id_local && clienteLimpo.id_local && c.id_local === clienteLimpo.id_local)
    );

    if (idx !== -1) {
      clientesOfflineExistentes[idx] = {
        ...clientesOfflineExistentes[idx],
        ...clienteLimpo,
        atualizadoEm: new Date().toISOString()
      };
    } else {
      clientesOfflineExistentes.push({
        ...clienteLimpo,
        criadoEm: clienteLimpo.criadoEm || new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      });
    }
    
    await armazenamentoFila.setItem('clientes', clientesOfflineExistentes);
    return clienteLimpo.id_local;
  } catch (error) {
    console.error("Erro ao adicionar cliente na fila offline:", error);
    return null;
  }
}

export async function adicionarOrcamentoNaFila(orcamento: any) {
  try {
    if (!orcamento) {
      return false;
    }
    if (orcamento.deletadoEm) {
      return false;
    }

    const backendOnline = await verificarBackendOnline();
    
    if (backendOnline) {
      try {
        const listaOrcamentos = await axios.get(`${API_BASE_URL}/orcamentos`, {
          headers: getAuthHeader(),
        });
        await armazenamentoFila.setItem('orcamentos', listaOrcamentos.data.dado);
      } catch (error) {
        console.error("Erro ao buscar orçamentos online:", error);
      }
    }

    let orcamentosOffline = await armazenamentoFila.getItem('orcamentos') as any[] || [];
    
    if (!Array.isArray(orcamentosOffline)) {
      orcamentosOffline = [];
    }
    
    if (orcamento.id_local) {
      const indiceExistente = orcamentosOffline.findIndex((o: any) => 
        o && o.id_local && o.id_local === orcamento.id_local
      );
      
      if (indiceExistente !== -1) {
        const idLocalOriginal = orcamentosOffline[indiceExistente].id_local;
        
        orcamentosOffline[indiceExistente] = { 
          ...orcamentosOffline[indiceExistente], 
          ...orcamento,
          id_local: idLocalOriginal,
          atualizadoEm: new Date().toISOString()
        };
      } else {
        orcamento.criadoEm = orcamento.criadoEm || new Date().toISOString();
        orcamentosOffline.push(orcamento);
      }
    } else {
      orcamento.id_local = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      orcamento.criadoEm = orcamento.criadoEm || new Date().toISOString();
      orcamentosOffline.push(orcamento);
    }
    
    orcamentosOffline = orcamentosOffline.filter(o => !o.deletadoEm);
    
    await armazenamentoFila.setItem('orcamentos', orcamentosOffline);
    return true;
  } catch (error) {
    console.error("Erro ao adicionar orçamento offline:", error);
    return false;
  }
}

export async function adicionarUsuarioConectadoNaFila(usuario: any) {
  const usuariosConectados: any[] = (await armazenamentoFila.getItem('usuario_conectado')) || [];

  const usuarioExistente = usuariosConectados.find(u => u.email === usuario.email);

  if (!usuarioExistente) {
    usuariosConectados.push(usuario);
    await armazenamentoFila.setItem('usuario_conectado', usuariosConectados);
  }
}

export async function adicionarUsuarioNaFila(usuario: any) {
  const cargo = getCargoUsuario();

  if (cargo !== 'admin') {
    await armazenamentoFila.removeItem('usuarios');
    return;
  }

  const backendOnline = await verificarBackendOnline();
  let listaUsuarios: any[] = [];

  if (backendOnline) {
    try {
      const response = await axios.get(`${API_BASE_URL}/usuarios/offiline`, { headers: getAuthHeader() });
      listaUsuarios = response.data.map((u: any) => ({
        nome: u.nome,
        email: u.email,
        cargo: u.cargo,
      }));
    } catch (erro) {
    }
  } else {
    listaUsuarios = (await armazenamentoFila.getItem('usuarios')) || [];
  }

  listaUsuarios.push(usuario);
  await armazenamentoFila.setItem('usuarios', listaUsuarios);
}

export async function adicionarEstadosNaFila(estado: any) {
  const backendOnline = await verificarBackendOnline();
  let listaEstados: any[] = [];

  if (backendOnline) {
    try {
      const response = await axios.get(`${API_BASE_URL}/estados`, { headers: getAuthHeader() });
      listaEstados = response.data.map((e: any) => ({
        id_est_fk: e.id,
        nome: e.nome,
        uf_sta: e.uf,
      }));
    } catch (erro) {
    }
  } else {
    listaEstados = (await armazenamentoFila.getItem('estados')) || [];
  }

  listaEstados.push(estado);
  await armazenamentoFila.setItem('estados', listaEstados);
}

export async function adicionarCidadesNaFila(cidade: any) {
  const backendOnline = await verificarBackendOnline();
  let listaCidades: any[] = [];

  if (backendOnline) {
    try {
      const response = await axios.get(`${API_BASE_URL}/cidades`, { headers: getAuthHeader() });
      listaCidades = response.data.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        id_est_fk: c.id_est_fk,
      }));
    } catch (erro) {
    }
  } else {
    listaCidades = (await armazenamentoFila.getItem('cidades')) || [];
  }

  listaCidades.push(cidade);
  await armazenamentoFila.setItem('cidades', listaCidades);
}

export async function adicionarEnderecoNaFila(enderecoParaAdicionar: any) {
  if (!enderecoParaAdicionar) return;

  const armazenamentoFila = localforage.createInstance({
    name: 'app',
    storeName: 'filaOffline'
  });

  let enderecosOffline: any[] = (await armazenamentoFila.getItem('enderecos')) || [];

  if (!enderecoParaAdicionar.id_local) {
    enderecoParaAdicionar.id_local = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  const idx = enderecosOffline.findIndex(e => 
    (e.id && enderecoParaAdicionar.id && e.id === enderecoParaAdicionar.id) ||
    (e.id_local && enderecoParaAdicionar.id_local && e.id_local === enderecoParaAdicionar.id_local)
  );

  if (idx !== -1) {
    enderecosOffline[idx] = { ...enderecosOffline[idx], ...enderecoParaAdicionar, atualizadoEm: new Date().toISOString() };
  } else {
    enderecosOffline.push({ ...enderecoParaAdicionar, criadoEm: enderecoParaAdicionar.criadoEm || new Date().toISOString(), atualizadoEm: new Date().toISOString() });
  }

  await armazenamentoFila.setItem('enderecos', enderecosOffline);
  
  return enderecoParaAdicionar.id_local;
}

export async function buscarClientesOffline(): Promise<any[]> {
  const armazenamentoFila = localforage.createInstance({
    name: 'app',
    storeName: 'filaOffline'
  });
  const clientes = (await armazenamentoFila.getItem('clientes') as any[]) || [];
  const enderecos = (await armazenamentoFila.getItem('enderecos') as any[]) || [];

  return clientes
    .filter(c => c && typeof c === 'object' && (c.id || c.id_local))
    .map(cliente => {
      let endereco = null;
      
      if (cliente.id_local_endereco) {
        endereco = enderecos.find(e => e && e.id_local === cliente.id_local_endereco);
      }
      
      if (!endereco && cliente.id_end_fk) {
        endereco = enderecos.find(e => e && (e.id === cliente.id_end_fk || e.id_local === cliente.id_end_fk));
      }
      
      return {
        ...cliente,
        endereco
      };
    });
}

export async function buscarEnderecosOffline(): Promise<any[]> {
  const enderecos = (await armazenamentoFila.getItem('enderecos') as any[]) || [];
  return enderecos.filter(e => e && typeof e === 'object' && (e.id || e.id_local));
}

export async function buscarProdutosOffline(): Promise<any[]> {
  const produtos = (await armazenamentoFila.getItem('produtos') as any[]) || [];
  return produtos.filter(p => p && typeof p === 'object' && p.id);
}

export async function buscarOrcamentosOffline(): Promise<any[]> {
  const orcamentos = (await armazenamentoFila.getItem('orcamentos') as any[]) || [];
  const clientes = (await armazenamentoFila.getItem('clientes') as any[]) || [];
  const produtos = (await armazenamentoFila.getItem('produtos') as any[]) || [];
  
  const produtosMap = produtos.reduce((map: Record<string, any>, produto: any) => {
    if (produto && produto.id) {
      map[produto.id] = produto;
    }
    return map;
  }, {});

  return orcamentos.filter(o => o && typeof o === 'object').map(orcamento => {
    const idCliente = orcamento.id_cli_fk || orcamento.id_cliente;
    let orcamentoFinal = orcamento;
    if (idCliente) {
      const cliente = clientes.find(c => c && c.id === idCliente);
      if (cliente) {
        orcamentoFinal = {
          ...orcamento,
          clienteDocumento: cliente.documento || '',
          clienteTelefone: cliente.telefone || '',
          clienteNome: cliente.nome || '',
        };
      }
    }
    
    if (orcamentoFinal.produtosOrcamento && Array.isArray(orcamentoFinal.produtosOrcamento)) {
      orcamentoFinal.produtosOrcamento = orcamentoFinal.produtosOrcamento.map((prodOrc: any) => {
        if (prodOrc.id_pro_fk && (!prodOrc.produto || !prodOrc.produto.modelo)) {
          const produtoCompleto = produtosMap[prodOrc.id_pro_fk];
          if (produtoCompleto) {
            return {
              ...prodOrc,
              produto: produtoCompleto
            };
          }
        }
        return prodOrc;
      });
    }
    
    return orcamentoFinal;
  });
}

export async function buscarUsuarioOffline(): Promise<any[]> {
  const usuarios = (await armazenamentoFila.getItem('usuario_conectado') as any[]) || [];
  return usuarios.filter(u => u && typeof u === 'object' && u.email);
}

export async function buscarUsuariosOffline(): Promise<any[]> {
  const usuarios = (await armazenamentoFila.getItem('usuarios') as any[]) || [];
  return usuarios.filter(u => u && typeof u === 'object' && u.email);
}

export async function buscarEstadosOffline(): Promise<any[]> {
  const estados = (await armazenamentoFila.getItem('estados') as any[]) || [];
  return estados.filter(e => e && typeof e === 'object' && e.id_est_fk);
}

export async function buscarCidadesOffline(): Promise<any[]> {
  const cidades = (await armazenamentoFila.getItem('cidades') as any[]) || [];
  return cidades.filter(c => c && typeof c === 'object' && c.id);
}

export async function adicionarNaFila(item: ItemFila) {
  const fila: ItemFila[] = (await armazenamentoFila.getItem('requisicoes')) || [];
  
  if (item.url.includes('/orcamentos') && item.metodo === 'POST' && item.dados?.id_local) {
    const existingIndex = fila.findIndex(
      req => req.url.includes('/orcamentos') && 
             req.metodo === 'POST' && 
             req.dados?.id_local === item.dados.id_local
    );
    
    if (existingIndex !== -1) {
      fila[existingIndex] = item;
      await armazenamentoFila.setItem('requisicoes', fila);
      return;
    }
  }
  
  fila.push(item);
  await armazenamentoFila.setItem('requisicoes', fila);
}

export async function enviarFila() {
  const backendOnline = await verificarBackendOnline();
  if (!backendOnline) {
    return;
  }

  const fila: ItemFila[] = (await armazenamentoFila.getItem('requisicoes')) || [];
  if (!fila.length) return;

  const restantes: ItemFila[] = [];
  const enderecoIdMap: Record<string, string> = {};

  for (const item of fila) {
    try {
      if (item.url.startsWith('/enderecos/idLocal/') && item.metodo === 'GET') {
        const idLocal = item.url.split('/').pop();
        const resp = await axios.request({
          url: `${API_BASE_URL}${item.url}`,
          method: item.metodo,
          headers: getAuthHeader(),
          params: item.params
        });
        if (resp.data && resp.data.id) {
          enderecoIdMap[idLocal!] = resp.data.id;
        }
        continue;
      }

      if (item.url === '/clientes' && item.metodo === 'POST' && item.dados && item.dados.id_local_endereco) {
        const idLocal = item.dados.id_local_endereco;
        if (enderecoIdMap[idLocal]) {
          item.dados.id_end_fk = enderecoIdMap[idLocal];
        }
        delete item.dados.id_local_endereco;
      }

      await axios.request({
        url: `${API_BASE_URL}${item.url}`,
        method: item.metodo,
        data: item.dados,
        headers: getAuthHeader(),
        params: item.params 
      });
    } catch (erro) {
      restantes.push(item);
    }
  }

  await armazenamentoFila.setItem('requisicoes', restantes);
}

/**
 * Atualiza uma requisição POST existente na fila offline, identificando pelo id_local.
 * @param tipo 'clientes' ou 'enderecos'
 * @param idLocal id_local do cliente/endereço
 * @param novosDados dados atualizados
 */
export async function atualizarRequisicaoPostNaFila(
  tipo: 'clientes' | 'enderecos',
  idLocal: string,
  novosDados: any
) {
  const armazenamentoFila = localforage.createInstance({
    name: 'app',
    storeName: 'filaOffline'
  });

  const fila: ItemFila[] = (await armazenamentoFila.getItem('requisicoes')) || [];
  let url = '';
  if (tipo === 'clientes') url = '/clientes';
  if (tipo === 'enderecos') url = '/enderecos';

  let alterado = false;
  for (let req of fila) {
    if (
      req.url === url &&
      req.metodo === 'POST' &&
      req.dados &&
      req.dados.id_local === idLocal
    ) {
      req.dados = { ...req.dados, ...novosDados };
      alterado = true;
    }
  }

  if (alterado) {
    await armazenamentoFila.setItem('requisicoes', fila);
  }
}

export async function atualizarOrcamentoOffline(id: string | number, dadosAtualizados: any) {
  const orcamentos = await buscarOrcamentosOffline();
  const idx = orcamentos.findIndex(o => String(o.id) === String(id) || String(o.id_local) === String(id));
  if (idx !== -1) {
    orcamentos[idx] = { ...orcamentos[idx], ...dadosAtualizados };
    await localforage.setItem('orcamentos', orcamentos);
  }
}

export async function sincronizarClientesOffline() {
  const backendOnline = await verificarBackendOnline();
  if (!backendOnline) return;

  try {
    const response = await axios.get(`${API_BASE_URL}/clientes`, {
      headers: getAuthHeader(),
    });

    // Ajuste conforme o retorno da sua API
    const listaClientes = Array.isArray(response.data) ? response.data : (response.data.dado || []);
    await armazenamentoFila.setItem('clientes', listaClientes);
  } catch (error) {
    console.error("Erro ao sincronizar clientes offline:", error);
  }
}

window.addEventListener('online', () => {
  enviarFila();
});
