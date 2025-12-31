<template>
  <div id="app" :class="{ 'login-bg': isLoginPage }">
    <CabecalhoComponente v-if="!isLoginPage" />
    <div v-if="!isLoginPage" id="content">
      <router-view></router-view>
    </div>
    <div v-else>
      <router-view></router-view>
    </div>
    <footer id="footer">
      <RodapeComponente v-if="!isLoginPage" />
    </footer>
  </div>
</template>

<script>
import CabecalhoComponente from './Componentes/Esqueleto/CabecalhoComponente.vue';
import RodapeComponente from './Componentes/Esqueleto/RodapeComponente.vue';

export default {
  name: "App",
  components: { CabecalhoComponente, RodapeComponente },
  computed: {
    isLoginPage() {
      return this.$route.name === "conectar";
    },
  },
};
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#content {
  flex: 1;
  display: flex;
  justify-content: center;
}

#footer {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  #app.login-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffb37b 0%, #e6401a 100%) !important;
  }

  #content {
    background: transparent;
  }
}

@media (min-width: 769px) {
  #app.login-bg {
    background: none !important;
  }
}
</style>
