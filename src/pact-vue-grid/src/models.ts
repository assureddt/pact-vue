export interface GridOptions {
    read: string;
    delete: string;
    pageSize: number;
    order: GridOptionsOrder;
    allowEdit: boolean;
    allowAdd: boolean;
    allowDelete: boolean;
    buttonsWidth: number;
    deleteColumn: string;
    filters?: GridCascadeFilter[];
    customActions?: GridCustomAction[];
    parent?: number;
    selectable?: true;
    selectionMode?: GridSelectionMode;
}

export interface GridOptionsOrder {
    columnName: string,
    direction: GridOrderDirection
}

export enum GridOrderDirection { ascending = 0, descending = 1 }
export enum GridSelectionMode { single = 0, multiple = 1 }

export interface GridColumn {
    display: string;
    name: string;
    type: string;
}

export interface GridRow {
    id: number;
    [key: string]: boolean | undefined | string | number;
}

export interface EditOptions {
    add: string;
    edit: string;
    grabData: string;
    addTitle: string;
    editTitle: string;
    columnClass?: string;
}

export interface EditField {
    display: string;
    name: string;
    placeholder: string;
    required: boolean;
    type: string;
    pattern?: string;
    customComponent?: string;
}

export interface EditFieldSelect extends EditField {
    type: "select"
    optionsUrl: string;
    multiple?: boolean;
}

export interface EditFieldSelectBoolean extends EditField {
    type: "boolean",
    trueText: string,
    falseText: string
}

export interface EditFieldNumber extends EditField {
    type: "number"
    min?: number;
    max?: number;
}

export interface GridColumnOrder extends GridColumn {
    min: number;
    up: string;
    down: string;
}

export interface GridCascadeFilter {
    url: string;
    label: string;
    isParentId: boolean;
    name: string;
    parent?: string;
}

export interface SelectOption  {
    id: number,
    display: string
}

export interface GridCustomAction {
    fontAwesomeIcon: string,
    action(row: GridRow): void
    label: string
    buttonClass: string,
    name: string
    shouldDisable?(row: GridRow): boolean
}

export interface CRUDGridOptions {
    gridOptions: GridOptions,
    gridColumns: (GridColumn | GridColumnOrder)[],
    editOptions: EditOptions,
    editFields: (EditField | EditFieldSelect | EditFieldNumber | EditFieldSelectBoolean)[],
    pageTitle?: string
}

export interface EditorValues {
    [key: string]: number | string | [] | null;
}