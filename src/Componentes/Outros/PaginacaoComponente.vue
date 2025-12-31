<template>
  <nav class="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
    <a href="#" class="px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      @click.prevent="changePage(currentPage - 1)" :disabled="currentPage === 1">
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd"
          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
          clip-rule="evenodd"></path>
      </svg>
    </a>

    <template v-for="(page, idx) in pagesToShow" :key="idx">
      <a v-if="page === '...'" class="px-4 py-2 text-gray-700 ring-1 ring-inset ring-gray-300 cursor-default">
        {{ page }}
      </a>

      <a v-else-if="page === currentPage" href="#" aria-current="page"
        class="z-10 inline-flex px-4 py-2 font-semibold text-white bg-[#f93910]">
        {{ page }}
      </a>

      <a v-else href="#" class="px-4 py-2 font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        @click.prevent="changePage(page)">
        {{ page }}
      </a>
    </template>

    <a href="#" class="px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      @click.prevent="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clip-rule="evenodd"></path>
      </svg>
    </a>
  </nav>
</template>

<script>
export default {
  props: {
    totalPages: { type: Number, required: true },
    currentPage: { type: Number, required: true },
    itemsPerPage: { type: Number, required: true },
    totalResults: { type: Number, required: true },
  },

  computed: {
    pagesToShow() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, this.currentPage + 2);

      if (this.totalPages <= maxVisible) {
        start = 1; end = this.totalPages;
      } else {
        if (start > 1) {
          pages.push(1);
          if (start > 2) pages.push('...');
        }
      }

      for (let p = start; p <= end; p++) pages.push(p);

      if (end < this.totalPages) {
        if (end < this.totalPages - 1) pages.push('...');
        pages.push(this.totalPages);
      }

      return pages;
    }
  },

  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.$emit('page-changed', page);
      }
    }
  }
};
</script>
