# Pact Vue
A collection of reusable components ontop of vuejs and bootstrap 5

## Component Development
If you want to develop a package locally its easy to inherit the component by using full paths. 

For example when developing the child parent grid i used the following...

`import { childParentCRUDGrid } from "c:/Source/pact-vue/src/pact-vue-grid/src/childParentCRUDGrid";
import { GridOrderDirection, GridRow, CRUDGridOptions } from "c:/Source/pact-vue/src/pact-vue-grid/src/models";
import "c:/Source/pact-vue/src/pact-vue-grid/dist/pact-vue-grid.css";`