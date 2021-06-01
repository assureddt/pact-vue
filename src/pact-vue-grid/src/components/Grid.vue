<template>
    <table class="table table-sm table-bordered">
        <thead>
            <tr>
                <th v-if="options.selectable" class="select-width">
                    <font-awesome-icon icon="hand-pointer" fixed-width></font-awesome-icon>
                </th>
                <th
                    scope="col"
                    class="handy"
                    v-for="column in columns"
                    :key="column.name"
                    v-on:click="changeOrder(column.name)"
                    v-on:keydown="changeOrder(column.name)"
                    :class="columnHeaderClass(column)"
                    tabindex="0"
                >
                    {{ column.display }}
                </th>
                <th v-if="hasActions" :style="{ width: options.buttonsWidth + 'px' }">Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="record in records" :key="record.id">
                <td v-if="options.selectable" class="text-center">
                    <input
                        type="checkbox"
                        v-model="seletedRows[record.id]"
                        true-value="true"
                        false-value="false"
                        class="form-check-input"
                        aria-label="select row"
                        v-on:change="selectableChanged(record)"
                    />
                </td>
                <td v-for="column in columns" :key="column.name + '-' + record.id">
                    <template v-if="column.type == 'text'">
                        {{ record[column.name] }}
                    </template>
                    <template v-else-if="column.type == 'order'">
                        <div class="btn-group" role="group" aria-label="order buttons">
                            <button
                                type="button"
                                class="btn btn-success btn-sm"
                                v-on:click="up(record, column)"
                                v-if="record[column.name] != column.min"
                                aria-label="Move up"
                            >
                                <font-awesome-icon icon="arrow-up" class="text-white" fixed-width></font-awesome-icon>
                            </button>
                            <button
                                type="button"
                                class="btn btn-success btn-sm"
                                v-on:click="down(record, column)"
                                v-if="record[column.name] != total - 1"
                                aria-label="Move down"
                            >
                                <font-awesome-icon icon="arrow-down" class="text-white" fixed-width></font-awesome-icon>
                            </button>
                        </div>
                    </template>
                </td>
                <td v-if="hasActions">
                    <div class="btn-group" role="group" aria-label="action buttons">
                        <template v-if="options.customActions != undefined">
                            <button
                                v-for="customAction in options.customActions"
                                :key="customAction.name"
                                type="button"
                                class="btn btn-sm"
                                :class="customAction.buttonClass"
                                v-on:click="customAction.action(record)"
                                :aria-label="customAction.label"
                            >
                                <font-awesome-icon
                                    :icon="['fas', customAction.fontAwesomeIcon]"
                                    class="text-white"
                                    fixed-width
                                ></font-awesome-icon>
                            </button>
                        </template>
                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            v-if="options.allowEdit"
                            v-on:click="editRecord(record)"
                            aria-label="Edit"
                        >
                            <font-awesome-icon icon="edit" class="text-white" fixed-width></font-awesome-icon>
                        </button>
                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            v-if="options.allowDelete"
                            v-on:click="deleteRecord(record)"
                            aria-label="Delete"
                        >
                            <font-awesome-icon icon="times" class="text-white" fixed-width></font-awesome-icon>
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
	import { defineComponent, PropType, ref, onMounted, watch } from "vue";
	import { GridOptions, GridColumn, GridRow, GridOrderDirection, GridColumnOrder, GridSelectionMode } from "../models";

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
            filter: {
                type: String,
                required: false
            },
            page: {
                type: Number,
                default: 0,
                required: false
            },
            refreshCount: {
                type: Number,
                default: 0,
                required: false
            }
		},
		emits: ["edit", "delete", "selectionChanged", "updateTotal"],
		setup(props, { emit }) {
			const records = ref<GridRow[]>([]);
			const total = ref(0);
			const orderColumnName = ref(props.options.order.columnName);
			const orderDirection = ref(props.options.order.direction);
			const seletedRows = ref<SelectedRow>({});

			const loadPage = async () => {
				fetch(
					props.options.read +
						"?page=" +
						props.page +
						"&size=" +
						props.options.pageSize +
						"&order=" +
						orderColumnName.value +
						"&direction=" +
						orderDirection.value +
						"&filter=" +
						props.filter +
						(props.parent != undefined ? "&parentId=" + props.parent : "")
				)
					.then((response) => response.json())
					.then((data) => {
						records.value.splice(0);
						data.records.forEach((x: GridRow) => records.value.push(x));
						total.value = data.count;
                        emit("updateTotal", total.value);
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

            watch(props, () => {
				loadPage();
			});

			const editRecord = (item: GridRow) => {
				emit("edit", item.id);
			};

			const deleteRecord = (item: GridRow) => {
                emit("delete", item.id, item[props.options.deleteColumn]);
			};

			const up = (item: GridRow, column: GridColumnOrder) => {
				fetch(column.up + "?id=" + item.id)
					.then((response) => response.json())
					.then(() => {
						loadPage();
					});
			};

			const down = (item: GridRow, column: GridColumnOrder) => {
				fetch(column.down + "?id=" + item.id)
					.then((response) => response.json())
					.then(() => {
						loadPage();
					});
			};

			const columnHeaderClass = (column: GridColumnOrder) => {
				return {
					"order-buttons-wdith": column.type == "order",
				};
			};

			const hasActions = (): boolean => {
				return props.options.allowEdit || props.options.allowDelete || props.options.customActions != undefined;
			};

			const selectableChanged = (record: GridRow) => {
				let anyChecked = false;

				if (props.options.selectionMode == null || props.options.selectionMode == GridSelectionMode.single) {
					for (const key in seletedRows.value) {
						if (parseInt(key) == record.id) {
							if (seletedRows.value[key] == "true") {
								anyChecked = true;
								emit("selectionChanged", record.id);
							}
							continue;
						}
						seletedRows.value[key] = false;
					}
				}
				else if(props.options.selectionMode == GridSelectionMode.multiple)
				{
					let selectedIds: number[] = []; 
					for (const key in seletedRows.value) {
						const numberKey = parseInt(key);
						if (numberKey == record.id) {
							if (seletedRows.value[key] == "true") {
								selectedIds.push(numberKey);
								anyChecked = true;
							}
						}
					}
					emit("selectionChanged", selectedIds);
				}

				if (!anyChecked) emit("selectionChanged", undefined);
			};

			return {
				records,
				total,
				loadPage,
				changeOrder,
				editRecord,
				deleteRecord,
				up,
				down,
				columnHeaderClass,
				hasActions,
				seletedRows,
				selectableChanged
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
		width: 79px;
	}
	.search-width {
		min-width: 250px;
	}
	.select-width {
		width: 20px;
	}
</style>
