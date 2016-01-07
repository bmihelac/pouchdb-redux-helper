import './jsdom';
import { shallow, render, mount } from 'enzyme';
import React from 'react';
import test from 'tape';
import PouchDB from 'pouchdb';
import { combineReducers, createStore } from 'redux'
import { Provider } from 'react-redux';

import createCRUD, { INITIAL_STATE } from '../src/crud/crud';
import {
  createMapStateToProps,
  connectList,
} from '../src/crud/containers';


const db = PouchDB('db');
const crud = createCRUD(db, 'mountPoint');
const folder = '';
const queryOpts = {
  fun: 'by_date',
  key: folder,
}
const store = createStore(combineReducers({[crud.mountPoint]: crud.reducer}));


const MyListComponent = ({ items }) => {
  return (
    <ul className="my-list">
      { items.map(item => {
        return (<li key={item.get('_id')}>{item.get('name')}</li>);
      })}
    </ul>
  );
}

test('createMapStateToProps should return mapStateToProps function with `items` dictionary', t => {
  const mapStateToProps = createMapStateToProps('mountPoint', '');
  const result = mapStateToProps({mountPoint: INITIAL_STATE});
  t.equal(result.items, null);
  t.end()
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
  const store = createStore(combineReducers({[crud.mountPoint]: crud.reducer}));
  mount(<ListContainer store={store} />);
});

test('test connectList with data', t => {
  const ListContainer = connectList(crud)(MyListComponent);
  store.dispatch({
    type: crud.actionTypes.allDocs.success,
    payload: {
      rows: [{
        id: 'id-1',
        doc: {_id: 'id-1', name: 'foo'},
      }],
    },
    folder: '{}',
  });

  const result = render(<ListContainer store={store}/>);
  t.equal(result.find('ul.my-list').length, 1);
  t.equal(result.find('ul.my-list > li').length, 1);
  t.equal(result.find('ul.my-list > li').text(), 'foo');
  t.end()
});
