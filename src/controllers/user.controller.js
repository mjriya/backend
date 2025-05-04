import { User } from "../model/user.model.js";
import { Article } from "../model/articel.model.js";
import jwt from "jsonwebtoken";
import { environment } from "../loaders/environment.loader.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// Function to handle login

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    // console.log("Password comparison result:", isMatch); // Debugging
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, roles: user.roles }, // Payload
      process.env.JWT_SECRET
    );

    // Send the full user data along with the token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  const { name, email, roles } = req.body;

  try {
    // Ensure only admins can create users
    // if (!req.user || !req.user.roles.includes("admin")) {
    //   return res.status(403).json({ message: "You are not authorized to create users" });
    // }

    // Check if a user with the same email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString("hex");

    // Create a unique slug from the email
    const slug = email.replace(/@.*$/, "").replace(/\s+/g, "-").toLowerCase();

    // Create new user
    const newUser = new User({
      name,
      email,
      password: randomPassword, // The raw password will be hashed by the schema's pre-save hook
      roles, // You can specify roles here when creating a user
      slug, // Add slug to the user object
    });

    await newUser.save();

    // const subject = "sportzpoint";
    // const text = `Hello ${name},\n\nYour account has been created successfully.\n\nEmail: ${email}\nPassword: ${randomPassword}\n\nPlease change your password after logging in.\n\nBest regards,\nThe SportzPoint Team`;

    // await sendEmail({
    //   to: email,
    //   subject,
    //   text,
    // });

    // Send a response with the generated password
    res.status(201).json({ message: "User created successfully", password: randomPassword, newUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Fetch all users
export const getAllUsersController = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find().select("-password"); // Exclude password field for security
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getArticlesByAuthor = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

    const skip = (page - 1) * limit; // Calculate the number of articles to skip

    const articles = await Article.find({ author: userId })
      .populate('primary_category')
      .populate('categories')
      .populate('tags')
      .populate('live_blog_updates')
      .populate('author', 'name email')
      .populate('credits', 'name email')
      .skip(skip) // Skip articles based on the page number
      .limit(parseInt(limit)) // Limit the number of articles per page
      .exec();

    // Get the total count of articles to calculate total pages
    const totalCount = await Article.countDocuments({ author: userId });

    res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving articles",
      error: error.message,
    });
  }
};

// Fetch articles by author and status
export const getArticlesByAuthorStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query; // Include `status` in query parameters

    const skip = (page - 1) * limit; // Calculate the number of articles to skip

    // Build a dynamic query object
    const query = { author: userId };
    if (status) {
      query.status = status; // Add status filter if provided
    }

    const articles = await Article.find(query)
      .populate('primary_category')
      .populate('categories')
      .populate('tags')
      .populate('live_blog_updates')
      .populate('author', 'name email')
      .populate('credits', 'name email')
      .skip(skip) // Skip articles based on the page number
      .limit(parseInt(limit)) // Limit the number of articles per page
      .exec();

    // Get the total count of articles to calculate total pages
    const totalCount = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving articles",
      error: error.message,
    });
  }
};

// Fetch a specific user's data by ID
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password"); // Exclude password field

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// Update the logged-in user's profile
export const updateMyProfile = async (req, res) => {


  const { userId } = req.user; // ID of the user to update


  try {


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true }
    );

    if (!updatedUser) {

      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update a user's profile
export const updateUser = async (req, res) => {
  const { id } = req.params; // ID of the user to update
  const { name, email, roles } = req.body;

  try {
    // Ensure only admins can update users
    // if (!req.user || !req.user.roles.includes("admin")) {
    //   return res.status(403).json({ message: "You are not authorized to update users" });
    // }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Ensure only admins can delete users
    if (!req.user || !req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "You are not authorized to delete users" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// doing some work here..

// Send an email
export const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    host: environment.SMTP_HOST,
    port: environment.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: environment.SMTP_USER,
      pass: environment.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: `"sportzpoint" <${environment.SMTP_USER}>`,
    to,
    subject,
    text,
  });
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetPasswordExpire = Date.now() + 30 * 60 * 1000; // Token expires in 30 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Send the email
    // const resetUrl = `${environment.WEB_LINK}/reset-password/${resetToken}`;
   
    // const aw = await sendEmail({
    //   to: email,
    //   subject: "Password Reset Request",
    //   text: `You requested a password reset. Please go to the following link to reset your password: ${resetUrl}`
    // });
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch a specific user's data by ID
export const getUserProfileController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password"); // exclude password field
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// Update the logged-in user's profile
export const updateUserProfileController = async (req, res) => {
  try {
    const userId = req.user.userId; // retrieved from the JWT payload
    const { name, email, password } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields (only those provided)
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      // hash the password if updated (using bcrypt or another hashing library)
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Save updated user
    await user.save();

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// Fetch a specific user's data by slug
export const getUserProfileBySlugController = async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await User.findById(userId).select("-password"); // exclude password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

export { forgotPassword, resetPassword };
