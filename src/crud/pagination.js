import { createPromiseAction } from '../actions';
import {
  folderNameFromOpts,
  createMapStateToProps,
  wrap,
} from './containers';


export const defaultOpts = {
  rowsPerPage: 10,
}


export function paginationFolderSuffix(rowsPerPage, startkey) {
  return `/page/${rowsPerPage}/${startkey || ''}`;
}


function getListFunction(opts) {
  return opts.fun ? 'query' : 'allDocs';
}

function getListParams(crud, opts) {
  const initialParams = {};

  if (!opts.fun) {
    Object.assign(initialParams, {
      startkey: crud.mountPoint + '-',
      endkey: crud.mountPoint + '-\uffff',
    });
  }

  const params = {
    include_docs: true,
    attachments: true,
    ...initialParams,
    ...opts.options
  };

  return params;
}


export function createPaginateAction(crud, folder, opts={}, folderVars={}) {
  const fun = () => {
    const funName = getListFunction(opts);
    const funParams = getListParams(crud, opts);
    return crud.db[funName](funParams).then(payload => {
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
