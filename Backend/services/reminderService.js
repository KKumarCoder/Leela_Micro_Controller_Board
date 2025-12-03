export const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const errors = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors.push(`${field} is required`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

export const validateMobile = (req, res, next) => {
  const { mobile } = req.body;

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile number",
    });
  }

  next();
};

export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address",
    });
  }

  next();
};
