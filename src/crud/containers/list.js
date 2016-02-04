import * as utils from '../../utils';
import { createPromiseAction } from '../../actions';

import { wrap } from './common';


export const createMapStateToProps = (mountPoint, folder='', propName) => function mapStateToPropsList(state) {
  if (!utils.hasFolder(state[mountPoint], folder)) {
    return { [propName]: null };
  }
  return {
    [propName]: utils.getDocumentsInFolder(state[mountPoint], folder),
    folderVars: utils.getFolderVars(state[mountPoint], folder),
  };
};


export function folderNameFromOpts(options) {
  return JSON.stringify(options);
}


export function createListAction(crud, folder, opts, folderVars) {
  const { options={} } = opts;

  return () => {
    if (opts.queryFunc) {
      return createPromiseAction(
        () => opts.queryFunc(options),
        crud.actionTypes.query,
        {...folderVars, folder}
      );
    } else if (options.fun) {
      const {fun, ...queryOptions} = options.fun;
      return crud.actions.query(
        fun,
        folder,
        queryOptions,
        folderVars
      );
    } else {
      return crud.actions.allDocs(
        folder, {
          startkey: crud.mountPoint + '-',
          endkey: crud.mountPoint + '-\uffff',
          ...options
        }, folderVars);
    }
  }
}

export function createMapStateToPropsList(crud, opts={}, mapStateToProps) {

  return (state, ownProps) => {
    let props = mapStateToProps ? mapStateToProps(state, ownProps) : {};
    const finalOpts = Object.assign(
      {},
      opts,
      props.listOpts,
    )
    const {options = {}, folder, propName = 'items', queryFunc, ...folderVars} = finalOpts;
    const toFolder = folder || folderNameFromOpts(options);

    Object.assign(
      props,
      createMapStateToProps(crud.mountPoint, toFolder, propName)(state)
    );

    props.action = createListAction(crud, toFolder, finalOpts, folderVars);
    return props;
  }

}

export function connectList(crud, opts={}, mapStateToProps, mapDispatchToProps) {

  const mapStateToPropsFinal = createMapStateToPropsList(
    crud,
    opts,
    mapStateToProps
  );
  return wrap(mapStateToPropsFinal, mapDispatchToProps);
}
