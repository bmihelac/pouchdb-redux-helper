import React, { Component } from 'react';


export class Loading extends Component {
  render() {
    return (
      <div className="loading">
        {this.props.children}
      </div>
    );
  }
}


const defaultOpts = {
  propName: 'items',
  loadingText: 'loading...',
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

      getLoadingText() {
        return this.props.loadingText || options.loadingText;
      }

      hasItems() {
        return !!this.props[this.getPropName()];
      }

      getAction() {
        return this.props.action || opts.action;
      }

      getLoadFunction() {
        return loadFunction;
      }

      componentDidMount = () => {
        if (!this.hasItems()) {
          const action = this.getAction();
          action ? this.props.dispatch(action()) : this.getLoadFunction()(this);
        }
      }

      componentWillReceiveProps = nextProps => {
        //if (!this.props[propName]) {
          //loadFunction(this);
        //}
      }

      render() {
        if (!this.hasItems()) {
          return (
            <Loading>{ this.getLoadingText() }</Loading>
          );
        }
        return <ComposedComponent { ...this.props } />;
      }
    }
  }
};
