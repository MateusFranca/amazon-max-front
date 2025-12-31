<template>
  <div class="container mx-auto p-6 lg:p-12">
    <h3 class="text-3xl mb-2 text-[#3F3D56] text-left">{{ id ? "Editar Produto" : "Cadastro de Produto" }}</h3>
    <h4 class="text-sm mb-4 text-[#6C6B7F] text-left">{{ id ? "Atualize o produto e mantenha seus dados atualizados" :
      "Cadastre um novo produto e mantenha seus dados atualizados" }}</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <form @submit.prevent="save">

        <div class="flex flex-col md:flex-row gap-2">
          <!-- Campo Marca -->
          <div class="flex flex-col sm:w-full w-full mt-2">
            <label for="marca" class="font-medium text-[#3F3D56]">Marca:</label>
            <input v-model="state.formularioProduto.marca" type="text" id="marca" placeholder="Digite a marca"
              class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
              :class="{ 'border-[#f93910]': v$.formularioProduto.marca.$error }" />
            <span v-if="v$.formularioProduto.marca.$error" class="text-red-500">
              {{ v$.formularioProduto.marca.$errors[0].$message }}
            </span>
          </div>
          <!-- Campo Modelo -->
          <div class="flex flex-col sm:w-full w-full mt-2">
            <label for="modelo" class="font-medium text-[#3F3D56]">Modelo:</label>
            <input v-model="state.formularioProduto.modelo" type="text" id="modelo" placeholder="Digite o modelo"
              class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
              :class="{ 'border-[#f93910]': v$.formularioProduto.modelo.$error }" />
            <span v-if="v$.formularioProduto.modelo.$error" class="text-red-500">
              {{ v$.formularioProduto.modelo.$errors[0].$message }}
            </span>
          </div>
        </div>
        <!-- Campos de valores -->
        <div class="flex flex-col sm:w-full w-full mt-2">
          <label for="valorCompleto" class="font-medium text-[#3F3D56]">Valor Completo:</label>
          <input v-model="state.formularioProduto.valor_completo" type="text" id="valorCompleto"
            placeholder="Digite o valor completo" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
            :class="{ 'border-[#f93910]': v$.formularioProduto.valor_completo?.$error }" />
          <span v-if="v$.formularioProduto.valor_completo?.$error" class="text-red-500">
            {{ v$.formularioProduto.valor_completo?.$errors[0].$message }}
          </span>
        </div>
        <div class="flex flex-col sm:w-full w-full mt-2">
          <label for="valorMedio" class="font-medium text-[#3F3D56]">Valor Médio:</label>
          <input v-model="state.formularioProduto.valor_medio" type="text" id="valorMedio"
            placeholder="Digite o valor médio" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
            :class="{ 'border-[#f93910]': v$.formularioProduto.valor_medio?.$error }" />
          <span v-if="v$.formularioProduto.valor_medio?.$error" class="text-red-500">
            {{ v$.formularioProduto.valor_medio?.$errors[0].$message }}
          </span>
        </div>
        <div class="flex flex-col sm:w-full w-full mt-2">
          <label for="valorReduzido" class="font-medium text-[#3F3D56]">Valor Reduzido:</label>
          <input v-model="state.formularioProduto.valor_reduzido" type="text" id="valorReduzido"
            placeholder="Digite o valor reduzido" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
            :class="{ 'border-[#f93910]': v$.formularioProduto.valor_reduzido?.$error }" />
          <span v-if="v$.formularioProduto.valor_reduzido?.$error" class="text-red-500">
            {{ v$.formularioProduto.valor_reduzido?.$errors[0].$message }}
          </span>
        </div>
        <div class="flex flex-col sm:w-full w-full mt-2">
          <label for="valorExclusivo" class="font-medium text-[#3F3D56]">Valor Exclusivo:</label>
          <input v-model="state.formularioProduto.valor_exclusivo" type="text" id="valorExclusivo"
            placeholder="Digite o valor exclusivo" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg"
            :class="{ 'border-[#f93910]': v$.formularioProduto.valor_exclusivo?.$error }" />
          <span v-if="v$.formularioProduto.valor_exclusivo?.$error" class="text-red-500">
            {{ v$.formularioProduto.valor_exclusivo?.$errors[0].$message }}
          </span>
        </div>

        <!-- Campo Descrição Técnica -->
        <div class="flex flex-col w-full mt-2">
          <label for="descricaoTecnica" class="font-medium text-[#3F3D56]">Descrição Técnica:</label>
          <textarea v-model="state.formularioProduto.descricao_tecnica" id="descricaoTecnica"
            placeholder="Digite a descrição técnica" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg" rows="7"
            style="resize: none"
            :class="{ 'border-[#f93910]': v$.formularioProduto.descricao_tecnica.$error }"></textarea>
          <span v-if="v$.formularioProduto.descricao_tecnica.$error" class="text-red-500">
            {{ v$.formularioProduto.descricao_tecnica.$errors[0].$message }}
          </span>
        </div>

        <!-- Upload de Foto -->
        <div class="flex flex-col w-full mt-2">
          <div class="flex items-center space-x-3 mt-2">
            <div
              class="flex items-center space-x-2 cursor-pointer hover:underline hover:text-[#c43d1f] transition-colors duration-200"
              @click="triggerFileUploadProxy">
              <font-awesome-icon :icon="['fas', 'paperclip']" class="w-5 h-5" />
              <span class="text-sm font-medium">Anexar foto(s) - clique para selecionar</span>
            </div>
          </div>
          <input ref="foto" type="file" id="foto" class="hidden" accept="image/*" multiple
            @change="handleFileUploadProxy" />
          <p v-if="state.formularioProduto.foto && state.formularioProduto.foto.length"
            class="text-orange-600 font-semibold mt-2 break-words whitespace-normal">
            Foto(s) selecionada(s):
            <span class="text-gray-800 break-words block" v-for="(imgObj, index) in state.formularioProduto.foto"
              :key="index">
              {{ imgObj.file?.name || imgObj.nome }}
              <button type="button" @click="removeImageProxy(index)">
                <font-awesome-icon :icon="['fas', 'trash']" class="w-5 h-5 mx-auto" />
              </button>
            </span>
          </p>
          <span v-if="v$.formularioProduto.foto.$error" class="text-red-500">
            {{ v$.formularioProduto.foto.$errors[0].$message }}
          </span>
        </div>
      </form>

      <Card
        :marca="state.formularioProduto.marca"
        :modelo="state.formularioProduto.modelo"
        :valor_vista="state.formularioProduto.valor_completo"
        :valor_parcelado="state.formularioProduto.valor_parcelado"
        :descricao_tecnica="state.formularioProduto.descricao_tecnica"
        :numero_parcela="state.formularioProduto.numero_parcela"
        :foto="state.formularioProduto.foto ? state.formularioProduto.foto.map(item => item.url) : []"
      />
    </div>

    <!-- Botão para Salvar -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <BotaoComponente v-if="!state.isUploading" :disabled="state.isUploading" :title="id ? 'Atualizar' : 'Cadastrar'"
        @click.prevent="save" class="mt-4 mb-0">
        <font-awesome-icon :icon="id ? 'pencil-alt' : 'save'" class="mr-2" />
      </BotaoComponente>

      <BotaoComponente v-else="!state.isUploading" :disabled="true">
        <font-awesome-icon icon="spinner" spin class="ml-2" />
      </BotaoComponente>

    </div>
  </div>
</template>

<script>
import BotaoComponente from "../../../Componentes/Outros/BotaoComponente.vue";
import Card from "../../../Componentes/Outros/Card.vue";
import { cadastroScriptProduto } from "./CadastroScriptProduto.ts";

export default {
  name: "cadastrar-produto",
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  components: { BotaoComponente, Card },
  setup(props) {
    return cadastroScriptProduto(props.id);
  },
};
</script>
