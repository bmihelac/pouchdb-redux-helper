import { connect } from 'react-redux';
import loading from '../loading';


export function wrap(mapStateToProps, mapDispatchToProps, loadFunction, loadOpts) {
  return function(WrappedComponent) {
    return connect(mapStateToProps, mapDispatchToProps)(
      loading(loadFunction, loadOpts)(WrappedComponent)
    );
  }
}

