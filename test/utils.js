import test from 'tape';
import immutable from 'immutable';

import * as utils from '../src/utils';
import { payload } from './testUtils';


test('toList should convert pouchdb payload to immutable list', t => {
  const list = utils.toList(payload);
  t.equal(list.count(), 1);
  const item = list.get(0);
  t.equal(item.get('title'), 'Sound and Vision');
  t.equal(item.get('_id'), '0B3358C1-BA4B-4186-8795-9024203EB7DD');
  t.equal(item.get('_rev'), '1-5782E71F1E4BF698FA3793D9D5A96393');
  t.end();
});


test('updateDocInList should return new list with updated doc', t => {
  const list = immutable.List([
    immutable.Map({_id: 'id-1', title: 'foo'}),
    immutable.Map({_id: 'id-2', title: 'foo'}),
  ]);
  const list2 = utils.setDocInList(list, immutable.Map({_id: 'id-1', title: 'bar'}))
  t.equal(list2.get(0).get('title'), 'bar');
  t.end();
});


test('updateDocInList should ignore non existing doc', t => {
  const list = immutable.List([
    immutable.Map({_id: 'id-1', title: 'foo'}),
  ]);
  const list2 = utils.setDocInList(list, immutable.Map({_id: 'id-2', title: 'bar'}))
  t.equal(list, list2);
  t.end();
});


test('createActionType should return action type', t => {
  t.equal(utils.createActionType('items', 'get', 'request'), 'POUCHDB_items_get_request');
  t.end();
});


test.only('test setQueryPayloadInState', t => {
  const state = utils.setQueryPayloadInState(new immutable.Map(), '', payload,
                                             {foo: 'bar'});
  const folderVars = utils.getFolderVars(state, '');
  t.equal(folderVars.get('total_rows'), 1, 'should have total_rows in folderVars');
  t.equal(folderVars.get('offset'), 0, 'should have offset in folderVars');
  t.equal(folderVars.get('foo'), 'bar', 'should have foo in folderVars');
  t.end();
});
