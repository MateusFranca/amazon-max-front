<template>
    <div
        class="max-w-xl md:max-w-sm w-full bg-white border border-gray-200 p-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 mx-auto cursor-pointer">
        <div v-if="hasImages" class="rounded-lg overflow-hidden">
            <swiper :modules="modules" :slides-per-view="1" :navigation="true" :pagination="{ clickable: true }"
                class="h-full w-full">
                <swiper-slide v-for="(img, index) in foto" :key="index">
                    <img :src="img" :alt="marca" class="h-full w-full object-cover" />
                </swiper-slide>
            </swiper>
        </div>
        <div v-else class="h-48 w-full flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
            Nenhuma imagem selecionada
        </div>

        <div class="mt-4 flex flex-col flex-1">
            <h2 class="text-xl font-bold text-gray-800 break-words">
                {{ marca }}<span v-if="marca && modelo"> - </span>{{ modelo }}
            </h2>
            <p class="text-gray-600 mt-2 flex-1 break-words">
                {{ descricao_tecnica }}
            </p>

            <div class="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between w-full">
                <div class="text-2xl font-bold text-green-600 w-full md:w-auto break-all">
                    <span v-if="valor_vista >= 0">R$</span>
                    <span class="break-all">{{ valor_vista || '0,00' }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { parseBRL, formatToBRL } from '../../utils/currencyMaskUtils.ts';

export default {
    components: { Swiper, SwiperSlide },
    name: "Card",
    props: {
        marca: {
            type: String,
            required: true
        },
        modelo: {
            type: String,
            required: true
        },
        valor_vista: {
            type: String,
            required: true
        },
        descricao_tecnica: {
            type: String,
            required: true
        },
        foto: {
            type: Array,
            default: () => []
        },

    },
    computed: {
        hasImages() {
            return this.foto && this.foto.length > 0 && this.foto.some(img => img);
        },
        parcelasNum() {
            const n = parseInt(this.numero_parcela, 10);
            return isNaN(n) ? 0 : n;
        },
    },
    setup() {
        const modules = [Navigation, Pagination];
        return { modules };
    },
    methods: {}
};
</script>
