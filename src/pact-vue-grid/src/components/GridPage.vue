<template>
	<div class="row row-cols-lg-auto g-3 align-items-center mb-1">
		<div class="col-1" v-if="options.allowAdd">
			<button class="btn btn-primary btn-sm" v-on:click="addMode" aria-label="Create new">
				<font-awesome-icon icon="plus" class="text-white" fixed-width></font-awesome-icon>
			</button>
		</div>
		<cascade-filters :filters="options.filters" @changed-filter="filterChanged" :reset="resetCascadeFilters"></cascade-filters>
		<pagination :total="total" :page-size="options.pageSize" @page-changed="paginationPageChanged" :reset="resetCascadeFilters"></pagination>
		<div class="col-12 col-md-4 col-lg-3 col-xl-3 ms-auto">
			<div class="input-group input-group-sm">
				<label class="input-group-text" for="search-box">Search</label>
				<input type="text" class="form-control form-control-sm" placeholder="Search..." v-model="filter" id="search-box" />
				<button class="btn btn-outline-secondary" type="button" @click="reset" v-if="options.showReset">Reset</button>
			</div>
		</div>
	</div>
	<div class="row" v-if="deleting != undefined">
		<div class="col-12 mb-1">
			<div class="alert alert-danger mb-0 p-2" role="alert">
				Are you sure you want to delete '{{ deletingDisplay }}'?
				<div class="mt-1">
					<button class="btn btn-primary" v-on:click="confirmDelete">
						<font-awesome-icon icon="check" class="text-white" fixed-width></font-awesome-icon>
						Yes
					</button>
					<button class="btn btn-danger ms-1" v-on:click="cancelDelete">
						<font-awesome-icon icon="ban" class="text-white" fixed-width></font-awesome-icon>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col">
			<grid-component
				:options="options"
				:columns="columns"
				:query-data="computedQueryData"
				:filter="filter"
				:page="page"
				@update-total="updateTotal"
				@edit="gridEdit"
				@delete="gridDelete"
				@selection-changed="selectionChangedPassthrough"
				:key="refreshCount"
			></grid-component>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, ref, watch } from "vue";
	import { GridOptions, GridColumn, GridColumnOrder, QueryData } from "../models";
	import CascadeFilters from "./CascadeFilters.vue";
	import Pagination from "./Pagination.vue";
	import Grid from "./Grid.vue";

	export default defineComponent({
		props: {
			options: {
				type: Object as PropType<GridOptions>,
				required: true,
			},
			columns: {
				type: Array as PropType<(GridColumn | GridColumnOrder)[]>,
				required: true,
			},
			queryData: {
				type: Object as PropType<QueryData>,
				required: false,
			},
		},
		emits: ["changeMode", "selectionChanged", "refreshed", "filterChanged"],
		components: {
			"cascade-filters": CascadeFilters,
			pagination: Pagination,
			"grid-component": Grid,
		},
		setup(props, { emit }) {
			const page = ref(0);
			const total = ref(0);
			const filter = ref("");
			const computedQueryData = ref<undefined | QueryData>(props.options.queryData ?? props.queryData ?? undefined);
			const referenceTitle = ref("");
			const deleting = ref<number | undefined>(undefined);
			const deletingDisplay = ref<string | undefined>(undefined);
			const refreshCount = ref(0);
			const resetCascadeFilters = ref(0);

			const addMode = () => {
				emit("changeMode", "add", undefined, computedQueryData.value, referenceTitle.value);
			};

			const updateTotal = (count: number) => {
				total.value = count;
				emit("refreshed");
			};

			const gridEdit = (id: number) => {
				emit("changeMode", "edit", id, undefined, referenceTitle.value);
			};

			const gridDelete = (id: number, itemDisplay: string) => {
				deletingDisplay.value = itemDisplay;
				deleting.value = id;
			};

			const cancelDelete = () => {
				deleting.value = undefined;
				deletingDisplay.value = undefined;
			};

			const confirmDelete = () => {
				if (deleting.value == undefined) return;
				fetch(props.options.delete + "?id=" + deleting.value)
					.then((response) => response.json())
					.then(() => {
						cancelDelete();
						refresh();
					});
			};

			const filterChanged = (filter: QueryData, display: string) => {
				computedQueryData.value = filter;
				referenceTitle.value = display;
				emit("filterChanged", filter);
			};

			const selectionChangedPassthrough = (ids: number[] | undefined) => {
				emit("selectionChanged", ids);
			};

			watch(props, () => {
				computedQueryData.value = props.queryData;
			});

			const paginationPageChanged = (pageIndex: number) => {
				page.value = pageIndex;
			};

			const refresh = () => {
				refreshCount.value = refreshCount.value + 1;
			};

			const reset = () => {
				filter.value = "";
				resetCascadeFilters.value += 1;
				page.value = 0;
			};

			return {
				updateTotal,
				gridEdit,
				gridDelete,
				page,
				total,
				filter,
				addMode,
				cancelDelete,
				confirmDelete,
				deleting,
				filterChanged,
				selectionChangedPassthrough,
				paginationPageChanged,
				computedQueryData,
				refreshCount,
				referenceTitle,
				deletingDisplay,
				reset,
				resetCascadeFilters,
			};
		},
	});
</script>

<style scoped>
	.handy {
		cursor: pointer;
	}
	.order-buttons-wdith {
		width: 79px;
	}
	.select-width {
		width: 20px;
	}
</style>
