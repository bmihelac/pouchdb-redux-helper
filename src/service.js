export const allDocs = (db, params) => {
  return db.allDocs({
    attachments: true,
    include_docs: true,
    ...params
  });
};

export const query = (db, params) => {
  const { fun, ...options } = params;
  return db.query(fun, {
    attachments: true,
    include_docs: true,
    ...options
  });
};

export const get = (db, params) => {
  const { docId, ...options } = params;
  return db.get(docId, options);
};

export const put = (db, params) => {
  const { doc, ...options } = params;
  return db.put(doc, options);
}

export const post = (db, params) => {
  const { doc, ...options } = params;
  return db.post(doc, options);
}

export const remove = (db, params) => {
  const { doc, ...options } = params;
  return db.remove(doc, options);
}
