<template>
	<div class="row row-cols-lg-auto g-3 align-items-center mb-1">
		<div class="col-12" v-if="options.allowAdd">
			<button class="btn btn-primary btn-sm" v-on:click="addMode">
				<font-awesome-icon icon="plus" class="text-white" fixed-width></font-awesome-icon>
			</button>
		</div>
		<cascade-filters :filters="options.filters" @changed-filter="cascadeFilterChanged"></cascade-filters>
		<div class="col-12">
			<ul class="pagination pagination-sm handy mb-0">
				<li class="page-item" v-if="page > 0">
					<a class="page-link" v-on:click="adjustPage(-1)">
						<font-awesome-icon icon="arrow-left" fixed-width></font-awesome-icon>
					</a>
				</li>
				<li class="page-item" v-if="page - 2 >= 0">
					<a class="page-link" v-on:click="changePage(page - 2)">{{ page - 1 }}</a>
				</li>
				<li class="page-item" v-if="page - 1 >= 0">
					<a class="page-link" v-on:click="changePage(page - 1)">{{ page }}</a>
				</li>
				<li class="page-item active">
					<a class="page-link">{{ page + 1 }}</a>
				</li>
				<li class="page-item" v-if="page + 1 < pages">
					<a class="page-link" v-on:click="changePage(page + 1)">{{ page + 2 }}</a>
				</li>
				<li class="page-item" v-if="page + 2 < pages">
					<a class="page-link" v-on:click="changePage(page + 2)">{{ page + 3 }}</a>
				</li>
				<li class="page-item" v-if="page < pages - 1">
					<a class="page-link" v-on:click="adjustPage(1)">
						<font-awesome-icon icon="arrow-right" fixed-width></font-awesome-icon>
					</a>
				</li>
			</ul>
		</div>
		<div class="col-12 ms-auto">
			<input type="text" class="form-control form-control-sm search-width" placeholder="Search..." v-model="filter" />
		</div>
	</div>
	<div class="row" v-if="deleting != undefined">
		<div class="col-12 mb-1">
			<div class="alert alert-danger mb-0 p-2" role="alert">
				Are you sure you want to delete '{{ deleting[options.deleteColumn] }}'?
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
			<table class="table table-sm table-bordered">
				<thead>
					<tr>
						<th scope="col" class="handy" v-for="column in columns" :key="column.name" v-on:click="changeOrder(column.name)" :class="columnHeaderClass(column)">
							{{ column.display }}
						</th>
						<th v-if="options.allowEdit || options.allowDelete" :style="{ width: options.buttonsWidth + 'px' }"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="record in records" :key="record.id">
						<td v-for="column in columns" :key="column.name + '-' + record.id">
							<template v-if="column.type == 'text'">
								{{ record[column.name] }}
							</template>
							<template v-else-if="column.type == 'order'">
								<div class="btn-group" role="group" aria-label="order buttons">
									<button type="button" class="btn btn-success btn-sm" v-on:click="up(record, column)" v-if="record[column.name] != column.min">
										<font-awesome-icon icon="arrow-up" class="text-white" fixed-width></font-awesome-icon>
									</button>
									<button type="button" class="btn btn-success btn-sm" v-on:click="down(record, column)" v-if="record[column.name] != total - 1">
										<font-awesome-icon icon="arrow-down" class="text-white" fixed-width></font-awesome-icon>
									</button>
								</div>
							</template>
						</td>
						<th v-if="options.allowEdit || options.allowDelete">
							<div class="btn-group" role="group" aria-label="edit and remove buttons">
								<button type="button" class="btn btn-primary btn-sm" v-if="options.allowEdit" v-on:click="editRecord(record)">
									<font-awesome-icon icon="edit" class="text-white" fixed-width></font-awesome-icon>
								</button>
								<button type="button" class="btn btn-danger btn-sm" v-if="options.allowDelete" v-on:click="deleteRecord(record)">
									<font-awesome-icon icon="times" class="text-white" fixed-width></font-awesome-icon>
								</button>
							</div>
						</th>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, ref, onMounted, watch } from "vue";
	import { GridOptions, GridColumn, GridRow, GridOrderDirection, GridColumnOrder } from "../models";
	import CascadeFilters from "./CascadeFilters.vue";

	export default defineComponent({
		props: {
			options: {
				type: Object as PropType<GridOptions>,
				required: true,
			},
			columns: {
				type: Array as PropType<(GridColumn | GridColumnOrder)[]>,
				required: true,
			}
		},
		emits: ["changeMode"],
		components: {
			"cascade-filters": CascadeFilters
		},
		setup(props, { emit }) {
			const records = ref<GridRow[]>([]);
			const page = ref(0);
			const total = ref(0);
			const orderColumnName = ref(props.options.order.columnName);
			const orderDirection = ref(props.options.order.direction);
			const filter = ref("");
			const pages = ref(0);
			const deleting = ref<GridRow | undefined>(undefined);
			const parent = ref<number | undefined>();

			const loadPage = async () => {
				fetch(
					props.options.read +
						"?page=" +
						page.value +
						"&size=" +
						props.options.pageSize +
						"&order=" +
						orderColumnName.value +
						"&direction=" +
						orderDirection.value +
						"&filter=" +
						filter.value +
						(parent.value != undefined ? "&parentId=" + parent.value : "")
				)
					.then((response) => response.json())
					.then((data) => {
						records.value.splice(0);
						data.records.forEach((x: GridRow) => records.value.push(x));
						total.value = data.count;
						pages.value = Math.ceil(data.count / props.options.pageSize);
					});
			};
			onMounted(loadPage);

			const changeOrder = async (columnName: string) => {
				if (orderColumnName.value == columnName)
					orderDirection.value =
						orderDirection.value == GridOrderDirection.ascending ? GridOrderDirection.descending : GridOrderDirection.ascending;
				orderColumnName.value = columnName;
				await loadPage();
			};

			const changePage = async (position: number) => {
				page.value = position;
				await loadPage();
			};

			const adjustPage = async (value: number) => {
				page.value = page.value + value;
				await loadPage();
			};

			const addMode = () => {
				emit("changeMode", "add", undefined, parent.value);
			};

			watch(filter, () => {
				page.value = 0;
				loadPage();
			});

			const editRecord = (item: GridRow) => {
				emit("changeMode", "edit", item.id, undefined);
			};

			const deleteRecord = (item: GridRow) => {
				deleting.value = item;
			};

			const cancelDelete = () => {
				deleting.value = undefined;
			};

			const confirmDelete = () => {
				fetch(props.options.delete + "?id=" + deleting.value?.id)
					.then((response) => response.json())
					.then((_) => {
						cancelDelete();
						loadPage();
					});
			};

			const up = (item: GridRow, column: GridColumnOrder) => {
				fetch(column.up + "?id=" + item.id)
					.then((response) => response.json())
					.then((_) => {
						cancelDelete();
						loadPage();
					});
			}

			const down = (item: GridRow, column: GridColumnOrder) => {
				fetch(column.down+ "?id=" + item.id)
					.then((response) => response.json())
					.then((_) => {
						cancelDelete();
						loadPage();
					});
			}

			const columnHeaderClass = (column: GridColumnOrder) => {
				return {
					'order-buttons-wdith': column.type == "order"
				}
			}

			const cascadeFilterChanged = (parentId: number) => {
				parent.value = parentId;
				loadPage();
			}

			return {
				records,
				page,
				total,
				loadPage,
				changeOrder,
				filter,
				pages,
				changePage,
				adjustPage,
				addMode,
				editRecord,
				deleteRecord,
				cancelDelete,
				confirmDelete,
				deleting,
				up,
				down,
				columnHeaderClass,
				cascadeFilterChanged
			};
		},
	});
</script>

<style scoped>
	.handy {
		cursor: pointer;
	}
	.order-buttons-wdith {
		width: 79px
	}
	.search-width {
		min-width: 250px;
	}
</style>