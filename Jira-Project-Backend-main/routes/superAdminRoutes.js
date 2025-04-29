
const {
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
} = require('../controllers/superAdminController');

// Swagger annotations here...

router.post('/superadmin/login', superAdminLogin);
router.post('/superadmin/forgot-password', forgotPassword);
router.post('/superadmin/reset-password/:token', resetPassword);

router.get('/myprofile', auth, getMyProfile);
router.post('/clients', auth, createClient);
router.get('/clientsdata', auth, getAllClients);
router.get('/clientsdata/:id', auth, getClientById);
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
router.delete('/methodologies/:id', deleteMethodology);
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
router.post('/priority', createPriority);
router.get('/priority/:id', getPriorityById);


module.exports = router;

/**
 * @swagger
 * tags:
 *   name: SuperAdmin
 *   description: Super Admin Authentication & Password Reset
 */

/**
 * @swagger
 * /superadmin/login:
 *   post:
 *     summary: Super Admin Login
 *     tags: [SuperAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */


/**
 * @swagger
 * /superadmin/forgot-password:
 *   post:
 *     summary: Send fixed SuperAdmin login credentials to email
 *     tags: [SuperAdmin]
 *     responses:
 *       200:
 *         description: Credentials sent successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /superadmin/reset-password:
 *   post:
 *     summary: Reset Password using token
 *     tags: [SuperAdmin]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Reset token sent via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, confirmPassword]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password mismatch
 */

/**
 * @swagger
 * /myprofile:
 *   get:
 *     summary: Get Super Admin Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the profile of the logged-in Super Admin
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *               - email
 *               - organizationType
 *               - gstNumber
 *               - registrationNumber
 *             properties:
 *               organizationName:
 *                 type: string
 *               email:
 *                 type: string
 *               organizationType:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               registrationNumber:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Client created successfully
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: List of clients fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       organizationName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       organizationType:
 *                         type: string
 *                       gstNumber:
 *                         type: string
 *                       registrationNumber:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 */
/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The client ID (MongoDB ObjectId format)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 organizationName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 organizationType:
 *                   type: string
 *                 gstNumber:
 *                   type: string
 *                 registrationNumber:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *       400:
 *         description: Invalid client ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid client ID format
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Client not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Delete a client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       400:
 *         description: Invalid client ID format
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
router.delete('/clients/:id', deleteClient);

/**
 * @swagger
 * /superadmin/clients/{id}:
 *   put:
 *     summary: Update a client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the client to update
 *         schema:
 *           type: string
 *           example: 6430ebc59328f4d3fc3d8db3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: Tech Solutions
 *               email:
 *                 type: string
 *                 example: tech@example.com
 *               organizationType:
 *                 type: string
 *                 example: Private
 *               gstNumber:
 *                 type: string
 *                 example: GSTIN1234
 *               registrationNumber:
 *                 type: string
 *                 example: REG98765
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Client updated successfully
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /clients/{id}/toggle-status:
 *   patch:
 *     summary: Toggle client status (active/inactive)
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the client to toggle status for
 *         schema:
 *           type: string
 *           example: 60d33b0f8e3d4b3a8c8b8c8c
 *     responses:
 *       200:
 *         description: Client status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Client activated successfully
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Invalid client ID format
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 example: Manager
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Invalid or missing role name
 *       409:
 *         description: Role already exists
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: List of all roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6800d64c841bfebb4b2845c9"
 *                       roleName:
 *                         type: string
 *                         example: "Admin"
 *       500:
 *         description: Server Error
 */


/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The role ID
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "660a28d6cda451a8a018fc45"
 *                     roleName:
 *                       type: string
 *                       example: "Admin"
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 example: Senior Manager
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid or missing role name
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /superadmin/methodologies:
 *   post:
 *     summary: Create a new methodology (SuperAdmin only)
 *     tags: [SuperAdmin Methodologies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               boardName:
 *                 type: string
 *                 example: Scrum Board
 *               taskTitle:
 *                 type: string
 *                 example: Review Sprint Results
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-04-20
 *               priority:
 *                 type: string
 *                 enum: [new, high]
 *                 example: high
 *               status:
 *                 type: string
 *                 enum: [new, high]
 *                 example: new
 *               wipLimit:
 *                 type: number
 *                 example: 3
 *               issueType:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: yes
 *               isBlocked:
 *                 type: boolean
 *                 example: true
 *               blockedReason:
 *                 type: string
 *                 example: Waiting for feedback
 *     responses:
 *       201:
 *         description: Methodology created successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /superadmin/methodologies:
 *   get:
 *     summary: Get all methodologies (SuperAdmin only)
 *     tags: [SuperAdmin Methodologies]
 *     responses:
 *       200:
 *         description: List of methodologies
 *       500:
 *         description: Server Error
 */
/**
 * @swagger
 * /superadmin/methodologies/{id}:
 *   get:
 *     summary: Get a single methodology by ID (SuperAdmin only)
 *     tags: [SuperAdmin Methodologies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Methodology ID
 *     responses:
 *       200:
 *         description: Methodology details
 *       404:
 *         description: Methodology not found
 *       500:
 *         description: Server Error
 */
/**
 * @swagger
 * /superadmin/methodologies/{id}:
 *   put:
 *     summary: Update a methodology by ID (SuperAdmin only)
 *     tags: [SuperAdmin Methodologies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Methodology ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               boardName:
 *                 type: string
 *                 example: Scrum Board
 *               taskTitle:
 *                 type: string
 *                 example: Review Sprint Results
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-04-20
 *               priority:
 *                 type: string
 *                 enum: [new, high]
 *                 example: high
 *               status:
 *                 type: string
 *                 enum: [new, high]
 *                 example: new
 *               wipLimit:
 *                 type: number
 *                 example: 3
 *               issueType:
 *                 type: string
 *                 enum: [yes, no]
 *                 example: yes
 *               isBlocked:
 *                 type: boolean
 *                 example: true
 *               blockedReason:
 *                 type: string
 *                 example: Waiting for feedback
 *     responses:
 *       200:
 *         description: Methodology updated successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Methodology not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /superadmin/methodologies/{id}:
 *   delete:
 *     summary: Delete a methodology by ID (SuperAdmin only)
 *     tags: [SuperAdmin Methodologies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Methodology ID
 *     responses:
 *       200:
 *         description: Methodology deleted successfully
 *       404:
 *         description: Methodology not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /methodology-names:
 *   post:
 *     summary: Create a new Methodology Name
 *     description: Creates a new methodology name.
 *     tags: [Methodology]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the methodology.
 *     responses:
 *       201:
 *         description: Methodology name created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Methodology name created
 *                 newName:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Agile
 *       400:
 *         description: Name already exists
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /methodology-fields/by-methodology/{name}:
 *   post:
 *     summary: Create Methodology Fields for a specific Methodology Name
 *     description: Creates new fields associated with a given methodology name.
 *     tags: [Methodology]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the methodology
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskTitle:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [completed, not completed]
 *               wipLimit:
 *                 type: integer
 *               issueType:
 *                 type: string
 *                 enum: [severe, low]
 *               isBlocked:
 *                 type: boolean
 *               blockedReason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Methodology field created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Methodology field created successfully
 *                 field:
 *                   type: object
 *                   properties:
 *                     taskTitle:
 *                       type: string
 *                       example: Task 1
 *       404:
 *         description: Methodology Name not found
 *       400:
 *         description: Blocked reason is required if task is blocked
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /methodology-fields/by-methodology/{name}:
 *   put:
 *     summary: Update Methodology Fields for a specific Methodology Name
 *     description: Updates methodology fields for a specific methodology name.
 *     tags: [Methodology]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the methodology
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskTitle:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [completed, not completed]
 *               wipLimit:
 *                 type: integer
 *               issueType:
 *                 type: string
 *                 enum: [severe, low]
 *               isBlocked:
 *                 type: boolean
 *               blockedReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Methodology fields updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Methodology fields updated successfully
 *                 fields:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       taskTitle:
 *                         type: string
 *       404:
 *         description: Methodology Name or fields not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /methodology-fields/by-methodology/{name}:
 *   delete:
 *     summary: Delete Methodology Fields for a specific Methodology Name
 *     description: Deletes all fields associated with the specified methodology name.
 *     tags: [Methodology]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the methodology
 *     responses:
 *       200:
 *         description: Methodology fields deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Methodology fields deleted successfully
 *                 deletedCount:
 *                   type: integer
 *                   example: 5
 *       404:
 *         description: Methodology Name not found or no fields found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /methodology-names:
 *   get:
 *     summary: Get all Methodology Names
 *     description: Retrieves a list of all methodology names.
 *     tags: [Methodology]
 *     responses:
 *       200:
 *         description: A list of methodology names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Agile
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /methodology-fields/{methodologyNameId}:
 *   get:
 *     summary: Get all fields for a specific Methodology Name
 *     description: Retrieves a list of methodology fields for a specific methodology name by ID.
 *     tags: [Methodology]
 *     parameters:
 *       - in: path
 *         name: methodologyNameId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the methodology name
 *     responses:
 *       200:
 *         description: A list of methodology fields
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   taskTitle:
 *                     type: string
 *                     example: Task 1
 *       500:
 *         description: Server error
 */



/**
 * @swagger
 * /issues:
 *   post:
 *     summary: Create a new issue (SuperAdmin only)
 *     tags: [SuperAdmin Issues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Critical Bug
 *     responses:
 *       201:
 *         description: Issue created successfully
 *       400:
 *         description: Issue name is required and must be at least 3 characters long
 *       409:
 *         description: Issue with this name already exists
 *       500:
 *         description: Server Error
 */
/**
 * @swagger
 * /issues:
 *   get:
 *     summary: Get all issues (SuperAdmin only)
 *     tags: [SuperAdmin Issues]
 *     responses:
 *       200:
 *         description: List of issues
 *       500:
 *         description: Server Error
 */
/**
 * @swagger
 * /issues/{id}:
 *   get:
 *     summary: Get a specific issue by ID (Super Admin)
 *     tags: [Super Admin - Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the issue to retrieve
 *         schema:
 *           type: string
 *           example: 6620f4d47c80214901c9a68f
 *     responses:
 *       200:
 *         description: Issue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6620f4d47c80214901c9a68f
 *                     name:
 *                       type: string
 *                       example: Blocked
 *       400:
 *         description: Invalid issue ID format
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /issues/{id}:
 *   put:
 *     summary: Update an issue by ID (SuperAdmin only)
 *     tags: [SuperAdmin Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Critical Bug Fixed
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *       400:
 *         description: Issue name is required and must be at least 3 characters long
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Server Error
 */
/**
 * @swagger
 * /issues/{id}:
 *   delete:
 *     summary: Delete an issue by ID (SuperAdmin only)
 *     tags: [SuperAdmin Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue deleted successfully
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Server Error
 */
/**
 * @swagger
 * /status:
 *   post:
 *     summary: Create a new status
 *     tags: [SuperAdmin Status]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: In Progress
 *     responses:
 *       201:
 *         description: Status created successfully
 *       400:
 *         description: Status already exists
 *       500:
 *         description: Server Error
 */
/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get all statuses
 *     tags: [SuperAdmin Status]
 *     responses:
 *       200:
 *         description: List of statuses
 *       500:
 *         description: Server Error
 */
/**
 * @swagger
 * /status/{id}:
 *   put:
 *     summary: Update a status by ID
 *     tags:
 *       - Status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the status to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated status name
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Completed
 *     responses:
 *       200:
 *         description: The updated status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6801faf696ebe2f481dcea51
 *                 name:
 *                   type: string
 *                   example: Completed
 *                 __v:
 *                   type: integer
 *                   example: 0
 *       404:
 *         description: Status not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /status/{id}:
 *   get:
 *     summary: Get a specific status by ID (Super Admin)
 *     tags: [Super Admin - Status]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the status to retrieve
 *         schema:
 *           type: string
 *           example: 6626a5f2648018df53e4be90
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6626a5f2648018df53e4be90
 *                     name:
 *                       type: string
 *                       example: High
 *       400:
 *         description: Invalid status ID format
 *       404:
 *         description: Status not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /status/{id}:
 *   delete:
 *     summary: Delete a status by ID
 *     tags: [SuperAdmin Status]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Status ID
 *     responses:
 *       200:
 *         description: Status deleted successfully
 *       404:
 *         description: Status not found
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /priority:
 *   post:
 *     summary: Create a new priority
 *     tags: [Priority]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: High
 *     responses:
 *       201:
 *         description: Priority created
 *       400:
 *         description: Priority already exists
 */


/**
 * @swagger
 * /priority:
 *   get:
 *     summary: Get all priorities
 *     tags: [Priority]
 *     responses:
 *       200:
 *         description: List of priorities
 */
router.get('/priority', getPriorities);

/**
 * @swagger
 * /priority/{id}:
 *   get:
 *     summary: Get a specific priority by ID
 *     tags: [Priority]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the priority to retrieve
 *         schema:
 *           type: string
 *           example: 6627a1f2648018df53e4be99
 *     responses:
 *       200:
 *         description: Priority retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 priority:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6627a1f2648018df53e4be99
 *                     name:
 *                       type: string
 *                       example: High
 *       400:
 *         description: Invalid priority ID format
 *       404:
 *         description: Priority not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /priority/{id}:
 *   put:
 *     summary: Update a priority by ID
 *     tags: [Priority]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Priority ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Medium
 *     responses:
 *       200:
 *         description: Priority updated
 *       404:
 *         description: Priority not found
 */
router.put('/priority/:id', updatePriority);

/**
 * @swagger
 * /priority/{id}:
 *   delete:
 *     summary: Delete a priority by ID
 *     tags: [Priority]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Priority ID
 *     responses:
 *       200:
 *         description: Priority deleted
 *       404:
 *         description: Priority not found
 */
router.delete('/priority/:id', deletePriority);

/**
 * @swagger
 * /type-of-organisation:
 *   post:
 *     summary: Create a new type of organisation
 *     tags: [Type of Organisation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: University
 *     responses:
 *       201:
 *         description: Type created
 *       400:
 *         description: Type already exists
 */
router.post('/type-of-organisation', createTypeOfOrganisation);

/**
 * @swagger
 * /type-of-organisation:
 *   get:
 *     summary: Get all types of organisation
 *     tags: [Type of Organisation]
 *     responses:
 *       200:
 *         description: List of types
 */
router.get('/type-of-organisation', getTypesOfOrganisation);

/**
 * @swagger
 * /type-of-organisation/{id}:
 *   get:
 *     summary: Get a specific Type of Organisation by ID
 *     tags: [Type of Organisation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the Type of Organisation to retrieve
 *         schema:
 *           type: string
 *           example: 6627b3c9dce5f52794fd0c0d
 *     responses:
 *       200:
 *         description: Type of Organisation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6627b3c9dce5f52794fd0c0d
 *                     name:
 *                       type: string
 *                       example: University
 *       400:
 *         description: Invalid type ID format
 *       404:
 *         description: Type of Organisation not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /type-of-organisation/{id}:
 *   put:
 *     summary: Update type of organisation by ID
 *     tags: [Type of Organisation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: School
 *     responses:
 *       200:
 *         description: Type updated
 *       404:
 *         description: Type not found
 */
router.put('/type-of-organisation/:id', updateTypeOfOrganisation);

/**
 * @swagger
 * /type-of-organisation/{id}:
 *   delete:
 *     summary: Delete type of organisation by ID
 *     tags: [Type of Organisation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Type ID
 *     responses:
 *       200:
 *         description: Type deleted
 *       404:
 *         description: Type not found
 */
router.delete('/type-of-organisation/:id', deleteTypeOfOrganisation);

/**
 * @swagger
 * /api/activate-status:
 *   post:
 *     summary: Create a new activation status
 *     tags: [ActivateStatus]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Active
 *     responses:
 *       201:
 *         description: Activation status created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6629b34a3e8884d518d879e2
 *                 name:
 *                   type: string
 *                   example: Active
 *       400:
 *         description: Status already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/activate-status:
 *   get:
 *     summary: Get all Activate/Deactivate statuses
 *     tags: [Activate Status]
 *     responses:
 *       200:
 *         description: List of statuses
 */
router.get('/activate-status', getAllActivateStatus);

/**
 * @swagger
 * /api/activate-status/{id}:
 *   put:
 *     summary: Update Activate/Deactivate status by ID
 *     tags: [Activate Status]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Status ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated status
 */
router.put('/activate-status/:id', updateActivateStatus);

/**
 * @swagger
 * /api/activate-status/{id}:
 *   delete:
 *     summary: Delete Activate/Deactivate status by ID
 *     tags: [Activate Status]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Status ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status deleted
 */
router.delete('/activate-status/:id', deleteActivateStatus);

// 👤 Profile

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create a profile
 *     tags: [Profile]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               fullName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               jobType:
 *                 type: string
 *               department:
 *                 type: string
 *               organization:
 *                 type: string
 *               contact:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Profile created
 */
router.post('/profile', upload, createProfile);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout user (handled on frontend)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', logout);


module.exports = router;
