import test from 'tape';

import PouchDB from 'pouchdb';

import pouchdbMiddleware, { POUCHDB } from '../src/middleware';

const middleware = pouchdbMiddleware(PouchDB('test', {db: require('memdown')}));

const createFakeStore = fakeData => ({
  getState() {
    return fakeData;
  }
});

const dispatchWithStoreOf = (storeData, action) => {
  let dispatched = [];
  const next = actionAttempt => {
    dispatched.push(actionAttempt);
  }
  const store = createFakeStore(storeData);
  let promise = middleware(store)(next)(action);
  return {
    dispatched,
    promise,
  }
};


test('should dispatch action', t => {
  const actionTypeRequest = 'REQUEST';
  const actionTypeSuccess = 'SUCCESS';
  const actionTypeFail = 'FAIL';
  const action = {
    [POUCHDB]: {
      types: [actionTypeRequest, actionTypeSuccess, actionTypeFail],
      method: 'allDocs',
      params: {},
    }
  };

  let { dispatched, promise } = dispatchWithStoreOf({}, action);
  t.equal(dispatched.length, 1);
  t.deepEqual(dispatched[0], {
    type: actionTypeRequest,
  }, 'should dispatch to requestType');

  promise.then(() => {
    t.pass('should dispatch payload');
    t.equal(dispatched.length, 2);
    t.equal(dispatched[1].type, actionTypeSuccess);
    t.equal(dispatched[1].payload.rows.length, 0);
    t.end();
  });

});
