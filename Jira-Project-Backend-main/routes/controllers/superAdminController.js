const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const SuperAdmin = require('./model');
const Client = require('./client'); // Assuming you have a Client model
const crypto = require('crypto');
const PasswordResetToken = require('PasswordResetToken');
const Role = require('./Role');
const MethodologyName = require('./MethodologyName')
const Issue = require('./Issue');
const Status = require('./Status');
const Priority = require('./Priority');
const TypeOfOrganisation = require('./TypeOfOragnisation');
const ActivateStatus = require('./Status');
const Profile = require('./Profile');
const multer = require('multer');
const path = require('path');
const MethodologyField = require('./MethodologyField');



const JWT_SECRET = 'your_jwt_secret'; // Ideally from process.env
const CLIENT_URL = 'http://localhost:3000'; // Frontend base URL
const FRONTEND_RESET_PATH = '/superadmin/reset-password/';

// LOGIN
const superAdminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if SuperAdmin exists
    const admin = await SuperAdmin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare plain text passwords (no bcrypt)
    if (admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// Helper function to generate random username
const forgotPassword = async (req, res) => {
  try {
    const fixedUsername = 'superadmin';
    const defaultPassword = 'temporary123';
    const fixedEmail = 'superadmin@domain.com';

    // Check if SuperAdmin exists, update password or create new
    let superAdmin = await SuperAdmin.findOne({ username: fixedUsername });

    if (superAdmin) {
      superAdmin.password = defaultPassword;
      await superAdmin.save();
    } else {
      await SuperAdmin.create({
        email: fixedEmail,
        username: fixedUsername,
        password: defaultPassword,
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'gounishivakishorreddy@gmail.com',
        pass: 'egtdjbplpblysvab',
      },
      tls: { rejectUnauthorized: false },
    });

    const loginLink = `http://localhost:5173`;

    await transporter.sendMail({
      from: 'gounishivakishorreddy@gmail.com',
      to: 'naveenbanoth018@gmail.com',
      subject: 'SuperAdmin Credentials',
      html: `
        <h3>SuperAdmin Login Details</h3>
        <p><strong>Username:</strong> ${fixedUsername}</p>
        <p><strong>Password:</strong> ${defaultPassword}</p>
        <p>Login here: <a href="${loginLink}">${loginLink}</a></p>
        <p>We recommend changing your password after login.</p>
      `,
    });

    res.status(200).json({
      message: 'Login credentials sent to email',
      username: fixedUsername,
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { username, password, confirmPassword } = req.body;

  // 1. Validate password match
  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // 2. Optional: Enforce strong password
  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must include at least 1 uppercase letter, 1 number, and 1 special character'
    });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await SuperAdmin.findById(decoded.id);

    // 4. Validate username match
    if (!admin || admin.username !== username) {
      return res.status(400).json({ message: 'Invalid token or username' });
    }

    // 5. Set new plain password (no hashing)
    admin.password = password;
    await admin.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ message: 'Token expired or invalid', error: err.message });
  }
};

// GET MY PROFILE
const getMyProfile = async (req, res) => {
  try {
    const user = await SuperAdmin.findById(req.user.id).select('-password -confirmpassword');
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
// CREATE CLIENT
const createClient = async (req, res) => {
    try {
      const {
        organizationName,
        email,
        organizationType,
        gstNumber,
        registrationNumber
      } = req.body;
  
      const allowedOrganizationTypes = ['Private Ltd', 'Public Ltd', 'Sole Proprietor', 'Partnership', 'Software'];
  
      if (
        !organizationName || organizationName.length < 1 || organizationName.length > 40 ||
        !/^[a-zA-Z0-9 ]+$/.test(organizationName)
      ) return res.status(400).send('Invalid organization name');
  
      if (
        !email || email.length < 1 || email.length > 40 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) return res.status(400).send('Invalid email format');
  
      if (
        !organizationType ||
        !allowedOrganizationTypes.includes(organizationType)
      ) return res.status(400).send(`Invalid organization type. Allowed values: ${allowedOrganizationTypes.join(', ')}`);
  
      if (
        !gstNumber || gstNumber.length < 1 || gstNumber.length > 40 ||
        !/^[a-zA-Z0-9]+$/.test(gstNumber)
      ) return res.status(400).send('Invalid GST number');
  
      if (
        !registrationNumber || registrationNumber.length < 1 || registrationNumber.length > 40 ||
        !/^[a-zA-Z0-9]+$/.test(registrationNumber)
      ) return res.status(400).send('Invalid registration number');
  
      const newClient = new Client({
        organizationName,
        email,
        organizationType,
        gstNumber,
        registrationNumber
      });
  
      await newClient.save();
  
      res.status(201).send({ message: 'Client created successfully', client: newClient });
    } catch (error) {
      console.error('Create Client Error:', error);
      res.status(500).send('Server Error');
    }
  };
  

// GET ALL CLIENTS
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json({ clients });
  } catch (error) {
    console.error('Fetch Clients Error:', error);
    res.status(500).send('Server Error');
  }
};

// GET CLIENT BY ID
const getClientById = async (req, res) => {
  try {
    const clientId = req.params.id;

    if (!clientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid client ID format' });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error('Fetch Client By ID Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

const deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    if (!clientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid client ID format' });
    }

    const deletedClient = await Client.findByIdAndDelete(clientId);

    if (!deletedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete Client Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

const updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const updates = req.body;

    // Validate ObjectId
    if (!clientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid client ID format' });
    }

    // Validate fields
    if (updates.organizationName !== undefined) {
      const name = updates.organizationName.trim();
      if (name.length < 1 || name.length > 40 || !/^[a-zA-Z0-9 ]+$/.test(name)) {
        return res.status(400).json({ error: 'Invalid organization name' });
      }
    }

    if (updates.email !== undefined) {
      const email = updates.email.trim();
      if (email.length < 1 || email.length > 40 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    if (updates.organizationType !== undefined && updates.organizationType.trim() === '') {
      return res.status(400).json({ error: 'Organization type cannot be empty' });
    }

    if (updates.gstNumber !== undefined) {
      const gst = updates.gstNumber.trim();
      if (gst.length < 1 || gst.length > 40 || !/^[a-zA-Z0-9]+$/.test(gst)) {
        return res.status(400).json({ error: 'Invalid GST number' });
      }
    }

    if (updates.registrationNumber !== undefined) {
      const reg = updates.registrationNumber.trim();
      if (reg.length < 1 || reg.length > 40 || !/^[a-zA-Z0-9]+$/.test(reg)) {
        return res.status(400).json({ error: 'Invalid registration number' });
      }
    }

    // Update
    const updatedClient = await Client.findByIdAndUpdate(clientId, { $set: updates }, { new: true });

    if (!updatedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({
      message: 'Client updated successfully',
      client: updatedClient
    });

  } catch (error) {
    console.error('PUT Client Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};


// @desc    Deactivate a client by ID
// @route   PATCH /clients/:id/deactivate
// @access  Private
/**
 * @desc    Toggle client status (active <-> inactive)
 * @route   PATCH /clients/:id/toggle-status
 * @access  Private
 */
const toggleClientStatus = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Validate ObjectId format
    if (!clientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid client ID format' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Toggle isActive status
    client.isActive = !client.isActive;
    await client.save();

    res.status(200).json({
      message: `Client ${client.isActive ? 'activated' : 'deactivated'} successfully`,
      client
    });
  } catch (error) {
    console.error('Toggle Client Status Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};


const createRole = async (req, res) => {
  try {
    const { roleName } = req.body;

    if (!roleName || roleName.length < 3 || roleName.length > 30 || !/^[a-zA-Z0-9 _-]+$/.test(roleName)) {
      return res.status(400).json({ error: 'Invalid or missing role name' });
    }

    const existingRole = await Role.findOne({ roleName });
    if (existingRole) {
      return res.status(409).json({ error: 'Role already exists' });
    }

    const newRole = new Role({ roleName });
    await newRole.save();

    res.status(201).json({ message: 'Role created successfully', role: newRole });
  } catch (error) {
    console.error('Create Role Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get all roles
// @route   GET /roles
// @access  Private
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().select('_id roleName'); // fetch only required fields
    res.status(200).json({ roles });
  } catch (error) {
    console.error('Fetch All Roles Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const roleId = req.params.id;
    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.status(200).json({ role });
  } catch (error) {
    console.error('Fetch Role By ID Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};



// @desc    Update a role
// @route   PUT /roles/:id
// @access  Private
const updateRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { roleName } = req.body;

    if (!roleName || roleName.length < 3 || roleName.length > 30 || !/^[a-zA-Z0-9 _-]+$/.test(roleName)) {
      return res.status(400).json({ error: 'Invalid or missing role name' });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      { roleName },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.status(200).json({ message: 'Role updated successfully', role: updatedRole });
  } catch (error) {
    console.error('Update Role Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Delete a role
// @route   DELETE /roles/:id
// @access  Private
const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    const deletedRole = await Role.findByIdAndDelete(roleId);

    if (!deletedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete Role Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

const createMethodology = async (req, res) => {
  try {
    const methodology = new Methodology(req.body);
    await methodology.save();
    res.status(201).json({ message: 'Methodology created successfully', methodology });
  } catch (error) {
    console.error('Create Methodology Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all methodologies
// @route   GET /methodologies
// @access  Private
const getAllMethodologies = async (req, res) => {
  try {
    const methodologies = await Methodology.find();
    res.status(200).json({ methodologies });
  } catch (error) {
    console.error('Fetch Methodologies Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get single methodology
// @route   GET /methodologies/:id
// @access  Private
const getMethodologyById = async (req, res) => {
  try {
    const methodology = await Methodology.findById(req.params.id);
    if (!methodology) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(methodology);
  } catch (error) {
    console.error('Fetch Methodology Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update methodology
// @route   PUT /methodologies/:id
// @access  Private
const updateMethodology = async (req, res) => {
  try {
    const updated = await Methodology.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.status(200).json({ message: 'Updated successfully', methodology: updated });
  } catch (error) {
    console.error('Update Methodology Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete methodology
// @route   DELETE /methodologies/:id
// @access  Private
const deleteMethodology = async (req, res) => {
  try {
    const deleted = await Methodology.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete Methodology Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

const createIssue = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.length < 3) {
      return res.status(400).json({ error: 'Issue name is required and must be at least 3 characters long' });
    }

    const existing = await Issue.findOne({ name });
    if (existing) {
      return res.status(409).json({ error: 'Issue with this name already exists' });
    }

    const issue = new Issue({ name });
    await issue.save();
    res.status(201).json({ message: 'Issue created successfully', issue });
  } catch (error) {
    console.error('Create Issue Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get all issues
// @route   GET /superadmin/issues
// @access  Private
const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.status(200).json({ issues });
  } catch (error) {
    console.error('Get Issues Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid issue ID format' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.status(200).json({ issue });
  } catch (error) {
    console.error('Get Issue by ID Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};


// @desc    Update an issue by ID
// @route   PUT /superadmin/issues/:id
// @access  Private
const updateIssue = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.length < 3) {
      return res.status(400).json({ error: 'New issue name is required and must be at least 3 characters long' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.status(200).json({ message: 'Issue name updated', issue });
  } catch (error) {
    console.error('Update Issue Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Delete an issue by ID
// @route   DELETE /superadmin/issues/:id
// @access  Private
const deleteIssue = async (req, res) => {
  try {
    const deleted = await Issue.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete Issue Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Create a new status
// @route   POST /superadmin/status
// @access  Private
const createStatus = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Status.findOne({ name });
    if (existing) return res.status(400).json({ message: "Status already exists" });

    const status = new Status({ name });
    await status.save();

    res.status(201).json({ message: 'Status created successfully', status });
  } catch (err) {
    console.error('Create Status Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all statuses
// @route   GET /superadmin/status
// @access  Private
const getAllStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();
    res.status(200).json({ statuses });
  } catch (err) {
    console.error('Fetch Statuses Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid status ID format' });
    }

    const status = await Status.findById(id);
    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }

    res.status(200).json({ status });
  } catch (err) {
    console.error('Get Status by ID Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update a status by ID
// @route   PUT /superadmin/status/:id
// @access  Private
const updateStatus = async (req, res) => {
  try {
    const { name } = req.body;

    const status = await Status.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!status) return res.status(404).json({ message: "Status not found" });

    res.status(200).json({ message: 'Status updated successfully', status });
  } catch (err) {
    console.error('Update Status Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete a status by ID
// @route   DELETE /superadmin/status/:id
// @access  Private
const deleteStatus = async (req, res) => {
  try {
    const status = await Status.findByIdAndDelete(req.params.id);
    if (!status) return res.status(404).json({ message: "Status not found" });

    res.status(200).json({ message: "Status deleted successfully" });
  } catch (err) {
    console.error('Delete Status Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// 👉 Priority CRUD
exports.createPriority = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Priority.findOne({ name });
    if (existing) return res.status(400).json({ message: "Priority already exists" });

    const priority = new Priority({ name });
    await priority.save();
    res.status(201).json(priority);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPriorities = async (req, res) => {
  try {
    const priorities = await Priority.find();
    res.json(priorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getPriorityById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid priority ID format' });
    }

    const priority = await Priority.findById(id);
    if (!priority) {
      return res.status(404).json({ error: 'Priority not found' });
    }

    res.status(200).json({ priority });
  } catch (err) {
    console.error('Get Priority by ID Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};


exports.updatePriority = async (req, res) => {
  try {
    const { name } = req.body;
    const priority = await Priority.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!priority) return res.status(404).json({ message: "Priority not found" });
    res.json(priority);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePriority = async (req, res) => {
  try {
    const priority = await Priority.findByIdAndDelete(req.params.id);
    if (!priority) return res.status(404).json({ message: "Priority not found" });
    res.json({ message: "Priority deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Type of Organisation CRUD
exports.createTypeOfOrganisation = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await TypeOfOrganisation.findOne({ name });
    if (existing) return res.status(400).json({ message: "Type already exists" });

    const type = new TypeOfOrganisation({ name });
    await type.save();
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTypesOfOrganisation = async (req, res) => {
  try {
    const types = await TypeOfOrganisation.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTypeOfOrganisation = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await TypeOfOrganisation.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!updated) return res.status(404).json({ message: "Type not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTypeOfOrganisation = async (req, res) => {
  try {
    const deleted = await TypeOfOrganisation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Type not found" });
    res.json({ message: "Type deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Multer setup for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
exports.upload = upload.single('image');

// 👉 Get All Activate/Deactivate Status
exports.getAllActivateStatus = async (req, res) => {
  try {
    const statusList = await ActivateStatus.find();
    res.json(statusList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Edit Activate/Deactivate Status by ID
exports.updateActivateStatus = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await ActivateStatus.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Status not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Delete Activate/Deactivate Status by ID
exports.deleteActivateStatus = async (req, res) => {
  try {
    const deleted = await ActivateStatus.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Status not found" });
    res.json({ message: "Status deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Create Profile
exports.createProfile = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      jobType,
      department,
      organization,
      contact,
      email
    } = req.body;

    const profile = new Profile({
      image: req.file?.filename || '',
      fullName,
      dateOfBirth,
      gender,
      jobType,
      department,
      organization,
      contact,
      email
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Logout (Token to be handled on frontend)
exports.logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};


module.exports = {
  superAdminLogin,
  forgotPassword,
  resetPassword,
  getMyProfile,
  createClient,
  getAllClients,
  getClientById,
  deleteClient,
  updateClient,
  toggleClientStatus,
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  createMethodology,
  getAllMethodologies,
  getMethodologyById,
  updateMethodology,
  deleteMethodology,
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  createStatus,
  getAllStatuses,
  getStatusById,
  updateStatus,
  deleteStatus,
  createPriority,
  getPriorities,
  getPriorityById,
  updatePriority,
  deletePriority,
  createTypeOfOrganisation,
  getTypeOfOrganisation,
  updateTypeOfOrganisation,
  deleteTypeOfOrganisation
};


const express = require('express');
const router = express.Router();
const auth = require('./middleware');
const superAdminController = require('../controllers/superAdminController');

router.post('/login', superAdminController.superAdminLogin);
router.post('/forgot-password', superAdminController.forgotPassword);
router.post('/reset-password/:token', superAdminController.resetPassword);

router.get('/myprofile', auth, superAdminController.getMyProfile);
router.post('/clients', superAdminController.createClient);
router.get('/clientsdata', superAdminController.getAllClients);
router.get('/clientsdata/:id', superAdminController.getClientById);
router.delete('/clients/:id', deleteClient);
router.put('/clients/:id', SuperAdminController.updateClient);
router.patch('/clients/:id/toggle-status', SuperAdminController.toggleClientStatus);
router.post('/roles', createRole);
router.get('/roles/:id', superAdminController.getAllRoles);
router.get('/roles/:id', superAdminController.getRoleById);

router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);
router.post('/methodologies', createMethodology);
router.get('/methodologies', getAllMethodologies);
router.get('/methodologies/:id', getMethodologyById);
router.put('/methodologies/:id', updateMethodology);
router.delete('/methodologies/:id', deleteMethodology)
// In your routes setup
app.post('/superadmin/issues', createIssue);
app.get('/superadmin/issues', getAllIssues);
router.get('/issues/:id', getIssueById);
app.put('/superadmin/issues/:id', updateIssue);
app.delete('/superadmin/issues/:id', deleteIssue);
app.post('/superadmin/issues', createStatus);
app.get('/superadmin/issues',  getAllStatuses);
router.get('/status/:id', getStatusById);
app.put('/superadmin/issues/:id', updateStatus);
app.delete('/superadmin/issues/:id', deleteStatus);

// Priority Routes
router.post('/priority', createPriority);
router.get('/priority', getPriorities);
router.get('/priority/:id', getPriorityById);
router.put('/priority/:id', updatePriority);
router.delete('/priority/:id', deletePriority);

// Type of Organisation Routes
router.post('/type-of-organisation', createTypeOfOrganisation);
router.get('/type-of-organisation', getTypesOfOrganisation);
router.put('/type-of-organisation/:id',updateTypeOfOrganisation);
router.delete('/type-of-organisation/:id', deleteTypeOfOrganisation);

router.get('/activate-status', getAllActivateStatus);
router.put('/activate-status/:id', updateActivateStatus);
router.delete('/activate-status/:id', deleteActivateStatus);

// 👉 Profile Routes
router.post('/profile',upload, createProfile);

// 👉 Logout Route
router.post('/logout', logout);




module.exports = router;
