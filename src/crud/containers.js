import uuid from 'uuid';
import React, { Children, Component, cloneElement } from 'react';
import { connect } from 'react-redux';
import loading from './loading';
import * as utils from '../utils';
import { createPromiseAction } from '../actions';


export const createMapStateToProps = (mountPoint, folder='', propName) => function mapStateToPropsList(state) {
  if (!utils.hasFolder(state[mountPoint], folder)) {
    return { [propName]: null };
  }
  return {
    [propName]: utils.getDocumentsInFolder(state[mountPoint], folder),
    folderVars: utils.getFolderVars(state[mountPoint], folder),
  };
};


/**
 * combines result of two mapStateToProps functions
 *
 * @param fun1
 * @param fun2
 * @returns {object} combined stateProps
 */
function combineMapStateToProps(fun1, fun2) {
  return state => Object.assign({}, fun1(state), fun2 ? fun2(state) : null)
}


export const singleObjectMapStateToProps = (mountPoint, propName) => function singleObjectMapStateToProps(state, ownProps) {
  const id = ownProps.docId;
  return {
    id,
    [propName]: utils.getObjectFromState(state, mountPoint, id),
  }
};


export function folderNameFromOpts(options) {
  return JSON.stringify(options);
}


export function connectList(crud, opts={}, mapStateToProps, mapDispatchToProps) {
  const {options = {}, folder, propName = 'items', queryFunc, ...folderVars} = opts;
  const toFolder = folder || folderNameFromOpts(options);
  const mergedMapStateToProps = combineMapStateToProps(
    createMapStateToProps(crud.mountPoint, toFolder, propName),
    mapStateToProps
  );

  return function(WrappedComponent) {
    let action;
    if (queryFunc) {
      action = createPromiseAction(
        () => queryFunc(options),
        crud.actionTypes.query,
        {...folderVars, folder: toFolder}
      );
    } else if (options.fun) {
      const {fun, ...queryOptions} = options;
      action = crud.actions.query(
        fun,
        toFolder,
        queryOptions,
        folderVars
      );
    } else {
      action = crud.actions.allDocs(
          toFolder, {
          startkey: crud.mountPoint + '-',
          endkey: crud.mountPoint + '-\uffff',
          ...options
      }, folderVars);
    }
    const loadFunction = c => {
      c.props.dispatch(action);
    };
    return connect(mergedMapStateToProps, mapDispatchToProps)(
      loading(loadFunction, { propName })(
        WrappedComponent
    ));
  }
}


/**
 * Returns onSubmit handler that dispatch `put` action
 *
 * @param {crud} crud
 * @returns {function}
 */
export function createOnSubmitHandler(crud) {
  return function onSubmit (item, data, dispatch) {
    const doc = {
      ...item,
      ...data
    };
    if (!doc._id) {
      doc._id = crud.mountPoint + '-' + uuid.v4();
    }
    dispatch(crud.actions.put(doc));
  }
}


/**
 * createOnRemoveHandler
 *
 * @param crud
 * @returns {function}
 */
export function createOnRemoveHandler(crud) {
  return function onRemove (dispatch, items) {
    dispatch(crud.actions.remove(items.toObject()));
  }
}


/**
 * Decorator connects passed component to include single document as `item`.
 *
 * @param {crud} crud
 */
export function connectSingleItem(crud, opts={}) {
  const { propName = 'item' } = opts;
  const mapStateToProps = singleObjectMapStateToProps(crud.mountPoint, propName);
  const loadFunction = c => { c.props.dispatch(crud.actions.get(c.props.id)); }

  return function(WrappedComponent) {
    return connect(mapStateToProps)(loading(loadFunction, { propName })(WrappedComponent));
  }
};
