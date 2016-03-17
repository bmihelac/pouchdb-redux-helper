import { createPromiseAction } from '../actions';
import { folderNameFromOpts } from '../utils';
import {
  createMapStateToProps,
  isQuery,
  getListParams,
} from './containers/list';
import { wrap } from './containers/common';


export const defaultOpts = {
  rowsPerPage: 10,
}


export function paginationFolderSuffix(rowsPerPage, startkey) {
  return `/page/${rowsPerPage}/${startkey || ''}`;
}


// add limit, startkey to list params
export function getPaginationListParams(listParams, opts, rowsPerPage, startkey) {
  let finalStartkey = startkey || (opts.options && opts.options.startkey);
  return Object.assign(
    {},
    listParams,
    { limit: rowsPerPage+1 },
    startkey ? { startkey: finalStartkey } : null,
  );
}

export function paginateQuery(crud, opts, rowsPerPage, startkey) {
  let fun;
  const listParams = getListParams(crud, opts);
  const funParams = getPaginationListParams(listParams, opts, rowsPerPage, startkey);
  if (isQuery(opts)) {
    fun = crud.db.query.bind(crud.db, opts.options.fun);
  } else {
    fun = crud.db.allDocs.bind(crud.db);
  }

  return fun(funParams).then(payload => {
    //assign next page starting id
    if (payload.rows[rowsPerPage]) {
      const lastRow = payload.rows.pop();
      payload.next = lastRow.key;
    }
    if (payload.rows.length == 0) {
      return payload;
    }
    // create reversedParams from funParams
    const reversedParams = {
      ...funParams,
      include_docs: false,
      attachments: false,
      startkey: payload.rows[0].key,
      limit: rowsPerPage,
      skip: 1,
      descending: true,
    }
    if (listParams.startkey) {
      reversedParams.endkey = listParams.startkey;
    }
    return fun(reversedParams).then(r => {
      const firstRow = r.rows.pop();
      if (firstRow) {
        payload.prev = firstRow.key;
      }
      return payload;
    });
  });
}


const loadItemsAction = (crud, finalOpts, rowsPerPage, startkey, toFolder) => createPromiseAction(
  () => paginateQuery(crud, finalOpts, rowsPerPage, startkey),
  crud.actionTypes.query,
  {folder: toFolder},
)

export function createMapStateToPropsPagination(paginationOpts={}, crud, opts={}, mapStateToProps) {

  return (state, ownProps) => {
    let props = mapStateToProps ? mapStateToProps(state, ownProps) : {};
    // rowsPerPage and startkey can be given in mapStateToProps,
    // paginationOpts or defaultOpts
    const { rowsPerPage, startkey } = Object.assign(
      {},
      defaultOpts,
      paginationOpts,
      props
    );
    // finalOpts from argument opts overriden with eventual listOpts from mapStateToProps
    const finalOpts = Object.assign(
      {},
      opts,
      props.listOpts,
    )
    const toFolder = (finalOpts.folder || folderNameFromOpts(finalOpts.options)) +
      paginationFolderSuffix(rowsPerPage, startkey);
    const propName = finalOpts.propName || 'items';
    // add documents, folderVars to props
    props = Object.assign(
      props,
      createMapStateToProps(crud.mountPoint, toFolder, propName)(state)
    );
    props.action = loadItemsAction;
    props.actionArgs = [crud, finalOpts, rowsPerPage, startkey, toFolder];
    // assign action that loads items from db
    return props;
  }

}


export default function paginate (paginationOpts, crud, connectListOpts={}, mapStateToProps, mapDispatchToProps) {
  const mapStateToPropsFinal = createMapStateToPropsPagination(
    paginationOpts,
    crud,
    connectListOpts,
    mapStateToProps
  );
  return wrap(mapStateToPropsFinal, mapDispatchToProps);
}
