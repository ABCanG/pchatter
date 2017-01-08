import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

const InputField = ({ input, label, required, help, children, meta: { touched, error }, ...custom }) => {
  const validation = {};
  if (touched && error) {
    validation.validationState = 'error';
  }
  return (
    <FormGroup controlId={input.name} {...validation} >
      <ControlLabel>{label}{required && <span style={{ color: 'red' }}>*</span>}</ControlLabel>
      <FormControl {...custom} {...input} >{children}</FormControl>
      {touched && error && <HelpBlock>{error}</HelpBlock>}
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
};

InputField.propTypes = {
  input: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.object,
  children: PropTypes.node,
  required: PropTypes.bool,
  help: PropTypes.node,
};


export default InputField;
