const validation = (values) => {
    let errors = {};
  
  
  
    if (!values.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Email address is invalid";
    }
  
    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 5) {
      errors.password = "Password needs to be 6 characters or more";
    }
  
    return errors;
  };
  
  export default validation;
  