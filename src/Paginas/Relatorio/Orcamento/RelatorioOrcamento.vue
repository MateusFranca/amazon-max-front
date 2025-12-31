<template>
  <FormsRegister title="Relatório de Orçamento"
    subTitle="Visualize e filtre relatórios de orçamento por usuário e período"
    imgPath="../../../../Publico/Imagens/Decoracao/relatorio.svg" class="mt-5">
    <form @submit.prevent="exportarRelatorio">
      <div class="flex flex-col md:flex-row gap-2" v-if="!isVendedor">
        <div class="flex flex-col sm:w-full w-full mt-2">
          <label class="font-medium text-[#3F3D56]">Usuário:</label>
          <Multiselect v-model="usuarioSelecionado" :options="usuarios.map(u => ({ label: u.nome, value: u.id }))"
            placeholder="Selecione um usuário" :searchable="true" :clear-on-select="true" :close-on-select="true"
            :allow-empty="true" class="w-full" :classes="{
              container: 'relative w-full flex items-center justify-end box-border cursor-pointer border-2 border-[#03223f] rounded-md bg-white leading-snug outline-none',
              optionSelected: 'text-white bg-orange-400',
              optionPointed: 'bg-gray-200',
              optionSelectedPointed: 'text-white bg-orange-500',
            }" />
        </div>
      </div>
      <div class="flex flex-col md:flex-row gap-2">
        <div class="flex flex-col sm:w-full w-full mt-2">
          <label class="font-medium text-[#3F3D56]">Data Inicial:</label>
          <input type="date" v-model="dataInicial" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg" required
            :max="dataFinal" />
        </div>
        <div class="flex flex-col sm:w-full w-full mt-2">
          <label class="font-medium text-[#3F3D56]">Data Final:</label>
          <input type="date" v-model="dataFinal" class="border-2 border-[#3F3D56] p-2 w-full rounded-lg" required
            :max="hoje" :min="dataInicial" />
        </div>
      </div>
      <div class="flex flex-row gap-2 mt-4">
        <BotaoComponente :title="'Exportar'" @click.prevent="exportarRelatorio">
          <font-awesome-icon icon="file-export" class="ml-2" />
        </BotaoComponente>
      </div>
    </form>
  </FormsRegister>
</template>

<script lang="ts" setup>
import FormsRegister from "../../../Componentes/Esqueleto/FormularioCadastrarComponente.vue";
import BotaoComponente from "../../../Componentes/Outros/BotaoComponente.vue";
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { useRelatorioOrcamento } from './RelatorioScriptOrcamento'

function formatarDataISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

const hoje = formatarDataISO(new Date());
const dataInicialPadrao = formatarDataISO(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

const {
  usuarios,
  usuarioSelecionado,
  dataInicial,
  dataFinal,
  isVendedor,
  exportarRelatorio
} = useRelatorioOrcamento();

dataInicial.value = dataInicialPadrao;
dataFinal.value = hoje;
</script>

<style scoped>
input[type="date"] {
  color: #000000; 
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5); 
}

input[type="date"]::-webkit-datetime-edit-fields-wrapper,
input[type="date"]::-webkit-datetime-edit-text,
input[type="date"]::-webkit-datetime-edit-month-field,
input[type="date"]::-webkit-datetime-edit-day-field,
input[type="date"]::-webkit-datetime-edit-year-field {
  color: #000000;
}
</style>