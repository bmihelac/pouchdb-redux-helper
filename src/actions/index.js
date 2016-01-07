import { ACTIONS, TYPES } from '../constants';
import { createActionType } from '../utils';
import { POUCHDB } from '../middleware';


/**
 * Utility function returns array of 3 action types with defaults.
 *
 * @param {string} action
 * @param {Object} actionTypes object with `request`, `success`, `failure` keys,
 * or string that represent `success`
 */
export function createDefaultActionTypes(action, actionTypes={}) {
  const types = {
    request: createActionType('', action, TYPES.request),
    success: createActionType('', action, TYPES.success),
    failure: createActionType('', action, TYPES.failure),
    ...actionTypes
  };
  return [types.request, types.success, types.failure];
}

/*
 * Creates pouchdb action.
 *
 * `method` - pouchdb service method
 * `types` - action types
 * `params` - params to delegate to pouchdb service method
 * `opts` - additional options to add to action
*/
export function pouchdbAction(method, types, params={}, opts={}) {
  return {
    [POUCHDB]: {
      types,
      method,
      params
    },
    ...opts
  };
}

/*
 * Creates action for `allDocs`
*/
export function allDocs(types={}, params={}, opts={}) {
  return pouchdbAction(
    ACTIONS.allDocs,
    createDefaultActionTypes(ACTIONS.allDocs, types),
    params,
    opts
  );
}


/*
 * Creates action for `allDocs`
*/
export function query(types={}, params={}, opts={}) {
  return pouchdbAction(
    ACTIONS.query,
    createDefaultActionTypes(ACTIONS.query, types),
    params,
    opts
  );
}


/*
 * Creates action for `get`
*/
export function get(docId, types={}, params={}, opts={}) {
  return pouchdbAction(
    ACTIONS.get,
    createDefaultActionTypes(ACTIONS.get, types),
    {docId, ...params},
    opts
  );
}

/*
 * Creates action for `put`
 */
export function put(doc, types={}, params={}, opts={}) {
  return pouchdbAction(
    ACTIONS.put,
    createDefaultActionTypes(ACTIONS.put, types),
    {doc, ...params},
    opts
  );
}


/*
 * Creates action for `post`
 */
export function post(doc, types={}, params={}, opts={}) {
  return pouchdbAction(
    ACTIONS.post,
    createDefaultActionTypes(ACTIONS.post, types),
    {doc, ...params},
    opts
  );
}

/*
 * Creates action for `remove`
 */
export function remove(doc, types={}, params={}, opts={}) {
  return pouchdbAction(
    ACTIONS.remove,
    createDefaultActionTypes(ACTIONS.remove, types),
    {doc, ...params},
    opts
  );
}
