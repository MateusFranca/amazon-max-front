<template>
  <FormsRegister :title="id ? 'Atualização de usuário' : 'Cadastro de usuário'"
    :subTitle="id ? 'Preencha os campos abaixo para atualizar o usuário.' : 'Preencha os campos abaixo para cadastrar um novo usuário.'"
    imgPath="../../../../Publico/Imagens/Decoracao/cadastrar-usuario.svg" class="mt-5">
    <form @submit.prevent="save" class="flex flex-col gap-4 w-full">
      <div class="flex flex-col w-full">
        <label for="nomeUsuario" class="font-medium text-[#3F3D56]">
          Nome:
        </label>
        <input v-model="state.usuario.nome" type="text" id="nomeUsuario" placeholder="Digite o nome"
          class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
          :class="{ 'border-red-500': v$.usuario.nome.$error }" />
        <span v-if="v$.usuario.nome.$error" class="text-red-500">
          {{ v$.usuario.nome.$errors[0].$message }}
        </span>
      </div>

      <div class="flex flex-col w-full">
        <label for="emailUsuario" class="font-medium text-[#3F3D56]">
          Email:
        </label>
        <input v-model="state.usuario.email" type="email" id="emailUsuario" placeholder="Digite o email"
          class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
          :class="{ 'border-red-500': v$.usuario.email.$error }" />
        <span v-if="v$.usuario.email.$error" class="text-red-500">
          {{ v$.usuario.email.$errors[0].$message }}
        </span>
      </div>

      <div class="w-full md:flex md:space-x-6">
        <div class="w-full md:w-1/2 space-y-4">
          <div class="flex flex-col w-full relative">
            <label for="senhaUsuario" class="font-medium text-[#3F3D56]">
              Senha on-line:
            </label>
            <div class="relative w-full">
              <input v-model="state.usuario.senha" :type="exibirSenha('senha') ? 'text' : 'password'" id="senhaUsuario"
                placeholder="Digite a senha on-line" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                :class="{ 'border-red-500': v$.usuario.senha.$error }" />
              <button type="button" @click="alternarVisibilidadeSenha('senha')"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <font-awesome-icon :icon="exibirSenha('senha') ? 'eye-slash' : 'eye'" />
              </button>
            </div>
            <span v-if="v$.usuario.senha.$error" class="text-red-500">
              {{ v$.usuario.senha.$errors[0].$message }}
            </span>
          </div>
        </div>

        <div class="w-full md:w-1/2 space-y-4">
          <div class="flex flex-col w-full relative">
            <label for="confSenhaUsuario" class="font-medium text-[#3F3D56]">
              Confirmar senha on-line:
            </label>
            <div class="relative w-full">
              <input v-model="state.usuario.confirmarSenha" :type="exibirSenha('confirmarSenha') ? 'text' : 'password'"
                id="confSenhaUsuario" placeholder="Digite a senha on-line"
                class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
                :class="{ 'border-red-500': v$.usuario.confirmarSenha.$error }" />
              <button type="button" @click="alternarVisibilidadeSenha('confirmarSenha')"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <font-awesome-icon :icon="exibirSenha('confirmarSenha') ? 'eye-slash' : 'eye'" />
              </button>
            </div>
            <span v-if="v$.usuario.confirmarSenha.$error" class="text-red-500">
              {{ v$.usuario.confirmarSenha.$errors[0].$message }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-col w-full">
        <label for="cargoUsuario" class="font-medium text-[#3F3D56]">
          Cargo:
        </label>
        <Multiselect id="cargoUsuario" v-model="state.usuario.cargo" placeholder="Selecionar cargo" searchable
          :limit="5"
          :options="[{ label: 'Administrador', value: 'Administrador' }, { label: 'Vendedor', value: 'Vendedor' }]"
          :classes="{
            container: 'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#3F3D56] rounded-md bg-white leading-snug outline-none',
            optionSelected: 'text-white bg-orange-400',
            optionPointed: 'bg-gray-200',
            optionSelectedPointed: 'text-white bg-orange-500',
          }" :class="{ 'border-red-500': v$.usuario.cargo.$error }" />
        <span v-if="v$.usuario.cargo.$error" class="text-red-500">
          {{ v$.usuario.cargo.$errors[0].$message }}
        </span>
      </div>

      <div v-if="state.usuario.cargo === 'Vendedor'" class="flex flex-col w-full">
        <label for="percentual_comissao" class="font-medium text-[#3F3D56]">
          Percentual Comissão:
        </label>
        <input v-model="state.usuario.percentual_comissao" type="text" id="percentual_comissao"
          placeholder="Digite o percentual de comissão" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
          :class="{ 'border-red-500': v$.usuario.percentual_comissao.$error }" min="1" max="100"
          @input="limitPercentualComissao" />
        <span v-if="v$.usuario.percentual_comissao.$error" class="text-red-500">
          {{ v$.usuario.percentual_comissao.$errors[0].$message }}
        </span>
      </div>

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

    </form>
  </FormsRegister>
</template>

<script lang="ts">
import BotaoComponente from "../../../Componentes/Outros/BotaoComponente.vue";
import FormsRegister from "../../../Componentes/Esqueleto/FormularioCadastrarComponente.vue";
import { useCadastroUsuario } from "./CadastroScriptUsuario";

export default {
  name: "cadastrar-usuario",
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  components: {
    FormsRegister,
    BotaoComponente,
  },
  setup(props) {
    return useCadastroUsuario(props.id);
  },
};
</script>
