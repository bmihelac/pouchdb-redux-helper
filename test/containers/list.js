import test from 'tape';
import React from 'react';
import '../jsdom';
import { shallow, render, mount } from 'enzyme';

import createCRUD, { INITIAL_STATE } from '../../src/crud/crud';
import {
  createMapStateToProps,
  connectList,
} from '../../src/crud/containers/list';

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
  const mapStateToProps = createMapStateToProps('mountPoint', '', 'items');
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


test('test connectList with queryFunc', t => {
  const pouchdbOptions = {};
  const queryFunc = (options) => {
    t.ok(true, 'queryFunc should be called');
    t.equal(options, pouchdbOptions, 'should have pouchdbOptions');
    t.end();
    return db.allDocs();
  };
  const folder = 'queryFunc';
  const ListContainer = connectList(crud, { queryFunc, folder, options: pouchdbOptions })(
    MyListComponent
  );
  mount(<ListContainer store={store} />);
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
