# pouchdb-redux-helper

Helpers for working with PouchDB in React with Redux store.

[![build status](https://img.shields.io/travis/bmihelac/pouchdb-redux-helper/master.svg?style=flat-square)](https://travis-ci.org/bmihelac/pouchdb-redux-helper)
[![npm version](https://img.shields.io/npm/v/pouchdb-redux-helper.svg?style=flat-square)](https://www.npmjs.com/package/pouchdb-redux-helper)


pouchdb-redux-helper consists of:

* redux middleware for PouchDB api

* `createCRUD` function for creating reducers, actionTypes, actions and route paths.

* helper functions for connectiong components with store

pouchdb-redux-helpers uses and depends on:

* immutablejs for storing data

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
* `opts`: options (not used currently)

### Returns

It returns object consisting of:

* `actions`

    * `actions.allDocs(folder='', params)`
    * `actions.query(folder='', params)`
    * `actions.get(docId, params, opts)`
    * `actions.put(doc, params, opts)`
    * `actions.remove(doc, params, opts)`

    Options for actions:

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


#### Example Usage

```js
import { pouchdbMiddleware, createCRUD } from 'pouchdb-redux-helper';
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
  applyMiddleware(...[pouchdbMiddleware(db)]),
)(createStore);
const store = finalCreateStore(reducers);
// allDocs action
```

Example of calling `allDocs` action of `projectsCrud`.

```js
store.dispatch(projectsCrud.actions.allDocs('all'));
```

When previous example is executed, following will happen:

1. middleware will dispatch `POUCHDB_projects_allDocs_request` action and
  execute PouchDB `allDocs` as promise.

2. If promise resolves

  2.1. Middleware will dispatch `POUCHDB_projects_allDocs_success`
    action with result

  2.2. store will merge received documents with existing state in
    `state.projects.documents` and update document ids in
    `state.projects.folders.all` List.

3. If error occurs middleware will dispatch `POUCHDB_projects_allDocs_failure`
    action with error

### Connect containers helper functions

#### connectList

Decorator connects wrapped Component with documents from the state as property.
Query options can be passed to PouchDB, such as query function, startkey, endkey,
etc. If state does not already contains `folder` with documents, they are loaded.

```js
connectList(crud, opts={})
```

##### Options

* `crud`: crud obtained from `createCRUD`
* `opts`:
  * `opts.options`: options to pass to PouchDB. If `options.fun` is given,
      `query` will be executed, otherwise `allDocs` which starts with `mountPoint-`
  * `opts.folder`: folder where to save result. If empty this is serialized from
      `opts.options`
  * `customMapStateToProps`: custom mapStateToProps function to merge
  * `propName="items"`: name of property to pass to wrapped component

##### Example usage

```js
const ProjectList = ({items}) => (
  <ul>
  { items.map(item => <li key={item.get('_id')}>item.get('name')</li>) }
  </ul>
);

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

## Example app

[Example app](http://bmihelac.github.io/pouchdb-redux-helper-example/)

[Example app source code](https://github.com/bmihelac/pouchdb-redux-helper-example)

## TODO:

* upgrade babel to 6.x

## License

MIT
