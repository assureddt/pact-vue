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
}

export interface GridOptionsOrder {
    columnName: string,
    direction: GridOrderDirection
}

export enum GridOrderDirection { ascending = 0, descending = 1 }

export interface GridColumn {
    display: string;
    name: string;
    type: string;
}

export interface GridRow {
    id: number;
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
}

export interface EditFieldSelect extends EditField {
    type: "select"
    optionsUrl: string;
    multiple?: boolean;
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