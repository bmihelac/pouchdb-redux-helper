import test from 'tape';
import immutable from 'immutable';

import * as utils from '../src/utils';


test('toList should convert pouchdb payload to immutable list', t => {
  const payload = JSON.parse(`
  {
    "offset": 0,
    "total_rows": 1,
    "rows": [{
      "doc": {
        "_id": "0B3358C1-BA4B-4186-8795-9024203EB7DD",
        "_rev": "1-5782E71F1E4BF698FA3793D9D5A96393",
        "title": "Sound and Vision",
        "_attachments": {
          "attachment/its-id": {
            "content_type": "image/jpg",
            "data": "R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
            "digest": "md5-57e396baedfe1a034590339082b9abce"
          }
        }
      },
      "id": "0B3358C1-BA4B-4186-8795-9024203EB7DD",
      "key": "0B3358C1-BA4B-4186-8795-9024203EB7DD",
      "value": {
        "rev": "1-5782E71F1E4BF698FA3793D9D5A96393"
      }
    }]
  }
  `);
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
