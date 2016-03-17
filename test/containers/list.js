import test from 'tape';
import sinon from 'sinon';
import React from 'react';
import '../jsdom';
import { shallow, render, mount } from 'enzyme';

import createCRUD, { INITIAL_STATE } from '../../src/crud/crud';
import {
  createMapStateToProps,
  createListAction,
  connectList,
} from '../../src/crud/containers/list';

import db from '../testDb';
import createStore from '../testStore';
import { allDocsState } from '../testUtils';


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


const MyListComponent = ({ isLoading, items }) => {
  if (isLoading) {
    return <div className="loading" />
  }
  return (
    <ul className="my-list">
      { items.map(item => {
        return (<li key={item.get('_id')}>{item.get('name')}</li>);
      })}
    </ul>
  );
}

test('test createMapStateToProps', t => {
  let result;

  const mapStateToProps = createMapStateToProps('mountPoint', '', 'items');
  t.equal(typeof mapStateToProps, 'function', 'should be a function');
  t.equal(mapStateToProps.length, 1, 'should have one argument');

  result = mapStateToProps({mountPoint: INITIAL_STATE});
  t.equal(result.items, null, 'items should be null for empty state');

  result = mapStateToProps({ mountPoint: allDocsState });
  t.equal(result.items.size, 1, 'result should have 1 item');
  t.equal(result.folderVars.size, 0, 'result should have 0 folderVars');

  t.end()
});


test('test createListAction', t => {
  const thunk = createListAction(crud, '');
  t.equal(typeof thunk, 'function', 'called function should return thunk');
  t.equal(thunk.length, 2, 'thunk should have 2 arguments');
  t.end();
});


test('test createListAction allDocs', t => {
  sinon.spy(crud.actions, 'allDocs');
  createListAction(crud, '')
  t.equal(
    crud.actions.allDocs.calledOnce,
    true,
    'thunk should call crud.action.allDocs'
  );
  const args = crud.actions.allDocs.args[0];
  t.equal(args[0], '', 'folder should be empty string');
  t.equal(args[1].startkey, 'mountPoint-', 'startkey should be mountPoint-');
  t.equal(args[1].endkey, 'mountPoint-\uffff', 'startkey should be mountPoint-\uffff');

  crud.actions.allDocs.restore();
  t.end();
});


test('test createListAction query', t => {
  sinon.spy(crud.actions, 'query');
  createListAction(crud, '', {options: {fun: 'myfun'}});
  t.equal(
    crud.actions.query.calledOnce,
    true,
    'thunk should be crud.action.query'
  );
  const args = crud.actions.query.args[0];
  t.equal(args[0], 'myfun', 'fun argument should be myfun');
  t.equal(args[1], '', 'folder should be empty string');
  t.deepEqual(args[3], {}, 'query options should be empty');

  crud.actions.query.restore();
  t.end();
});


test('test connectList without data should display loader component', t => {
  const ListContainer = connectList(crud)(MyListComponent);
  const result = render(<ListContainer store={store}/>);
  t.equal(result.find('div.loading').length, 1);
  t.end();
});

test('test connectList without data should trigger allDocs action', t => {
  t.plan(1);
  const crud = createCRUD(db, 'mountPoint');
  crud.actions.allDocs = (f, opts) => {
    t.ok('actions.allDocs should be called');
    return {type: 'foo'}
  }
  const ListContainer = connectList(crud)(MyListComponent);
  const store = createStore({[crud.mountPoint]: crud.reducer});
  mount(<ListContainer store={store} />);
});

test('test connectList with data', t => {
  const ListContainer = connectList(crud)(MyListComponent);
  store.dispatch(allDocsSuccessAction);

  const result = render(<ListContainer store={store}/>);
  t.equal(result.find('ul.my-list').length, 1);
  t.equal(result.find('ul.my-list > li').length, 1);
  t.equal(result.find('ul.my-list > li').text(), 'foo');
  t.end()
});

test('test connectList with mapStateToProps, mapDispatchToProps', t => {
  const mapStateToProps = (state) => ({ foo: 'bar' });
  const mapDispatchToProps = (dispatch) => ({ action: 'foo' });
  const ListContainer = connectList(crud, {}, mapStateToProps, mapDispatchToProps)(
    MyListComponent
  );
  const wrapper = shallow(<ListContainer store={store}/>);
  t.equal(wrapper.prop('foo'), 'bar');
  t.equal(wrapper.prop('action'), 'foo');
  t.end();
});


test('test connectList with opts from mapStateToProps', t => {
  const crud = createCRUD(db, 'mountPoint');
  const folder = 'folderFoo';
  crud.actions.allDocs = (f, params, opts) => {
    t.equal(f, folder, 'folder should be set');
    t.equal(params.startkey, 'a', 'params should be set');
    t.equal(opts.folderParam1, 'foo', 'opts should be set');
    t.end();
    return {type: 'foo'};
  }
  const store = createStore({[crud.mountPoint]: crud.reducer});
  const ListContainer = connectList(crud, {}, state => ({
    listOpts: {
      folder,
      options: {
        startkey: 'a',
      },
      folderParam1: 'foo',
    }
  }))(MyListComponent);
  mount(<ListContainer store={store} />);
});

test('test connectList without crud', t => {
  t.throws(
    connectList,
    /^Invariant Violation/,
    'should throw an error'
  );
  t.end();
});
