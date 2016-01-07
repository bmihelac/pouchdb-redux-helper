# pouchdb-redux-helper

Helpers for working with PouchDB in React with Redux store.

[![build status](https://img.shields.io/travis/bmihelac/pouchdb-redux-helper/master.svg?style=flat-square)](https://travis-ci.org/bmihelac/pouchdb-redux-helper)
[![npm version](https://img.shields.io/npm/v/pouchdb-redux-helper.svg?style=flat-square)](https://www.npmjs.com/package/pouchdb-redux-helper)


pouchdb-redux-helper consists of:

* redux middleware

* `createCRUD` function for creating reducers, actionTypes, actions and route paths.

* helper functions for connectiong components with store

pouchdb-redux-helpers uses and depends on:

* immutablejs for storing data

## Installation

```
$ npm install pouchdb-redux-helper --save
```

## Usage

### Create CRUD for PouchDB database part:

```js
const db = PouchDB('testdb');
const projectsCrud = createCRUD(db, 'projects');
```

`projectsCrud` is object consisting of:

`actions` - actions (allDocs, query, get, put, remove)
`actionTypes` - action types for actions above
`reducer` - reducer for given CRUD
`mountPoint` - where in store would reducer be mounted
`paths` - paths for crud routes (list, detail, edit, create)
`urlPrefix` - urlPrefix for resource form mountPoint

`projectsCrud` asumes that all *project* objects have id that starts with
`project-`. Also, default handlers for creating new projects will assign docId
that starts with `project-`.

Having `projectsCrud.reducer` mounted in redux store, dispatching
`projectsCrud.actions.allDocs` will load all projects from database.

```js
store.dispatch(projectsCrud.actions.allDocs('all'));
```

Middleware would accept this action, and create appropriate PouchDB call and
dispatch `projectsCrud.actionTypes.allDocs.request` action. When PouchDB returns result
middleware will dispatch `projectsCrud.actionTypes.allDocs.success` action.
Default reducer set documents in state.

Every CRUD reducer state consists of *documents* and *folders* map:

*documents* is a map of docId: doc.
*folders* is a map of folderName:[doc1Id, doc2Id,...].

Dispatching other actions, result in similar workflow.


### Connect containers

```js
//dumb component that displays projects list
const ProjectList = ({items}) => (
  <div>
    { items.map(item => (
      <div key={ item.get('_id') }>
        <Link to={`/projects/${item.get('_id')}/`}>{ item.get('name') }</Link>
      </div>
     ))}
    <Link to="/projects/new/">New</Link>
  </div>
);

// connected component
export const AllProjectListContainer = containers.connectList(projectsCrud, {folder: 'all'})(ProjectList);
```

```js
const routes = (
  <Route path="/" component={App}>
    <Route path={projectsCrud.paths.list} component={AllProjectListContainer} />
  </Route>
);
```

Now, navigating to /projects/ would display all projects.

### Create store

```js
import { pouchdbMiddleware } from 'pouchdb-redux-helper';

const reducers = combineReducers({
  ...,
  [projectsCrud.mountPoint]: projectsCrud.reducer,
});

const middlewares = [pouchdbMiddleware(db)];

const finalCreateStore = compose(
  applyMiddleware(...middlewares),
  reduxReactRouter({ routes, createHistory }),
)(createStore);

const store = finalCreateStore(reducers);
```

## TODO:

* upgrade babel to 6.x

## License

MIT
