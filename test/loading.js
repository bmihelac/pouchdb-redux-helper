import './jsdom';
import test from 'tape';
import React from 'react';
import { mount } from 'enzyme';

import loading from '../src/crud/loading';


const MyListComponent = ({ items }) => {
}

test('loading with action as property', t => {
  const action = { type: 'foo' };
  const store = {
    getState: () => {},
    dispatch: a => {
      console.log('dispatch');
      t.deepEqual(a, action, 'dispatched action should be equal to action prop');
      t.end();
    }
  };
  const C = loading(action)(MyListComponent);
  mount(<C dispatch={store.dispatch} action={action}/>);
});
