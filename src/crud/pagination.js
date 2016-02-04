import {
  folderNameFromOpts,
  createMapStateToProps,
  createListAction,
  wrap,
} from './containers';


export const defaultOpts = {
  rowsPerPage: 10,
}


export function paginationFolderSuffix(rowsPerPage, startkey) {
  return `/page/${rowsPerPage}/${startkey || ''}`;
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
    const {options={}, folder, propName = 'items', queryFunc, ...folderVars} = finalOpts;
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

    props.action = createListAction(crud, toFolder, finalOpts, paginatedFolderVars);
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
