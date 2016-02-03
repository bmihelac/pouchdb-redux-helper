import thunk from 'redux-thunk';
import { applyMiddleware, compose, combineReducers, createStore } from 'redux'


export const actions = [];

const actionsLogger = store => next => action => {
  let result = next(action)
  actions.push(result);
  return result;
}

export default function finalCreateStore(reducers) {
  const finalCreateStore = compose(
    applyMiddleware(actionsLogger, thunk),
  )(createStore);
  return finalCreateStore(combineReducers(reducers));
}
