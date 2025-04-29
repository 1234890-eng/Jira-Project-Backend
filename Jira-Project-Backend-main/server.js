const nodemailer = require('nodemailer'); // at the top
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserCreation = require('./Model/model');
const jwt = require('jsonwebtoken');
//const middleware = require('./middleware');
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const PasswordResetToken = require('./PasswordResetToken');
const Client = require('./Model/Client');
const setupSwaggerDocs = require('./swagger');
//const verifyToken = require('./verifyToken')
const MethodologyName = require('./MethodologyName')
const Issue = require('./Issue');
const Status = require('./Status');
const Priority = require('./Priority');
const TypeOfOrganisation = require('./TypeOfOragnisation');
const ActivateStatus = require('./ActivateStatus');
const Profile = require('./Profile');
const Role = require('./Model/Role');
const MethodologyField = require('./methodologyField')
const index = require('./index');





app.use(express.json());
app.use(cors());
app.use(cors({
  origin: "http://192.168.0.7:3001", // Match the frontend's origin exactly
  origin: 'https://jira-project-backend-done.onrender.com',  // Render production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow the HTTP methods that you need
  credentials: true, // Optional: if you're using cookies
}));

app.use('/admin', index);



const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jira Tracker API',
      version: '1.0.0',
      description: 'API documentation for Jira Tracker Backend',
    },
    servers: [
      {
        url: 'https://jira-project-backend-done.onrender.com',
      },
    ],
    
  },
  apis: ['./routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.connect("mongodb+srv://shiva123:Tinku%40890@cluster0.aqepzbj.mongodb.net/", {
})
.then(() => console.log('DB Connection established'))
.catch(err => console.error('DB connection error:', err));


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'gounishivakishorreddy@gmail.com',
    pass: 'egtdjbplpblysvab'
  }
});

// Now inside your route
app.post('/send-userid-mail', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await UserCreation.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const randomNumber = Math.floor(100 + Math.random() * 900);
    const userId = `SuperAdmin${randomNumber}`;

    const newUser = new UserCreation({
      email,
      password: "dummy234",
      userId,
      role: 'SuperAdmin'
    });
    await newUser.save();

    const mailOptions = {
      from: 'gounishivakishorreddy@gmail.com',
      to: 'naveenb.rfchh@gmail.com',
      subject: 'Your SuperAdmin UserID',
      html: `<p>Dear SuperAdmin,</p>
             <p>Your UserID is: <b>${userId}</b></p>
             <p>Use this UserID to verify and reset your password.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'UserID sent successfully to email', userId });
  } catch (error) {
    console.error('Error sending mail:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


const crypto = require('crypto');

// Generate OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();  // Generates a 6-digit OTP
}

// Send OTP to email
app.post('/send-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'UserID is required' });
    }

    // Find user by UserID
    const user = await UserCreation.findOne({ userId });
    if (!user) {
      return res.status(400).json({ message: 'Invalid UserID' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);  // OTP valid for 10 minutes

    // Save OTP and expiry in the database
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: 'gounishivakishorreddy@gmail.com',
      to: 'naveenb.rfchh@gmail.com',
      subject: 'Your OTP for SuperAdmin Login',
      html: `<p>Dear SuperAdmin,</p>
             <p>Your OTP is: <b>${otp}</b></p>
             <p>This OTP is valid for 10 minutes only.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


// Route: Reset SuperAdmin password without token

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.userId; // Attach userId to request
    req.userRole = decoded.role;    
    next(); // Proceed to the next middleware or route handler
  });
};

// Verify OTP API
app.post('/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Get the userId from the database (based on the OTP)
    const user = await UserCreation.findOne({ otp });
    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.userId }, 'your-secret-key', { expiresIn: '1h' });

    // Send the token to the client
    res.status(200).json({ message: 'OTP verified successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});


app.post('/reset-password', verifyToken, async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Find the user based on the userId extracted from the token
    const user = await UserCreation.findOne({ userId: req.userId }); // req.userId comes from the JWT token in the header
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password before saving it
    const hashedPassword = bcrypt.hashSync(newPassword, 10); // Adjust salt rounds as needed

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});




// Login Route (Using userId and password)
app.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Check if userId and password are provided
    if (!userId || !password) {
      return res.status(400).json({ message: 'userId and password are required' });
    }

    // Find the user by userId
    const user = await UserCreation.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid userId or password' });
    }

    // Compare the password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid userId or password' });
    }

    // Generate a JWT token with the userId and role
    const token = jwt.sign(
      { userId: user.userId, role: user.role }, // Include userId and role in token payload
      'your-secret-key', // Secret key for signing the token
      { expiresIn: '1h' } // Token expiration time (1 hour)
    );

    // Respond with the token
    res.status(200).json({
      message: 'Login successful',
      token: token, // Send the token to the client
    });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};


app.get('/super-admin-dashboard', verifyToken, checkRole('SuperAdmin'), async (req, res) => {
  // Check if the userId matches the one in the token, in case you want to enforce user-specific access
  const userIdFromToken = req.userId;  // This userId comes from the token

  // In case this is a user-specific dashboard, you can fetch the user from DB
  const user = await UserCreation.findOne({ userId: userIdFromToken });
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({ message: 'Welcome to the Super Admin Dashboard' });
});

app.get('/admin-dashboard', verifyToken, checkRole('Admin'), async (req, res) => {
  const userIdFromToken = req.userId;

  try {
    const user = await UserCreation.findOne({ userId: userIdFromToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Welcome to the Admin Dashboard' });
  } catch (error) {
    console.error('Error accessing Admin Dashboard:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


/*app.get('/myprofile', middleware, async (req, res) => {
  try {
    const user = await SuperAdmin.findById(req.user.id).select('-password -confirmpassword');
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});*/


app.post('/clients', verifyToken, checkRole('SuperAdmin'), async (req, res) => {
  try {
    const { organizationName, email, organizationType, gstNumber, registrationNumber, isActive, adminEmail } = req.body;

    // Validate required fields
    if (!organizationName || !email || !organizationType || !gstNumber || !registrationNumber || !adminEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new client
    const newClient = new Client({
      organizationName,
      email,
      organizationType,
      gstNumber,
      registrationNumber,
      isActive,
      createdBy: req.userId, // SuperAdmin's ID
      createdByRole: req.userRole, // SuperAdmin's role
    });

    await newClient.save();

    // Check if the Admin exists
    let admin = await UserCreation.findOne({ email, role: 'Admin' });

    const randomNumber = Math.floor(100 + Math.random() * 900);
    const userId = `SuperAdmin${randomNumber}`;

    if (!admin) {
      // If Admin does not exist, create a new Admin user
      const userId = new mongoose.Types.ObjectId(); // Generate new ObjectId for Admin
      const newUser = new UserCreation({
        email,
        password: 'dummy234', // Dummy password (you may want to add proper password handling later)
        userId,
        role: 'Admin',
      });
      await newUser.save();

      // Send email to the newly created Admin
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'gounishivakishorreddy@gmail.com',
          pass: 'egtdjbplpblysvab'
        },
      });

      const mailOptions = {
        from: 'gounishivakishorreddy@gmail.com',
        to: adminEmail,
        subject: 'New Admin Account Created',
        text: `Your new admin account has been created successfully. Your User ID: ${userId} .`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }

    res.status(201).json({ message: 'Client created successfully', client: newClient });

  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/clients', verifyToken, checkRole('SuperAdmin'), async (req, res) => {
  try {
    // Fetch all clients
    const clients = await Client.find(); // You can add filters if needed, like pagination

    if (!clients) {
      return res.status(404).json({ message: 'No clients found' });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/clients/:id', async (req, res) => {
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

    res.status(200).json(client);
  } catch (error) {
    console.error('Fetch Client By ID Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.put('/clients/:id', verifyToken, checkRole('SuperAdmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationName, email, organizationType, gstNumber, registrationNumber, isActive } = req.body;

    // Find the client by ID
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update client details
    client.organizationName = organizationName || client.organizationName;
    client.email = email || client.email;
    client.organizationType = organizationType || client.organizationType;
    client.gstNumber = gstNumber || client.gstNumber;
    client.registrationNumber = registrationNumber || client.registrationNumber;
    client.isActive = isActive || client.isActive;

    // Save the updated client
    await client.save();

    res.status(200).json({ message: 'Client updated successfully', client });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.delete('/clients/:id', verifyToken, checkRole('SuperAdmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Find the client by ID
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete the client
    await Client.findByIdAndDelete(id);

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Deactivate client
app.patch('/clients/:id/toggle-status', async (req, res) => {
  try {
    const clientId = req.params.id;

    // Validate Mongo ObjectId format
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
});

app.post('/roles', verifyToken, checkRole("SuperAdmin", "Admin"), async (req, res) => {
  try {
    const { roleName } = req.body;

    const newRole = new Role({
      roleName,
      createdBy: req.userId,
      createdByRole: req.userRole
    });

    await newRole.save();
    res.status(201).json({ message: 'Role created successfully', role: newRole });

  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/getroles', verifyToken, async (req, res) => {
  try {
    let roles;

    if (req.userRole === 'SuperAdmin') {
      // SuperAdmin should only see roles created by SuperAdmin
      roles = await Role.find({ createdByRole: 'SuperAdmin' });
    } else if (req.userRole === 'Admin') {
      // Admin should see roles created by Admin and SuperAdmin
      roles = await Role.find({
        $or: [
          { createdByRole: 'Admin' },
          { createdByRole: 'SuperAdmin' }
        ]
      });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/editroles/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName } = req.body;

    // Find the role to update
    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Access control:
    // - SuperAdmin can update roles they created
    // - Admin can update only roles they created
    if (
      (req.userRole === 'SuperAdmin' && role.createdByRole !== 'SuperAdmin') ||
      (req.userRole === 'Admin' && role.createdBy !== req.userId)
    ) {
      return res.status(403).json({ message: 'Access denied to edit this role' });
    }

    // Perform the update
    role.roleName = roleName || role.roleName;
    await role.save();

    res.status(200).json({ message: 'Role updated successfully', role });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.delete('/deleteroles/:id', verifyToken, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) return res.status(404).json({ message: 'Role not found' });

    if (req.userRole === 'Admin' && role.createdByRole === 'SuperAdmin') {
      return res.status(403).json({ message: 'Admins cannot delete SuperAdmin-created roles' });
    }

    await Role.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Role deleted successfully' });

  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





app.post('/methodology-names', async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await MethodologyName.findOne({ name });
    if (exists) return res.status(400).json({ error: 'Name already exists' });

    const newName = new MethodologyName({ name });
    await newName.save();

    res.status(201).json({ message: 'Methodology name created', newName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST: Create Methodology Field
// POST: Create Methodology Fields for a specific Methodology Name
app.post('/methodology-fields/by-methodology/:name', async (req, res) => {
  try {
    const {
      taskTitle, 
      dueDate, 
      priority, 
      status, 
      wipLimit, 
      issueType, 
      isBlocked, 
      blockedReason
    } = req.body;

    // Find the methodology by its name
    const methodology = await MethodologyName.findOne({ name: req.params.name });

    if (!methodology) {
      return res.status(404).json({ message: 'Methodology Name not found' });
    }

    // If task is blocked, blockedReason must be given
    if (isBlocked && !blockedReason) {
      return res.status(400).json({ error: 'Blocked reason is required if task is blocked' });
    }

    // Create a new field
    const newField = new MethodologyField({
      methodologyNameId: methodology._id,  // Use methodology ID to associate fields
      taskTitle,
      dueDate,
      priority,
      status,
      wipLimit,
      issueType,
      isBlocked,
      blockedReason
    });

    // Save the new field
    await newField.save();

    res.status(201).json({ message: 'Methodology field created successfully', field: newField });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});


// PUT: Update Methodology Name
// PUT: Update Methodology Fields for a specific Methodology Name
// PUT: Update Methodology Fields for a specific Methodology Name
app.put('/methodology-fields/by-methodology/:name', async (req, res) => {
  try {
    const {
      taskTitle, 
      dueDate, 
      priority, 
      status, 
      wipLimit, 
      issueType, 
      isBlocked, 
      blockedReason
    } = req.body;

    // Find the methodology by its name
    const methodology = await MethodologyName.findOne({ name: req.params.name });

    if (!methodology) {
      return res.status(404).json({ message: 'Methodology Name not found' });
    }

    // Find all fields related to this methodology name
    const fields = await MethodologyField.find({ methodologyNameId: methodology._id });

    // If no fields found, return a message
    if (fields.length === 0) {
      return res.status(404).json({ message: 'No fields found for this methodology name' });
    }

    // Update each field related to the methodology
    for (let field of fields) {
      // Update field properties with new values
      field.taskTitle = taskTitle || field.taskTitle;
      field.dueDate = dueDate || field.dueDate;
      field.priority = priority || field.priority;
      field.status = status || field.status;
      field.wipLimit = wipLimit || field.wipLimit;
      field.issueType = issueType || field.issueType;
      field.isBlocked = isBlocked || field.isBlocked;
      field.blockedReason = blockedReason || field.blockedReason;

      // Save the updated field
      await field.save();
    }

    res.json({ message: 'Methodology fields updated successfully', fields });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// DELETE: Delete Methodology Fields for a specific Methodology Name
app.delete('/methodology-fields/by-methodology/:name', async (req, res) => {
  try {
    // Find the methodology by its name
    const methodology = await MethodologyName.findOne({ name: req.params.name });

    if (!methodology) {
      return res.status(404).json({ message: 'Methodology Name not found' });
    }

    // Delete all fields related to this methodology name
    const deletedFields = await MethodologyField.deleteMany({ methodologyNameId: methodology._id });

    if (deletedFields.deletedCount === 0) {
      return res.status(404).json({ message: 'No fields found for this methodology name' });
    }

    // Optionally, delete the methodology name itself if needed
    // const deletedMethodology = await MethodologyName.findByIdAndDelete(methodology._id);
    // if (deletedMethodology) {
    //   return res.json({ message: 'Methodology name and its fields deleted successfully' });
    // }

    res.json({ message: 'Methodology fields deleted successfully', deletedCount: deletedFields.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});


app.get('/methodology-names', async (req, res) => {
  try {
    const names = await MethodologyName.find();
    res.json(names);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/methodology-fields/:methodologyNameId', async (req, res) => {
  try {
    const { methodologyNameId } = req.params;
    const fields = await MethodologyField.find({ methodologyNameId });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post('/issues', async (req, res) => {
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
});

app.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.status(200).json({ issues });
  } catch (error) {
    console.error('Get Issues Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/issues/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid issue ID format' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.status(200).json({ issue });
  } catch (error) {
    console.error('Get Issue Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});


app.put('/issues/:id', async (req, res) => {
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
});

app.delete('/issues/:id', async (req, res) => {
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
});

// routes/statusRoutes.js

// Create Status
app.post('/status', async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Status.findOne({ name });
    if (existing) return res.status(400).json({ message: "Status already exists" });

    const status = new Status({ name });
    await status.save();

    res.status(201).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Statuses
app.get('/status', async (req, res) => {
  try {
    const statuses = await Status.find();
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
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
});


// Edit Status by ID
app.put('/status/:id', async (req, res) => {
  try {
    const { name } = req.body;

    const status = await Status.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!status) return res.status(404).json({ message: "Status not found" });

    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Status by ID
app.delete('/status/:id', async (req, res) => {
  try {
    const status = await Status.findByIdAndDelete(req.params.id);
    if (!status) return res.status(404).json({ message: "Status not found" });

    res.json({ message: "Status deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 👉 Create Priority
app.post('/priority', async (req, res) => {
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
});

// 👉 Get All Priorities
app.get('/priority', async (req, res) => {
  try {
    const priorities = await Priority.find();
    res.json(priorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/priority/:id', async (req, res) => {
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
});


// 👉 Edit Priority by ID
app.put('/priority/:id', async (req, res) => {
  try {
    const { name } = req.body;

    const priority = await Priority.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!priority) return res.status(404).json({ message: "Priority not found" });

    res.json(priority);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 Delete Priority by ID
app.delete('/priority/:id', async (req, res) => {
  try {
    const priority = await Priority.findByIdAndDelete(req.params.id);
    if (!priority) return res.status(404).json({ message: "Priority not found" });

    res.json({ message: "Priority deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 Create Type of Organisation
app.post('/type-of-organisation', async (req, res) => {
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
});

// 👉 Get All Types of Organisation
app.get('/type-of-organisation', async (req, res) => {
  try {
    const types = await TypeOfOrganisation.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/type-of-organisation/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid type ID format' });
    }

    const type = await TypeOfOrganisation.findById(id);
    if (!type) {
      return res.status(404).json({ error: 'Type of Organisation not found' });
    }

    res.status(200).json({ type });
  } catch (error) {
    console.error('Error fetching Type of Organisation by ID:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});


// 👉 Edit Type of Organisation by ID
app.put('/type-of-organisation/:id', async (req, res) => {
  try {
    const { name } = req.body;

    const updated = await TypeOfOrganisation.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Type not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 Delete Type of Organisation by ID
app.delete('/type-of-organisation/:id', async (req, res) => {
  try {
    const deleted = await TypeOfOrganisation.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Type not found" });

    res.json({ message: "Type deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 Create Activate/Deactivate Status
app.post('/api/activate-status', async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await ActivateStatus.findOne({ name });
    if (existing) return res.status(400).json({ message: "Status already exists" });

    const status = new ActivateStatus({ name });
    await status.save();

    res.status(201).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 Get All Activate/Deactivate Status
app.get('/api/activate-status', async (req, res) => {
  try {
    const statusList = await ActivateStatus.find();
    res.json(statusList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 Edit Activate/Deactivate Status by ID
app.put('/api/activate-status/:id', async (req, res) => {
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
});

// 👉 Delete Activate/Deactivate Status by ID
app.delete('/api/activate-status/:id', async (req, res) => {
  try {
    const deleted = await ActivateStatus.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Status not found" });

    res.json({ message: "Status deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });



// 👉 Create Profile
app.post('/api/profile', upload.single('image'), async (req, res) => {
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
});

app.post('/api/logout', (req, res) => {
  // Frontend should just clear the token
  res.json({ message: "Logged out successfully" });
});


const PORT =  3000;


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`Server running on http://192.168.109.247:${PORT}`); // Still relevant for local access
  console.log(`Swagger Docs at http://localhost:${PORT}/api-docs`);
  console.log(`Swagger Docs at http://127.0.0.1:${PORT}/api-docs`);
  console.log(`Swagger Docs at http://192.168.109.247:${PORT}/api-docs`);
  console.log(`Swagger Docs (Localhost): http://localhost:${PORT}/api-docs`);
console.log(`Swagger Docs (LAN): http://192.168.109.247:${PORT}/api-docs`);
console.log(`Swagger Docs (Public IP - test): http://49.204.45.122:${PORT}/api-docs`);

});
