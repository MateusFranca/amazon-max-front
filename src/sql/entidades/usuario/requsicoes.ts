// // import { buscarUsuarios, inserirUsuario } from "./usuario";

// export function requisicaoUsuarios<T = any>(opcoes: any): Promise<T> {
//   if (opcoes.method === 'GET') {
//     return buscarUsuarios() as Promise<T>;
//   } else if (opcoes.method === 'POST') {
   
//     return inserirUsuario(opcoes.data) as Promise<T>;

//   }
//   return Promise.resolve({} as T);
// }