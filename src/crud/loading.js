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


/**
 * loading decorator
 *
 * @param {function} loadFunction(component)
 * @param {object} [opts={}]
 * @param {string} [opts.propName='items']
 * @param {string} [opts.loadingText='loading....']
 * @returns {Component}
 */
export default function loading(loadFunction, opts={}) {
  const {
    propName: propName = 'items',
    loadingText: loadingText = 'loading...'
  } = opts;
  return function loadingWithLoadFunction (ComposedComponent) {
    return class ComponentWithLoading extends Component {

      componentDidMount = () => {
        if (!this.props[propName]) {
          loadFunction(this);
        }
      }

      componentWillReceiveProps = nextProps => {
        //if (!this.props[propName]) {
          //loadFunction(this);
        //}
      }

      render() {
        if (!this.props[propName]) {
          return (
            <Loading>{ loadingText }</Loading>
          );
        }
        return <ComposedComponent { ...this.props } />;
      }
    }
  }
};
