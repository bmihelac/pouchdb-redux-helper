/**
 * Creates thunk for given promise function.
 *
 * Dispatch `actionTypes.request` action and execute function `fun`.
 * On resolved promise, `actionTypes.success` is dispatched with `payload`.
 * On error, `actionTypes.failure` is dispatched with `err`.
 *
 * @param fun - function(dispatch, getState)
 * @param actionTypes - action types object
 * @param actionTypes.request
 * @param actionTypes.success
 * @param actionTypes.failure
 * @param [actionParams={}] - params to dispatch with every action
 * @returns function
 */
export default function createPromiseAction(fun, actionTypes, actionParams={}) {
  return (dispatch, getState) => {
    dispatch({
      type: actionTypes.request,
      ...actionParams
    });
    return fun(dispatch, getState).then(payload => {
      dispatch({
        type: actionTypes.success,
        payload,
        ...actionParams
      });
    }).catch(err => {
      dispatch({
        type: actionTypes.failure,
        err,
        ...actionParams
      });
    });
  }
}
