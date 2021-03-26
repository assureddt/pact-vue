import { createApp, ComponentPublicInstance  } from "vue";
import Page from "./components/Page.vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { GridOptions, GridColumn, EditOptions, EditField, GridColumnOrder} from "./models";
import "bootstrap";
import "../node_modules/bootstrap/dist/css/bootstrap.css"

export class CRUDGrid {
    constructor(selector: string, gridOptions: GridOptions, gridColumns: (GridColumn | GridColumnOrder)[], editOptions: EditOptions, editFields: EditField[]) {
        this.gridOptions = gridOptions;
        this.gridColumns = gridColumns;
        this.editOptions = editOptions;
        this.editFields = editFields;

        this.vm = createApp(Page, {
            gridOptions: this.gridOptions,
            gridColumns: this.gridColumns,
            editOptions: this.editOptions,
            editFields: this.editFields
        })
        .component('font-awesome-icon', FontAwesomeIcon)
        .mount(selector);
    }
    
    gridOptions: GridOptions
    gridColumns: GridColumn[]
    editOptions: EditOptions
    editFields: EditField[]
    vm: ComponentPublicInstance
}