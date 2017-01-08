import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import Dropzone from 'react-dropzone';

const FileInputField = ({ input, label, required, help, option, children, meta: { touched, error }, ...custom }) => {
  const validation = {};
  if (touched && error) {
    validation.validationState = 'error';
  }
  return (
    <FormGroup controlId={input.name} {...validation} >
      <ControlLabel>{label}{required && <span style={{ color: 'red' }}>*</span>}</ControlLabel>
      <Dropzone
        {...option}
        {...custom}
        onDrop={(f) => input.onChange(f)}
        className="dropzone-input"
        >
        {children}
      </Dropzone>
      {touched && error && <HelpBlock>{error}</HelpBlock>}
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
};

FileInputField.propTypes = {
  option: PropTypes.object,
  input: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.object,
  children: PropTypes.node,
  required: PropTypes.bool,
  help: PropTypes.node,
  cbFunction: PropTypes.func,
};

export default FileInputField;
