import { requisicaoCidades } from "./entidades/cidade/requsicoes";
import { requisicaoClientes } from "./entidades/cliente/requsicoes";
// import { requisicaoConexao } from "./entidades/conexao";
import { requisicaoEnderecos } from "./entidades/endereco/requsicoes";
import { requisicaoEstados } from "./entidades/estado/requsicoes";
import { requisicaoProdutos } from "./entidades/produto/requsicoes";
// import { requisicaoUsuarios } from "./entidades/usuario/requsicoes";

export async function requisicaoPorEndpoint<T = any>(
  endpoint: string,
  opcoes?: any,
  params?: any
): Promise<T> {
  // if (endpoint.startsWith('usuarios')) {
  //   return requisicaoUsuarios<T>(opcoes);
  // }

  if (endpoint.startsWith('estados')) {
    return requisicaoEstados<T>(opcoes);
  }

  if (endpoint.startsWith('cidades')) {
    return requisicaoCidades<T>(opcoes, params);
  }

  if (endpoint.startsWith('enderecos')) {
    return requisicaoEnderecos<T>(opcoes);
  }

   if (endpoint.startsWith('produtos')) {
    return requisicaoProdutos<T>(opcoes);
  }

  if (endpoint.startsWith('clientes')) {
    return requisicaoClientes<T>(opcoes);
  }



  // if (endpoint.startsWith('autenticacao/conectar')) {
  //   return requisicaoConexao<T>(opcoes);
  // }

  throw new Error(`Entidade não implementada`);
}

