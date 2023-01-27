<template>
	<form class="row" id="add-edit-form" @submit.prevent="submit" :novalidate="!showValidity">
		<div class="col">
			<div class="row">
				<div class="col-12 mb-3">
					<h5 v-if="mode == 'edit'">{{ options.editTitle }}</h5>
					<h5 v-if="mode == 'add'">{{ options.addTitle }}</h5>
				</div>
			</div>
			<div class="row" v-if="subPageTitle.length > 0">
				<div class="col-12 mb-3">
					<h6>{{ subPageTitle }}</h6>
				</div>
			</div>
			<div class="row" v-if="loaded">
				<template v-for="field in fields" :key="field.name">
					<div class="mb-3" :class="workoutColumnClass(field)">
						<label :for="field.name" class="form-label">{{ field.display }}</label>
						<component
							v-if="field.customComponent != null"
							:is="field.customComponent"
							:select-options="selectOptions.get(field.name)"
							:field="field"
							:model-value="record[field.name]"
							:editor-values="record"
							:parent="parent"
							@update:model-value="record[field.name] = $event"
						></component>
						<select
							v-else-if="field.type == 'select' && selectOptions.has(field.name)"
							class="form-select"
							:id="field.name"
							v-model="record[field.name]"
							:required="field.required"
							:multiple="field.multiple"
						>
							<option v-if="!field.required && !field.multiple" :value="null">
								Unselected
							</option>
							<option v-for="selectOption in selectOptions.get(field.name)" :key="selectOption.id" :value="selectOption.id">
								{{ selectOption.display }}
							</option>
						</select>
						<select
							v-else-if="field.type == 'boolean'"
							class="form-select"
							:id="field.name"
							v-model="record[field.name]"
							:required="field.required"
						>
							<option v-if="!field.required" :value="undefined">
								Unselected
							</option>
							<option :value="false">
								{{ field.falseText }}
							</option>
							<option :value="true">
								{{ field.trueText }}
							</option>
						</select>
						<input
							v-else-if="field.type == 'number'"
							:type="field.type"
							class="form-control"
							:id="field.name"
							:placeholder="field.placeholder"
							v-model="record[field.name]"
							:required="field.required"
							:pattern="field.pattern"
							:min="field.min"
							:max="field.max"
						/>
						<input
							v-else
							:type="field.type"
							class="form-control"
							:id="field.name"
							:placeholder="field.placeholder"
							v-model="record[field.name]"
							:required="field.required"
							:pattern="field.pattern"
						/>
					</div>
				</template>
			</div>
			<div class="row" v-if="serverMessage != undefined && serverMessage.length > 0">
				<div class="col-12 mb-3">
					<div class="alert alert-danger mb-0" role="alert">
						{{ serverMessage }}
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-12 mb-3">
					<button class="btn btn-primary" v-if="mode == 'add'">
						<font-awesome-icon icon="plus" class="text-white" fixed-width></font-awesome-icon>
						Add
					</button>
					<button class="btn btn-primary" v-if="mode == 'edit'">
						<font-awesome-icon icon="save" class="text-white" fixed-width></font-awesome-icon>
						Save
					</button>
					<button class="btn btn-danger ms-1" v-on:click="gridMode">
						<font-awesome-icon icon="ban" class="text-white" fixed-width></font-awesome-icon>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</form>
</template>

<script lang="ts">
	import { defineComponent, PropType, ref, reactive } from "vue";
	import {
		EditField,
		EditFieldSelect,
		EditFieldNumber,
		EditFieldSelectBoolean,
		EditOptions,
		SelectOption,
		EditorValues,
		QueryData,
	} from "../models";

	export default defineComponent({
		props: {
			options: {
				type: Object as PropType<EditOptions>,
				required: true,
			},
			fields: {
				type: Array as PropType<(EditField | EditFieldSelect | EditFieldNumber | EditFieldSelectBoolean)[]>,
				required: true,
			},
			mode: {
				type: String,
				required: true,
			},
			editing: {
				type: Number,
				required: false,
			},
			queryData: {
				type: Object as PropType<QueryData>,
				required: false,
			},
			subPageTitle: {
				type: String,
				required: false,
				default: "",
			},
		},
		emits: ["changeMode"],
		setup(props, { emit }) {
			const record = ref<EditorValues>({});
			const showValidity = ref(false);
			const serverMessage = ref("");
			const selectOptions = reactive(new Map<string, SelectOption[]>());
			const columnClass = ref("col-12");
			const loaded = ref(false);

			if (props.options.columnClass != undefined) columnClass.value = props.options.columnClass.valueOf();

			props.fields.forEach((field) => {
				if (field.type == "select") {
					const selectField = field as EditFieldSelect;

					fetch(selectField.optionsUrl)
						.then((response) => response.json())
						.then((data) => {
							selectOptions.set(field.name, data);
						});

					if (props.editing == undefined) {
						if (selectField.multiple) record.value[field.name] = [];
						else if ((selectField.multiple == null || selectField.multiple == false) && !selectField.required)
							record.value[field.name] = null;
					}
				}
			});

			const gridMode = () => {
				emit("changeMode", "grid");
			};

			const submit = async () => {
				const form = document.getElementById("add-edit-form") as HTMLFormElement;
				if (!form.checkValidity()) {
					showValidity.value = true;
					form.classList.add("was-validated");
					return;
				}

				let url = props.mode == "add" ? props.options.add : props.options.edit;
				if (props.mode == "add" && props.queryData != undefined) url += "?" + props.queryData.createUrlData();
				postData(url, record.value).then((data) => {
					if (data.result == "OK") {
						gridMode();
					} else if (data.result == "FAIL") {
						serverMessage.value = data.message;
					}
				});
			};

			if (props.editing != undefined) {
				fetch(props.options.grabData + "?id=" + props.editing)
					.then((response) => response.json())
					.then((data) => {
						record.value = data.record;
						loaded.value = true;
					});
			} else loaded.value = true;

			async function postData(url: string, data: EditorValues) {
				const response = await fetch(url, {
					method: "POST",
					cache: "no-cache",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});
				return response.json();
			}

			const workoutColumnClass = (field: EditField) => {
				if (field.columnClass != undefined) return field.columnClass;
				return columnClass.value;
			};

			return {
				record,
				submit,
				showValidity,
				serverMessage,
				gridMode,
				selectOptions,
				columnClass,
				loaded,
				workoutColumnClass,
			};
		},
	});
</script>

<style scoped>
	.handy {
		cursor: pointer;
	}
</style>
