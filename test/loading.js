import './jsdom';
import test from 'tape';
import sinon from 'sinon';
import ReactTestUtils from 'react-addons-test-utils';

import React from 'react';
import { mount } from 'enzyme';

import loading from '../src/crud/loading';


const MyListComponent = ({ isLoading, items }) => {
  return <div />
}

test('loading with loadFunction', t => {
  const loadFunction = sinon.spy();
  const C = loading(loadFunction)(MyListComponent);
  mount(<C />);
  t.equal(
    loadFunction.calledOnce,
    true,
    'loadFunction should be called'
  );
  const args = loadFunction.args[0];
  t.equals(ReactTestUtils.isCompositeComponent(args[0]), true,
           'loadFunction should be called with component as argument')
  t.end();
});

test('loading with action as property', t => {
  const action = () => { type: 'foo' };
  const store = {
    getState: () => {},
    dispatch: a => {
      t.deepEqual(a, action(), 'dispatched action should be equal to action prop');
      t.end();
    }
  };
  const C = loading()(MyListComponent);
  mount(<C dispatch={store.dispatch} action={action}/>);
});
