import { createPromiseAction } from '../actions';
import {
  folderNameFromOpts,
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


export function createPaginateAction(crud, folder, opts={}, folderVars={}) {
  const fun = () => {
    let p;
    const funParams = getListParams(crud, opts);
    if (isQuery(opts)) {
      p = crud.db.query(opts.options.fun, funParams);
    } else {
      p = crud.db.allDocs(funParams);
    }
    return p.then(payload => {
      // TODO: add prev, next startkey to payload so they are available as folderVars
      payload.prev = 'PREV';
      payload.next = 'NEXT';
      return payload;
    });
  }

  return createPromiseAction(
    fun,
    crud.actionTypes.query,
    {...folderVars, folder}
  )
}


export function createMapStateToPropsPagination(paginationOpts={}, crud, opts={}, mapStateToProps) {

  return (state, ownProps) => {
    let props = mapStateToProps ? mapStateToProps(state, ownProps) : {};
    const { rowsPerPage, startkey, prevStartkey } = Object.assign({}, defaultOpts, paginationOpts, props);
    const finalOpts = Object.assign(
      {},
      opts,
      props.listOpts,
    )
    const {options={}, folder, propName = 'items', ...folderVars} = finalOpts;
    finalOpts.options = Object.assign({}, finalOpts.options, { limit: rowsPerPage+1, startkey });
    const paginatedFolderVars = Object.assign(
      folderVars,
      { prevStartkey, rowsPerPage }
    )
    const toFolder = (folder || folderNameFromOpts(options)) + paginationFolderSuffix(rowsPerPage, startkey);

    Object.assign(
      props,
      createMapStateToProps(crud.mountPoint, toFolder, propName)(state)
    );

    props.action = () => createPaginateAction(crud, toFolder, finalOpts, paginatedFolderVars);
    return props;
  }

}


export default function paginate (paginationOpts, crud, connectListOpts, mapStateToProps, mapDispatchToProps) {
  const mapStateToPropsFinal = createMapStateToPropsPagination(
    paginationOpts,
    crud,
    connectListOpts,
    mapStateToProps
  );
  return wrap(mapStateToPropsFinal, mapDispatchToProps);
}
