<template>
  <footer class="bg-[#f93910]">
    <div class="w-full p-4 md:py-2 flex flex-col items-center text-white">
      <div class="text-center md:flex md:items-center">
        <span class="block md:inline">Todos os direitos reservados</span>
        <span class="block md:inline md:ml-1">
          <router-link to="/" class="hover:underline">
            Amazon Max © {{ currentYear }}
          </router-link>
        </span>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("token");
    },
    currentYear() {
      return new Date().getFullYear();
    }
  },
  methods: {
    goToLogin() {
      localStorage.removeItem("token");
      this.$router.push('/');
    }
  }
};
</script>
