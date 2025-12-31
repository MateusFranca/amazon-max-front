import { buscarEnderecos, inserirEndereco } from "./endereco";

export function requisicaoEnderecos<T = any>(opcoes: any): Promise<T> {
  if (opcoes.method === 'GET') {
    return buscarEnderecos() as Promise<T>;
  }

  if (opcoes.method === 'POST') {
    return inserirEndereco(opcoes.data) as Promise<T>;
  }

  return Promise.resolve({} as T);
}