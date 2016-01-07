import test from 'tape';

import * as actions from '../src/actions';
import { POUCHDB } from '../src/middleware';
import { TYPES, ACTIONS } from '../src/constants';

test('createDefaultActionTypes should create default action types', t => {
  t.deepEqual(actions.createDefaultActionTypes(ACTIONS.get), [
    'POUCHDB__get_request',
    'POUCHDB__get_success',
    'POUCHDB__get_failure',
  ]);
  t.deepEqual(actions.createDefaultActionTypes(ACTIONS.get, {success: 'success2'})[1],
              'success2');
  t.end();
});

test('should create pouchdbAction', t => {
  const method = 'findAll';
  const actionTypes = [
    'request',
    'success',
    'failure',
  ]
  const params = {param: 1};
  const opts = {a: 'foo'};
  const action = actions.pouchdbAction(method, actionTypes, params, opts);
  t.equal(action[POUCHDB].method, method);
  t.equal(action[POUCHDB].params, params);
  t.deepEqual(action[POUCHDB].types, actionTypes);
  t.equal(action[POUCHDB].params.param, 1);
  t.equal(action.a, 'foo');
  t.end();
});

test('should create allDocs action with default types', t => {
  const action = actions.allDocs();
  t.equal(action[POUCHDB].types[0], 'POUCHDB__allDocs_request');
  t.equal(action[POUCHDB].types[1], 'POUCHDB__allDocs_success');
  t.equal(action[POUCHDB].types[2], 'POUCHDB__allDocs_failure');
  t.end();
});
