<template>
    <div class="container mx-auto p-8">
        <h3 class="text-4xl font-bold mb-3">Consultar produtos</h3>
        <div class="relative w-full lg:w-1/3 mb-5">
            <input type="text" v-model="filtro" placeholder="Digite para pesquisar"
                class="border border-gray-300 rounded-lg px-4 py-2 pr-10 w-full" @input="buscar({ filtro })" />
            <font-awesome-icon icon="search"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <TabelaComponente :columns="columns" :items="items" :meta="meta" @paginate="buscar">
            <template #acoes="{ item }">
                <div class="flex justify-center items-center gap-3">
                    <font-awesome-icon icon="eye" :class="{
                        'opacity-50 cursor-not-allowed text-gray-400': item.deletadoEm,
                        'text-gray-500 hover:text-gray-700': !item.deletadoEm
                    }" v-if="cargoUsuario === 'leitor' || cargoUsuario === 'vendedor' || cargoUsuario === 'admin'"
                        @click="!item.deletadoEm && abrirModalExibir(item)" />

                    <font-awesome-icon icon="pencil-alt" :class="{
                        'opacity-50 cursor-not-allowed text-gray-400': item.deletadoEm,
                        'text-blue-600 hover:text-blue-800': !item.deletadoEm
                    }" v-if="cargoUsuario === 'vendedor' || cargoUsuario === 'admin'"
                        @click="!item.deletadoEm && editar(item)" />

                    <font-awesome-icon
                        v-if="(cargoUsuario === 'vendedor' || cargoUsuario === 'admin') && item.deletadoEm"
                        :icon="['fas', 'check']" class="text-green-600 hover:text-green-800 cursor-pointer"
                        @click="abrirModalAtivar(item)" />
                    <font-awesome-icon v-else-if="(cargoUsuario === 'vendedor' || cargoUsuario === 'admin')"
                        icon="trash" class="text-red-600 hover:text-red-800 cursor-pointer"
                        @click="abrirModalExcluir(item)" />
                </div>
            </template>
            <template #message>
                <div v-if="items.length === 0" class="text-center text-gray-500 mt-4">
                    Nenhum produto encontrado.
                </div>
            </template>
        </TabelaComponente>

        <ModalViewComponent :isModalControllerView="isModalViewOpen" title="Visualizar produto"
            @close-modal="fecharModalExibir" modalWidth="48rem">
            <template #content>
                <div class="flex justify-center">
                    <Card v-if="selectedItem"
                        :marca="selectedItem.marca"
                        :modelo="selectedItem.modelo"
                        :valor_vista="selectedItem.valor_completo"
                        :valor_parcelado="selectedItem.valor_parcelado"
                        :descricao_tecnica="selectedItem.descricao_tecnica"
                        :numero_parcela="String(selectedItem.numero_parcela)"
                        :foto="selectedItem.fotosURLs"
                    />
                </div>
            </template>
        </ModalViewComponent>

        <ModalDesativarComponente :isModalControllerDelete="isModalExcluir" deleteDataName="marcaModelo"
            :deleteData="itemSelecionado" @confirmar="confirmarExclusao" @cancelar="fecharModalExcluir" />

        <ModalAtivarComponente :isModalControllerActivate="isModalAtivar" activateDataName="marcaModelo"
            :activateData="itemSelecionado" @confirmar="confirmarAtivacao" @cancelar="fecharModalAtivar" />
    </div>
</template>

<script>
import TabelaComponente from "../../../Componentes/Outros/TabelaComponente.vue";
import ModalDesativarComponente from "../../../Componentes/Modais/ModalDesativarComponente.vue";
import ModalAtivarComponente from "../../../Componentes/Modais/ModalAtivarComponente.vue";
import ModalViewComponent from "../../../Componentes/Modais/ModalViewComponent.vue";
import Card from "../../../Componentes/Outros/Card.vue";
import { ref } from "vue";
import { consultaScriptProduto } from "./ConsultaScriptProduto.ts";
import { useRouter } from "vue-router";

export default {
    name: "consultar-produto",
    components: {
        TabelaComponente,
        ModalDesativarComponente,
        ModalAtivarComponente,
        ModalViewComponent,
        Card
    },
    setup() {
        const { columns, items, meta, loading, filtro, buscar, excluir, ativar, cargoUsuario } = consultaScriptProduto();
        const router = useRouter();
        const itemSelecionado = ref(null);
        const isModalExcluir = ref(false);
        const isModalAtivar = ref(false);

        const selectedItem = ref(null);
        const isModalViewOpen = ref(false);

        const abrirModalExcluir = (item) => {
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

        const abrirModalExibir = (item) => {
            let fotosURLs = [];
            if (navigator.onLine && Array.isArray(item.foto)) {
                fotosURLs = item.foto.map(f => {
                    console.log(f.blob);

                    if (f.blob) {
                        try {
                            return URL.createObjectURL(f.blob);
                        } catch {
                            return "";
                        }
                    }
                    return f.urlImagem || "";
                });
            } else if (Array.isArray(item.fotosURLs)) {
                fotosURLs = item.fotosURLs;
            }
            selectedItem.value = {
                ...item,
                fotosURLs
            };
            isModalViewOpen.value = true;
        };

        const fecharModalExibir = () => {
            isModalViewOpen.value = false;
            selectedItem.value = null;
        };

        const abrirModalAtivar = (item) => {
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

        // const editar = (item) => {
        //     let fotosURLs = [];
        //     if (!navigator.onLine && Array.isArray(item.foto)) {
        //         fotosURLs = item.foto.map(f => {
        //             if (f.blob) {
        //                 try {
        //                     return URL.createObjectURL(f.blob);
        //                 } catch {
        //                     return "";
        //                 }
        //             }
        //             return f.urlImagem || "";
        //         });
        //     } else if (Array.isArray(item.fotosURLs)) {
        //         fotosURLs = item.fotosURLs;
        //     }
        //     router.push({
        //         name: 'cadastrar-produto',
        //         params: { id: item.id },
        //         // query: { fotosURLs: JSON.stringify(fotosURLs) }
        //     });
        // };

        const editar = (item) => {
            router.push({
                name: 'cadastrar-produto',
                params: { id: item.id }
            });
        };

        return {
            columns,
            items,
            meta,
            buscar,
            excluir,
            ativar,
            itemSelecionado,
            abrirModalExcluir,
            confirmarExclusao,
            fecharModalExcluir,
            isModalExcluir,
            abrirModalAtivar,
            confirmarAtivacao,
            fecharModalAtivar,
            isModalAtivar,
            abrirModalExibir,
            fecharModalExibir,
            isModalViewOpen,
            selectedItem,
            editar,
            filtro,
            cargoUsuario
        };
    }
};
</script>
