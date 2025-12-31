<template>
    <div class="container mx-auto p-8">
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-4xl font-bold">Consultar clientes</h3>
        </div>
        <div class="mb-4 flex justify-between items-center">
            <div class="relative w-full lg:w-1/3">
                <input type="text" v-model="filtro" placeholder="Pesquisar"
                    class="border border-gray-300 rounded-lg px-4 py-2 pr-10 w-full" @input="buscar({ filtro })" />
                <font-awesome-icon icon="search"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <!-- <div class="flex gap-2">
                <BotaoComponente :title="'Sincronizar'" class="px-3 py-1 text-sm" @click="sincronizarClientes">
                    <font-awesome-icon icon="sync" class="ml-1" />
                </BotaoComponente>
            </div> -->
        </div>
        <TabelaComponente :columns="columns" :items="items" :meta="meta" @paginate="buscar">
            <template #acoes="{ item }">
                <div class="flex justify-center items-center gap-3">
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
                    Nenhum cliente encontrado.
                </div>
            </template>
        </TabelaComponente>

        <ModalDesativarComponente :isModalControllerDelete="isModalExcluir" deleteDataName="nome"
            :deleteData="itemSelecionado" @confirmar="confirmarExclusao" @cancelar="fecharModalExcluir" />

        <ModalAtivarComponente :isModalControllerActivate="isModalAtivar" activateDataName="nome"
            :activateData="itemSelecionado" @confirmar="confirmarAtivacao" @cancelar="fecharModalAtivar" />
    </div>
</template>

<script>
import BotaoComponente from "../../../Componentes/Outros/BotaoComponente.vue";
import TabelaComponente from "../../../Componentes/Outros/TabelaComponente.vue";
import ModalDesativarComponente from "../../../Componentes/Modais/ModalDesativarComponente.vue";
import ModalAtivarComponente from "../../../Componentes/Modais/ModalAtivarComponente.vue";
import { ref, getCurrentInstance } from "vue";
import { consultaScriptCliente } from "./ConsultaScriptCliente.ts";
import { useRouter } from "vue-router";
import { buscarDessincronizadosLocal } from "./SincroniaScriptCliente.ts";
import { buscarDessincronizadosLocalEndereco } from "./SincroniaScriptEndereco.ts";

export default {
    name: "consulta-cliente",
    components: {
        BotaoComponente,
        TabelaComponente,
        ModalDesativarComponente,
        ModalAtivarComponente,
    },
    setup() {
        const { columns, items, meta, loading, filtro, buscar, excluir, ativar, cargoUsuario } = consultaScriptCliente();
        const router = useRouter();
        const itemSelecionado = ref(null);
        const isModalExcluir = ref(false);
        const isModalAtivar = ref(false);
        const sincronizando = ref(false);
        const instance = getCurrentInstance();
        const proxy = instance?.proxy;

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

        const editar = (item) => {
            router.push({
                name: 'cadastrar-cliente',
                params: { id: item.id }
            });
        };


        const sincronizarClientes = async () => {
            try {
                await buscarDessincronizadosLocalEndereco();
                await buscarDessincronizadosLocal();

                proxy?.$toast.info(`Sincronizando Clientes`);
                await new Promise((resolve) => setTimeout(resolve, 3000));

                await buscarDessincronizadosLocalEndereco();
                await buscarDessincronizadosLocal();
                proxy?.$toast.success(`Dados de cliente sincronizados com sucesso!`);
            } catch (error) {
                proxy?.$toast.error("Erro inesperado ao sincronizar cliente.");
            }
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
            isModalViewOpen,
            selectedItem,
            editar,
            filtro,
            cargoUsuario,
            sincronizarClientes,
            sincronizando,
        };
    }
};
</script>