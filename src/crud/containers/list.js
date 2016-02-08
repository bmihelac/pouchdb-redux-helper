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


export function isQuery(opts) {
  return opts.options && opts.options.fun;
}


export function getListFunction(crud, opts) {
  if (isQuery(opts)) {
    return crud.actions.query.bind(null, opts.options.fun);
  } else {
    return crud.actions.allDocs;
  }
}


export function getListParams(crud, opts) {
  const initialParams = {};

  if (!isQuery(opts)) {
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


export function createListAction(crud, folder, opts={}, folderVars={}) {
  const funName = getListFunction(crud, opts);
  const funParams = getListParams(crud, opts);
  return funName(folder, funParams, folderVars);
}

export function createMapStateToPropsList(crud, opts={}, mapStateToProps) {

  return (state, ownProps) => {
    let props = mapStateToProps ? mapStateToProps(state, ownProps) : {};
    const finalOpts = Object.assign(
      {},
      opts,
      props.listOpts,
    )
    const {options = {}, folder, propName = 'items', ...folderVars} = finalOpts;
    const toFolder = folder || folderNameFromOpts(options);

    Object.assign(
      props,
      createMapStateToProps(crud.mountPoint, toFolder, propName)(state)
    );

    props.action = () => createListAction(crud, toFolder, finalOpts, folderVars);
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
