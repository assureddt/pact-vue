<template>
	<form class="row" id="add-edit-form" @submit.prevent="submit" :novalidate="!showValidity">
		<div class="col">
			<div class="row">
				<div class="col-12 mb-3">
					<h5 v-if="mode == 'edit'">{{options.editTitle}}</h5>
					<h5 v-if="mode == 'add'">{{options.addTitle}}</h5>
				</div>
			</div>
			<div class="row" v-for="field in fields" :key="field.name">
				<div class="col-12 mb-3">
					<label :for="field.name" class="form-label">{{ field.display }}</label>
					<input :type="field.type" class="form-control" :id="field.name" :placeholder="field.placeholder" v-model="record[field.name]" :required="field.required" :pattern="field.pattern"/>
				</div>
			</div>
			<div class="row" v-if="serverMessage.length > 0">
				<div class="col-12 mb-3">
					<div class="alert alert-danger mb-0" role="alert">
						{{serverMessage}}
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
	import { defineComponent, PropType, ref } from "vue";
	import { EditField, EditOptions } from "../models";

	export default defineComponent({
		props: {
			options: {
				type: Object as PropType<EditOptions>,
				required: true,
			},
			fields: {
				type: Array as PropType<EditField[]>,
				required: true,
			},
			mode: {
				type: String,
				required: true,
			},
			editing: {
				type: Number,
				required: false
			},
			parent: {
				type: Number,
				required: false
			}
		},
		emits: ["changeMode"],
		setup(props, { emit }) {
			const record = ref({});
			const showValidity = ref(false);
			const serverMessage = ref("");

			const gridMode = () => {
				emit("changeMode", "grid");
			};

			const submit = async () => {
                const form = document.getElementById('add-edit-form') as HTMLFormElement;
                if (!form.checkValidity()) {
					showValidity.value = true;
					form.classList.add('was-validated');
                    return;
                }

				let url = props.mode == "add" ? props.options.add : props.options.edit;
				if(props.mode == "add" && props.parent != undefined)
					url += "?parentId=" + props.parent;
				postData(url, record.value).then(data => {
					if(data.result == "OK"){
						gridMode();
					}
					else if(data.result == "FAIL"){
						serverMessage.value = data.message;
					}
				});
			};

			if(props.editing != undefined)
			{
				fetch(props.options.grabData +"?id=" + props.editing)
					.then((response) => response.json())
					.then((data) => {
						record.value = data.record;
					});
			}

			async function postData(url:string, data: any) {
				const response = await fetch(url, {
					method: 'POST',
					cache: 'no-cache',
					headers: {
					'Content-Type': 'application/json'
					},
					body: JSON.stringify(data)
				});
				return response.json();
			}

			return {
				record,
				submit,
				showValidity,
				serverMessage,
				gridMode
			};
		},
	});
</script>

<style scoped>
	.handy {
		cursor: pointer;
	}
</style>