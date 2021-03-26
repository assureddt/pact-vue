<template>
	<div class="row">
		<div class="col">
			<div class="row" v-if="pageTitle != undefined && mode == 'grid'">
				<div class="col">
					<h5>{{ pageTitle }}</h5>
				</div>
			</div>
			<div class="row">
				<div class="col">
					<page-grid v-if="mode == 'grid'" :options="gridOptions" :columns="gridColumns" @change-mode="changeMode"></page-grid>
					<page-edit v-if="mode == 'add' || mode == 'edit'" :options="editOptions" :fields="editFields" :mode="mode" @change-mode="changeMode" :editing="editing" :parent="parent"></page-edit>
				</div>
			</div>
		</div>
	</div>
	
</template>

<script lang="ts">
	import { defineComponent, PropType, ref} from "vue";
	import { GridOptions, GridColumn, EditField, EditOptions} from "../models";
    import Gird from "./Grid.vue";
	import Editor from "./Editor.vue";

	export default defineComponent({
		props: {
			gridOptions: {
				type: Object as PropType<GridOptions>,
				required: true,
			},
			gridColumns: {
				type: Array as PropType<GridColumn[]>,
				required: true,
			},
			editOptions: {
				type: Object as PropType<EditOptions>,
				required: true,
			},
			editFields: {
				type: Array as PropType<EditField[]>,
				required: true,
			},
			pageTitle: {
				type: String,
				required: false,
			}
		},
        components: {
            "page-grid": Gird,
			"page-edit": Editor
        },
		setup() {
			const mode = ref("grid");
			const editing = ref<number | undefined>(undefined);
			const parent = ref<number | undefined>(undefined);

			const changeMode = (changeToMode: string, id?: number, parentId?: number) => {
				editing.value = id;
				parent.value = parentId;
				mode.value = changeToMode;
			}

			return {
				mode,
				changeMode,
				editing,
				parent
			};
		},
	});
</script>

<style scoped>
	.handy {
		cursor: pointer;
	}
</style>