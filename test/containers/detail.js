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


test('test connectSingleItem with data', t => {
  const Container = connectSingleItem(crud)(MyDetailComponent);
  store.dispatch(allDocsSuccessAction);

  const result = render(<Container docId={"id-1"} store={store}/>);
  t.equal(result.find('div.my-detail').length, 1);
  debugger;
  t.end()
});

