<template>
	<div class="col-12 col-md-6 d-flex align-items-center">
		<label class="form-label my-auto me-1">Show</label>
		<select class="form-select form-select-sm w-auto d-inline-block" v-model="selectedPageSize" v-on:change="sizeChanged($event)">
			<option v-for="sizeOption in sizeOptions" :key="sizeOption" :value="sizeOption">{{sizeOption}}</option>
		</select>
		<label class="form-label my-auto ms-1">items</label>
	</div>
</template>

<script lang="ts">
	import { defineComponent, ref } from "vue";

	export default defineComponent({
		props: {
			pageSize: {
				type: Number,
				required: false,
				default: 20
			},
			sizeOptions: {
				type: Array<number>,
				required: false,
				default: () => [10, 20, 30, 40, 50, 75, 100]
			}
		},
		emits: ["pageSizeChanged"],
		setup(props, { emit }) {
			const selectedPageSize = ref(props.pageSize);

			const sizeChanged = async (event: Event) => {
				const value = Number((event.target as HTMLSelectElement).value);
				selectedPageSize.value = value;
				emit("pageSizeChanged", value);
			};

			return {
				sizeChanged,
				selectedPageSize
			};
		},
	});
</script>
