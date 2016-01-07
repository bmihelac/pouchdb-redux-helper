import uuid from 'uuid';
import React, { Children, Component, cloneElement } from 'react';
import { connect } from 'react-redux';
import loading from './loading';
import { getObjectFromState } from '../utils';


export const createMapStateToProps = (mountPoint, folder='', propName='items') => function mapStateToPropsList(state) {
  if (!state[mountPoint].hasIn(['folders', folder])) {
    return { [propName]: null };
  }
  const documents = state[mountPoint].get('documents');
  const ids = state[mountPoint].getIn(['folders', folder]);
  const items = ids.map(docId => documents.get(docId));
  return {
    [propName]: items
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


export const singleObjectMapStateToProps = (mountPoint, propName='items') => function singleObjectMapStateToProps(state) {
  const id = state.router.params.id;
  return {
    id,
    [propName]: getObjectFromState(state, mountPoint, id),
  }
};


export function connectList(crud, opts={}) {
  const {options = {}, folder, customMapStateToProps, propName} = opts;
  const toFolder = !folder ? JSON.stringify(options) : folder;
  const mapStateToProps = combineMapStateToProps(
    createMapStateToProps(crud.mountPoint, toFolder, propName),
    customMapStateToProps
  );

  return function(WrappedComponent) {
    let action;
    if (options.fun) {
      action = crud.actions.query(
        toFolder,
        options
      );
    } else {
      action = crud.actions.allDocs(
          toFolder, {
          startkey: crud.mountPoint + '-',
          endkey: crud.mountPoint + '-\uffff',
          ...options
      });
    }
    const loadFunction = c => {
      c.props.dispatch(action);
    };
    return connect(mapStateToProps)(
      loading(loadFunction, { propName })(
        WrappedComponent
    ));
  }
}


/**
 * Returns onSubmit handler that dispatch `put` action and `pushState` action.
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
 * Decorator connects passed component to include single object as `items`.
 *
 * @param {crud} crud
 */
export function connectSingleItem(crud, opts={}) {
  const { propName } = opts;
  const mapStateToProps = singleObjectMapStateToProps(crud.mountPoint, propName);
  const loadFunction = c => { c.props.dispatch(crud.actions.get(c.props.id)); }

  return function(WrappedComponent) {
    return connect(mapStateToProps)(loading(loadFunction, { propName })(WrappedComponent));
  }
};
