<template>
	<div class="col-12 col-md-6" v-if="pages > 1">
		<ul class="pagination pagination-sm handy mb-0">
			<li class="page-item" v-if="page > 0">
				<button class="page-link" v-on:click="adjustPage(-1)">
					<font-awesome-icon icon="arrow-left" fixed-width></font-awesome-icon>
				</button>
			</li>
			<li class="page-item" v-if="page - 2 >= 0">
				<button class="page-link" v-on:click="changePage(page - 2)">{{ page - 1 }}</button>
			</li>
			<li class="page-item" v-if="page - 1 >= 0">
				<button class="page-link" v-on:click="changePage(page - 1)">{{ page }}</button>
			</li>
			<li class="page-item active">
				<button class="page-link">{{ page + 1 }}</button>
			</li>
			<li class="page-item" v-if="page + 1 < pages">
				<button class="page-link" v-on:click="changePage(page + 1)">{{ page + 2 }}</button>
			</li>
			<li class="page-item" v-if="page + 2 < pages">
				<button class="page-link" v-on:click="changePage(page + 2)">{{ page + 3 }}</button>
			</li>
			<li class="page-item" v-if="page < pages - 1">
				<button class="page-link" v-on:click="adjustPage(1)">
					<font-awesome-icon icon="arrow-right" fixed-width></font-awesome-icon>
				</button>
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
	import { defineComponent, ref, watch } from "vue";

	export default defineComponent({
		props: {
			total: {
				type: Number,
				required: true,
			},
			pageSize: {
				type: Number,
				required: true,
			},
			reset: {
				type: Number,
				required: true,
				default: 0,
			},
		},
		emits: ["pageChanged"],
		setup(props, { emit }) {
			const page = ref(0);
			const pages = ref(Math.ceil(props.total / props.pageSize));

			const changePage = async (position: number) => {
				page.value = position;
			};

			const adjustPage = async (value: number) => {
				page.value = page.value + value;
			};

			watch(props, () => {
				pages.value = Math.ceil(props.total / props.pageSize);
				if (page.value < 0 || page.value > pages.value - 1) page.value = 0;
			});

			watch(page, () => {
				emit("pageChanged", page.value);
			});

			watch(
				() => props.reset,
				() => {
					page.value = 0;
				}
			);

			return {
				page,
				pages,
				changePage,
				adjustPage,
			};
		},
	});
</script>
