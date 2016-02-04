import { Map, List, fromJS } from 'immutable';


/*
 * Returns immutablejs `List` from payload
 */
export function toList(payload) {
  return List(payload.rows.map(row => fromJS(row.doc)));
}


/**
 * findDocById
 *
 * @param {immutable.List} list
 * @param {string} docId
 * @returns {number}
 */
export function findDocById(list, docId) {
  return list.findIndex(item => item.get('_id') === docId);
}

export function findDoc(list, doc) {
  return findDocById(list, doc.get('_id'));
}

export function deleteDocFromList(list, doc) {
  const index = findDoc(list, doc);
  if (index === -1) {
    return list;
  }
  return list.delete(index);
}


export function getFoldersFromState(state) {
  return state.get('folders');
}


export function getFolderFromState(state, folder) {
  return getFoldersFromState(state).get(folder);
}


export function getDocumentsFromState(state) {
  return state.get('documents');
}


export function saveFolderVars(state, folder, vars) {
  return state.setIn(['folders', folder, 'vars'], fromJS(vars));
}


export function getFolderVars(state, folder) {
  return state.getIn(['folders', folder, 'vars']);
}


export function saveIdsInFolder(state, folder, ids) {
  return state.setIn(['folders', folder, 'ids'], ids);
}


export function getIdsFromFolder(state, folder) {
  return state.getIn(['folders', folder, 'ids']);
}


export function hasFolder(state, folder) {
  return state.hasIn(['folders', folder]);
}


export function invalidateFolders(state) {
  return state.set('folders', Map());
}


/**
 * getDocumentsInFolder returns documents for ids in given folder.
 */
export function getDocumentsInFolder(state, folder) {
  const ids = getIdsFromFolder(state, folder);
  const documents = state.get('documents');
  return ids.map(docId => documents.get(docId));
}


/**
 * removeDocument from all folders and documents.
 */
export function removeDocument(state, id) {
  let newState = state.deleteIn(['documents', id]);
  newState.get('folders').map((folder, k) => {
    const list = folder.get('ids');
    const index = list.indexOf(id)
    if (index != -1) {
      newState = newState.setIn(['folders', k, 'ids'], list.delete(index));
    }
  });
  return newState;
}

export function getDocument(state, id) {
  return state.get('documents').get(id);
}

export function setDocument(state, doc) {
  return state.setIn(['documents', doc._id], fromJS(doc));
}

/**
 * setDocuments merges documents in rows with existing documents.
 */
export function setDocuments(state, rows) {
  const documents = Map(rows.map(row => [row.id, fromJS(row.doc)]));
  return state.mergeIn(['documents'], documents);
}

export function setQueryPayloadInState(state, folder, payload, folderVars) {
  const ids = List(payload.rows.map(row => row.id));
  return setDocuments(
    saveFolderVars(
      saveIdsInFolder(state, folder, ids),
      folder,
      folderVars
    ),
    payload.rows
  )
}


/*
 * Replaces document `doc` in a given `list`
 *
 * Return original `list` if `doc` is not found
 */
export function setDocInList(list, doc) {
  const index = findDoc(list, doc);
  if (index === -1) {
    return list;
  }
  return list.set(index, doc);
}


/**
 * Returns object from state
 *
 * @param {object} state
 * @param {string} mountPoint
 * @param {object} docId
 * @returns {immutable.Map}
 */
export const getObjectFromState = (state, mountPoint, docId) => {
  return state[mountPoint].get('documents').get(docId);
};



/**
 * createActionType
 *
 * @param {string} prefix
 * @param {string} action
 * @param {string} type
 * @returns {string}
 */
export function createActionType(prefix, action, type) {
  return `POUCHDB_${prefix}_${action}_${type}`;
}


/**
 * markDocumentDeleted
 *
 * @param {immutable.Map} state
 * @param {string} docId
 * @returns {immutable.Map} new state
 */
export function markDocumentDeleted(state, docId) {
  if (state.hasIn(['documents', docId])) {
    return state;
  }
  return state.setIn(['documents', docId, '_deleted'], true);
}


/**
 * createDetailLink
 *
 * @param urlPrefix
 * @param docId
 * @returns {string}
 */
export function createDetailLink(urlPrefix, docId) {
  return urlPrefix + '/' + docId + '/';
}
