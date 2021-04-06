import { createApp, ComponentPublicInstance  } from "vue";
import Page from "./components/ChildParentPage.vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { CRUDGridOptions } from "./models";

export class childParentCRUDGrid {
    constructor(selector: string, parentOptions: CRUDGridOptions, childOptions: CRUDGridOptions) {
        this.parentOptions = parentOptions;
        this.childOptions = childOptions;

        this.vm = createApp(Page, {
            parentGridOptions: parentOptions.gridOptions,
            parentGridColumns: parentOptions.gridColumns,
            parentEditOptions: parentOptions.editOptions,
            parentEditFields: parentOptions.editFields,
            parentTitle: parentOptions.pageTitle,
            childGridOptions: childOptions.gridOptions,
            childGridColumns: childOptions.gridColumns,
            childEditOptions: childOptions.editOptions,
            childEditFields: childOptions.editFields,
            childTitle: childOptions.pageTitle
        })
        .component('font-awesome-icon', FontAwesomeIcon)
        .mount(selector);
    }
    
    parentOptions: CRUDGridOptions
    childOptions: CRUDGridOptions
    vm: ComponentPublicInstance
}