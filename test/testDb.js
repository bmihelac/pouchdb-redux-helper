import PouchDB from 'pouchdb';

const db = PouchDB('db', {db: require('memdown')});

export default db;
