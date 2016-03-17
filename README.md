# pouchdb-redux-helper

Helpers for working with PouchDB in React with Redux store.

[![build status](https://img.shields.io/travis/bmihelac/pouchdb-redux-helper/master.svg?style=flat-square)](https://travis-ci.org/bmihelac/pouchdb-redux-helper)
[![npm version](https://img.shields.io/npm/v/pouchdb-redux-helper.svg?style=flat-square)](https://www.npmjs.com/package/pouchdb-redux-helper)


pouchdb-redux-helper consists of:

* `createCRUD` function for creating reducers, actionTypes, actions and route paths.

* helper functions for connecting components with store

pouchdb-redux-helpers uses and depends on:

* immutablejs for storing data

* redux-thunk for handling actions

poouchdb-redux-helper is currently considered experimental software.

## Installation

```
$ npm install pouchdb-redux-helper --save
```

## Usage

### Create CRUD

```js
createCRUD(db, mountPoint, [prefix=null], [opts={}])
```

This function return reducer and redux helpers for given resource type in given
database.

### Options

* `db`: PouchDB database
* `mountPoint`: unique name of CRUD that defines where it will be mounted in
    state as well to give action types unique prefix
* `prefix`: prefix to use for document id for creating new object and in allDocs.
    Equal to `mountPoint` if not specified.
* `opts`: options

    * `startkey` - startkey for this crud, default `mountPoint-`
    * `endkey` - endkey for this crud, default `mountPoint-\uffff`

### Returns

It returns object consisting of:

* `actions`

    * `actions.allDocs(folder='', params, opts)`
    * `actions.query(fun, folder='', params, opts)`
    * `actions.get(docId, params, opts)`
    * `actions.put(doc, params, opts)`
    * `actions.remove(doc, params, opts)`

    Options for actions:

    * `fun`: query function
    * `folder`: folder where to save document ids
    * `params`: params to delegate to pouchdb service method
    * `opts`: additional options to add to action
    * `doc`: document
    * `docId`: document id

* `actionTypes`

    action types for actions above (allDocs, query, get, put, remove)

* `reducer`

    Reducer for given CRUD. It is immutable.Map object with:

    * `documents`: currently loaded documents, a map of docId: doc structure
    * `folders` is a map of document ids for given database query.
        It has folderName:[doc1Id, doc2Id,...] structure.

* `mountPoint`

    mountPoint from option

* `paths`

    paths for crud routes (list, detail, edit, create)

* `urlPrefix`

    urlPrefix for using in routes

* `db`

    PouchDB database


#### Example Usage

```js
import thunk from 'redux-thunk';
import { createCRUD } from 'pouchdb-redux-helper';
//...
const db = PouchDB('testdb');
// get CRUD 
const projectsCrud = createCRUD(db, 'projects');
// reducers
const reducers = combineReducers({
  [projectsCrud.mountPoint]: projectsCrud.reducer,
});
// create store
const finalCreateStore = compose(
  applyMiddleware(...[thunk]),
)(createStore);
const store = finalCreateStore(reducers);
// allDocs action
```

Example of calling `allDocs` action of `projectsCrud`.

```js
store.dispatch(projectsCrud.actions.allDocs('all'));
```

When previous example is executed, following will happen:

1. thunk will dispatch `POUCHDB_projects_allDocs_request` action and
  execute PouchDB `allDocs` as promise.

2. If promise resolves

  2.1. thunk will dispatch `POUCHDB_projects_allDocs_success`
    action with result

  2.2. store will merge received documents with existing state in
    `state.projects.documents` and update document ids in
    `state.projects.folders.all` List.

3. If error occurs `POUCHDB_projects_allDocs_failure` action will be dispatched
    with error

### Connect containers helper functions

#### connectList

Decorator connects wrapped Component with documents from the state as property.
Query options can be passed to PouchDB, such as query function, startkey, endkey,
etc. If state does not already contains `folder` with documents, they are loaded.

```js
connectList(crud, opts={}, mapStateToProps, mapDispatchToProps)
```

##### Options

* `crud`: crud obtained from `createCRUD`
* `opts`:
  * `opts.options`: options to pass to PouchDB. If `options.fun` is given,
      `query` will be executed, otherwise `allDocs` which starts with `mountPoint-`
  * `opts.folder`: folder where to save result. If empty this is serialized from
      `opts.options`
  * `propName="items"`: name of property to pass to wrapped component
* `mapStateToProps`: custom mapStateToProps to delegate to `connect`
* `mapDispatchToProps`: mapDispatchToProps to delegate to `connect`

##### Example usage

```js
const ProjectList = ({isLoading, items}) => {(
  if (isLoading) {
    return <div>loading...</div>
  }
  return (<ul>
    { items.map(item => <li key={item.get('_id')}>item.get('name')</li>) }
  </ul>)
)};

// connected component contains all documents
export const ProjectListContainer = containers.connectList(
  projectsCrud, {folder: 'all'}
)(ProjectList);

// connected component contains only starred projects
// it assumes view named 'starredProjects' exists in design documents
export const StarredProjectListContainer = containers.connectList(
  projectsCrud, {fun: 'starredProjects'}
)(ProjectList);
```

#### connectSingleItem

Decorator connects single document defined as component property `id`.

##### Options

* `crud`: crud obtained from `createCRUD`
* `opts`:
  * `propName="items"`: name of property to pass to wrapped component

##### Properties

* `docId`: document id

##### Example usage

```js
const ProjectDetail = ({items, dispatch}) => (
  <div>{ item.get('name') }</div>
);

// displays project with docId from url id param
const ProjectDetailContainer = connect(state => ({ docId: state.router.params.id }))(
  containers.connectSingleItem(projectsCrud)(ProjectDetail)
)
```

### Routes creating helper

Use crud.paths

```js
const routes = (
  <Route path="/" component={App}>
    <Route path={projectsCrud.paths.list} component={AllProjectListContainer} />
  </Route>
);
```

### Pagination

Decorator connects and paginate wrapped Component.

```js
paginate(paginationOpts, crud, connectListOpts, mapStateToProps, mapDispatchToProps)
```

#### Options

* `paginationOpts`:
  * `paginationOpts.rowsPerPage`: rows per page
  * `paginationOpts.startkey`: startkey

Other options are equal to those in `connectList`.

## Example app

[Example app](http://bmihelac.github.io/pouchdb-redux-helper-example/)

[Example app source code](https://github.com/bmihelac/pouchdb-redux-helper-example)

## TODO:

* upgrade babel to 6.x

## Changelog

* 0.11.0 (unreleased)
* 0.10.0
    * refactor loading decorator to always render passed component with
      `isLoading` property instead of using custom `Loading` component
    * loading component triggers load in componentWillReceiveProps
    * loading component expect `action` as function and `actionArgs` as function
      arguments.
    * bugfixes
* 0.9.0
    * fixes in pagination
* 0.8.0
    * save extra things received from query/allDocs in `folderVars`.
      This includes `total_rows`, `offset`, `skip`.
    * remove `queryFunc` introduced in 0.7.0
    * pagination suport
    * pass additional `opts` in `query` and `allDocs` actions and save them
      in folder as `folderVars`
* 0.7.0
    * add `queryFunc` option to `containers.connectList` options
* 0.6.0
    * use redux-thunk instead of custom middleware and service
    * remove service, middleware modules
    * remove `actions` in favor of `createPromiseAction`

## License

MIT
