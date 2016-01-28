import { connectList, folderNameFromOpts } from './containers';


export const defaultOpts = {
  rowsPerPage: 10,
}


function paginationFolderSuffix(opts) {
  return `/page/${opts.rowsPerPage}/${opts.startkey || ''}`;
}

export function applyPagination (paginationOpts={}, connectListOpts={}) {
  const opts = Object.assign({}, defaultOpts, paginationOpts);
  const newConnectListOpts = Object.assign({}, connectListOpts);
  const defaultFolder = connectListOpts.folder || folderNameFromOpts(connectListOpts);

  newConnectListOpts.options = Object.assign({}, newConnectListOpts.options);
  newConnectListOpts.options.limit = opts.rowsPerPage + 1;
  newConnectListOpts.folder = defaultFolder + paginationFolderSuffix(opts);
  newConnectListOpts.rowsPerPage = opts.rowsPerPage;

  if (opts.startkey) {
    newConnectListOpts.options.startkey = opts.startkey;
  }
  if (opts.prevStartkey) {
    newConnectListOpts.prevStartkey = opts.prevStartkey;
  }
  return newConnectListOpts;
}


export default function paginate (paginationOpts, crud, connectListOpts, mapStateToProps, mapDispatchToProps) {
  const paginatedListOpts = applyPagination(paginationOpts, connectListOpts);
  return connectList(crud, paginatedListOpts, mapStateToProps, mapDispatchToProps);
}

