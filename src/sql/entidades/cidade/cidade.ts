import { abrirConexao } from '../../banco';

export interface Cidade {
    id: string;
    nome: string;
    id_est_fk: string;
}

export async function criarTabelaCidade(): Promise<void> {
    const db = await abrirConexao();
    await db.execute(`
        CREATE TABLE IF NOT EXISTS cidades (
            id TEXT PRIMARY KEY NOT NULL,
            nome TEXT NOT NULL,
            id_est_fk TEXT NOT NULL
        );
    `);
}

export async function inserirCidades(cidades: Cidade[]): Promise<void> {
    const db = await abrirConexao();
    const values = cidades.map(c => `('${c.id}', '${c.nome.replace(/'/g, "''")}', '${c.id_est_fk}')`).join(',');
    await db.execute(`INSERT OR IGNORE INTO cidades (id, nome, id_est_fk) VALUES ${values};`);
}

export async function buscarCidadesPorEstado(id_est: string): Promise<Cidade[]> {
    const db = await abrirConexao();
    const res = await db.query('SELECT * FROM cidades WHERE id_est_fk = ?', [id_est]);
    return res.values as Cidade[];
}
