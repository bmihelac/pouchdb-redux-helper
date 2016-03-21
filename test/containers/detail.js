import test from 'tape';
import React from 'react';
import { render } from 'enzyme';

import createCRUD from '../../src/crud/crud';
import {
  connectSingleItem,
} from '../../src/crud/containers/detail';

import db from '../testDb';
import createStore from '../testStore';


const crud = createCRUD(db, 'mountPoint');
const store = createStore({[crud.mountPoint]: crud.reducer});

const allDocsSuccessAction = {
  type: crud.actionTypes.allDocs.success,
  payload: {
    rows: [{
      id: 'id-1',
      doc: {_id: 'id-1', name: 'foo'},
    }],
  },
  folder: '{}',
}


const MyDetailComponent = ({ item }) => (
  <div className="my-detail">{item.get('name')}</div>
);


test('test connectSingleItem with own property', t => {
  const Container = connectSingleItem(crud)(MyDetailComponent);
  store.dispatch(allDocsSuccessAction);

  const result = render(<Container docId={"id-1"} store={store}/>);
  t.equal(result.find('div.my-detail').length, 1);
  t.end()
});


test('test connectSingleItem with mapStateToProps', t => {
  const Container = connectSingleItem(crud, {}, state => ({
    singleItemOpts: {docId: 'id-1'}
  }))(MyDetailComponent);
  store.dispatch(allDocsSuccessAction);

  const result = render(<Container store={store}/>);
  t.equal(result.find('div.my-detail').length, 1);
  t.end()
});


test('test connectSingleItem without crud', t => {
  t.throws(
    connectSingleItem,
    /^Invariant Violation/,
    'should throw an error'
  );
  t.end();
});
