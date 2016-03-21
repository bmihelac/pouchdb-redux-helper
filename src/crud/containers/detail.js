import invariant from 'invariant';
import uuid from 'uuid';

import * as utils from '../../utils';
import { wrap } from './common';


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


export function createMapStateToPropsDetail(crud, opts={}, mapStateToProps) {

  return (state, ownProps) => {
    let props = mapStateToProps ? mapStateToProps(state, ownProps) : {};
    const finalOpts = Object.assign(
      {},
      opts,
      props.singleItemOpts,
      ownProps,
    )
    const {propName='item', docId} = finalOpts;
    props.propName = propName;
    props[propName] = utils.getObjectFromState(state, crud.mountPoint, docId);
    props.action = crud.actions.get;
    props.actionArgs = [docId];
    return props;
  }

}



/**
 * Decorator connects passed component to include single document as `item`.
 *
 * @param {crud} crud
 */
export function connectSingleItem(crud, opts={}, mapStateToProps, mapDispatchToProps) {
  invariant(
    typeof crud !== 'undefined',
    'crud is required parameter'
  );
  const mapStateToPropsFinal = createMapStateToPropsDetail(
    crud,
    opts,
    mapStateToProps
  );
  return wrap(mapStateToPropsFinal, mapDispatchToProps);
};
