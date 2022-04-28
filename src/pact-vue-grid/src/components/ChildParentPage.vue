<template>
	<div class="row">
		<div class="col-6" v-if="rawMode == 'grid'">
			<div class="row" v-if="parentTitle != undefined && rawMode == 'grid'">
				<div class="col">
					<h5>{{ parentTitle }}</h5>
				</div>
			</div>
			<div class="row">
				<div class="col">
					<page-grid v-if="rawMode == 'grid'" :options="parentGridOptions" :columns="parentGridColumns" @change-mode="parentChangeMode" @selection-changed="selectionChanged"></page-grid>
				</div>
			</div>
		</div>
		<div class="col-6" v-if="rawMode == 'grid'">
			<div class="row" v-if="childTitle != undefined && rawMode == 'grid'">
				<div class="col">
					<h5>{{ childTitle }}</h5>
				</div>
			</div>
			<div class="row">
				<div class="col">
					<page-grid v-if="rawMode == 'grid' && childGridParent != undefined" :options="childGridOptions" :columns="childGridColumns" @change-mode="childChangeMode" :parent="childGridParent"></page-grid>
				</div>
			</div>
		</div>
		<div class="col" v-if="mode == 'add-parent' || mode == 'edit-parent'">
			<page-edit :options="parentEditOptions" :fields="parentEditFields" :mode="rawMode" @change-mode="parentChangeMode" :editing="editing" :parent="parent"></page-edit>
		</div>
		<div class="col" v-if="mode == 'add-child' || mode == 'edit-child'">
			<page-edit :options="childEditOptions" :fields="childEditFields" :mode="rawMode" @change-mode="childChangeMode" :editing="editing" :parent="parent"></page-edit>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, ref} from "vue";
	import { GridOptions, GridColumn, EditField, EditFieldSelect, EditFieldNumber, EditFieldSelectBoolean, EditOptions} from "../models";
    import Gird from "./GridPage.vue";
	import Editor from "./GridEditor.vue";

	export default defineComponent({
		props: {
			parentGridOptions: {
				type: Object as PropType<GridOptions>,
				required: true,
			},
			parentGridColumns: {
				type: Array as PropType<GridColumn[]>,
				required: true,
			},
			parentEditOptions: {
				type: Object as PropType<EditOptions>,
				required: true,
			},
			parentEditFields: {
				type: Array as PropType<(EditField | EditFieldSelect | EditFieldNumber)[]>,
				required: true,
			},
			parentTitle: {
				type: String,
				required: false,
			},
			childGridOptions: {
				type: Object as PropType<GridOptions>,
				required: true,
			},
			childGridColumns: {
				type: Array as PropType<GridColumn[]>,
				required: true,
			},
			childEditOptions: {
				type: Object as PropType<EditOptions>,
				required: true,
			},
			childEditFields: {
				type: Array as PropType<(EditField | EditFieldSelect | EditFieldNumber | EditFieldSelectBoolean)[]>,
				required: true,
			},
			childTitle: {
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
			const rawMode = ref("grid");
			const editing = ref<number | undefined>(undefined);
			const parent = ref<number | undefined>(undefined);
			const childGridParent = ref<number | undefined>(undefined);

			const parentChangeMode = (changeToMode: string, id?: number, parentId?: number) => {
				editing.value = id;
				parent.value = parentId;
				mode.value = changeToMode + "-parent";
				rawMode.value = changeToMode;
			}

			const childChangeMode = (changeToMode: string, id?: number, parentId?: number) => {
				editing.value = id;
				parent.value = parentId;
				mode.value = changeToMode + "-child";
				rawMode.value = changeToMode;
			}

			const selectionChanged = (id: number | undefined) => {
				childGridParent.value = id;
			}

			return {
				mode,
				parentChangeMode,
				childChangeMode,
				editing,
				parent,
				rawMode,
				selectionChanged,
				childGridParent
			};
		},
	});
</script>

<style scoped>
	.handy {
		cursor: pointer;
	}
</style>