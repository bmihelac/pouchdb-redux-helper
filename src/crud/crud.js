import { List, Map, fromJS } from 'immutable';
import { createPromiseAction } from '../actions';
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

  const allDocs = (folder='', params, opts) => {
    const mergedParams = {
      attachments: true,
      include_docs: true,
      ...params
    }
    return createPromiseAction(
      () => db.allDocs(mergedParams),
      actionTypes.allDocs,
      {...opts, folder}
    )
  }

  const query = function query(fun, folder='', params, opts) {
    const mergedParams = {
      attachments: true,
      include_docs: true,
      ...params
    }
    return createPromiseAction(
      () => db.query(fun, mergedParams),
      actionTypes.query,
      {...opts, folder}
    )
  };

  const get = function get(docId, params={}, opts) {
    return createPromiseAction(
      () => db.get(docId, params),
      actionTypes.get,
      {...opts, docId}
    )
  }

  const put = function put(doc, params, opts) {
    return createPromiseAction(
      () => db.put(doc, params),
      actionTypes.put,
      {...opts, doc}
    )
  }

  const remove = function remove(doc, params, opts) {
    return createPromiseAction(
      () => db.remove(doc, params),
      actionTypes.remove,
      {...opts, doc}
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
        const {type, folder, payload, ...opts} = action;
        return utils.setDocuments(
          utils.saveFolderVars(
            utils.saveIdsInFolder(state, folder, ids),
            folder,
            opts
          ),
          payload.rows
        )
      case actionTypes.put.success:
        return utils.setDocument(state, {
          ...action.doc,
          _rev: action.payload.rev,
        });
      case actionTypes.get.success:
        return utils.setDocument(state, action.payload);
      case actionTypes.remove.success:
        return utils.removeDocument(state, action.payload.id);
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
    db,
  }
}
