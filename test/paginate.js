import './jsdom';
import test from 'tape';
import React from 'react';
import { shallow, mount } from 'enzyme';

import createCRUD from '../src/crud/crud';
import paginate, {
  defaultOpts,
} from '../src/crud/pagination';

import db from './testDb';
import * as testUtils from './testUtils';
import createStore, { actions } from './testStore';

const crud = createCRUD(db, 'doc');
const store = createStore({[crud.mountPoint]: crud.reducer});

//test('applyPagination', t => {
  //t.deepEqual(
    //applyPagination(),
    //{
      //options: { limit: 11 },
      //folder: '{}/page/10/',
      //rowsPerPage: defaultOpts.rowsPerPage
    //},
    //'should work for empty options'
  //);

  //t.deepEqual(
    //applyPagination({rowsPerPage: 20}),
    //{
      //options: { limit: 21 },
      //folder: '{}/page/20/',
      //rowsPerPage: 20,
    //},
    //'should work for rowsPerPage in paginationOpts'
  //);

  //t.deepEqual(
    //applyPagination({startkey: 'doc-10', prevStartkey: 'doc-01'}),
    //{
      //options: { limit: 11, startkey: 'doc-10' },
      //folder: '{}/page/10/doc-10',
      //rowsPerPage: 10,
      //prevStartkey: 'doc-01',
    //},
    //'should work for startkey in paginationOpts'
  //);

  //t.deepEqual(
    //applyPagination(null, {folder: 'byName', options: {
      //fun: 'docByName',
      //startkey: '10'
    //}}),
    //{
      //options: { fun: 'docByName', limit: 11, startkey: '10' },
      //folder: 'byName/page/10/',
      //rowsPerPage: 10,
    //},
    //'should work for custom connectListOpts'
  //);

  //t.end();
//});


const MyListComponent = ({ items }) => {
  return (
    <ul className="my-list">
      { items.map(item => <li key={item.get('_id')}>{item.get('name')}</li>) }
    </ul>
  );
}

const PaginatedMyListComponent = ({ items, folderVars }) => {
  const lastItem = items.get(folderVars.get('rowsPerPage'));
  const nextStartkey = lastItem ? lastItem.get('_id') : null;
  const prevStartkey = items.get(folderVars.get('prevStartkey'));
  return (
    <div>
      <MyListComponent items={items.slice(0, folderVars.get('rowsPerPage'))} />
      <div>
        { prevStartkey }
        { nextStartkey }
      </div>
    </div>
  );
}


test('test paginate', t => {
  let wrapper;

  testUtils.populateDb(db, testUtils.docs).then(() => {
    const C1 = paginate({}, crud)(PaginatedMyListComponent);
    wrapper = mount(<C1 store={store} />);
    t.equal(wrapper.find('.loading').length, 1, 'initial render should be loading');
    actions.pop().then(() => {
      wrapper = shallow(<C1 store={store} />);
      t.deepEqual(
        wrapper.prop('folderVars').get('rowsPerPage'),
        defaultOpts.rowsPerPage,
        'wrapped component should have folderVars'
      );
      t.equal(wrapper.prop('items').count(), defaultOpts.rowsPerPage + 1,
              'wrapped component should have rowsPerPage+1 items');

      const startkey = wrapper.prop('items').get(defaultOpts.rowsPerPage).get('_id');
      const prevStartkey = wrapper.prop('items').get(0).get('_id');
      const C2 = paginate({startkey, prevStartkey }, crud)(PaginatedMyListComponent);
      wrapper = mount(<C2 store={store} />);
      t.equal(wrapper.find('.loading').length, 1, 'should be loading');
      actions.pop().then(() => {
        wrapper = shallow(<C2 store={store} />);
        t.deepEqual(wrapper.prop('folderVars').toJS(), {
          rowsPerPage: defaultOpts.rowsPerPage,
          prevStartkey
        }, 'should have folderVars');
        t.equal(wrapper.prop('items').count(), defaultOpts.rowsPerPage,
                'should have rowsPerPage items');
        t.equal(wrapper.prop('items').get(0).get('_id'), 'doc-11',
                'should start with doc-11');

        t.end();
      }).catch(err => t.fail(err.stack));;
    }).catch(err => t.fail(err.stack));
  }).catch(err => t.fail(err.stack));;
});
