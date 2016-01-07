import test from 'tape';
import { List, fromJS, Map } from 'immutable';

import createCRUD, { INITIAL_STATE } from '../src/crud/crud';
import db from './testDb';
const crud = createCRUD(db, 'mountPoint');
const {reducer, actionTypes} = crud;

const doc = {
  _id: 'mydoc',
  _rev: '1-5782E71F1E4BF698FA3793D9D5A96393',
  title: 'Sound and Vision',
}

const INITIAL_STATE_WITH_DOC = INITIAL_STATE.setIn(
  ['documents', doc._id], fromJS(doc)
).setIn(['folders', ''], List([doc._id]));


test('reducer should have initial state', t => {
  const state = reducer(undefined, {});
  t.ok(state instanceof Map, 'should be Map');
  t.equal(state.get('folders'), Map());
  t.equal(state.get('documents'), Map());
  t.end();
});

test('reducer should handle ALL_DOCS action type', t => {
  const payload = {
    rows: [{
      doc: doc,
      id: doc._id
    }]
  };
  const state = reducer(INITIAL_STATE, {
    type: actionTypes.allDocs.success,
    folder: '',
    payload: payload
  });
  t.ok(state.get('folders').has(''), 'has folder');
  t.equal(state.getIn(['folders', '', 0]), doc._id);
  t.deepEqual(state.getIn(['documents', doc._id]).toObject(), doc);
  t.end();
});

test('reducer should handle QUERY action type', t => {
  const payload = {
    rows: [{
      doc: doc,
      id: doc._id
    }]
  };
  const state = reducer(INITIAL_STATE, {
    type: actionTypes.query.success,
    folder: '',
    payload: payload
  });
  t.ok(state.get('folders').has(''), 'has folder');
  t.equal(state.getIn(['folders', '', 0]), doc._id);
  t.deepEqual(state.getIn(['documents', doc._id]).toObject(), doc);
  t.end();
});

test('reducer should handle PUT success', t => {
  const initialState = INITIAL_STATE.setIn(['documents', doc._id], fromJS(doc));
  const payload = {
    ok: true,
    rev: 'rev-2',
    id: doc._id,
  }
  const state = reducer(initialState, {
    type: actionTypes.put.success,
    payload: payload,
    doc: { ...doc, title: 'foo' }
  });
  const updatedDoc = state.getIn(['documents', doc._id]);
  t.equal(updatedDoc.get('title'), 'foo');
  t.equal(updatedDoc.get('_rev'), payload.rev);
  t.end();
});

test('reducer should handle REMOVE success', t => {
  const initialState = INITIAL_STATE.setIn(
    ['documents', doc._id], fromJS(doc)
  ).setIn(['folders', ''], List([doc._id]));
  const state = reducer(initialState, {
    type: actionTypes.remove.success,
    payload: { id: doc._id },
    doc: { ...doc }
  });
  t.equal(state.get('documents').count(), 0);
  t.equal(state.getIn(['folders', '']).count(), 0);
  t.end();
});


test('reducer should include paths', t => {
  t.deepEqual(crud.paths, {
    create: '/mountPoint/new/',
    detail: '/mountPoint/:id/',
    edit: '/mountPoint/:id/edit/',
    list: '/mountPoint/',
  });
  t.end();
});
