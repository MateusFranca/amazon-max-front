<template>
    <div class="container mx-auto p-4 sm:p-6 lg:p-12">
        <h3 class="text-2xl sm:text-3xl mb-2 text-[#3F3D56] text-left">
            {{ id ? "Editar orçamento" : "Cadastro de orçamento" }}
        </h3>
        <h4 class="text-sm sm:text-base mb-4 text-[#6C6B7F] text-left">
            {{ id ? "Atualize o orçamento e mantenha seus dados atualizados" : "Cadastre um novo orçamento" }}
        </h4>

        <div class="grid grid-cols-1 gap-6">
            <form @submit.prevent="salvar">

                <p class="font-medium text-[#3F3D56] text-2xl mb-2">Informações do Cliente</p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col w-full">
                        <label for="id_cli_fk" class="font-medium text-[#3F3D56]">Cliente:</label>
                        <Multiselect id="id_cli_fk" v-model="state.orcamento.id_cli_fk"
                            @input="v$.orcamento.id_cli_fk.$touch(); formErrors.cliente = ''"
                            noOptionsText="Nenhuma opção disponível" noResultsText="Nenhum resultado encontrado"
                            placeholder="Selecione o cliente" searchable :limit="5" :options="state.listaClientes.map(cli => ({
                                label: cli.nome,
                                value: cli.id
                            }))" :classes="{
                                container: 'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#03223f] rounded-md bg-white leading-snug outline-none',
                                optionSelected: 'text-white bg-orange-400',
                                optionPointed: 'bg-gray-200',
                                optionSelectedPointed: 'text-white bg-orange-500',
                            }"
                            :class="[{ 'border-red-500': v$.orcamento.id_cli_fk.$error || formErrors.cliente }, { 'bg-gray-100': !!id }]"
                            :disabled="state.produtosOrcamento.length >= 1" />
                        <span v-if="v$.orcamento.id_cli_fk.$error" class="text-red-500">
                            {{ v$.orcamento.id_cli_fk.$errors[0].$message }}
                        </span>
                        <span v-else-if="formErrors.cliente" class="text-red-500">
                            {{ formErrors.cliente }}
                        </span>
                    </div>
                    <div class="flex flex-col w-full">
                        <label for="cpf_cliente" class="font-medium text-[#3F3D56]">Documento:</label>
                        <input id="cpf_cliente" placeholder="Documento do cliente" type="text"
                            :value="documentoFormatado"
                            class="border-2 border-[#3F3D56] p-2 w-full rounded-lg bg-gray-100" disabled />
                    </div>
                </div>

                <p class="font-medium text-[#3F3D56] text-2xl mt-4 mb-2">Informações do Produto</p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col w-full">
                        <label for="id_pro_fk" class="font-medium text-[#3F3D56]">Produto:</label>
                        <Multiselect
                            id="id_pro_fk"
                            v-model="produtoForm.id_pro_fk"
                            placeholder="Selecione o produto"
                            :options="state.listaProdutos.map(pro => ({
                                label: pro.nome,
                                value: pro.id,
                            }))"
                            :limit="5"
                            :classes="{
                                container: 'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#03223f] rounded-md bg-white leading-snug outline-none',
                                optionSelected: 'text-white bg-orange-400',
                                optionPointed: 'bg-gray-200',
                                optionSelectedPointed: 'text-white bg-orange-500',
                            }"
                            :class="{ 'border-[#f93910]': produtoFormError.id_pro_fk }"
                            @change="atualizarValorUnitario"
                        />
                        <span v-if="produtoFormError.id_pro_fk" class="text-red-500">
                            {{ produtoFormError.id_pro_fk }}
                        </span>
                        <span v-else-if="!produtoForm.id_pro_fk && v$.$dirty && state.produtosOrcamento.length === 0"
                            class="text-red-500">
                            Produto é obrigatório
                        </span>
                    </div>
                    <div class="flex flex-col w-full">
                        <label for="valor_unitario" class="font-medium text-[#3F3D56]">Valor Unitário:</label>
                        <Multiselect
                            id="valor_unitario"
                            v-model="produtoForm.valor_unitario"
                            placeholder="Selecione o valor"
                            :options="valorUnitarioOptions"
                            noOptionsText="Selecione um produto primeiro" 
                            noResultsText="Nenhum resultado encontrado"
                            :classes="{
                                container: 'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#3F3D56] rounded-md bg-white leading-snug outline-none',
                                optionSelected: 'text-white bg-orange-400',
                                optionPointed: 'bg-gray-200',
                                optionSelectedPointed: 'text-white bg-orange-500',
                            }"
                            :class="{ 'border-[#f93910]': produtoFormError.valor_unitario }"
                        />
                        <span v-if="produtoFormError.valor_unitario" class="text-red-500">
                            {{ produtoFormError.valor_unitario }}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col w-full">
                        <label for="quantidade" class="font-medium text-[#3F3D56]">Quantidade:</label>
                        <input v-model="produtoForm.quantidade" type="number" min="1" id="quantidade"
                            placeholder="Quantidade" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                            :class="{ 'border-[#f93910]': produtoFormError.quantidade }" />
                        <span v-if="produtoFormError.quantidade" class="text-red-500">
                            {{ produtoFormError.quantidade }}
                        </span>
                    </div>
                </div>

                <p class="font-medium text-[#3F3D56] text-2xl mt-4 mb-2">Informações da Venda</p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col w-full">
                        <label for="prazo" class="font-medium text-[#3F3D56]">Prazo:</label>
                        <input id="prazo" v-model="state.orcamento.prazo" type="date"
                            class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                            :class="{ 'border-[#f93910]': (v$.orcamento.prazo && v$.orcamento.prazo.$error) || formErrors.prazo }"
                            @input="formErrors.prazo = ''" />
                        <span v-if="v$.orcamento.prazo && v$.orcamento.prazo.$error"
                            class="text-red-500">
                            {{ v$.orcamento.prazo.$errors[0].$message }}
                        </span>
                        <span v-else-if="formErrors.prazo" class="text-red-500">
                            {{ formErrors.prazo }}
                        </span>
                    </div>

                    <div class="flex flex-col w-full">
                        <label for="forma_pagamento" class="font-medium text-[#3F3D56]">Forma de Pagamento:</label>
                        <Multiselect id="forma_pagamento" v-model="state.orcamento.forma_pagamento"
                            placeholder="Selecione a forma de pagamento" :options="formasPagamentoOptions"
                            noOptionsText="Nenhuma opção disponível" 
                            noResultsText="Nenhum resultado encontrado"
                            :classes="{
                                container: 'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#03223f] rounded-md bg-white leading-snug outline-none',
                                optionSelected: 'text-white bg-orange-400',
                                optionPointed: 'bg-gray-200',
                                optionSelectedPointed: 'text-white bg-orange-500',
                            }" />
                        <div v-if="state.orcamento.forma_pagamento === 'cartao_debito'" class="text-xs text-gray-600 mt-1">
                            Taxa de juros: 0,89%
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 mt-2">
                    <div v-if="state.orcamento.forma_pagamento === 'cartao_credito'"  class="flex flex-col w-full">
                        <label for="parcelas" class="font-medium text-[#3F3D56]">Parcelas</label>
                        <Multiselect
                            id="parcelas"
                            v-model="state.orcamento.parcelas"
                            :options="parcelasOptions"
                            placeholder="Selecione a quantidade de parcelas"
                            searchable
                            :classes="{
                                container: 'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#3F3D56] rounded-md bg-white leading-snug outline-none',
                                optionSelected: 'text-white bg-orange-400',
                                optionPointed: 'bg-gray-200',
                                optionSelectedPointed: 'text-white bg-orange-500',
                            }"
                            @change="calcularValores()"
                        />
                        <div v-if="['cartao_credito'].includes(state.orcamento.forma_pagamento) && state.orcamento.parcelas >= 1"
                            class="text-xs text-gray-600 mt-1">
                            Taxa de juros:
                            <span v-if="state.orcamento.parcelas === 1">1,69%</span>
                            <span v-else-if="state.orcamento.parcelas >= 2 && state.orcamento.parcelas <= 12">2,65%</span>
                            <span v-else>0%</span>
                            <br />
                            Valor da parcela:
                            <span>
                                {{ formatToBRL((state.orcamento.valor_final / state.orcamento.parcelas) || 0) }}
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col w-full">
                        <label for="codigo_finame" class="font-medium text-[#3F3D56]">Código FINAME</label>
                        <input v-model="state.orcamento.codigo_finame" type="text" id="codigo_finame"
                            placeholder="Código FINAME"
                            class="border-2 border-[#3F3D56] p-2 w-full rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6608]"
                            maxlength="50" />
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4 mt-4">
                    <div class="flex flex-col w-full">
                        <label for="observacao" class="font-medium text-[#3F3D56]">Observação:</label>
                        <textarea id="observacao" v-model="state.orcamento.observacao"
                            placeholder="Digite aqui suas observações"
                            class="border-2 border-[#3F3D56] p-2 w-full rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6608]"
                            rows="5"
                            :class="{ 'border-red-500': v$.orcamento.observacao.$error || formErrors.observacao }"
                            @input="v$.orcamento.observacao.$touch(); formErrors.observacao = ''"></textarea>
                        <span v-if="v$.orcamento.observacao.$error" class="text-red-500">
                            {{ v$.orcamento.observacao.$errors[0].$message }}
                        </span>
                        <span v-else-if="formErrors.observacao" class="text-red-500">
                            {{ formErrors.observacao }}
                        </span>
                    </div>
                </div>

                <div class="flex flex-wrap gap-4 mt-6 items-center">
                    <BotaoComponente v-if="!state.isLoad"
                        :disabled="state.isLoad || !produtoForm.id_pro_fk || !produtoForm.valor_unitario || state.orcamento.forma_pagamento === 'nao_selecionado'"
                        :title="'Inserir na tabela'" @click.prevent="adicionarProduto()">
                        <font-awesome-icon icon="plus" class="ml-2" />
                    </BotaoComponente>
                </div>
            </form>

            <div class="bg-white shadow rounded-lg relative">
                <TabelaComponente :columns="tableColumns" :items="paginatedItems" :meta="paginationMeta"
                    @paginate="handlePagination">
                    <template #produto="{ item }">
                        {{ nomeProduto(item.id_pro_fk) }}
                    </template>

                    <template #valor_unitario="{ item }">
                        {{ formatToBRL(item.valor_unitario) }}
                    </template>

                    <template #valor_final="{ item }">
                        {{ formatToBRL(item.valor_final_unitario) }}
                    </template>

                    <template #subtotal="{ item }">
                        {{ formatToBRL(item.valor_final_unitario * item.quantidade) }}
                    </template>

                    <template #acoes="{ index }">
                        <div class="flex gap-2 items-center justify-center">
                            <button
                                @click="editarProduto(index + (paginationMeta.pagina_atual - 1) * paginationMeta.itens_por_pagina)"
                                class="text-blue-600 hover:text-blue-800">
                                <font-awesome-icon icon="pencil-alt" />
                            </button>
                            <button
                                @click="removerProduto(index + (paginationMeta.pagina_atual - 1) * paginationMeta.itens_por_pagina)"
                                class="text-red-600 hover:text-red-800">
                                <font-awesome-icon icon="trash" />
                            </button>
                        </div>
                    </template>

                    <template #summary>
                        <div class="px-4 py-3 border-t border-gray-300">
                            <div v-if="!state.produtosOrcamento.length" class="p-4 text-center mb-2">
                                <span
                                    :class="{ 'text-red-500': (v$.$dirty && state.produtosOrcamento.length === 0) || formErrors.produtos }">
                                    {{ formErrors.produtos || 'É necessário adicionar pelo menos um produto à tabela' }}
                                </span>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                <div class="flex flex-col items-center justify-center text-center">
                                    <label for="percentual_comissao" class="font-medium text-[#3F3D56] text-sm text-center">Comissão
                                        do Vendedor (%)</label>
                                    <input v-model.number="state.orcamento.percentual_comissao" type="number"
                                        min="0" :max="comissaoMaxima" step="1" id="percentual_comissao" placeholder="%"
                                        class="border-2 border-[#3F3D56] p-1 w-full rounded-lg text-sm text-center"
                                        @input="
                                            state.orcamento.percentual_comissao = Math.max(
                                                0,
                                                Math.min(
                                                    comissaoMaxima,
                                                    Number(state.orcamento.percentual_comissao) || 0
                                                )
                                            );
                                        calcularValores();
                                        " />
                                </div>
                                <div class="flex flex-col items-center justify-center text-center">
                                    <label for="valor_final" class="font-medium text-[#3F3D56] text-sm text-center">Valor
                                        Final:</label>
                                    <input :value="formatToBRL(state.orcamento.valor_final)" type="text"
                                        id="valor_final"
                                        class="border-2 border-[#3F3D56] p-1 w-full rounded-lg bg-gray-100 text-sm text-center"
                                        disabled />
                                </div>
                            </div>
                        </div>
                    </template>
                </TabelaComponente>
            </div>

            <div class="flex justify-start mt-4">
                <BotaoComponente v-if="!state.isLoad" :title="id ? 'Atualizar' : 'Cadastrar'"
                    @click.prevent="salvarOrcamento">
                    <font-awesome-icon :icon="id ? 'pencil-alt' : 'save'" class="ml-2" />
                </BotaoComponente>
                <BotaoComponente v-else :disabled="true">
                    <font-awesome-icon icon="spinner" spin class="ml-2" />
                </BotaoComponente>
            </div>
        </div>

        <ModalEditarComponente :isModalControllerEdit="showEditModal" :title="'Editar Produto do Orçamento'"
            @close-modal="showEditModal = false" @edit-request="salvarEdicao">
            <template #content>
                <div class="space-y-4">
                    <div class="flex flex-col w-full">
                        <label for="edit_produto" class="font-medium text-[#3F3D56]">Produto:</label>
                        <Multiselect id="edit_produto" v-model="itemEmEdicao.id_pro_fk"
                            placeholder="Selecione o produto" searchable :options="state.listaProdutos.map(pro => ({
                                label: pro.nome,
                                value: pro.id,
                            }))" :limit="5" :classes="{
                                container: 'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#03223f] rounded-md bg-white leading-snug outline-none',
                                optionSelected: 'text-white bg-orange-400',
                                optionPointed: 'bg-gray-200',
                                optionSelectedPointed: 'text-white bg-orange-500',
                            }" :class="{ 'border-red-500': itemEmEdicaoV$.id_pro_fk.$error }"
                            @change="atualizarValorUnitarioEdicao" />
                        <span v-if="itemEmEdicaoV$.id_pro_fk.$error" class="text-red-500 text-xs">
                            {{ itemEmEdicaoV$.id_pro_fk.$errors[0].$message }}
                        </span>
                    </div>
                    <div class="flex flex-col w-full">
                        <label for="edit_valor_unitario" class="font-medium text-[#3F3D56]">Valor Unitário:</label>
                        <Multiselect
                            id="edit_valor_unitario"
                            v-model="itemEmEdicao.valor_unitario"
                            placeholder="Selecione o valor"
                            :options="valorUnitarioOptionsEdicao"
                            :classes="{
                                container: 'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#3F3D56] rounded-md bg-white leading-snug outline-none',
                                optionSelected: 'text-white bg-orange-400',
                                optionPointed: 'bg-gray-200',
                                optionSelectedPointed: 'text-white bg-orange-500',
                            }"
                        />
                    </div>
                    <div class="flex flex-col w-full">
                        <label for="edit_quantidade" class="font-medium text-[#3F3D56]">Quantidade:</label>
                        <input v-model="itemEmEdicao.quantidade" type="number" min="1" id="edit_quantidade"
                            placeholder="Quantidade" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                            :class="{ 'border-red-500': itemEmEdicaoV$.quantidade.$error }"
                            @input="itemEmEdicaoV$.quantidade.$touch()" />
                        <span v-if="itemEmEdicaoV$.quantidade.$error" class="text-red-500 text-xs">
                            {{ itemEmEdicaoV$.quantidade.$errors[0].$message }}
                        </span>
                    </div>
                </div>
            </template>
        </ModalEditarComponente>
    </div>
</template>

<script>
import BotaoComponente from "../../../Componentes/Outros/BotaoComponente.vue";
import TabelaComponente from "../../../Componentes/Outros/TabelaComponente.vue";
import ModalEditarComponente from "../../../Componentes/Modais/ModalEditarComponente.vue";
import { cadastroScriptOrcamento } from "./CadastroScriptOrcamento.ts";
import { nextTick, reactive, ref, computed, watch, onMounted, getCurrentInstance } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, minValue, maxValue, helpers } from "@vuelidate/validators";
import { formatarDocumento } from "../../../utils/formatUtils";
import { formatToBRL } from "../../../utils/currencyMaskUtils.ts";
import Multiselect from '@vueform/multiselect';

export default {
    name: "cadastrar-orcamento",
    props: {
        id: {
            type: [String, Number],
            default: null,
        },
    },
    components: { BotaoComponente, TabelaComponente, ModalEditarComponente },
    setup(props) {
        const {
            state,
            produtoV$,
            save, 
            produtoForm,
            produtoFormError,
            adicionarProduto,
            removerProduto,
            nomeProduto,
            atualizarValorUnitario,
            calcularValores,
            gerarPdfBlob,
            carregarOrcamento,
            carregarClientes,
            carregarProdutos,
            comissaoMaxima
        } = cadastroScriptOrcamento(props.id);

        const { proxy } = getCurrentInstance();

        const formErrors = reactive({
            produtos: '',
            cliente: '',
            prazo: '',
            observacao: '',
            general: ''
        });

        if (props.id) {
            carregarOrcamento();
        }

        onMounted(async () => {
            await carregarClientes();
            await carregarProdutos();

            if (props.id) {
                setTimeout(() => {
                    if (state.orcamento.prazo && typeof state.orcamento.prazo === 'string') {
                        if (state.orcamento.prazo.includes('T')) {
                            state.orcamento.prazo = state.orcamento.prazo.split('T')[0];
                        }
                    }
                }, 500);
            }
        });

        const tableColumns = [
            { header: 'Produto', value: 'produto', headerClass: 'bg-[#ff6608] text-white' },
            { header: 'Quantidade', value: 'quantidade', headerClass: 'bg-[#ff6608] text-white' },
            { header: 'Valor Unit.', value: 'valor_unitario', headerClass: 'bg-[#ff6608] text-white' },
            { header: 'Valor Total Unit.', value: 'subtotal', headerClass: 'bg-[#ff6608] text-white' },
            { header: 'Ações', value: 'acoes', headerClass: 'bg-[#ff6608] text-white' },
        ];

        const atualizarValorBruto = () => {
            const valorFinal = state.produtosOrcamento.reduce((total, produto) => {
                return total + (parseFloat(produto.valor_unitario) * produto.quantidade);
            }, 0);

            state.orcamento.valor_total_desconto = 0;
            state.orcamento.valor_final = valorFinal;
        };

        const calcularValoresModificado = () => {
            atualizarValorBruto();
            if (typeof calcularValores === 'function') {
                calcularValores();
            }
        };

        const abrirPdfEmNovaAba = () => {
            const pdfBlob = gerarPdfBlob();
            const clienteSelecionado = state.listaClientes.find(cli => cli.id === state.orcamento.id_cli_fk);
            const nomeCliente = clienteSelecionado ? clienteSelecionado.nome : "orcamento";
            const nomeArquivo = `${nomeCliente.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = nomeArquivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const showEditModal = ref(false);
        const itemEmEdicao = reactive({
            id_pro_fk: null,
            valor_unitario: null,
            quantidade: null,
            indice: -1
        });

        const itemEmEdicaoRules = {
            id_pro_fk: { required: helpers.withMessage("Selecione um produto", required) },
            quantidade: {
                required: helpers.withMessage("Quantidade é obrigatória", required),
                minValue: helpers.withMessage("Quantidade mínima é 1", minValue(1))
            }
        };

        const itemEmEdicaoV$ = useVuelidate(itemEmEdicaoRules, itemEmEdicao);

        const editarProduto = (index) => {
            const item = state.produtosOrcamento[index];
            itemEmEdicao.id_pro_fk = item.id_pro_fk;
            itemEmEdicao.valor_unitario = item.valor_unitario;
            itemEmEdicao.quantidade = item.quantidade;
            itemEmEdicao.indice = index;
            showEditModal.value = true;
        };

        const atualizarValorUnitarioEdicao = async () => {
            await nextTick();
            const produtoSelecionado = state.listaProdutos.find(
                (pro) => pro.id === itemEmEdicao.id_pro_fk
            );
            if (produtoSelecionado) {
                itemEmEdicao.valor_unitario = produtoSelecionado.valor_unitario;
            } else {
                itemEmEdicao.valor_unitario = null;
            }
        };

        const salvarEdicao = () => {
            itemEmEdicaoV$.value.$touch();

            if (itemEmEdicaoV$.value.$invalid) {
                return;
            }

            const valorFinalUnitario = itemEmEdicao.valor_unitario;

            state.produtosOrcamento[itemEmEdicao.indice] = {
                id_pro_fk: itemEmEdicao.id_pro_fk,
                valor_unitario: itemEmEdicao.valor_unitario,
                quantidade: itemEmEdicao.quantidade,
                valor_final_unitario: valorFinalUnitario,
            };

            calcularValores();

            proxy.$toast.success("Produto editado com sucesso");
            showEditModal.value = false;
        };

        const paginationMeta = reactive({
            total_paginas: 1,
            pagina_atual: 1,
            itens_por_pagina: 5,
            total_itens: state.produtosOrcamento.length,
        });

        const paginatedItems = computed(() => {
            if (!state.produtosOrcamento || state.produtosOrcamento.length === 0) {
                return [];
            }
            const start = (paginationMeta.pagina_atual - 1) * paginationMeta.itens_por_pagina;
            const end = start + paginationMeta.itens_por_pagina;
            return state.produtosOrcamento.slice(start, end).map((item) => ({
                ...item,
                // desconto_unitario: item.desconto_unitario || 0, // Removido
            }));
        });

        const handlePagination = ({ pagina }) => {
            if (pagina < 1 || pagina > paginationMeta.total_paginas) {
                return;
            }
            paginationMeta.pagina_atual = pagina;
        };

        watch(
            () => state.produtosOrcamento.length,
            (newLength) => {
                paginationMeta.total_itens = newLength;
                paginationMeta.total_paginas = Math.max(1, Math.ceil(newLength / paginationMeta.itens_por_pagina));
                if (paginationMeta.pagina_atual > paginationMeta.total_paginas) {
                    paginationMeta.pagina_atual = 1;
                }
                calcularValores();
            }
        );

        if (!state.orcamento.forma_pagamento) {
            state.orcamento.forma_pagamento = "nao_selecionado";
        }

        const validarProdutoForm = () => {
            let isValid = true;

            Object.keys(produtoFormError).forEach(key => {
                produtoFormError[key] = "";
            });

            if (!produtoForm.id_pro_fk && state.produtosOrcamento.length === 0) {
                produtoFormError.id_pro_fk = "Selecione um produto";
                isValid = false;
            }

            if (!produtoForm.quantidade || produtoForm.quantidade < 1) {
                produtoFormError.quantidade = "Quantidade deve ser maior que zero";
                isValid = false;
            }

            return isValid;
        };

        const documentoFormatado = computed(() => {
            const cliente = state.listaClientes.find(cli => cli.id === state.orcamento.id_cli_fk);
            return cliente ? formatarDocumento(cliente.documento) : "";
        });

        const rules = {
            orcamento: {
                id_cli_fk: { required: helpers.withMessage("Cliente é obrigatório", required) },
                // desconto_total_percentual: {
                //     minValue: helpers.withMessage("O desconto não pode ser negativo", minValue(0)),
                //     maxValue: helpers.withMessage("O desconto não pode exceder 100%", maxValue(100))
                // },
                prazo: { required: helpers.withMessage("Prazo é obrigatório", required) },
                observacao: {
                    maxLength: helpers.withMessage("A observação não pode ter mais de 100 caracteres", (value) => !value || value.length <= 100)
                }
            }
        };

        const v$ = useVuelidate(rules, state);

        const clearFormErrors = () => {
            Object.keys(formErrors).forEach(key => {
                formErrors[key] = '';
            });
            v$.value.$reset();
        };

        const salvarOrcamento = async () => {
            v$.value.$touch();

            clearFormErrors();

            if (state.produtosOrcamento.length === 0) {
                formErrors.produtos = 'Adicione pelo menos um produto à tabela antes de cadastrar.';
                proxy.$toast.error('Adicione pelo menos um produto à tabela.');
                return;
            }

            if (!state.orcamento.id_cli_fk) {
                formErrors.cliente = 'Selecione um cliente antes de cadastrar.';
                proxy.$toast.error('Selecione um cliente.');
                return;
            }

            if (!state.orcamento.prazo) {
                formErrors.prazo = 'Informe o prazo do orçamento.';
                proxy.$toast.error('Informe o prazo do orçamento.');
                return;
            }

            if (state.orcamento.observacao && state.orcamento.observacao.length > 100) {
                formErrors.observacao = 'A observação não pode ter mais de 100 caracteres.';
                proxy.$toast.error('A observação não pode ter mais de 100 caracteres.');
                return;
            }

            if (v$.value.$invalid) {
                proxy.$toast.error('Corrija os erros no formulário.');
                return;
            }

            try {
                state.isLoad = true;

                calcularValores();

                const saveResult = await save();

                if (!saveResult) {
                    formErrors.general = `Erro ao ${props.id ? 'atualizar' : 'cadastrar'} o orçamento. Verifique os dados e tente novamente.`;
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 500));

                calcularValores();

                const pdfBlob = gerarPdfBlob();

                const clienteSelecionado = state.listaClientes.find(cli => cli.id === state.orcamento.id_cli_fk);
                const nomeCliente = clienteSelecionado ? clienteSelecionado.nome.replace(/[^\w\s]/gi, '') : 'orcamento';
                const dataAtual = new Date().toISOString().split('T')[0];
                const nomeArquivo = `Orcamento_${nomeCliente.replace(/\s+/g, '_')}_${dataAtual}.pdf`;

                const link = document.createElement('a');
                link.href = URL.createObjectURL(pdfBlob);
                link.download = nomeArquivo;
                document.body.appendChild(link);
                link.click();

                proxy?.$router.push({ name: "consultar-orcamento" });

                if (v$.value && typeof v$.value.$reset === 'function') {
                    v$.value.$reset();
                }

            } catch (error) {
                console.error('Erro ao processar orçamento:', error);
                formErrors.general = `Erro ao ${props.id ? 'atualizar' : 'cadastrar'} o orçamento: ${error.message || 'Erro desconhecido'}`;
                proxy.$toast.error(`Erro ao processar o orçamento.`);
            } finally {
                state.isLoad = false;
            }
        };

        const valorUnitarioOptions = computed(() => {
            const produto = state.listaProdutos.find(p => p.id === produtoForm.id_pro_fk);
            if (!produto) return [];
            return [
                { label: `Completo: ${formatToBRL(produto.valor_completo)}`, value: produto.valor_completo },
                { label: `Médio: ${formatToBRL(produto.valor_medio)}`, value: produto.valor_medio },
                { label: `Reduzido: ${formatToBRL(produto.valor_reduzido)}`, value: produto.valor_reduzido },
                { label: `Exclusivo: ${formatToBRL(produto.valor_exclusivo)}`, value: produto.valor_exclusivo },
            ];
        });

        const valorUnitarioOptionsEdicao = computed(() => {
            const produto = state.listaProdutos.find(p => p.id === itemEmEdicao.id_pro_fk);
            if (!produto) return [];
            return [
                { label: `Completo: ${formatToBRL(produto.valor_completo)}`, value: produto.valor_completo },
                { label: `Médio: ${formatToBRL(produto.valor_medio)}`, value: produto.valor_medio },
                { label: `Reduzido: ${formatToBRL(produto.valor_reduzido)}`, value: produto.valor_reduzido },
                { label: `Exclusivo: ${formatToBRL(produto.valor_exclusivo)}`, value: produto.valor_exclusivo },
            ];
        });

        const formasPagamentoOptions = computed(() => {
            const prod = state.listaProdutos.find(p => p.id === produtoForm.id_pro_fk)
            if (!prod) return []
            const v = produtoForm.valor_unitario
            const ops = [{ label: 'Cartão de Débito', value: 'cartao_debito' }]
            if (v === prod.valor_completo || v === prod.valor_medio || v === prod.valor_reduzido) {
                ops.push({ label: 'Cartão de Crédito', value: 'cartao_credito' })
            }
            return ops
        })

        const parcelasOptions = computed(() => {
            if (state.orcamento.forma_pagamento !== 'cartao_credito') return []
            const prod = state.listaProdutos.find(p => p.id === produtoForm.id_pro_fk)
            if (!prod) return []
            const v = produtoForm.valor_unitario
            const max =
                v === prod.valor_completo ? 12 :
                v === prod.valor_medio ? 6 :
                v === prod.valor_reduzido ? 4 : 0
            return Array.from({ length: max }, (_, i) => ({
                label: `${i + 1}x`,
                value: i + 1
            }))
        })

        watch(
            () => produtoForm.valor_unitario,
            (novo, old) => {
                if (novo !== old) {
                state.orcamento.forma_pagamento = "nao_selecionado";
                state.orcamento.parcelas = null;
                }
            }
        );


        return {
            state,
            v$,
            produtoV$,
            save,
            produtoForm,
            produtoFormError,
            adicionarProduto,
            removerProduto,
            editarProduto,
            nomeProduto,
            atualizarValorUnitario,
            calcularValores: calcularValoresModificado,
            formatToBRL,
            atualizarValorBruto,
            tableColumns,
            showEditModal,
            itemEmEdicao,
            itemEmEdicaoV$,
            salvarEdicao,
            atualizarValorUnitarioEdicao,
            paginatedItems,
            paginationMeta,
            handlePagination,
            validarProdutoForm,
            abrirPdfEmNovaAba,
            documentoFormatado,
            carregarClientes,
            carregarProdutos,
            rules,
            salvarOrcamento,
            formErrors,
            comissaoMaxima,
            valorUnitarioOptions,
            valorUnitarioOptionsEdicao,
            Multiselect,
            formasPagamentoOptions,
            parcelasOptions,
        };
    },
};
</script>