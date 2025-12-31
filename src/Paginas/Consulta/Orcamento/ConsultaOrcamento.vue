<template>
    <div class="container mx-auto p-8">
        <h3 class="text-4xl font-bold mb-5">Consultar orçamentos</h3>

        <div class="mb-4 flex justify-between items-center">
            <div class="relative w-full lg:w-1/3">
                <input type="text" v-model="filtro" placeholder="Pesquisar"
                    class="border border-gray-300 rounded-lg px-4 py-2 pr-10 w-full" @input="buscar({ filtro })" />
                <font-awesome-icon icon="search"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div class="flex gap-2">
                <!-- <BotaoComponente :title="'Sincronizar'" class="px-3 py-1 text-sm" @click="sincronizarOrcamentos">
                    <font-awesome-icon icon="sync" class="ml-1" />
                </BotaoComponente> -->
                <BotaoComponente :disabled="selectedItems.length === 0" :title="'Exportar'" class="px-3 py-1 text-sm"
                    @click="exportarOrcamentos">
                    <font-awesome-icon icon="file-export" class="ml-1" />
                </BotaoComponente>
            </div>
        </div>

        <TabelaComponente :columns="columns" :items="items" :meta="meta" @paginate="buscar"
            :headerClass="'bg-[#ff6608] text-white font-semibold'"
            :rowClass="(_, index) => (index % 2 === 0 ? 'bg-orange-100' : 'bg-white')">
            <template #checkbox="{ item }">
                <input type="checkbox" v-model="selectedItems" :value="item"
                    class="form-checkbox h-5 w-5 text-blue-600" />
            </template>

            <template #cliente="{ item }">
                <span class="whitespace-nowrap">{{ item.cliente }}</span>
            </template>

            <template #documento="{ item }">
                <span class="whitespace-nowrap">{{ item.documento || 'N/A' }}</span>
            </template>

            <template #telefone="{ item }">
                <span class="whitespace-nowrap">{{ item.telefone || 'N/A' }}</span>
            </template>

            <template #data_emissao="{ item }">
                <span class="whitespace-nowrap">{{ item.data_criacao }}</span>
            </template>

            <template #data_prazo="{ item }">
                <span class="whitespace-nowrap">{{ formatarDataBrasileira(item.prazo) || 'N/A' }}</span>
            </template>

            <template #valor_final="{ item }">
                <span class="whitespace-nowrap">{{ formatarMoeda(item.valor_final) }}</span>
            </template>

            <template #acoes="{ item }">
                <div class="flex justify-center items-center gap-3 whitespace-nowrap">

                    <font-awesome-icon icon="eye" class="text-gray-500 hover:text-gray-700 cursor-pointer"
                        v-if="cargoUsuario === 'vendedor' || cargoUsuario === 'admin'"
                        @click="visualizarDetalhes(item)" />

                    <font-awesome-icon icon="pencil-alt" :class="{
                        'opacity-50 cursor-not-allowed text-gray-400 ': item.deletadoEm,
                        'text-blue-600 hover:text-blue-800 cursor-pointer': !item.deletadoEm
                    }" v-if="cargoUsuario === 'vendedor' || cargoUsuario === 'admin'"
                        @click="!item.deletadoEm && editar(item)" />

                    <font-awesome-icon
                        v-if="isOnline && (cargoUsuario === 'vendedor' || cargoUsuario === 'admin') && item.deletadoEm"
                        :icon="['fas', 'check']" class="text-green-600 hover:text-green-800 cursor-pointer"
                        @click="abrirModalAtivar(item)" />
                    <font-awesome-icon v-else-if="isOnline && (cargoUsuario === 'vendedor' || cargoUsuario === 'admin')"
                        icon="trash" class="text-red-600 hover:text-red-800 cursor-pointer"
                        @click="abrirModalExcluir(item)" />

                </div>
            </template>
            <template #message>
                <div v-if="items.length === 0" class="text-center text-gray-500 mt-4">
                    Nenhum orçamento encontrado.
                </div>
            </template>

        </TabelaComponente>

        <ModalDesativarComponente :isModalControllerDelete="isModalExcluir" deleteDataName="orçamento"
            :deleteData="itemSelecionado" @confirmar="confirmarExclusao" @cancelar="fecharModalExcluir" />

        <ModalAtivarComponente :isModalControllerActivate="isModalAtivar" activateDataName="orçamento"
            :activateData="itemSelecionado" @confirmar="confirmarAtivacao" @cancelar="fecharModalAtivar" />


        <div v-if="isModalViewOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white w-11/12 h-5/6 rounded-lg shadow-lg overflow-y-auto relative">
                <button @click="fecharModalDetalhes"
                    class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold">
                    &times;
                </button>
                <div class="flex justify-between items-center p-4 border-b">
                    <h3 class="text-2xl font-bold">Detalhes do orçamento</h3>
                </div>
                <div class="p-6 space-y-6">
                    <!-- Informações do Cliente -->
                    <div class="p-8 bg-gray-100 rounded-lg shadow-md">
                        <h4 class="font-bold text-2xl mb-6">Informações do cliente</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                            <p class="text-gray-700"><span class="font-medium">Nome:</span> {{ selectedItem?.cliente ||
                                'N/A' }}
                            </p>
                            <p class="text-gray-700"><span class="font-medium">Documento:</span> {{
                                selectedItem?.documento ?
                                    formatarDocumento(selectedItem.documento) : 'N/A' }}</p>
                            <p class="text-gray-700"><span class="font-medium">Telefone:</span> {{
                                selectedItem?.telefone ?
                                    formatarTelefone(selectedItem.telefone) : 'N/A' }}</p>
                            <p class="text-gray-700"><span class="font-medium">Nascimento:</span> {{
                                selectedItem?.cliente_nascimento ?
                                    formatarDataBrasileira(selectedItem.cliente_nascimento) :
                                    'N/A' }}</p>
                        </div>
                    </div>

                    <!-- Informações do Orçamento -->
                    <div class="p-8 bg-gray-100 rounded-lg shadow-md">
                        <h4 class="font-bold text-2xl mb-6">Informações do orçamento</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                            <p class="text-gray-700"><span class="font-medium">Criado em:</span> {{
                                selectedItem?.data_criacao
                                || 'N/A' }}</p>
                            <p class="text-gray-700"><span class="font-medium">Status:</span> {{ selectedItem?.status ||
                                'Ativo'
                                }}</p>
                            <p class="text-gray-700"><span class="font-medium">Comissão:</span> {{
                                selectedItem?.percentual_comissao || 0 }}%</p>
                            <p class="text-gray-700"><span class="font-medium">Atualizado em:</span> {{
                                selectedItem?.atualizadoEm ? formatarDataBrasileira(selectedItem.atualizadoEm) : 'N/A'
                                }}</p>
                        </div>
                    </div>

                    <!-- Detalhes de Pagamento -->
                    <div class="p-8 bg-gray-100 rounded-lg shadow-md">
                        <h4 class="font-bold text-2xl mb-6">Pagamento</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
                            <p class="text-gray-700"><span class="font-medium">Forma:</span> {{
                                formatarFormaPagamento(selectedItem?.forma_pagamento) || 'N/A' }}</p>
                            <p class="text-gray-700"><span class="font-medium">Parcelas:</span> {{
                                selectedItem?.parcelas ||
                                '1x' }}</p>
                            <p class="text-gray-700"><span class="font-medium">Prazo:</span> {{ selectedItem?.prazo ||
                                'N/A' }}
                            </p>
                            <p class="text-gray-700"><span class="font-medium">Finame:</span> {{
                                selectedItem?.codigo_finame ||
                                'N/A' }}</p>
                        </div>
                    </div>

                    <!-- Observações -->
                    <div class="p-8 bg-gray-100 rounded-lg shadow-md" v-if="selectedItem?.observacao">
                        <h4 class="font-bold text-2xl mb-6">Observações</h4>
                        <p class="text-gray-700 whitespace-pre-line">{{ selectedItem.observacao }}</p>
                    </div>

                    <!-- Produtos -->
                    <div class="p-8 bg-gray-100 rounded-lg shadow-md">
                        <h4 class="font-bold text-2xl mb-6">Produtos do orçamento</h4>
                        <TabelaComponente :columns="[
                            { header: 'Produto', value: 'produto', headerClass: 'bg-[#ff6608] text-white font-semibold' },
                            { header: 'Quantidade', value: 'quantidade', headerClass: 'bg-[#ff6608] text-white font-semibold' },
                            { header: 'Valor Unit.', value: 'valor_unitario', headerClass: 'bg-[#ff6608] text-white font-semibold' },
                            { header: 'Valor Total Unit.', value: 'valor_final_unitario', headerClass: 'bg-[#ff6608] text-white font-semibold' },
                        ]" :items="paginatedProdutos" :meta="paginationMeta" @paginate="handlePagination">
                            <template #summary>
                                <div class="px-4 py-3 border-t border-gray-300">
                                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <div class="flex flex-col">
                                            <label for="valor_final" class="font-medium text-[#3F3D56] text-sm">Valor
                                                Final:</label>
                                            <input :value="formatarMoeda(selectedItem?.valor_final)" type="text"
                                                id="valor_final"
                                                class="border-2 border-[#3F3D56] p-1 w-full rounded-lg bg-gray-100 text-sm"
                                                disabled />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </TabelaComponente>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BotaoComponente from "../../../Componentes/Outros/BotaoComponente.vue";
import TabelaComponente from "../../../Componentes/Outros/TabelaComponente.vue";
import ModalDesativarComponente from "../../../Componentes/Modais/ModalDesativarComponente.vue";
import ModalAtivarComponente from "../../../Componentes/Modais/ModalAtivarComponente.vue";
import { ref, reactive, computed, watch, onMounted, getCurrentInstance } from "vue";
import { consultaScriptOrcamento } from "./ConsultaScriptOrcamento.ts";
import { useRouter } from "vue-router";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatarMoeda, formatarFormaPagamento, formatarDocumento, formatarDataBrasileira, formatarTelefone } from "../../../utils/formatters";
import { logoBase64 } from "../../../assets/logoBase64.ts";
import { buscarProdutosOffline } from "../../../utils/BancoOfflineUtlis.ts";
import { formatToBRL } from "../../../utils/currencyMaskUtils.ts";
import { gerarPdfOrcamento } from "../../Cadastrar/Orcamento/gerarPdfOrcamento.ts";
import { buscarDessincronizadosLocal } from "./SincroniaScriptOrcamento.ts";

export default {
    name: "consultar-orcamento",
    components: {
        BotaoComponente,
        TabelaComponente,
        ModalDesativarComponente,
        ModalAtivarComponente
    },
    setup() {
        const instance = getCurrentInstance();
        const proxy = instance?.proxy;

        const { columns, items, meta, buscar, excluir, ativar, cargoUsuario } = consultaScriptOrcamento();
        const router = useRouter();
        const filtro = ref("");
        const itemSelecionado = ref(null);
        const isModalExcluir = ref(false);
        const isModalAtivar = ref(false);

        const selectedItem = ref(null);
        const isModalViewOpen = ref(false);
        const selectedItems = ref([]);
        const produtosMap = ref({});

        const isOnline = computed(() => navigator.onLine);

        onMounted(async () => {
            const produtosOffline = await buscarProdutosOffline();
            produtosMap.value = produtosOffline.reduce((map, produto) => {
                map[produto.id] = produto;
                return map;
            }, {});
        });

        const paginationMeta = reactive({
            total_paginas: 1,
            pagina_atual: 1,
            itens_por_pagina: 5,
            total_itens: 0,
        });

        const handlePagination = ({ pagina }) => {
            if (pagina < 1 || pagina > paginationMeta.total_paginas) return;
            paginationMeta.pagina_atual = pagina;
        };

        const paginatedProdutos = computed(() => {
            if (!selectedItem.value?.produtosOrcamento) return [];
            const start = (paginationMeta.pagina_atual - 1) * paginationMeta.itens_por_pagina;
            const end = start + paginationMeta.itens_por_pagina;

            return selectedItem.value.produtosOrcamento.slice(start, end).map(produto => {
                let nomeProduto = 'N/A';
                if (produto.produto?.modelo) {
                    nomeProduto = produto.produto.modelo;
                } else if (produto.id_pro_fk && produtosMap.value[produto.id_pro_fk]) {
                    nomeProduto = produtosMap.value[produto.id_pro_fk].modelo;
                }

                return {
                    produto: nomeProduto,
                    quantidade: produto.quantidade,
                    valor_unitario: formatarMoeda(produto.valor_unitario),
                    valor_final_unitario: formatarMoeda(produto.valor_final_unitario),
                };
            });
        });

        watch(
            () => selectedItem.value?.produtosOrcamento?.length,
            (newLength) => {
                paginationMeta.total_itens = newLength || 0;
                paginationMeta.total_paginas = Math.max(1, Math.ceil(newLength / paginationMeta.itens_por_pagina));
                if (paginationMeta.pagina_atual > paginationMeta.total_paginas) {
                    paginationMeta.pagina_atual = 1;
                }
            }
        );

        // Habilita a coluna de checkbox na tabela
        if (!columns.find(col => col.value === 'checkbox')) {
            columns.unshift({ header: '', value: 'checkbox' });
        }

        const abrirModalExcluir = (item) => {
            if (!isOnline.value) {
                proxy?.$toast.error("Você está offline. Não é possível excluir orçamentos.");
                return;
            }
            itemSelecionado.value = item;
            isModalExcluir.value = true;
        };

        const fecharModalExcluir = () => {
            isModalExcluir.value = false;
            itemSelecionado.value = null;
        };

        const confirmarExclusao = async () => {
            if (itemSelecionado.value) {
                await excluir(itemSelecionado.value.id);
                fecharModalExcluir();
            }
        };

        const abrirModalAtivar = (item) => {
            if (!isOnline.value) {
                proxy?.$toast.error("Você está offline. Não é possível ativar orçamentos.");
                return;
            }
            itemSelecionado.value = item;
            isModalAtivar.value = true;
        };

        const fecharModalAtivar = () => {
            isModalAtivar.value = false;
            itemSelecionado.value = null;
        };

        const confirmarAtivacao = async () => {
            if (itemSelecionado.value) {
                await ativar(itemSelecionado.value.id);
                fecharModalAtivar();
            }
        };

        const editar = (item) => {
            router.push({
                name: 'cadastrar-orcamento',
                params: { id: item.id }
            });
        };

        const visualizarDetalhes = async (item) => {
            if (!isOnline.value && item.produtosOrcamento) {
                item.produtosOrcamento = item.produtosOrcamento.map(prodOrc => {
                    if (prodOrc.produto && prodOrc.produto.modelo) {
                        return prodOrc;
                    }

                    if (prodOrc.id_pro_fk && produtosMap.value[prodOrc.id_pro_fk]) {
                        return {
                            ...prodOrc,
                            produto: produtosMap.value[prodOrc.id_pro_fk]
                        };
                    }

                    return prodOrc;
                });
            }

            selectedItem.value = item;
            isModalViewOpen.value = true;
        };

        const fecharModalDetalhes = () => {
            isModalViewOpen.value = false;
            selectedItem.value = null;
        };

        // Adicione a função para gerar o PDF do orçamento selecionado
        const exportarPdfOrcamento = () => {
            if (!selectedItem.value) return;

            // Monta listaClientes e listaProdutos mínimos para o PDF
            const cliente = {
                id: selectedItem.value.id_cli_fk || selectedItem.value.cliente?.id || "",
                nome: selectedItem.value.cliente || "",
                documento: selectedItem.value.documento || "",
                telefone: selectedItem.value.telefone || ""
            };
            const listaClientes = [cliente];

            // Produtos: tenta obter nome/modelo do produto
            const listaProdutos = (selectedItem.value.produtosOrcamento || []).map(po => {
                let nome = po.produto?.modelo || po.produto?.nome || "Produto";
                return {
                    id: po.produto?.id || po.id_pro_fk || "",
                    nome
                };
            });

            // Função para obter nome do produto
            const nomeProduto = (id) => {
                const prod = listaProdutos.find(p => p.id === id);
                return prod ? prod.nome : "";
            };

            // Chama gerarPdfOrcamento
            const { blob, nomeArquivo } = gerarPdfOrcamento({
                orcamento: {
                    id_cli_fk: cliente.id,
                    valor_final: selectedItem.value.valor_final,
                    forma_pagamento: selectedItem.value.forma_pagamento,
                    prazo: selectedItem.value.prazo,
                    observacao: selectedItem.value.observacao,
                    percentual_comissao: selectedItem.value.percentual_comissao || 0,
                    parcelas: selectedItem.value.parcelas || 1,
                    codigo_finame: selectedItem.value.codigo_finame || "",
                },
                produtosOrcamento: (selectedItem.value.produtosOrcamento || []).map(po => ({
                    id_pro_fk: po.produto?.id || po.id_pro_fk || "",
                    valor_unitario: po.valor_unitario,
                    valor_final_unitario: po.valor_final_unitario,
                    quantidade: po.quantidade,
                })),
                listaClientes,
                listaProdutos,
                nomeProduto
            });

            // Baixa o PDF
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = nomeArquivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const exportarOrcamentos = () => {
            if (!selectedItems.value.length) return;
            selectedItems.value.forEach(item => {
                const cliente = {
                    id: item.id_cli_fk || item.cliente?.id || "",
                    nome: item.cliente || "",
                    documento: item.documento || "",
                    telefone: item.telefone || ""
                };
                const listaClientes = [cliente];
                const listaProdutos = (item.produtosOrcamento || []).map(po => {
                    let nome = po.produto?.modelo || po.produto?.nome || "Produto";
                    return {
                        id: po.produto?.id || po.id_pro_fk || "",
                        nome
                    };
                });
                const nomeProduto = (id) => {
                    const prod = listaProdutos.find(p => p.id === id);
                    return prod ? prod.nome : "";
                };
                const { blob, nomeArquivo } = gerarPdfOrcamento({
                    orcamento: {
                        id_cli_fk: cliente.id,
                        valor_final: item.valor_final,
                        forma_pagamento: item.forma_pagamento,
                        prazo: item.prazo,
                        observacao: item.observacao,
                        percentual_comissao: item.percentual_comissao || 0,
                        parcelas: item.parcelas || 1,
                        codigo_finame: item.codigo_finame || "",
                    },
                    produtosOrcamento: (item.produtosOrcamento || []).map(po => ({
                        id_pro_fk: po.produto?.id || po.id_pro_fk || "",
                        valor_unitario: po.valor_unitario,
                        valor_final_unitario: po.valor_final_unitario,
                        quantidade: po.quantidade,
                    })),
                    listaClientes,
                    listaProdutos,
                    nomeProduto
                });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = nomeArquivo;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        };

        const sincronizarOrcamentos = async () => {
            try {
                const data = await buscarDessincronizadosLocal();
                proxy?.$toast.info(`Sincronizando orcamentos`);
                await new Promise((resolve) => setTimeout(resolve, 3000));

                await buscarDessincronizadosLocal();
                proxy?.$toast.success(`Dados de orcamento sincronizados com sucesso!`);
            } catch (error) {
                proxy?.$toast.error("Erro inesperado ao sincronizar orçamentos.");
            }
        };

        return {
            columns,
            items,
            meta,
            buscar,
            excluir,
            ativar,
            editar,
            filtro,
            itemSelecionado,
            abrirModalExcluir,
            confirmarExclusao,
            fecharModalExcluir,
            cargoUsuario,
            isModalExcluir,
            abrirModalAtivar,
            confirmarAtivacao,
            fecharModalAtivar,
            isModalAtivar,
            selectedItem,
            visualizarDetalhes,
            fecharModalDetalhes,
            isModalViewOpen,
            exportarPdfOrcamento,
            selectedItems,
            exportarOrcamentos,
            sincronizarOrcamentos,
            formatarMoeda,
            formatarFormaPagamento,
            formatarDocumento,
            formatarDataBrasileira,
            formatarTelefone,
            paginatedProdutos,
            paginationMeta,
            handlePagination,
            isOnline
        };
    }
};
</script>