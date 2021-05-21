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
						<th v-if="selectable" class="select-width">
							<font-awesome-icon icon="hand-pointer" fixed-width></font-awesome-icon>
						</th>
						<th scope="col" class="handy" v-for="column in columns" :key="column.name" v-on:click="changeOrder(column.name)" v-on:keydown="changeOrder(column.name)" :class="columnHeaderClass(column)" tabindex=0>
							{{ column.display }}
						</th>
						<th v-if="hasActions" :style="{ width: options.buttonsWidth + 'px' }">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="record in records" :key="record.id">
						<td v-if="selectable" class="text-center">
							<input type="checkbox" v-model="seletedRows[record.id]" true-value="true" false-value="false" class="form-check-input" aria-label="select row" v-on:change="selectableChanged(record)"/>
						</td>
						<td v-for="column in columns" :key="column.name + '-' + record.id">
							<template v-if="column.type == 'text'">
								{{ record[column.name] }}
							</template>
							<template v-else-if="column.type == 'order'">
								<div class="btn-group" role="group" aria-label="order buttons">
									<button type="button" class="btn btn-success btn-sm" v-on:click="up(record, column)" v-if="record[column.name] != column.min" aria-label="Move up">
										<font-awesome-icon icon="arrow-up" class="text-white" fixed-width></font-awesome-icon>
									</button>
									<button type="button" class="btn btn-success btn-sm" v-on:click="down(record, column)" v-if="record[column.name] != total - 1" aria-label="Move down">
										<font-awesome-icon icon="arrow-down" class="text-white" fixed-width></font-awesome-icon>
									</button>
								</div>
							</template>
						</td>
						<td v-if="hasActions">
							<div class="btn-group" role="group" aria-label="action buttons">
								<template v-if="options.customActions != undefined">
									<button v-for="customAction in options.customActions" :key="customAction.name" 
									type="button" class="btn btn-sm" :class="customAction.buttonClass" v-on:click="customAction.action(record)" :aria-label="customAction.label">
										<font-awesome-icon :icon="['fas', customAction.fontAwesomeIcon]" class="text-white" fixed-width></font-awesome-icon>
									</button>
								</template>
								<button type="button" class="btn btn-primary btn-sm" v-if="options.allowEdit" v-on:click="editRecord(record)" aria-label="Edit">
									<font-awesome-icon icon="edit" class="text-white" fixed-width></font-awesome-icon>
								</button>
								<button type="button" class="btn btn-danger btn-sm" v-if="options.allowDelete" v-on:click="deleteRecord(record)" aria-label="Delete">
									<font-awesome-icon icon="times" class="text-white" fixed-width></font-awesome-icon>
								</button>
							</div>
						</td>
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
	import Pagination from "./Pagination.vue";

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
			selectable: {
				type: Boolean,
				required: true,
			},
			parent: {
				type: Number,
				required: false,
			}
		},
		emits: ["changeMode", "selectionChanged"],
		components: {
			"cascade-filters": CascadeFilters,
			"pagination": Pagination
		},
		setup(props, { emit }) {
			const records = ref<GridRow[]>([]);
			const page = ref(0);
			const total = ref(0);
			const orderColumnName = ref(props.options.order.columnName);
			const orderDirection = ref(props.options.order.direction);
			const filter = ref("");
			const deleting = ref<GridRow | undefined>(undefined);
			const parent = ref<number | undefined>();
			const seletedRows = ref<SelectedRow>({});
			const subPageTitle = ref("");

			if(props.options.parent != undefined)
				parent.value = props.options.parent.valueOf();

			if(props.parent != undefined)
				parent.value = props.parent.valueOf();

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

			const addMode = () => {
				emit("changeMode", "add", undefined, parent.value, subPageTitle.value);
			};

			watch(filter, () => {
				page.value = 0;
				loadPage();
			});

			const editRecord = (item: GridRow) => {
				emit("changeMode", "edit", item.id, undefined, subPageTitle.value);
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
					.then(() => {
						cancelDelete();
						loadPage();
					});
			};

			const up = (item: GridRow, column: GridColumnOrder) => {
				fetch(column.up + "?id=" + item.id)
					.then((response) => response.json())
					.then(() => {
						cancelDelete();
						loadPage();
					});
			}

			const down = (item: GridRow, column: GridColumnOrder) => {
				fetch(column.down+ "?id=" + item.id)
					.then((response) => response.json())
					.then(() => {
						cancelDelete();
						loadPage();
					});
			}

			const columnHeaderClass = (column: GridColumnOrder) => {
				return {
					'order-buttons-wdith': column.type == "order"
				}
			}

			const cascadeFilterChanged = (parentId: number, display: string) => {
				parent.value = parentId;
				subPageTitle.value = display;
				loadPage();
			}

			const hasActions = () : boolean => {
				return props.options.allowEdit || props.options.allowDelete || props.options.customActions != undefined;
			}

			const selectableChanged = (record: GridRow) => {
				let anyChecked = false;
				for(const key in seletedRows.value) {
					if(parseInt(key) == record.id) {
						if(seletedRows.value[key] == "true")
						{
							anyChecked = true;
							emit("selectionChanged", record.id);
						}
						continue;
					}
					seletedRows.value[key] = false;
				}
				if(!anyChecked)
					emit("selectionChanged", undefined);
			};

			watch(props, () => {
				parent.value = props.parent;
				loadPage();
			});

			const paginationPageChanged = (pageIndex: number) => {
				page.value = pageIndex;
				loadPage();
			}

			return {
				records,
				page,
				total,
				loadPage,
				changeOrder,
				filter,
				addMode,
				editRecord,
				deleteRecord,
				cancelDelete,
				confirmDelete,
				deleting,
				up,
				down,
				columnHeaderClass,
				cascadeFilterChanged,
				hasActions,
				seletedRows,
				selectableChanged,
				paginationPageChanged
			};
		},
	});

	interface SelectedRow {
		[key: number]: boolean | undefined | string;
	}
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
	.select-width {
		width: 20px;
	};
</style>