import "bootstrap";
import { CRUDGrid, GridOrderDirection } from "./main";

import "bootstrap/scss/bootstrap.scss";

//Fortawesome
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faPlus } from "@fortawesome/pro-solid-svg-icons/faPlus";
import { faEdit } from "@fortawesome/pro-solid-svg-icons/faEdit";
import { faTimes } from "@fortawesome/pro-solid-svg-icons/faTimes";
import { faBan } from "@fortawesome/pro-solid-svg-icons/faBan";
import { faSave } from "@fortawesome/pro-solid-svg-icons/faSave";
import { faCheck } from "@fortawesome/pro-solid-svg-icons/faCheck";

library.add(faPlus, faEdit, faTimes, faBan, faSave, faCheck);
dom.watch();

new CRUDGrid("#app", {
	gridOptions: {
		read: "/read.json",
		delete: "/remove",
		pageSize: 10,
        order: {
            columnName : "name",
            direction: GridOrderDirection.ascending
        },
		allowEdit: true,
		allowAdd: true,
		allowDelete: true,
		deleteColumn: "name",
		buttonsWidth: 79
	},
	gridColumns: [
		{
			name: "name",
			display: "Name",
            type: "text"
		},
		{
			name: "description",
			display: "Description",
            type: "text"
		},
	],
	editOptions: {
		add: "/add",
		edit: "/edit",
		grabData: "/data",
		editTitle: "Edit",
		addTitle: "Add"
	},
	editFields: [
		{
			name: "name",
			display: "Name",
			placeholder: "Name",
			required: true,
            type: "text"
		},
		{
			name: "description",
			display: "Description",
			placeholder: "Description",
			required: true,
            type: "text"
		}
	],
	pageTitle: "Things"
});
