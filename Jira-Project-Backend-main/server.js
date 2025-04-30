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
const Issue = require('./Model/Issue');
const Status = require('./Model/Status');
const Priority = require('./Model/Priority');
const TypeOfOrganisation = require('./Model/TypeOfOrganization');
const ActivateStatus = require('./Model/ActiveStatus');
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




app.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'userId and password are required' });
    }

    // Find the user
    const user = await UserCreation.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid userId or password' });
    }

    // Check if the user's password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid userId or password' });
    }

    // If Admin, check if their associated client is active
    if (user.role === 'Admin') {
      const client = await Client.findOne({ email: user.email });

      if (client && !client.isActive) {
        return res.status(403).json({ message: 'Your organization is deactivated. Please contact SuperAdmin.' });
      }
    }

    // Generate a token if everything is valid
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
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


app.get('/dashboard', verifyToken, async (req, res) => {
  const userIdFromToken = req.userId;
  const userRoleFromToken = req.userRole;

  try {
    const user = await UserCreation.findOne({ userId: userIdFromToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userRoleFromToken === 'SuperAdmin') {
      return res.status(200).json({ message: 'Welcome to the Super Admin Dashboard' });
    } else if (userRoleFromToken === 'Admin') {
      return res.status(200).json({ message: 'Welcome to the Admin Dashboard' });
    } else {
      return res.status(403).json({ message: 'Access Denied: Invalid Role' });
    }

  } catch (error) {
    console.error('Error accessing Dashboard:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





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

app.get('/getclients', verifyToken, checkRole('SuperAdmin'), async (req, res) => {
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


app.get('/getclients/:id', verifyToken, checkRole('SuperAdmin'), async (req, res) => {
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


app.delete('/deleteclients/:id', verifyToken, checkRole('SuperAdmin'), async (req, res) => {
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
app.patch('/activateclients/:id/status', verifyToken, checkRole('SuperAdmin'), async (req, res) => {
  try {
    const clientId = req.params.id;
    const { isActive } = req.body;

    if (!clientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid client ID format' });
    }

    // Validate isActive is boolean
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be true or false' });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { isActive },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({ message: `Client ${isActive ? 'activated' : 'deactivated'} successfully`, client: updatedClient });
  } catch (error) {
    console.error('Activate/Deactivate Client Error:', error);
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

app.get('/getroles/:id', verifyToken, async (req, res) => {
  try {
    const roleId = req.params.id;

    // Validate ObjectId format
    if (!roleId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Role ID format' });
    }

    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Access control: check if user can see this role
    if (
      req.userRole === 'SuperAdmin' && role.createdByRole === 'SuperAdmin'
    ) {
      return res.status(200).json(role);
    }

    if (
      req.userRole === 'Admin' &&
      (role.createdByRole === 'Admin' || role.createdByRole === 'SuperAdmin')
    ) {
      return res.status(200).json(role);
    }

    return res.status(403).json({ message: 'Access denied to this role' });

  } catch (error) {
    console.error('Error fetching role by ID:', error);
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


app.post('/issues', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Issue name is required' });
    }

    const newIssue = new Issue({
      name,
      createdByUserId: req.userId,
      createdByRole: req.userRole
    });

    await newIssue.save();
    res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
  } catch (error) {
    console.error('Create Issue Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.get('/createissues', verifyToken, async (req, res) => {
  try {
    let issues;

    if (req.userRole === 'SuperAdmin') {
      // SuperAdmin sees only their own issues
      issues = await Issue.find({ createdByRole: 'SuperAdmin' });
    } else if (req.userRole === 'Admin') {
      // Admin sees both their own and SuperAdmin's issues
      issues = await Issue.find({
        $or: [
          { createdByRole: 'Admin' },
          { createdByRole: 'SuperAdmin' }
        ]
      });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(issues);
  } catch (error) {
    console.error('Get Issues Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.put('/editissues/:id', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    if (!name) {
      return res.status(400).json({ message: 'Issue name is required' });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Admin can only edit their own issues
    if (req.userRole === 'Admin' && issue.createdByRole !== 'Admin') {
      return res.status(403).json({ message: 'Admins can only edit their own issues' });
    }

    issue.name = name;
    await issue.save();

    res.status(200).json({ message: 'Issue updated successfully', issue });
  } catch (error) {
    console.error('Update Issue Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.delete('/deleteissues/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Admin can only delete their own issues
    if (req.userRole === 'Admin' && issue.createdByRole !== 'Admin') {
      return res.status(403).json({ message: 'Admins can only delete their own issues' });
    }

    await issue.deleteOne();
    res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete Issue Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// routes/statusRoutes.js

// Create Status
app.post('/createstatus', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Status name is required' });
    }

    const newStatus = new Status({
      name,
      createdBy: req.userId,        // From verifyToken middleware
      createdByRole: req.userRole   // 'Admin' or 'SuperAdmin'
    });

    await newStatus.save();

    res.status(201).json({ message: 'Status created successfully', status: newStatus });
  } catch (error) {
    console.error('Create Status Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/getstatus', verifyToken, async (req, res) => {
  try {
    let statuses;

    if (req.userRole === 'Admin') {
      statuses = await Status.find({
        $or: [
          { createdByRole: 'Admin' },
          { createdByRole: 'SuperAdmin' }
        ]
      });
    } else if (req.userRole === 'SuperAdmin') {
      statuses = await Status.find({ createdByRole: 'SuperAdmin' });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(statuses);
  } catch (error) {
    console.error('Fetch Status Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get All Statuses

// Edit Status by ID
app.put('/editstatus/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const status = await Status.findById(id);
    if (!status) return res.status(404).json({ message: 'Status not found' });

    if (req.userRole === 'Admin' && status.createdByRole !== 'Admin') {
      return res.status(403).json({ message: 'Admins cannot edit SuperAdmin-created statuses' });
    }

    status.name = name || status.name;
    await status.save();

    res.status(200).json({ message: 'Status updated successfully', status });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Delete Status by ID
app.delete('/deletestatuses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const status = await Status.findById(id);
    if (!status) return res.status(404).json({ message: 'Status not found' });

    if (req.userRole === 'Admin' && status.createdByRole !== 'Admin') {
      return res.status(403).json({ message: 'Admins cannot delete SuperAdmin-created statuses' });
    }

    await Status.findByIdAndDelete(id);
    res.status(200).json({ message: 'Status deleted successfully' });
  } catch (error) {
    console.error('Delete Status Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// 👉 Create Priority
app.post('/createpriority', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Priority name is required' });
    }

    const newPriority = new Priority({
      name,
      createdBy: req.userId,
      createdByRole: req.userRole
    });

    await newPriority.save();

    res.status(201).json({ message: 'Priority created successfully', priority: newPriority });
  } catch (error) {
    console.error('Error creating priority:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// 👉 Get All Priorities
app.get('/getpriority', verifyToken, async (req, res) => {
  try {
    let query = {};

    if (req.userRole === 'Admin') {
      query.createdByRole = { $in: ['Admin', 'SuperAdmin'] };
    } else if (req.userRole === 'SuperAdmin') {
      query.createdByRole = 'SuperAdmin';
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const priorities = await Priority.find(query);
    res.status(200).json(priorities);
  } catch (error) {
    console.error('Error fetching priorities:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// 👉 Edit Priority by ID
app.put('/editpriority/:id', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    const priority = await Priority.findById(req.params.id);
    if (!priority) {
      return res.status(404).json({ message: 'Priority not found' });
    }

    if (req.userRole === 'Admin' && priority.createdByRole === 'SuperAdmin') {
      return res.status(403).json({ message: 'Admins cannot edit priorities created by SuperAdmin' });
    }

    priority.name = name || priority.name;
    await priority.save();

    res.status(200).json({ message: 'Priority updated successfully', priority });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// 👉 Delete Priority by ID
app.delete('/deletepriority/:id', verifyToken, async (req, res) => {
  try {
    const priority = await Priority.findById(req.params.id);
    if (!priority) {
      return res.status(404).json({ message: 'Priority not found' });
    }

    if (req.userRole === 'Admin' && priority.createdByRole === 'SuperAdmin') {
      return res.status(403).json({ message: 'Admins cannot delete priorities created by SuperAdmin' });
    }

    await Priority.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Priority deleted successfully' });
  } catch (error) {
    console.error('Error deleting priority:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 👉 Create Type of Organisation
app.post('/typeoforganization', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name of the organization type is required' });
    }

    const newTypeOfOrganization = new TypeOfOrganization({
      name,
      createdBy: req.userId,
      createdByRole: req.userRole
    });

    await newTypeOfOrganization.save();

    res.status(201).json({ message: 'Type of Organization created successfully', typeOfOrganization: newTypeOfOrganization });
  } catch (error) {
    console.error('Error creating Type of Organization:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// 👉 Get All Types of Organisation
app.get('/typeoforganization', verifyToken, async (req, res) => {
  try {
    let query = {};

    if (req.userRole === 'Admin') {
      query.createdByRole = { $in: ['Admin', 'SuperAdmin'] };
    } else if (req.userRole === 'SuperAdmin') {
      query.createdByRole = 'SuperAdmin';
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const typeOfOrganizations = await TypeOfOrganization.find(query);
    res.status(200).json(typeOfOrganizations);
  } catch (error) {
    console.error('Error fetching Type of Organization:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// 👉 Edit Type of Organisation by ID
app.put('/typeoforganization/:id', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    const typeOfOrganization = await TypeOfOrganization.findById(req.params.id);
    if (!typeOfOrganization) {
      return res.status(404).json({ message: 'Type of Organization not found' });
    }

    // Admin can't edit SuperAdmin-created TypeOfOrganization
    if (req.userRole === 'Admin' && typeOfOrganization.createdByRole === 'SuperAdmin') {
      return res.status(403).json({ message: 'Admins cannot edit TypeOfOrganization created by SuperAdmin' });
    }

    typeOfOrganization.name = name || typeOfOrganization.name;
    await typeOfOrganization.save();

    res.status(200).json({ message: 'Type of Organization updated successfully', typeOfOrganization });
  } catch (error) {
    console.error('Error updating Type of Organization:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// 👉 Delete Type of Organisation by ID
app.delete('/typeoforganization/:id', verifyToken, async (req, res) => {
  try {
    const typeOfOrganization = await TypeOfOrganization.findById(req.params.id);
    if (!typeOfOrganization) {
      return res.status(404).json({ message: 'Type of Organization not found' });
    }

    // Admin can't delete SuperAdmin-created TypeOfOrganization
    if (req.userRole === 'Admin' && typeOfOrganization.createdByRole === 'SuperAdmin') {
      return res.status(403).json({ message: 'Admins cannot delete TypeOfOrganization created by SuperAdmin' });
    }

    await TypeOfOrganization.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Type of Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting Type of Organization:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 👉 Create Activate/Deactivate Status
app.post('/activestatus', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name of the active status is required' });
    }

    const newActiveStatus = new ActiveStatus({
      name,
      createdBy: req.userId,
      createdByRole: req.userRole
    });

    await newActiveStatus.save();

    res.status(201).json({ message: 'Active Status created successfully', activeStatus: newActiveStatus });
  } catch (error) {
    console.error('Error creating Active Status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// 👉 Get All Activate/Deactivate Status
app.get('/activestatus', verifyToken, async (req, res) => {
  try {
    let query = {};

    if (req.userRole === 'Admin') {
      query.createdByRole = { $in: ['Admin', 'SuperAdmin'] };
    } else if (req.userRole === 'SuperAdmin') {
      query.createdByRole = 'SuperAdmin';
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const activeStatuses = await ActiveStatus.find(query);
    res.status(200).json(activeStatuses);
  } catch (error) {
    console.error('Error fetching Active Status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// 👉 Edit Activate/Deactivate Status by ID
app.put('/activestatus/:id', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    const activeStatus = await ActiveStatus.findById(req.params.id);
    if (!activeStatus) {
      return res.status(404).json({ message: 'Active Status not found' });
    }

    // Admin can't edit SuperAdmin-created ActiveStatus
    if (req.userRole === 'Admin' && activeStatus.createdByRole === 'SuperAdmin') {
      return res.status(403).json({ message: 'Admins cannot edit ActiveStatus created by SuperAdmin' });
    }

    activeStatus.name = name || activeStatus.name;
    await activeStatus.save();

    res.status(200).json({ message: 'Active Status updated successfully', activeStatus });
  } catch (error) {
    console.error('Error updating Active Status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// 👉 Delete Activate/Deactivate Status by ID
app.delete('/activestatus/:id', verifyToken, async (req, res) => {
  try {
    const activeStatus = await ActiveStatus.findById(req.params.id);
    if (!activeStatus) {
      return res.status(404).json({ message: 'Active Status not found' });
    }

    // Admin can't delete SuperAdmin-created ActiveStatus
    if (req.userRole === 'Admin' && activeStatus.createdByRole === 'SuperAdmin') {
      return res.status(403).json({ message: 'Admins cannot delete ActiveStatus created by SuperAdmin' });
    }

    await ActiveStatus.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Active Status deleted successfully' });
  } catch (error) {
    console.error('Error deleting Active Status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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
