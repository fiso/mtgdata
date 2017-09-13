function collectParams (request, params) {
  const errors = [];
  const collectedParams = {};

  params.forEach((param) => {
    if (param.required) {
      if (typeof request[param.name] === 'undefined') {
        errors.push(param.errorMessage ||
          `Missing required parameter ${param.name}`);
      }
    }

    if (typeof request[param.name] !== 'undefined') {
      let accepted = true;
      if (typeof param.validator === 'function') {
        const validationError = param.validator(request[param.name]);
        if (validationError) {
          errors.push(validationError);
          accepted = false;
        }
      }
      if (accepted) {
        collectedParams[param.name] = request[param.name];
      }
    }
  });

  return {errors, params: collectedParams};
}

module.exports = {
  collectParams,
};
