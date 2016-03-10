import uuid from 'uuid';

import * as utils from '../../utils';
import { wrap } from './common';

/**
 * combines result of two mapStateToProps functions
 *
 * @param fun1
 * @param fun2
 * @returns {object} combined stateProps
 */
function combineMapStateToProps(fun1, fun2) {
  return (state, ownProps) => Object.assign(
    {},
    fun1(state, ownProps),
    fun2 ? fun2(state, ownProps) : null
  )
}


export const singleObjectMapStateToProps = (mountPoint, propName) => function singleObjectMapStateToProps(state, ownProps) {
  const id = ownProps.docId;
  return {
    id,
    [propName]: utils.getObjectFromState(state, mountPoint, id),
  }
};


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
export function connectSingleItem(crud, opts={}, mapStateToProps, mapDispatchToProps) {
  const { propName = 'item' } = opts;
  const loadFunction = c => { c.props.dispatch(crud.actions.get(c.props.id)); }
  const mergedMapStateToProps = combineMapStateToProps(
    singleObjectMapStateToProps(crud.mountPoint, propName),
    mapStateToProps
  )

  return wrap(mergedMapStateToProps, mapDispatchToProps, loadFunction, { propName });
};
