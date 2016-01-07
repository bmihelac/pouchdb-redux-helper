import * as service from './service';

export const POUCHDB = 'Pouchdb';

export default function pouchdbMiddleware(db) {

  return store => next => action => {

    const pouchAPI = action[POUCHDB];

    if (typeof pouchAPI === 'undefined') {
      return next(action);
    }

    let { method, params } = pouchAPI;
    const { types } = pouchAPI;

    if (!Array.isArray(types) || types.length !== 3) {
      throw new Error('Expected an array of three action types.');
    }
    if (!types.every(type => typeof type === 'string')) {
      throw new Error('Expected action types to be strings.');
    }

    function actionWith(data) {
      const finalAction = Object.assign({}, action, data);
      delete finalAction[POUCHDB];
      return finalAction;
    }

    const [requestType, successType, failureType] = types;

    next(actionWith({
      type: requestType,
    }));

    return service[method](db, params)
    .then((payload) => {
      next(actionWith({
        type: successType,
        payload
      }));
    })
    .catch((error) => {
      next(actionWith({
        type: failureType,
        error: error.message || 'Something bad happened'
      }));
    });

  };

}
