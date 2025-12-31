<template>
  <FormsRegister title="Entrar em Contato" imgPath="../../../../Publico/Imagens/Decoracao/contato.svg" class="mt-12">
    <form @submit.prevent="enviarFormularioContato">
      <div class="flex flex-col sm:w-full w-full space-y-3 md:space-y-4 mt-2">
        <label for="nome" class="font-medium text-[#3F3D56]">
          Nome:
        </label>
        <input v-model="state.nome_con" type="text" name="nome" id="nome"
          :class="{ 'border-red-500': v$.nome_con.$error }"
          placeholder="Digite seu nome e sobrenome" class="border-2 border-[#A5DAFF] p-2 w-full rounded-lg" />
        <span v-if="v$.nome_con.$error" class="text-red-500 text-sm">
          {{ v$.nome_con.$errors[0].$message }}
        </span>
      </div>

      <div class="flex flex-col sm:w/full w-full space-y-3 md:space-y-4 mt-2">
        <label for="email" class="font-medium text-[#3F3D56]">
          E-mail:
        </label>
        <input v-model="state.email_con" type="email" name="email" id="email"
          :class="{ 'border-red-500': v$.email_con.$error }"
          placeholder="Digite seu e-mail" class="border-2 border-[#A5DAFF] p-2 w-full rounded-lg" />
        <span v-if="v$.email_con.$error" class="text-red-500 text-sm">
          {{ v$.email_con.$errors[0].$message }}
        </span>
      </div>

      <div class="flex flex-col sm:w/full w-full space-y-3 md:space-y-4 mt-2">
        <label for="telefone" class="font-medium text-[#3F3D56]">
          Telefone:
        </label>
        <input v-model="state.telefone_con" v-mask="'(##) #####-####'" type="tel" name="telefone" id="telefone"
          :class="{ 'border-red-500': v$.telefone_con.$error }"
          placeholder="Digite seu telefone" class="border-2 border-[#A5DAFF] p-2 w-full rounded-lg" />
        <span v-if="v$.telefone_con.$error" class="text-red-500 text-sm">
          {{ v$.telefone_con.$errors[0].$message }}
        </span>
      </div>

      <div class="flex flex-col w-full space-y-3 md:space-y-4 mt-2">
        <label for="mensagem" class="font-medium text-[#3F3D56]">
          Mensagem:
        </label>
        <textarea v-model="state.mensagem_con" name="mensagem" id="mensagem"
          :class="{ 'border-red-500': v$.mensagem_con.$error }"
          placeholder="Digite sua mensagem" class="border-2 border-[#A5DAFF] p-2 w-full rounded-lg" rows="7"
          style="resize: none"></textarea>
        <span v-if="v$.mensagem_con.$error" class="text-red-500 text-sm">
          {{ v$.mensagem_con.$errors[0].$message }}
        </span>
      </div>

      <BotaoComponente title="Enviar" imgPath="../../Publico/Imagens/Icones/iconeEnviar.svg" @click.prevent="enviarFormularioContato" class="mt-4 mb-0" />
    </form>
  </FormsRegister>
</template>

<script>
import BotaoComponente from "../../Componentes/Outros/BotaoComponente.vue";
import FormsRegister from "../../Componentes/Esqueleto/FormularioCadastrarComponente.vue";
import { API_BASE_URL } from "../../../api-config.ts";
import axios from "axios";
import { reactive, computed, getCurrentInstance } from "vue";
import useValidate from "@vuelidate/core";
import { required, email, helpers } from "@vuelidate/validators";

export default {
  name: "Contato",
  components: { FormsRegister, BotaoComponente },
  setup() {
    const { proxy } = getCurrentInstance();

    const state = reactive({
      nome_con: "",
      email_con: "",
      telefone_con: "",
      mensagem_con: "",
    });

    const rules = computed(() => ({
      nome_con: {
        required: helpers.withMessage("Nome é obrigatório", required),
      },
      email_con: {
        required: helpers.withMessage("Email é obrigatório", required),
        email: helpers.withMessage("Formato de email inválido", email),
      },
      telefone_con: {
        required: helpers.withMessage("Telefone é obrigatório", required),
      },
      mensagem_con: {
        required: helpers.withMessage("Mensagem é obrigatória", required),
      },
    }));

    const v$ = useValidate(rules, state);

    const reiniciarFormulario = () => {
      state.nome_con = "";
      state.email_con = "";
      state.telefone_con = "";
      state.mensagem_con = "";
      v$.value.$reset();
    };

    const enviarFormularioContato = async () => {
      const result = await v$.value.$validate();
      if (!result) {
        proxy.$toast.error("Por favor, corrija os erros no formulário.");
        return;
      }

      try {
        const dados = {
          nome_con: state.nome_con,
          email_con: state.email_con,
          telefone_con: state.telefone_con,
          mensagem_con: state.mensagem_con,
        };

        await axios.post(`${API_BASE_URL}/contatos`, dados);
        proxy.$toast.success("Mensagem enviada com sucesso!");
        reiniciarFormulario();
      } catch (error) {
        proxy.$toast.error("Erro ao enviar mensagem");
      }
    };

    return {
      state,
      v$,
      enviarFormularioContato,
      reiniciarFormulario
    };
  },
};
</script>
