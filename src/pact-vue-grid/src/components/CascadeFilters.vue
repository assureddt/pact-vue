<template v-if="filters != undefined">
	<div class="col-12" :class="filter.width" v-for="filter in filters" :key="filter.name">
		<div class="input-group input-group-sm">
			<label class="input-group-text" :for="getFilterId(filter)">{{ filter.label }}</label>
			<select class="form-select" v-model="filterValues[filter.name]" @change="selectChanged(filter)" :id="getFilterId(filter)">
				<option v-for="filterData in filterDataMap.get(filter.name)" :key="filterData.id" :value="filterData.id">{{
					filterData.display
				}}</option>
			</select>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, ref, watch, reactive } from "vue";
	import { GridFilter, SelectOption, QueryData } from "../models";

	export default defineComponent({
		props: {
			filters: {
				type: Array as PropType<GridFilter[]>,
				required: false,
			},
			reset: {
				type: Number,
				required: true,
				default: 0,
			},
		},
		emits: ["changedFilter"],
		setup(props, { emit }) {
			if (props.filters == undefined) return {};

			const filterDataMap = reactive(new Map<string, SelectOption[]>());
			const filterValues = reactive<FilterValues>({});
			const lastValueSent = ref<undefined | QueryData>(undefined);

			const getFilterData = async (filter: GridFilter, lastFilter: GridFilter | undefined) => {
				let url = filter.url;

				if (lastFilter != undefined) url += "?parentId=" + filterValues[lastFilter.name];

				fetch(url)
					.then((response) => response.json())
					.then((data: SelectOption[]) => {
						filterDataMap.set(filter.name, data);
						filterValues[filter.name] = getCachedSelectedItem(filter, data);
						loadNextFilter(filter);
					});
			};

			function loadNextFilter(lastFilter: GridFilter | undefined) {
				if (props.filters == undefined) return;

				props.filters.forEach((x) => {
					if (x.kind == "child") {
						if (lastFilter?.name == x.parent) getFilterData(x, lastFilter);
					}
				});
			}

			props.filters.forEach((x) => {
				if (x.kind !== "child" || !x.parent) {
					getFilterData(x, undefined);
				}
			});

			watch(filterValues, () => {
				if (props.filters == undefined) return;

				const output = new QueryData();
				let gotAllValues = true;
				props.filters.forEach((x) => {
					if (x.send) {
						const value = filterValues[x.name];
						gotAllValues = value != undefined;
						output.set(x.name, filterValues[x.name]);
					}
				});
				if (!gotAllValues) return;
				if (lastValueSent.value == undefined || lastValueSent.value != output) {
					emit("changedFilter", output, getCurrentTextDisplay());
					lastValueSent.value = output;
				}
			});

			const selectChanged = (changedFilter: GridFilter) => {
				if (props.filters == undefined) return {};

				sessionStorage.setItem(cacheKey(changedFilter.name), filterValues[changedFilter.name].toString());

				props.filters.forEach((x) => {
					if (x.kind == "child") {
						if (changedFilter?.name == x.parent) getFilterData(x, changedFilter);
					}
				});
			};

			const getCachedSelectedItem = (filter: GridFilter, data: SelectOption[]): number => {
				const rawData = sessionStorage.getItem(cacheKey(filter.name));
				if (rawData != null) {
					const value = parseInt(rawData);
					if (data.find((x) => x.id == value) != undefined) return value;
				}
				if (filter.defaultValue != undefined) {
					if (data.find((x) => x.id == filter.defaultValue) != undefined) {
						sessionStorage.setItem(cacheKey(filter.name), filter.defaultValue.toString());
						return filter.defaultValue;
					}
				}
				sessionStorage.setItem(cacheKey(filter.name), data[0].id.toString());
				return data[0].id;
			};

			const cacheKey = (key: string): string => {
				return "crud-" + key;
			};

			const getFilterId = (filter: GridFilter): string => {
				return "filter-" + filter.name;
			};

			const getCurrentTextDisplay = () => {
				if (props.filters == undefined || filterDataMap == undefined) return;
				let output = "";
				for (const filter of props.filters) {
					const options = filterDataMap.get(filter.name);
					if (options == undefined) continue;
					const values = options.find((x) => x.id == filterValues[filter.name]);
					if (values == undefined) continue;

					if (output.length > 0) output = output + " - ";
					output += values.display;
				}
				return output;
			};

			watch(
				() => props.reset,
				() => {
					props.filters?.forEach((filter) => {
						const options = filterDataMap.get(filter.name);
						if (options == null) return;
						sessionStorage.removeItem(cacheKey(filter.name));
						filterValues[filter.name] = getCachedSelectedItem(filter, options);
					});
				}
			);

			return {
				filterDataMap,
				getFilterData,
				filterValues,
				selectChanged,
				getFilterId,
			};
		},
	});

	interface FilterValues {
		[key: string]: number;
	}
</script>

<style scoped></style>
