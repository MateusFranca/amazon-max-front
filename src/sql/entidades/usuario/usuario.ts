// import { generateCustomToken } from '../../../utils/tokenUtils';
// import { DateTime } from 'luxon';
// import { gerarUUID } from '../../../utils/gerarUUID';
// import { abrirConexao } from '../../banco';

// export interface Usuario {
//     id: string;
//     nome: string;
//     email: string;
//     senha: string;
//     cargo: string;
//     acessos?: any;
//     percentual_comissao?: number;
//     criadoEm: string;
//     atualizadoEm: string;
//     deletadoEm?: string | null;
// }

// export interface BuscarUsuariosOpcoes {
//     pagina?: number;
//     limite?: number;
//     filtroBusca?: string;
// }

// export async function criarTabelaUsuario(): Promise<void> {
//     const db = await abrirConexao();

//     const criar = await db.execute(`
//     CREATE TABLE IF NOT EXISTS usuarios (
//       id TEXT PRIMARY KEY NOT NULL,
//       nome TEXT NOT NULL,
//       email TEXT NOT NULL,
//       senha TEXT NOT NULL,
//       cargo TEXT NOT NULL,
//       acessos TEXT,
//       percentual_comissao INTEGER,
//       criadoEm TEXT NOT NULL,
//       atualizadoEm TEXT NOT NULL,
//       deletadoEm TEXT
//     );
//   `);

//     const a = await db.execute(`
//       INSERT INTO usuarios (
//         id,
//         nome,
//         email,
//         senha,
//         cargo,
//         criadoEm,
//         atualizadoEm
//       ) VALUES (
//         'a1d77a0a-bc05-4f5c-b8ee-44d2f900260e',
//         'Rossini Carvalho',
//         'rossinicarvalho@gmail.com',
//         '$2a$16$gRF.o/fsslsHBJSr8xx91OZVOEnEoKuTfMX2W04vb/V4f0uAe86.W',
//         'Vinicius123@@',
//         'Administrador',
//         datetime('now'),
//         datetime('now')
//       );
//     `);

// }

// export async function inserirUsuario(usuario: Usuario): Promise<void> {
//     const db = await abrirConexao();

//     await db.run(
//         `INSERT INTO usuarios (
//       id, nome, email, senha, cargo,
//       acessos, percentual_comissao,
//       criadoEm, atualizadoEm, deletadoEm
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//             gerarUUID(),
//             usuario.nome,
//             usuario.email,
//             usuario.senha,
//             usuario.cargo,
//             usuario.acessos ? JSON.stringify(usuario.acessos) : null,
//             usuario.percentual_comissao ?? null,
//             DateTime.now().setZone('America/Porto_Velho').toISO(),
//             DateTime.now().setZone('America/Porto_Velho').toISO(),
//             usuario.deletadoEm ?? null,
//         ]
//     );

// }

// export async function buscarUsuarios(): Promise<{ dado: Usuario[], meta?: any }> {
//     const db = await abrirConexao();
//     const result = await db.query('SELECT * FROM usuarios');

//     const usuariosArray = (result.values || []).map((row: any) => ({
//         ...row,
//         acessos: row.acessos ? JSON.parse(row.acessos) : undefined,
//     }));

//     return {
//         dado: usuariosArray,
//         meta: {
//             total_itens: usuariosArray.length,
//             total_paginas: 1,
//             pagina_atual: 1,
//             itens_por_pagina: usuariosArray.length
//         }
//     };
// }

// export async function autenticarUsuario(email: string, senha: string): Promise<{ usuario: Usuario, token: string }> {
//     const db = await abrirConexao();

//     const result = await db.query(
//         'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
//         [email]
//     );


//     if (!result.values || result.values.length === 0) {
//         throw new Error('Usuário não encontrado');
//     }

//     const usuario = result.values[0];
//     if (usuario.senha !== senha) {
//         throw new Error('Senha incorreta');
//     }

//     const now = Math.floor(DateTime.now().toSeconds());
//     const exp = Math.floor(DateTime.now().plus({ hours: 8 }).toSeconds());
//     const token = generateCustomToken({
//         nome: usuario.nome,
//         email: usuario.email,
//         cargo: usuario.cargo,
//         iat: now,
//         exp: exp,
//         aud: usuario.cargo === 'Administrador' ? 'admin' : 'vendedor',
//         iss: 'offline-client'
//     });

//     localStorage.setItem('token', token);

//     return {
//         usuario: {
//             ...usuario,
//             acessos: usuario.acessos ? JSON.parse(usuario.acessos) : undefined,
//         },
//         token
//     };
// }

// export async function sincronizarUsuarios(usuarios: Usuario[]): Promise<void> {
//     if (!usuarios?.length) return;
//     const db = await abrirConexao();

//     const stmt = `INSERT OR REPLACE INTO usuarios (
//       id, nome, email, senha, cargo,
//       acessos, percentual_comissao,
//       criadoEm, atualizadoEm, deletadoEm
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     for (const usuario of usuarios) {
//         await db.run(stmt, [
//             usuario.id,
//             usuario.nome,
//             usuario.email,
//             usuario.senha,
//             usuario.cargo,
//             usuario.acessos ? JSON.stringify(usuario.acessos) : null,
//             usuario.percentual_comissao ?? null,
//             usuario.criadoEm,
//             usuario.atualizadoEm,
//             usuario.deletadoEm ?? null,
//         ]);
//     }

// }
