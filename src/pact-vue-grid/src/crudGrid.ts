import { createApp, ComponentPublicInstance  } from "vue";
import Page from "./components/Page.vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { CRUDGridOptions } from "./models";

export class CRUDGrid {
    constructor(selector: string, options: CRUDGridOptions) {
        this.options = options;

        this.vm = createApp(Page, {
            gridOptions: options.gridOptions,
            gridColumns: options.gridColumns,
            editOptions: options.editOptions,
            editFields: options.editFields,
            pageTitle: options.pageTitle
        })
        .component('font-awesome-icon', FontAwesomeIcon)
        .mount(selector);
    }
    
    options: CRUDGridOptions
    vm: ComponentPublicInstance
}
