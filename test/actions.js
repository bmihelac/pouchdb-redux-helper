import test from 'tape';

import createPromiseAction from '../src/actions';
import { TYPES } from '../src/constants';


test('test createPromiseAction success', t => {
  let dispatchCounter = 0;
  let action = createPromiseAction(
    () => Promise.resolve('bar'),
    TYPES,
    {actionParam: 'foo'}
  )
  const dispatch = action => {
    switch (dispatchCounter) {
      case 0:
        t.equal(action.type, TYPES.request);
        t.equal(action.actionParam, 'foo');
        break;
      case 1:
        t.equal(action.type, TYPES.success);
        t.equal(action.actionParam, 'foo');
        t.equal(action.payload, 'bar');
        t.end()
        break;
    }
    dispatchCounter++;
  }
  action(dispatch);
});



test('test createPromiseAction failure', t => {
  let dispatchCounter = 0;
  let action = createPromiseAction(
    () => Promise.reject('bar'),
    TYPES,
  )
  const dispatch = action => {
    switch (dispatchCounter) {
      case 0:
        t.equal(action.type, TYPES.request);
        break;
      case 1:
        t.equal(action.type, TYPES.failure);
        t.equal(action.err, 'bar');
        t.end()
        break;
    }
    dispatchCounter++;
  }
  action(dispatch);
});

