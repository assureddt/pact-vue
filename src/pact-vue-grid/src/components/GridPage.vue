<template>
	<div class="row row-cols-lg-auto g-3 align-items-center mb-1">
		<div class="col-12" v-if="options.allowAdd">
			<button class="btn btn-primary btn-sm" v-on:click="addMode" aria-label="Create new">
				<font-awesome-icon icon="plus" class="text-white" fixed-width></font-awesome-icon>
			</button>
		</div>
		<cascade-filters :filters="options.filters" @changed-filter="cascadeFilterChanged"></cascade-filters>
		<pagination :total="total" :page-size="options.pageSize" @page-changed="paginationPageChanged"></pagination>
		<div class="col-12 ms-auto">
			<div class="input-group input-group-sm">
				<label class="input-group-text" for="search-box">Search</label>
				<input type="text" class="form-control form-control-sm search-width" placeholder="Search..." v-model="filter" id="search-box" />
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
			:parent="computedParent" 
			:filter="filter"
			:page="page"
			@update-total="updateTotal"
			@edit="gridEdit"
			@delete="gridDelete"
			@selection-changed="selectionChangedPassthrough"
			:key="refreshCount"></grid-component>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, ref, watch } from "vue";
	import { GridOptions, GridColumn, GridColumnOrder } from "../models";
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
			parent: {
				type: Number,
				required: false,
			},
		},
		emits: ["changeMode", "selectionChanged"],
		components: {
			"cascade-filters": CascadeFilters,
			"pagination": Pagination,
			"grid-component": Grid
		},
		setup(props, { emit }) {
			const page = ref(0);
			const total = ref(0);
			const filter = ref("");
			const computedParent = ref<number | undefined>();
			const referenceTitle = ref("");
			const deleting = ref<number | undefined>(undefined);
			const deletingDisplay = ref<string | undefined>(undefined);
			const refreshCount = ref(0);
			
			if (props.options.parent != undefined) computedParent.value = props.options.parent.valueOf();

			if (props.parent != undefined) computedParent.value = props.parent.valueOf();

			const addMode = () => {
				emit("changeMode", "add", undefined, computedParent.value, referenceTitle.value);
			};

			const updateTotal = (count: number) => {
				total.value = count;
			}

			const gridEdit = (id: number) => {
				emit("changeMode", "edit", id, undefined, referenceTitle.value);
			}

			const gridDelete = (id: number, itemDisplay: string) => {
				deletingDisplay.value = itemDisplay;
				deleting.value = id;
			}

			const cancelDelete = () => {
				deleting.value = undefined;
				deletingDisplay.value = undefined;
			};

			const confirmDelete = () => {
				if(deleting.value == undefined) return;
				fetch(props.options.delete + "?id=" + deleting.value)
					.then((response) => response.json())
					.then(() => {
						cancelDelete();
						refesh();
					});
			};

			const cascadeFilterChanged = (parentId: number, display: string) => {
				computedParent.value = parentId;
				referenceTitle.value = display;
			};

			const selectionChangedPassthrough = (ids: number[] | undefined) => {
				emit("selectionChanged", ids);
			};

			watch(props, () => {
				computedParent.value = props.parent;
			});

			const paginationPageChanged = (pageIndex: number) => {
				page.value = pageIndex;
			};

			const refesh = () => {
				refreshCount.value = refreshCount.value + 1;
			}

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
				cascadeFilterChanged,
				selectionChangedPassthrough,
				paginationPageChanged,
				computedParent,
				refreshCount,
				referenceTitle,
				deletingDisplay
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
	.search-width {
		min-width: 250px;
	}
	.select-width {
		width: 20px;
	}
</style>