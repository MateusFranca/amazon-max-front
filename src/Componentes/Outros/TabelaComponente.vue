<template>
    <div class="overflow-auto">
        <table class="bg-white border border-gray-300 w-full">
            <thead>
                <tr>
                    <th v-for="column in columns" :key="column.value"
                        :class="[column.headerClass, 'px-6 py-4 text-center text-sm font-semibold text-black uppercase border whitespace-nowrap truncate']">
                        {{ column.header }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in items" :key="item.id || index" class="hover:bg-gray-100 odd:bg-gray-100">
                    <td v-for="column in columns" :key="column.value"
                        :class="[column.bodyClass, 'px-6 py-4 border border-gray-300']">
                        <slot :name="column.value" v-bind="{ item, index }">
                            {{column.value
                                .split('.')
                                .reduce((obj, key) => obj && obj[key], item)}}
                        </slot>
                    </td>
                </tr>
            </tbody>
        </table>

        <slot name="summary"></slot>

        <slot name="message" ></slot>

        <div v-if="meta.total_paginas >= 1" class="flex justify-center mt-4">
            <PaginacaoComponente :totalPages="meta.total_paginas" :currentPage="meta.pagina_atual"
                :itemsPerPage="meta.itens_por_pagina" :totalResults="meta.total_itens" @page-changed="paginate" />
        </div>
    </div>
</template>

<script>
import PaginacaoComponente from './PaginacaoComponente.vue';

export default {
    name: 'TabelaComponente',
    components: { PaginacaoComponente },

    props: {
        columns: { type: Array, default: () => [] },
        items: { type: Array, default: () => [] },
        meta: {
            type: Object,
            default: () => ({
                total_paginas: 1,
                pagina_atual: 1,
                itens_por_pagina: 10,
                total_itens: 0
            })
        }
    },

    methods: {
        paginate(page) {
            this.$emit('paginate', {
                pagina: page,
                limite: this.meta.itens_por_pagina
            });
        }
    }
};
</script>