import { DateTime } from 'luxon';
import { gerarUUID } from '../../../utils/gerarUUID';
import { abrirConexao } from '../../banco';

// Modelo Produto conforme especificação
export interface Produto {
    id: string;
    marca: string;
    modelo: string;
    valor_vista: string; // Decimal como string para SQLite
    foto?: any | null;   // JSON
    descricao_tecnica: string;
    id_usu_fk: string;
    criadoEm: string;
    atualizadoEm: string;
    deletadoEm?: string | null;
}

export interface BuscarProdutosOpcoes {
    pagina?: number;
    limite?: number;
    filtroBusca?: string;
}

export async function criarTabelaProduto(): Promise<void> {
    const db = await abrirConexao();
    await db.execute(`
        CREATE TABLE IF NOT EXISTS produtos (
            id TEXT PRIMARY KEY NOT NULL,
            marca TEXT NOT NULL,
            modelo TEXT NOT NULL,
            valor_vista TEXT NOT NULL,
            foto TEXT,
            descricao_tecnica TEXT NOT NULL,
            id_usu_fk TEXT NOT NULL,
            criadoEm TEXT NOT NULL,
            atualizadoEm TEXT NOT NULL,
            deletadoEm TEXT
        );
    `);
}

export async function inserirProduto(produto: Produto): Promise<void> {
    const db = await abrirConexao();

    await db.run(
        `INSERT INTO produtos (
            id, marca, modelo, valor_vista, foto, descricao_tecnica,
            id_usu_fk, criadoEm, atualizadoEm, deletadoEm
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            gerarUUID(),
            produto.marca,
            produto.modelo,
            produto.valor_vista,
            produto.foto ? JSON.stringify(produto.foto) : null,
            produto.descricao_tecnica,
            produto.id_usu_fk,
            DateTime.now().setZone('America/Porto_Velho').toISO(),
            DateTime.now().setZone('America/Porto_Velho').toISO(),
            produto.deletadoEm ?? null
        ]
    );
}

export async function buscarProdutos(): Promise<{ dado: Produto[], meta?: any }> {
    const db = await abrirConexao();
    const result = await db.query('SELECT * FROM produtos');

    const produtosArray = (result.values || []).map((row: any) => ({
        ...row,
        foto: row.foto ? JSON.parse(row.foto) : null,
    }));

    return {
        dado: produtosArray,
        meta: {
            total_itens: produtosArray.length,
            total_paginas: 1,
            pagina_atual: 1,
            itens_por_pagina: produtosArray.length
        }
    };
}

export async function sincronizarProdutos(produtos: Produto[]): Promise<void> {
    if (!produtos?.length) return;
    const db = await abrirConexao();

    const stmt = `INSERT OR REPLACE INTO produtos (
        id, marca, modelo, valor_vista, foto, descricao_tecnica,
        id_usu_fk, criadoEm, atualizadoEm, deletadoEm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    for (const produto of produtos) {
        await db.run(stmt, [
            produto.id,
            produto.marca,
            produto.modelo,
            produto.valor_vista,
            produto.foto ? JSON.stringify(produto.foto) : null,
            produto.descricao_tecnica,
            produto.id_usu_fk,
            produto.criadoEm,
            produto.atualizadoEm,
            produto.deletadoEm ?? null
        ]);
    }
}
