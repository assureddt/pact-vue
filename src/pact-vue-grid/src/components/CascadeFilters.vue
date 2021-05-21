<template v-if="filters != undefined">
	<div class="col-12" v-for="filter in filters" :key="filter.name">
		<div class="input-group input-group-sm">
			<label class="input-group-text" :for="getFilterId(filter)">{{ filter.label }}</label>
			<select class="form-select select-width" v-model="fitlerValues[filter.name]" @change="selectChanged(filter)" :id="getFilterId(filter)">
				<option v-for="filterData in filterDataMap.get(filter.name)" :key="filterData.id" :value="filterData.id">{{
					filterData.display
				}}</option>
			</select>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, ref, watch, reactive } from "vue";
	import { GridCascadeFilter, SelectOption } from "../models";

	export default defineComponent({
		props: {
			filters: {
				type: Array as PropType<GridCascadeFilter[]>,
				required: false,
			},
		},
		emits: ["changedFilter"],
		setup(props, { emit }) {
			if (props.filters == undefined) return {};

			const filterDataMap = reactive(new Map<string, SelectOption[]>());
			const fitlerValues = reactive<FilterValues>({});
			const lastValueSent = ref<number | undefined>(undefined);

			const getFilterData = async (filter: GridCascadeFilter, lastFilter: GridCascadeFilter | undefined) => {
				let url = filter.url;

				if (lastFilter != undefined) url += "?parentId=" + fitlerValues[lastFilter.name];

				fetch(url)
					.then((response) => response.json())
					.then((data: SelectOption[]) => {
						filterDataMap.set(filter.name, data);
						fitlerValues[filter.name] = getCachedSeletedItem(filter, data);
						loadNextFilter(filter);
					});
			};

			function loadNextFilter(lastFilter: GridCascadeFilter | undefined) {
				if (props.filters == undefined) return;
				const filter = props.filters.find((x) => x.parent == lastFilter?.name);
				if (filter != undefined) getFilterData(filter, lastFilter);
			}

			loadNextFilter(undefined);

			watch(fitlerValues, () => {
				if (props.filters == undefined) return;

				const lastFilter = props.filters.find((x) => x.isParentId);

				if (lastFilter == undefined) return;

				const currentValue = fitlerValues[lastFilter?.name];

				if (lastValueSent.value == undefined || lastValueSent.value != currentValue) {

					emit("changedFilter", currentValue, getCurrentTextDisplay());
					lastValueSent.value = currentValue;
				}
			});

			const selectChanged = (filter: GridCascadeFilter) => {
				if (props.filters == undefined) return {};

				sessionStorage.setItem(cacheKey(filter.name), fitlerValues[filter.name].toString());

				if (!filter.isParentId) loadNextFilter(filter);
			};

			const getCachedSeletedItem = (filter: GridCascadeFilter, data: SelectOption[]) : number => {
				let rawData = sessionStorage.getItem(cacheKey(filter.name));
				if(rawData != null)
				{
					var value = parseInt(rawData);
					if(data.find((x) => x.id == value) != undefined)
						return value;
				}
				sessionStorage.setItem(cacheKey(filter.name), data[0].id.toString());
				return data[0].id;
			}

			const cacheKey = (key: string) :string => {
				return "crud-" + key;
			}

			const getFilterId = (filter: GridCascadeFilter) : string => {
				return "filter-" + filter.name;
			}

			const getCurrentTextDisplay = () => {
				if (props.filters == undefined || filterDataMap == undefined) return;
				let output = "";
				for (let filter of props.filters) {
					var options = filterDataMap.get(filter.name);
					if(options == undefined) continue;
					var values = options.find((x) => x.id == fitlerValues[filter.name]);
					if(values == undefined) continue;

					if(output.length > 0)
						output = output + " - ";
					output += values.display;
				}
				return output;
			}

			return {
				filterDataMap,
				getFilterData,
				fitlerValues,
				selectChanged,
				getFilterId
			};
		},
	});

	interface FilterValues {
		[key: string]: number;
	}
</script>

<style scoped>
	.select-width {
		width: 250px;
	}
</style>