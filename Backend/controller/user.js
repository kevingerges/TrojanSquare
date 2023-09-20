const User = require('../model/User');
const sgmail = require('@sendgrid/mail');
const VerifyEmail = require('../model/verifyEmail');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const API_KEY = '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';
sgmail.setApiKey(API_KEY);

const createUser = async (req, res) => {
  const { email, fullname, password, confirmPassword, ...userData } = req.body;

  if (!email || !fullname || !password || !confirmPassword) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  if (!email.endsWith('usc.edu')) {
    res.status(400).json({ message: 'Email must end with @usc.edu' });
    return;
  }

  if (password === confirmPassword) {
    try {
      const user = await User.create({ socketid: uuidv4(), email, fullname, password, ...userData });

      const token = user.createjwt();
      res.status(200).json({ user, token });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(400).json({ message: 'Passwords do not match' });
  }
};
 

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const isPasswordCorrect = await user.comparePassword(password);
    if (isPasswordCorrect) {
      const token = await user.createjwt();
      res.status(200).json({ user, token });
    }
  } else {
    res.status(403).json({ message: 'user not found' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.user;
  const image = {
    image: `http://localhost:5000/api/v1/${req.file.filename}`,
  };
  const newUser = await User.findOneAndUpdate({ _id: id }, image, {
    new: true,
    runValidator: true,
  });
  res.status(200).json({ newUser });
};

const getUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id });
  res.status(200).json({ user });
};


const resetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'No account with that email address exists.' });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetPasswordExpires = Date.now() + 3600000; // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetPasswordExpires;

  await user.save();

  const msg = {
    to: email,
    from: 'passwordreset@demo.com',
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.

Please click on the following link, or paste this into your browser to complete the process:

http://${req.headers.host}/reset/${resetToken}

If you did not request this, please ignore this email and your password will remain unchanged.
`
  };

  sgmail.send(msg);

  res.status(200).json({ message: 'An email has been sent to ' + email + ' with further instructions.' });
};

module.exports = { createUser, loginUser, updateUser, getUser, resetPassword };

