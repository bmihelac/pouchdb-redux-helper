import thunk from 'redux-thunk';
import { applyMiddleware, compose, combineReducers, createStore } from 'redux'

export default function finalCreateStore(reducers) {
  const finalCreateStore = compose(
    applyMiddleware(...[thunk]),
  )(createStore);
  return finalCreateStore(combineReducers(reducers));
}
