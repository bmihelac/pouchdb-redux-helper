# pouchdb-redux-helper

Helpers for working with PouchDB in React with Redux store.

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

## Quickstart

1. Create CRUD for PouchDB database part:

```js
const db = PouchDB('testdb');
const projectsCrud = createCRUD(db, 'projects');
```

`projectsCrud` consist object with following:

actions - actions that can be dispatched (allDocs, query, get, put, remove)
actionTypes - action types for actions
reducer - reducer
mountPoint - where in store would reducer be mounted
paths - paths for crud routes (list, detail, edit, create)
urlPrefix - urlPrefix for resource form mountPoint

2. Add pouchdbMiddleware for PouchDB database:

```js
import { pouchdbMiddleware } from 'pouchdb-redux-helper';
const db = PouchDB('testdb');
const middlewares = [pouchdbMiddleware(db)];
```

## TODO:

* Add quickstart
* upgrade babel to 6.x

## License

MIT
