import { createApp, ComponentPublicInstance  } from "vue";
import Page from "./components/Page.vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { GridOptions, GridColumn, EditOptions, EditField, EditFieldSelect, EditFieldNumber, GridColumnOrder} from "./models";

export class CRUDGrid {
    constructor(options: CRUDGridOptions) {
        this.options = options;

        this.vm = createApp(Page, {
            gridOptions: options.gridOptions,
            gridColumns: options.gridColumns,
            editOptions: options.editOptions,
            editFields: options.editFields,
            pageTitle: options.pageTitle
        })
        .component('font-awesome-icon', FontAwesomeIcon)
        .mount(options.selector);
    }
    
    options: CRUDGridOptions
    vm: ComponentPublicInstance
}

export interface CRUDGridOptions {
    selector: string,
    gridOptions: GridOptions,
    gridColumns: (GridColumn | GridColumnOrder)[],
    editOptions: EditOptions,
    editFields: (EditField | EditFieldSelect | EditFieldNumber)[],
    pageTitle?: string
}