import {  buscarProdutos } from "./produto";

export function requisicaoProdutos<T = any>(opcoes: any): Promise<T> {

  if (opcoes.method === 'GET') {
    return buscarProdutos() as Promise<T>;
  } 

  return Promise.resolve({} as T);
}