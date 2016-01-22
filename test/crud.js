/* globals emit */

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


test('test crud action allDocs', t => {
  db.put(doc).then(() => {
    let dispatchCounter = 0;
    const dispatch = action => {
      switch (dispatchCounter) {
        case 0:
          t.equal(action.type, crud.actionTypes.allDocs.request);
          t.equal(action.folder, '');
          break;
        case 1:
          t.equal(action.type, crud.actionTypes.allDocs.success);
          t.equal(action.folder, '');
          t.ok(action.payload, 'should have payload');
          t.equal(action.payload.rows[0].doc.title, doc.title);
          t.end()
          break;
      }
      dispatchCounter++;
    }
    const allDocs = crud.actions.allDocs();
    t.equal(typeof allDocs, 'function');
    allDocs(dispatch);
  });
});


test('test crud action query', t => {
  var ddoc = {
    _id: '_design/byYear',
    views: {
      byYear: {
        map: function mapFun(doc) {
          if (doc.year) {
            emit(doc.year);
          }
        }.toString()
      }
    }
  }
  const doc = {
    _id: 'doc-1',
    title: 'Sound and Vision',
    year: 1977,
  }

  Promise.all([
    db.put(doc),
    db.put(ddoc),
  ]).then(() => {
    let dispatchCounter = 0;
    const dispatch = action => {
      switch (dispatchCounter) {
        case 0:
          t.equal(action.type, crud.actionTypes.query.request);
          t.equal(action.folder, '70s');
          break;
        case 1:
          t.equal(action.type, crud.actionTypes.query.success);
          t.equal(action.folder, '70s');
          t.ok(action.payload, 'should have payload');
          t.equal(action.payload.rows[0].doc.year, 1977);
          t.end()
          break;
      }
      dispatchCounter++;
    }
    const query = crud.actions.query('byYear', '70s', {
      startkey: 1970,
      endkey: 1980
    });
    query(dispatch);
  });
});


test('test crud action get', t => {
  const doc = {
    _id: 'doc-2',
    title: 'Sound and Vision',
  }

  db.put(doc).then(() => {
    let dispatchCounter = 0;
    const dispatch = action => {
      switch (dispatchCounter) {
        case 0:
          t.equal(action.type, crud.actionTypes.get.request);
          t.equal(action.docId, doc._id);
          break;
        case 1:
          t.equal(action.type, crud.actionTypes.get.success);
          t.equal(action.docId, doc._id);
          t.ok(action.payload, 'should have payload');
          t.equal(action.payload.title, doc.title);
          t.end()
          break;
      }
      dispatchCounter++;
    }
    const get = crud.actions.get(doc._id);
    get(dispatch);
  });
});


test('test crud action put', t => {
  const doc = {
    _id: 'doc-3',
    title: 'Sound and Vision',
  }

  db.put(doc).then((res) => {
    let dispatchCounter = 0;
    const dispatch = action => {
      switch (dispatchCounter) {
        case 0:
          t.equal(action.type, crud.actionTypes.put.request);
          t.equal(action.doc._id, doc._id);
          break;
        case 1:
          t.equal(action.type, crud.actionTypes.put.success);
          t.ok(action.payload, 'should have payload');
          t.ok(action.payload.rev, 'payload should have rev');
          t.ok(action.payload.ok, 'payload should have ok');
          t.end()
          break;
      }
      dispatchCounter++;
    }
    const put = crud.actions.put({...doc, _rev: res.rev});
    put(dispatch);
  });
});



test('test crud action remove', t => {
  const doc = {
    _id: 'doc-4',
    title: 'Sound and Vision',
  }

  db.put(doc).then((res) => {
    let dispatchCounter = 0;
    const dispatch = action => {
      switch (dispatchCounter) {
        case 0:
          t.equal(action.type, crud.actionTypes.remove.request);
          t.equal(action.doc._id, doc._id);
          break;
        case 1:
          t.equal(action.type, crud.actionTypes.remove.success);
          t.ok(action.payload, 'should have payload');
          t.ok(action.payload.rev, 'payload should have rev');
          t.ok(action.payload.ok, 'payload should have ok');
          t.end()
          break;
      }
      dispatchCounter++;
    }
    const remove = crud.actions.remove({...doc, _rev: res.rev});
    remove(dispatch);
  });
});

