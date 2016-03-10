/* globals emit */

import './jsdom';
import test from 'tape';
import sinon from 'sinon';
import React from 'react';
import { shallow, mount } from 'enzyme';

import {
  getListParams,
} from '../src/crud/containers/list';
import createCRUD, {
  INITIAL_STATE,
} from '../src/crud/crud';
import paginate, {
  defaultOpts,
  paginationFolderSuffix,
  createMapStateToPropsPagination,
  getPaginationListParams,
  paginateQuery,
  createPaginateAction,
} from '../src/crud/pagination';

import db from './testDb';
import * as testUtils from './testUtils';
import createStore, { actions } from './testStore';

const crud = createCRUD(db, 'doc');
const store = createStore({[crud.mountPoint]: crud.reducer});


test('paginationFolderSuffix', t => {
  t.equal(
    paginationFolderSuffix(10),
    '/page/10/'
  )
  t.equal(
    paginationFolderSuffix(10, 'startkey'),
    '/page/10/startkey'
  )
  t.end();
});


test('test getPaginationListParams', t => {
  const listParams = getListParams(crud, {});
  const opts = getPaginationListParams(listParams, {}, 10);
  t.equal(opts.startkey, 'doc-', 'startkey should be mountPoint-');
  t.equal(opts.endkey, 'doc-\uffff', 'startkey should be mountPoint-\uffff');
  t.equal(opts.limit, defaultOpts.rowsPerPage + 1, 'should have rowsPerPage+1 in opts');

  t.end();
});


test('test paginateQuery first page', t => {
  testUtils.populateDb(db, testUtils.docs).then(() => {
    const q = paginateQuery(crud, {}, 5);
    q.then(payload => {
      t.equal('prev' in payload, false, 'payload should have no prev');
      t.equal('next' in payload, true, 'payload should have next');
      t.end();
    });
  });
});

test('test paginateQuery', t => {
  testUtils.populateDb(db, testUtils.docs).then(() => {
    const q = paginateQuery(crud, {}, 5, 'doc-11');
    q.then(payload => {
      t.equal(payload.rows.length, 5, 'payload should have 5 rows');
      t.equal(payload.next, 'doc-16', 'payload should have next');
      t.equal(payload.prev, 'doc-06', 'payload should have prev');
      t.end();
    });
  });
});


test('test paginateQuery with query function', t => {
  testUtils.populateDb(db, testUtils.docs).then(() => {
    return testUtils.createIndex(db, 'evenDocs', (doc) => {
      if (doc.name % 2 == 0) {
        emit(doc._id);
      }
    }).then(() => {
      const opts = {options: {fun: 'evenDocs'}};
      return paginateQuery(crud, opts, 5).then(payload => {
        t.equal(payload.rows.length, 5, 'payload should have 5 rows');
        t.equal(payload.rows[0].id, 'doc-02', 'doc-02 should be first doc');
        t.equal(payload.next, 'doc-12', 'doc-12 should be next');

        return paginateQuery(crud, opts, 5, 'doc-12').then(payload => {
          t.equal(payload.rows.length, 5, 'payload should have 5 rows');
          t.equal(payload.prev, 'doc-02', 'doc-02 should be prev');
          t.end();
        });
      });
    });
  }).catch(err => {
    t.fail(err);
  });
});


test('test createMapStateToPropsPagination', t => {
  const mapStateToProps = createMapStateToPropsPagination({}, crud);
  const state = {
    doc: INITIAL_STATE,
  };
  const props = mapStateToProps(state);
  t.equal(typeof props.action, 'function', 'action should be function')
  t.equal(props.items, null, 'items should be null')

  //t.deepEqual(
    //mapStateToProps(state),
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

  t.end();
});


//const MyListComponent = ({ items }) => {
  //return (
    //<ul className="my-list">
      //{ items.map(item => <li key={item.get('_id')}>{item.get('name')}</li>) }
    //</ul>
  //);
//}

//const PaginatedMyListComponent = ({ items, folderVars }) => {
  //const lastItem = items.get(folderVars.get('rowsPerPage'));
  //const nextStartkey = lastItem ? lastItem.get('_id') : null;
  //const prevStartkey = items.get(folderVars.get('prevStartkey'));
  //return (
    //<div>
      //<MyListComponent items={items.slice(0, folderVars.get('rowsPerPage'))} />
      //<div>
        //{ prevStartkey }
        //{ nextStartkey }
      //</div>
    //</div>
  //);
//}


//test('test paginate', t => {
  //let wrapper;

  //testUtils.populateDb(db, testUtils.docs).then(() => {
    //const C1 = paginate({}, crud)(PaginatedMyListComponent);
    //wrapper = mount(<C1 store={store} />);
    //t.equal(wrapper.find('.loading').length, 1, 'initial render should be loading');
    //return actions.pop().then(() => {
      //wrapper = shallow(<C1 store={store} />);
      //t.deepEqual(
        //wrapper.prop('folderVars').get('rowsPerPage'),
        //defaultOpts.rowsPerPage,
        //'wrapped component should have folderVars'
      //);
      //t.equal(wrapper.prop('items').count(), defaultOpts.rowsPerPage + 1,
              //'wrapped component should have rowsPerPage+1 items');

      //const startkey = wrapper.prop('items').get(defaultOpts.rowsPerPage).get('_id');
      //const prevStartkey = wrapper.prop('items').get(0).get('_id');
      //const C2 = paginate({startkey, prevStartkey }, crud)(PaginatedMyListComponent);
      //wrapper = mount(<C2 store={store} />);
      //t.equal(wrapper.find('.loading').length, 1, 'should be loading');
      //return actions.pop().then(() => {
        //wrapper = shallow(<C2 store={store} />);
        //t.deepEqual(wrapper.prop('folderVars').toJS(), {
          //rowsPerPage: defaultOpts.rowsPerPage,
          //prevStartkey
        //}, 'should have folderVars');
        //t.equal(wrapper.prop('items').count(), defaultOpts.rowsPerPage,
                //'should have rowsPerPage items');
        //t.equal(wrapper.prop('items').get(0).get('_id'), 'doc-11',
                //'should start with doc-11');

        //t.end();
      //})
    //})
  //}).catch(err => {
    //t.fail(err.stack);
  //});;
//});
