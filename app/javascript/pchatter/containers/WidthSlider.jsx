import React from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import RcSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
import NumericInput from 'react-numeric-input';

import { setStyleWidth } from '../actions/canvasActionCreators';

class WidthSlider extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  handleChangeWidth = (width) => {
    const { dispatch } = this.props;
    dispatch(setStyleWidth(width || 1));
  }

  render() {
    const { width } = this.props;

    return (
      <div className="slider">
        <NumericInput
          value={width}
          min={1}
          max={200}
          mobile={false}
          onChange={this.handleChangeWidth}
          />
        <RcSlider
          value={width}
          min={1}
          max={200}
          onChange={this.handleChangeWidth} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const $$canvasStore = state.$$canvasStore;

  return {
    width: $$canvasStore.getIn(['style', 'width']),
  };
}

export default connect(mapStateToProps)(WidthSlider);
