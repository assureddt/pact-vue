export interface GridOptions {
	id?: string;
	read: string;
	delete: string;
	pageSize?: number;
	order: GridOptionsOrder;
	allowEdit: boolean;
	allowAdd: boolean;
	allowDelete: boolean;
	buttonsWidth: number;
	deleteColumn: string;
	filters?: GridFilter[];
	customActions?: GridCustomAction[];
	queryData?: QueryData;
	selectable?: true;
	selectionMode?: GridSelectionMode;
	showReset?: boolean;
	pageSizeOptions?: number[];
	actionsName?: string;
}

export class GridOptionsOrder {
	constructor(columnName: string, direction: GridOrderDirection) {
		this.columnName = columnName;
		this.direction = direction;
	}

	columnName = "";
	direction: GridOrderDirection = GridOrderDirection.ascending;
}

export enum GridOrderDirection {
	ascending = 0,
	descending = 1,
}
export enum GridSelectionMode {
	single = 0,
	multiple = 1,
}

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
	columnClass?: string;
}

export interface EditFieldSelect extends EditField {
	type: "select";
	optionsUrl: string;
	multiple?: boolean;
}

export interface EditFieldSelectBoolean extends EditField {
	type: "boolean";
	trueText: string;
	falseText: string;
}

export interface EditFieldNumber extends EditField {
	type: "number";
	min?: number;
	max?: number;
}

export interface GridColumnOrder extends GridColumn {
	min: number;
	up: string;
	down: string;
}

export interface GridBaseFilter {
	url: string;
	label: string;
	name: string;
	send: true | undefined;
	width: string | "col-12";
	defaultValue?: number;
}

export interface GridBasicFilter extends GridBaseFilter {
	kind: "basic";
}

export interface GridChildFilter extends GridBaseFilter {
	parent?: string;
	kind: "child";
}

export type GridFilter = GridBasicFilter | GridChildFilter;

export class QueryData extends Map<string, number> {
	createUrlData(): string {
		let urlSegment = "";
		this.forEach((value, key) => {
			if (urlSegment.length > 0) urlSegment += "&";
			urlSegment += key + "=" + value;
		});
		return urlSegment;
	}
}

export interface SelectOption {
	id: number;
	display: string;
}

export interface GridCustomAction {
	fontAwesomeIcon: string;
	action(row: GridRow): void;
	label: string;
	buttonClass: string;
	name: string;
	shouldDisable?(row: GridRow): boolean;
	shouldHide?(row: GridRow): boolean;
}

export interface CRUDGridOptions {
	gridOptions: GridOptions;
	gridColumns: (GridColumn | GridColumnOrder)[];
	editOptions: EditOptions;
	editFields: (EditField | EditFieldSelect | EditFieldNumber | EditFieldSelectBoolean)[];
	pageTitle?: string;
}

export interface EditorValues {
	[key: string]: number | string | [] | null;
}
