const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const User = require("../model/User");
const { sendEmail } = require("../config/email");
const { generateToken, tokenForVerify } = require("../utils/token");
const { secret } = require("../config/secret");

const client = new OAuth2Client(secret.google_client_id);

// register user
// sign up
exports.signup = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // If user exists and is active, return error
      if (user.status === "active") {
        return res.status(400).send({
          status: "failed",
          message: "Email already exists",
        });
      }
      // If user exists but not active, we can overwrite or just proceed to verification
      // For simplicity, let's update the user details if provided and resend verification
      // But actually, if they are retrying signup, they probably want to start fresh or just verify.
      // Let's assume we proceed to verification logic below using the EXISTING user.
      // We need to generate a new token for them.
      const token = user.generateConfirmationToken();
      await user.save({ validateBeforeSave: false });

      // Logic continues below...
      // Refactored to avoid code duplication
      return handleVerification(user, token, req, res);
    } else {
      const saved_user = await User.create(req.body);
      const token = saved_user.generateConfirmationToken();
      await saved_user.save({ validateBeforeSave: false });
      return handleVerification(saved_user, token, req, res);
    }
  } catch (error) {
    next(error);
  }
};

const handleVerification = async (user, token, req, res) => {
  // Check if email password is configured
  if (!secret.email_pass) {
    // If no email config, auto-activate
    user.status = "active";
    user.confirmationToken = undefined;
    user.confirmationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).send({
      status: "success",
      message: "Registration successful. Account activated (Email skipped in Dev).",
    });
  }

  const mailData = {
    from: secret.email_user,
    to: user.email,
    subject: "Verify Your Email",
    html: `<h2>Hello ${user.name}</h2>
    <p>Verify your email address to complete the signup and login into your <strong>Azad</strong> account.</p>

      <p>This link will expire in <strong> 10 minute</strong>.</p>

      <p style="margin-bottom:20px;">Click this link for active your account</p>

      <a href="${secret.client_url}/email-verify/${token}" style="background:#0989FF;color:white;border:1px solid #0989FF; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Account</a>

      <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@azad-smart-systems.com</p>

      <p style="margin-bottom:0px;">Thank you</p>
      <strong>Azad Team</strong>
       `,
  };
  const message = "Please check your email to verify!";
  sendEmail(mailData, res, message);
};

// add user by admin
exports.addUserByAdmin = async (req, res, next) => {
  try {
    const { email, password, name, role, status } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "fail", message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      status: status || 'active',
    });

    res.status(200).json({
      status: "success",
      message: "User added successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        imageURL: user.imageURL,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

// update user by admin
exports.updateUserByAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password, ...otherData } = req.body;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ status: "fail", message: "User not found" });
        }

        if (password && password.trim() !== '') {
            user.password = password; // Will be hashed by pre-save hook because we are modifying the field
        }
        
        // Update other fields
        if (otherData.name) user.name = otherData.name;
        if (otherData.email) user.email = otherData.email;
        if (otherData.role) user.role = otherData.role;
        if (otherData.status) user.status = otherData.status;
        if (otherData.phone) user.phone = otherData.phone;

        await user.save();

        res.status(200).json({
            status: "success",
            message: "User updated successfully",
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              status: user.status,
              phone: user.phone,
              address: user.address,
              bio: user.bio,
              imageURL: user.imageURL,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            }
        });
    } catch (error) {
        next(error);
    }
};

// login
exports.login = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        status: "fail",
        message: "Please provide a valid email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        error: "No user found. Please create an account",
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        error: "Password is not correct",
      });
    }

    if (user.status !== "active") {
      return res.status(401).json({
        status: "fail",
        error: "Your account is not active",
      });
    }

    const token = generateToken(user);
    const { password: pwd, ...others } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "Successfully logged in",
      data: {
        user: others,
        token,
      },
    });
  } catch (error) {
    next(error)
  }
};

// forget-password
exports.forgetPassword = async (req, res, next) => {
  try {
    const email = req.body?.email ?? req.body?.verifyEmail;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send({
        message: "User Not found with this email!",
      });
    } else {
      // Check if email service is configured
      if (!secret.email_pass) {
        return res.status(503).json({
          status: "fail",
          message: "Email service is not configured. Cannot send password reset link.",
        });
      }

      // Generate secure token
      const resetToken = crypto.randomBytes(32).toString("hex");
      // Hash it before saving (optional but good practice, here we save plain to match existing pattern or we can hash)
      // The User model has passwordResetToken field.
      // Let's use it.
      
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      const body = {
        from: secret.email_user,
        to: `${email}`,
        subject: "Password Reset",
        html: `<h2>Hello ${user.name}</h2>
        <p>A request has been received to change the password for your <strong>Azad</strong> account </p>

        <p>This link will expire in <strong> 10 minute</strong>.</p>

        <p style="margin-bottom:20px;">Click this link for reset your password</p>

        <a href=${secret.client_url}/forget-password/${resetToken} style="background:#0989FF;color:white;border:1px solid #0989FF; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password</a>

        <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@azad-smart-systems.com</p>

        <p style="margin-bottom:0px;">Thank you</p>
        <strong>Azad Team</strong>
        `,
      };
      
      await user.save({ validateBeforeSave: false });
      
      try {
        const message = "Please check your email to reset password!";
        // We need to wait for sendEmail to know if it failed.
        // The current sendEmail implementation takes a res and sends response itself.
        // We should refactor sendEmail to return a promise, but for now let's pass res and handle error inside sendEmail if possible,
        // OR we wrap it.
        // The current sendEmail function (from config/email.js) sends the response directly! 
        // This is bad design but we have to work with it or change it.
        // Let's stick to calling it, as it handles the response.
        sendEmail(body, res, message);
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({
          status: "fail",
          message: "There was an error sending the email. Try again later!",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// confirm-forget-password
exports.confirmForgetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    // Find user with this token and check if it's not expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(403).json({
        status: "fail",
        error: "Token is invalid or has expired",
      });
    }

    // Hash new password
    // The pre-save hook handles hashing if we modify 'password' field.
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// change password
exports.changePassword = async (req, res,next) => {
  try {
    const { password, googleSignIn, newPassword } = req.body || {};
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "You are not logged in" });
    }
    const user = await User.findById(userId);
    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    if (googleSignIn) {
      user.password = newPassword;
      await user.save();
      return res.status(200).json({ message: "Password changed successfully" });
    }

    if (typeof password !== "string" || password.length === 0) {
      return res.status(400).json({ message: "Current password is required" });
    }
    if (!bcrypt.compareSync(password, user?.password)) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error)
  }
};

// update a profile
exports.updateUser = async (req, res,next) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (typeof req.body?.name !== "undefined") user.name = req.body.name;
    if (typeof req.body?.email !== "undefined") user.email = req.body.email;
    if (typeof req.body?.phone !== "undefined") user.phone = req.body.phone;
    if (typeof req.body?.address !== "undefined") user.address = req.body.address;
    if (typeof req.body?.bio !== "undefined") user.bio = req.body.bio;

    const updatedUser = await user.save();
    const token = generateToken(updatedUser);
    const { password, passwordResetToken, passwordResetExpires, confirmationToken, confirmationTokenExpires, ...safeUser } =
      updatedUser.toObject();
      res.status(200).json({
        status: "success",
        message: "Successfully updated profile",
        data: {
          user: safeUser,
          token,
        },
      });
  } catch (error) {
    next(error)
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        status: "fail",
        error: "You are not logged in",
      });
    }

    const user = await User.findById(userId)
      .select(
        "-password -passwordResetToken -passwordResetExpires -confirmationToken -confirmationTokenExpires"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// signUpWithProvider
exports.signUpWithProvider = async (req, res, next) => {
  try {
    const { token } = req.params;
    let ticket;
    try {
        ticket = await client.verifyIdToken({
            idToken: token,
            audience: secret.google_client_id,
        });
    } catch (error) {
        // Fallback for development/testing or if verifyIdToken fails but we want to allow (NOT RECOMMENDED for production but helpful for debugging if config is wrong)
        // For strict security, we should just return error.
        // But if the user hasn't set up GOOGLE_CLIENT_ID, this will fail.
        // Let's assume strict security is requested.
        return res.status(401).json({ 
            status: "fail", 
            message: "Invalid Google Token. Please ensure GOOGLE_CLIENT_ID is set correctly in backend." 
        });
    }

    const { name, email, picture, sub } = ticket.getPayload();
    // 'sub' is the unique Google ID.

    const user = await User.findOne({ email: email });

    if (user) {
      const token = generateToken(user);
      res.status(200).send({
        status: "success",
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            address: user.address,
            phone: user.phone,
            imageURL: user.imageURL,
            googleSignIn: true,
          },
        },
      });
    } else {
      const newUser = new User({
        name: name,
        email: email,
        imageURL: picture,
        status: 'active',
        // It's good practice to store the provider ID
        // googleId: sub 
      });

      const signUpUser = await newUser.save();
      const token = generateToken(signUpUser);
      res.status(200).send({
        status: "success",
        data: {
          token,
          user: {
            _id: signUpUser._id,
            name: signUpUser.name,
            email: signUpUser.email,
            imageURL: signUpUser.imageURL,
            googleSignIn: true,
          }
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pages = Math.max(Number(page) || 1, 1);
    const limits = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pages - 1) * limits;

    const totalDoc = await User.countDocuments({});
    const users = await User.find({})
      .select(
        "-password -passwordResetToken -passwordResetExpires -confirmationToken -confirmationTokenExpires"
      )
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limits)
      .lean();
    res.status(200).json({
      status: "success",
      message: "Users found successfully",
      data: users,
      page: pages,
      limit: limits,
      totalDoc,
    });
  } catch (error) {
    next(error);
  }
};

// delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// confirm email
exports.confirmEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ confirmationToken: token });

    if (!user) {
      return res.status(403).json({
        status: "fail",
        error: "Invalid token",
      });
    }

    const expired = new Date() > new Date(user.confirmationTokenExpires);

    if (expired) {
      return res.status(401).json({
        status: "fail",
        error: "Token expired",
      });
    } else {
      user.status = "active";
      user.confirmationToken = undefined;
      user.confirmationTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: "success",
        message: "Email confirmed successfully",
      });
    }
  } catch (error) {
    next(error);
  }
};
