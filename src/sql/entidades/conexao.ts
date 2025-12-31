// import { autenticarUsuario } from "./usuario/usuario";

// export function requisicaoConexao<T = any>(opcoes?: any): Promise<T> {
//     if (!opcoes.data) {
//       throw new Error('Email e senha são obrigatórios para autenticação');
//     }
//     if (!opcoes.data.email || !opcoes.data.senha) {
//       throw new Error('Email e senha são obrigatórios para autenticação');
//     }
    
//     return autenticarUsuario(opcoes.data.email, opcoes.data.senha) as Promise<T>;
// }