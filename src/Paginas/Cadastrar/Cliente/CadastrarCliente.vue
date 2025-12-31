<template>
    <FormsRegister :title="id ? ' Atualização de cliente' : 'Cadastro de cliente'" :subTitle="id
        ? 'Atualize o cliente e mantenha seus dados atualizados'
        : 'Cadastre um novo cliente e mantenha seus dados atualizados'"
        imgPath="../../../../Publico/Imagens/Decoracao/cadastrar-cliente.svg" class="mt-5">
        <form @submit.prevent="save">
            <div class="flex flex-col md:flex-row gap-2">
                <!-- Campo Nome -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="nome" class="font-medium text-[#3F3D56]">Nome:</label>
                    <input v-model="state.formularioCliente.nome" type="text" id="nome" placeholder="Digite o nome"
                        class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                        :class="{ 'border-[#f93910]': v$.formularioCliente.nome.$error }" />
                    <span v-if="v$.formularioCliente.nome.$error" class="text-red-500">
                        {{ v$.formularioCliente.nome.$errors[0].$message }}
                    </span>
                </div>

                <!-- Campo Documento -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="documento" class="font-medium text-[#3F3D56]">
                        Documento:
                    </label>
                    <input v-model="state.formularioCliente.documento" type="text" id="documento"
                        placeholder="Digite o CPF ou CNPJ" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                        v-mask="mascaraDocumento"
                        :class="{ 'border-[#f93910]': v$.formularioCliente.documento.$error }" />
                    <span v-if="v$.formularioCliente.documento.$error" class="text-red-500">
                        {{ v$.formularioCliente.documento.$errors[0].$message }}
                    </span>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-2">
                <!-- Campo Telefone -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="telefone" class="font-medium text-[#3F3D56]">
                        Telefone:
                    </label>
                    <input v-model="state.formularioCliente.telefone" type="text" id="telefone"
                        placeholder="Digite o telefone" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                        :class="{ 'border-[#f93910]': v$.formularioCliente.telefone.$error }"
                        v-mask="'(##) #####-####'" />
                    <span v-if="v$.formularioCliente.telefone.$error" class="text-red-500">
                        {{ v$.formularioCliente.telefone.$errors[0].$message }}
                    </span>
                </div>

                <!-- Campo Data Nascimento (só aparece quando não é CNPJ) -->
                <div v-if="!isCNPJ" class="flex flex-col sm:w-full w-full mt-2">
                    <label for="data_nascimento" class="font-medium text-[#3F3D56]">
                        Data Nascimento:
                    </label>
                    <input v-model="state.formularioCliente.nascimento" type="date" id="data_nascimento"
                        class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                        :class="{ 'border-[#f93910]': v$.formularioCliente.nascimento.$error }" />
                    <span v-if="v$.formularioCliente.nascimento.$error" class="text-red-500">
                        {{ v$.formularioCliente.nascimento.$errors[0].$message }}
                    </span>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-2">
                <!-- Campo CEP -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="cep" class="font-medium text-[#3F3D56]">CEP:</label>
                    <input v-model="state.endereco.cep" type="text" id="cep" placeholder="Digite o CEP"
                        class="border-2 border-[#3F3D56] p-2 w-full rounded-lg" @blur="pesquisarCep(state.endereco)"
                        :class="{ 'border-[#f93910]': v$.endereco.cep.$error }" v-mask="'#####-###'" />
                    <span v-if="v$.endereco.cep.$error" class="text-red-500">
                        {{ v$.endereco.cep.$errors[0].$message }}
                    </span>
                </div>

                <!-- Campo Estado -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="estado" class="font-medium text-[#3F3D56]">Estado:</label>
                    <Multiselect id="estado" v-model="state.endereco.id_est_fk" @input="v$.endereco.id_est_fk.$touch()"
                        noOptionsText="Nenhuma opção disponíveis" noResultsText="Nenhum resultado encontrado"
                        placeholder="Digite para pesquisar" searchable :limit="5"
                        :options="listarEstados.map(est => ({ label: est.nome, value: est.id_est_fk }))" :classes="{
                            container:
                                'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#03223f] rounded-md bg-white leading-snug outline-none',
                            optionSelected: 'text-white bg-orange-400',
                            optionPointed: 'bg-gray-200',
                            optionSelectedPointed: 'text-white bg-orange-500',
                        }" :class="{ 'border-red-500': v$.endereco.id_est_fk.$error }" />
                    <span v-if="v$.endereco.id_est_fk.$error" class="text-red-500">
                        {{ v$.endereco.id_est_fk.$errors[0].$message }}
                    </span>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-2">
                <!-- Campo Cidade -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="cidade" class="font-medium text-[#3F3D56]">Cidade:</label>
                    <Multiselect id="cidade" v-model="state.endereco.id_cid_fk" @input="v$.endereco.id_cid_fk.$touch()"
                        noOptionsText="Nenhuma opção disponíveis" noResultsText="Nenhum resultado encontrado"
                        placeholder="Digite para pesquisar" searchable :limit="5"
                        :options="cidades.map(cid => ({ label: cid.nome, value: cid.id }))" :classes="{
                            container:
                                'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#03223f] rounded-md bg-white leading-snug outline-none',
                            optionSelected: 'text-white bg-orange-400',
                            optionPointed: 'bg-gray-200',
                            optionSelectedPointed: 'text-white bg-orange-500',
                        }" :class="{ 'border-red-500': v$.endereco.id_cid_fk.$error }" />
                    <span v-if="v$.endereco.id_cid_fk.$error" class="text-red-500">
                        {{ v$.endereco.id_cid_fk.$errors[0].$message }}
                    </span>
                </div>

                <!-- Campo Bairro -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="bairro" class="font-medium text-[#3F3D56]">Bairro:</label>
                    <input v-model="state.endereco.bairro" type="text" id="bairro" placeholder="Digite o bairro"
                        class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                        :class="{ 'border-[#f93910]': v$.endereco.bairro.$error }" />
                    <span v-if="v$.endereco.bairro.$error" class="text-red-500">
                        {{ v$.endereco.bairro.$errors[0].$message }}
                    </span>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-2">
                <!-- Campo Rua -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="rua" class="font-medium text-[#3F3D56]">Rua:</label>
                    <input v-model="state.endereco.rua" type="text" id="rua" placeholder="Digite o rua"
                        class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                        :class="{ 'border-[#f93910]': v$.endereco.rua.$error }" />
                    <span v-if="v$.endereco.rua.$error" class="text-red-500">
                        {{ v$.endereco.rua.$errors[0].$message }}
                    </span>
                </div>

                <!-- Campo Número -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="numero" class="font-medium text-[#3F3D56]">Número:</label>
                    <input v-model="state.endereco.numero" type="text" id="numero" placeholder="Digite o número"
                        class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                        :class="{ 'border-[#f93910]': v$.endereco.numero.$error }" />
                    <span v-if="v$.endereco.numero.$error" class="text-red-500">
                        {{ v$.endereco.numero.$errors[0].$message }}
                    </span>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-2">
                <!-- Campo Complemento -->
                <div class="flex flex-col sm:w-full w-full mt-2">
                    <label for="complemento" class="font-medium text-[#3F3D56]">
                        Complemento:
                    </label>
                    <input v-model="state.endereco.complemento" type="text" id="complemento"
                        placeholder="Digite o complemento" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                        :class="{ 'border-[#f93910]': v$.endereco.complemento.$error }" />
                    <span v-if="v$.endereco.complemento.$error" class="text-red-500">
                        {{ v$.endereco.complemento.$errors[0].$message }}
                    </span>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-2 mt-3">
                <!-- Botão Cadastrar/Atualizar -->
                <BotaoComponente v-if="!state.isLoad" :disabled="state.isLoad" :title="id ? 'Atualizar' : 'Cadastrar'"
                    @click.prevent="async () => {
                        state.isLoad = true;
                        await save();
                        state.isLoad = false;
                    }">
                    <font-awesome-icon :icon="id ? 'pencil-alt' : 'save'" class="ml-2" />
                </BotaoComponente>

                <BotaoComponente v-else :disabled="true">
                    <font-awesome-icon icon="spinner" spin class="ml-2" />
                </BotaoComponente>
            </div>
        </form>
    </FormsRegister>
</template>

<script lang="ts">
import BotaoComponente from "../../../Componentes/Outros/BotaoComponente.vue";
import FormsRegister from "../../../Componentes/Esqueleto/FormularioCadastrarComponente.vue";
import { cadastroScriptCliente } from "./CadastroScriptCliente.ts";

export default {
    name: "cadastrar-cliente",
    props: {
        id: {
            type: [String, Number],
            default: null,
        },
    },
    components: {
        BotaoComponente,
        FormsRegister,
    },
    setup(props) {
        const {
            state,
            v$,
            isCNPJ,
            save,
            pesquisarCep,
            listarEstados,
            cidades,
            mascaraDocumento,
        } = cadastroScriptCliente(props.id);

        return {
            state,
            v$,
            isCNPJ,
            save,
            pesquisarCep,
            listarEstados,
            cidades,
            mascaraDocumento,
        };
    },
};
</script>