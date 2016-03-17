var isEqual = require('lodash.isequal');
import React, { Component } from 'react';


const defaultOpts = {
  propName: 'items',
}

/**
 * loading decorator
 *
 * @param {function} loadFunction(component)
 * @param {object} [opts={}]
 * @param {string} [opts.propName='items']
 * @param {string} [opts.loadingText='loading....']
 * @param {string} [opts.action] action to dispatch if props[propName] is false
 * @returns {Component}
 */
export default function loading(loadFunction, opts={}) {
  const options = Object.assign({}, defaultOpts, opts);

  return function loadingWithLoadFunction (ComposedComponent) {
    return class ComponentWithLoading extends Component {

      getPropName() {
        return this.props.propName || options.propName;
      }

      hasItems(props) {
        return props[this.getPropName()];
      }

      getAction() {
        return this.props.action || opts.action;
      }

      getLoadFunction() {
        return loadFunction;
      }

      loadIfNeeded(props) {
        if (!this.hasItems(props)) {
          const action = this.getAction();
          if (action) {
            this.props.dispatch(action.apply(this, props.actionArgs));
          } else {
            this.getLoadFunction()(this);
          }
        }
      }

      componentDidMount = () => {
        this.loadIfNeeded(this.props);
      }

      componentWillReceiveProps = nextProps => {
        if (this.props.action == nextProps.action &&
            isEqual(this.props.actionArgs, nextProps.actionArgs)) {
          return;
        }
        this.loadIfNeeded(nextProps);
      }

      render() {
        const isLoading = !this.hasItems(this.props);
        return <ComposedComponent
          { ...this.props }
          isLoading={ isLoading }
        />;
      }
    }
  }
};
