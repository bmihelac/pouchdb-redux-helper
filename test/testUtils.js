import { fromJS } from 'immutable';


//Array(20).fill().map(((_, k) => ({_id: `doc-${('0' + (k+1)).slice(-2)}`, name: `${(k+1)}`})))
export const docs = [
  { _id: 'doc-01', name: '1' },
  { _id: 'doc-02', name: '2' },
  { _id: 'doc-03', name: '3' },
  { _id: 'doc-04', name: '4' },
  { _id: 'doc-05', name: '5' },
  { _id: 'doc-06', name: '6' },
  { _id: 'doc-07', name: '7' },
  { _id: 'doc-08', name: '8' },
  { _id: 'doc-09', name: '9' },
  { _id: 'doc-10', name: '10' },
  { _id: 'doc-11', name: '11' },
  { _id: 'doc-12', name: '12' },
  { _id: 'doc-13', name: '13' },
  { _id: 'doc-14', name: '14' },
  { _id: 'doc-15', name: '15' },
  { _id: 'doc-16', name: '16' },
  { _id: 'doc-17', name: '17' },
  { _id: 'doc-18', name: '18' },
  { _id: 'doc-19', name: '19' },
  { _id: 'doc-20', name: '20' }
];


export const payload = JSON.parse(`
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


export function deleteDb(db) {
  return db.allDocs().then(
    result => Promise.all(result.rows.map(row => db.remove(row.id, row.value.rev)))
  );
}

export function populateDb(db, docs) {
  return deleteDb(db).then(() => db.bulkDocs({docs}))
}

export function createIndex(db, name, fun) {
  const ddoc = {
    _id: '_design/' + name,
    views: {
      [name]: {
        map: fun.toString()
      }
    }
  }
  return db.put(ddoc);
}

export const doc = {
  _id: 'mydoc',
  _rev: '1-5782E71F1E4BF698FA3793D9D5A96393',
  title: 'Sound and Vision',
}

export const allDocsPayload = {
  rows: [{
    doc: doc,
    id: doc._id
  }]
};

export const allDocsState = fromJS({
  folders: {
    '': {
      ids: [doc._id],
      vars: {},
    }
  },
  documents: {[doc._id]: doc},
})
