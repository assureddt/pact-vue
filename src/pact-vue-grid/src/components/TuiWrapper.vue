<script lang="ts">
	import { defineComponent, onMounted, ref, h } from "vue";
	import Editor from "@toast-ui/editor";
	import "@toast-ui/editor/dist/toastui-editor.css";

	export default defineComponent({
		props: {
			modelValue: {
				type: String,
				required: false,
				default: "",
			},
		},
		emits: ["update:modelValue"],
		setup(props, { emit }) {
			const editor = ref();

			onMounted(() => {
				// eslint-disable-next-line
				const e = new Editor({
					el: editor.value,
					height: "500px",
					initialEditType: "markdown",
					previewStyle: "vertical",
					toolbarItems: [
						["heading", "bold", "italic", "strike"],
						["hr", "quote"],
						["ul", "ol", "indent", "outdent"],
						["table", "link"],
						["code", "codeblock"],
					],
					events: {
						change: () => emit("update:modelValue", e.getMarkdown()),
					},
					initialValue: props.modelValue ?? "",
					// eslint-disable-next-line
				}) as any;
			});

			return () =>
				h("div", {
					ref: editor,
				});
		},
	});
</script>
