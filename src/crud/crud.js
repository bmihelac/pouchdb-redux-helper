import { List, Map, fromJS } from 'immutable';
import createPromiseAction from '../actions';
import * as utils from '../utils';
import { ACTIONS, TYPES } from '../constants';


export const INITIAL_STATE = Map({
  folders: Map(),
  documents: Map(),
});


/**
 * Creates CRUD action types, actions and reducer for PouchDB database.
 *
 * @param {PouchDB} db - PouchDB instance
 * @param {string} [mountPoint] - prefix to use for action types
 * @param {string} [prefix=mountPoint] - prefix to use for action types
 * @param {Object} [opts={}] options
 *
 * @returns {Object} contains `actionTypes`, `actions`, `reducer`
 */
export default function createCRUD(db, mountPoint, prefix=null, opts={}) {
  prefix = prefix || mountPoint;
  const urlPrefix = '/' + prefix;

  const defaultOpts = opts;

  let actionTypes = {};
  for (let action in ACTIONS) {
    actionTypes[action] = {};
    for (let type in TYPES) {
      actionTypes[action][type] = utils.createActionType(prefix, action, type);
    };
  };

  const allDocs = (folder='', params) => {
    const mergedParams = {
      attachments: true,
      include_docs: true,
      ...params
    }
    return createPromiseAction(
      () => db.allDocs(mergedParams),
      actionTypes.allDocs,
      {folder}
    )
  }

  const query = function query(fun, folder='', params) {
    const mergedParams = {
      attachments: true,
      include_docs: true,
      ...params
    }
    return createPromiseAction(
      () => db.query(fun, mergedParams),
      actionTypes.query,
      {folder}
    )
  };

  const get = function get(docId, params={}) {
    return createPromiseAction(
      () => db.get(docId, params),
      actionTypes.get,
      {docId}
    )
  }

  const put = function put(doc, params) {
    return createPromiseAction(
      () => db.put(doc, params),
      actionTypes.put,
      {doc}
    )
  }

  const remove = function remove(doc, params) {
    return createPromiseAction(
      () => db.remove(doc, params),
      actionTypes.remove,
      {doc}
    )
  }

  const actions = {
    allDocs,
    query,
    get,
    put,
    remove,
  };

  const reducer = function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
      case actionTypes.query.success:
      case actionTypes.allDocs.success:
        const ids = List(action.payload.rows.map(row => row.id));
        const documents = Map(action.payload.rows.map(row => [row.id, fromJS(row.doc)]));
        return state.setIn(['folders', action.folder], ids).mergeIn(['documents'], documents);
      case actionTypes.put.success:
        return state.setIn(['documents', action.payload.id], fromJS({
          ...action.doc,
          _rev: action.payload.rev,
        }));
      case actionTypes.get.success:
        return state.setIn(['documents', action.payload._id], fromJS(action.payload));
      case actionTypes.remove.success:
        let newState = state.deleteIn(['documents', action.payload.id]);
        newState.get('folders').map((list, k) => {
          const index = list.indexOf(action.payload.id)
          if (index != -1) {
            newState = newState.setIn(['folders', k], list.delete(index));
          }
        });
        return newState;
      default:
        return state;
    }
  };

  const paths = {
    list: urlPrefix + '/',
    detail: utils.createDetailLink(urlPrefix, ':id'),
    edit: urlPrefix + '/:id/edit/',
    create: urlPrefix + '/new/',
  }

  return {
    actions,
    actionTypes,
    reducer,
    mountPoint,
    paths,
    urlPrefix,
  }
}
