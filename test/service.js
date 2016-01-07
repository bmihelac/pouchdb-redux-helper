import test from 'tape';

import * as service from '../src/service.js';

import db from './testDb';


test('service query', t => {
  t.plan(2);
  const fun = (doc, emit) => emit(doc.price);
  Promise.all([
    db.put({_id: 'id-1', price: 5}),
    db.put({_id: 'id-2', price: 15}),
  ]).then(() => {
    service.query(db, {
      fun,
      startkey: 10,
    }).then(res => {
      t.equal(res.rows.length, 1);
      t.equal(res.rows[0].doc._id, 'id-2');
    });
  }).catch(err => {
    console.log(err);
  });
});
