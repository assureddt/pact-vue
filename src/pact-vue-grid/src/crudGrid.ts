import { createApp, ComponentPublicInstance, App } from "vue";
import Page from "./components/Page.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { CRUDGridOptions } from "./models";

export class CRUDGrid {
	constructor(selector: string, options: CRUDGridOptions, setupCustomComponents?: (app: App<Element>) => App<Element>) {
		this.options = options;

		let app = createApp(Page, {
			gridOptions: options.gridOptions,
			gridColumns: options.gridColumns,
			editOptions: options.editOptions,
			editFields: options.editFields,
			pageTitle: options.pageTitle,
		}).component("font-awesome-icon", FontAwesomeIcon);

		if (setupCustomComponents != null) app = setupCustomComponents(app);

		this.vm = app.mount(selector);
	}

	options: CRUDGridOptions;
	vm: ComponentPublicInstance;
}
