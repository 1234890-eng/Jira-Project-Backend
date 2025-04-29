// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('./AdminDatabase/User');
const Issue = require('./AdminDatabase/IssueA');
const Status = require('./AdminDatabase/statusA'); // Adjust path if needed
const Priority = require('./AdminDatabase/PriorityA'); // Adjust path as needed
const OrganisationType = require('./AdminDatabase/OrganisationTypeA'); // adjust path if needed
const ActiveStatusType = require('./AdminDatabase/ActiveStatusTypeA'); // update path as needed





// Create User Route
router.post('/create-user', async (req, res) => {
  const { firstName, lastName, organizationName, role, projectId, status } = req.body;

  try {
    const newUser = new User({
      firstName,
      lastName,
      organizationName,
      role,
      projectId,
      status,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
});

// ✅ GET ALL USERS
router.get('/users', async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
  });
  
  // ✏️ UPDATE USER BY ID
  router.put('/user/:id', async (req, res) => {
    try {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ message: 'User updated', user: updated });
    } catch (err) {
      res.status(500).json({ message: 'Error updating user', error: err.message });
    }
  });
  
  // ❌ DELETE USER BY ID
  router.delete('/user/:id', async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
  });
  
  // ✅ Create Issue
router.post('/issue-create', async (req, res) => {
    try {
      const issue = new Issue({ issueName: req.body.issueName });
      await issue.save();
      res.status(201).json({ message: 'Issue created', issue });
    } catch (err) {
      res.status(500).json({ message: 'Error creating issue', error: err.message });
    }
  });
  
  // 📥 Get All Issues
  router.get('/issue-get', async (req, res) => {
    try {
      const issues = await Issue.find();
      res.status(200).json(issues);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching issues', error: err.message });
    }
  });
  
  // 🔍 Get Issue by ID
  router.get('/issue-byid/:id', async (req, res) => {
    try {
      const issue = await Issue.findById(req.params.id);
      if (!issue) return res.status(404).json({ message: 'Issue not found' });
      res.status(200).json(issue);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching issue', error: err.message });
    }
  });
  
  // ✏️ Update Issue by ID
  router.put('/issue-edit/:id', async (req, res) => {
    try {
      const updated = await Issue.findByIdAndUpdate(
        req.params.id,
        { issueName: req.body.issueName },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Issue not found' });
      res.status(200).json({ message: 'Issue updated', issue: updated });
    } catch (err) {
      res.status(500).json({ message: 'Error updating issue', error: err.message });
    }
  });
  
  // ❌ Delete Issue by ID
  router.delete('/issue-delete/:id', async (req, res) => {
    try {
      const deleted = await Issue.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Issue not found' });
      res.status(200).json({ message: 'Issue deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting issue', error: err.message });
    }
  });
  
  // ✅ Create Status
router.post('/status-create', async (req, res) => {
    try {
      const status = new Status({ statusName: req.body.statusName });
      await status.save();
      res.status(201).json({ message: 'Status created', status });
    } catch (err) {
      res.status(500).json({ message: 'Error creating status', error: err.message });
    }
  });
  
  // 📥 Get All Statuses
  router.get('/status-get', async (req, res) => {
    try {
      const statuses = await Status.find();
      res.status(200).json(statuses);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching statuses', error: err.message });
    }
  });
  
  // 🔍 Get Status by ID
  router.get('/status-getbyid/:id', async (req, res) => {
    try {
      const status = await Status.findById(req.params.id);
      if (!status) return res.status(404).json({ message: 'Status not found' });
      res.status(200).json(status);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching status', error: err.message });
    }
  });
  
  // ✏️ Update Status
  router.put('/status-edit/:id', async (req, res) => {
    try {
      const updated = await Status.findByIdAndUpdate(
        req.params.id,
        { statusName: req.body.statusName },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Status not found' });
      res.status(200).json({ message: 'Status updated', status: updated });
    } catch (err) {
      res.status(500).json({ message: 'Error updating status', error: err.message });
    }
  });
  
  // ❌ Delete Status
  router.delete('/status-delete/:id', async (req, res) => {
    try {
      const deleted = await Status.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Status not found' });
      res.status(200).json({ message: 'Status deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting status', error: err.message });
    }
  });
  
  // ✅ Create Priority
router.post('/priority-create', async (req, res) => {
    try {
      const priority = new Priority({ priorityName: req.body.priorityName });
      await priority.save();
      res.status(201).json({ message: 'Priority created', priority });
    } catch (err) {
      res.status(500).json({ message: 'Error creating priority', error: err.message });
    }
  });
  
  // 📥 Get All Priorities
  router.get('/priority-get', async (req, res) => {
    try {
      const priorities = await Priority.find();
      res.status(200).json(priorities);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching priorities', error: err.message });
    }
  });
  
  // 🔍 Get Priority by ID
  router.get('/priority-getbyedit/:id', async (req, res) => {
    try {
      const priority = await Priority.findById(req.params.id);
      if (!priority) return res.status(404).json({ message: 'Priority not found' });
      res.status(200).json(priority);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching priority', error: err.message });
    }
  });
  
  // ✏️ Update Priority
  router.put('/priority-edit/:id', async (req, res) => {
    try {
      const updated = await Priority.findByIdAndUpdate(
        req.params.id,
        { priorityName: req.body.priorityName },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Priority not found' });
      res.status(200).json({ message: 'Priority updated', priority: updated });
    } catch (err) {
      res.status(500).json({ message: 'Error updating priority', error: err.message });
    }
  });
  
  // ❌ Delete Priority
  router.delete('/priority-delete/:id', async (req, res) => {
    try {
      const deleted = await Priority.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Priority not found' });
      res.status(200).json({ message: 'Priority deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting priority', error: err.message });
    }
  });

  // ✅ Create
router.post('/organisation-type-create', async (req, res) => {
    try {
      const organisation = new OrganisationType({ organisationName: req.body.organisationName });
      await organisation.save();
      res.status(201).json({ message: 'Organisation Type created', organisation });
    } catch (err) {
      res.status(500).json({ message: 'Error creating organisation type', error: err.message });
    }
  });
  
  // 📥 Get All
  router.get('/organisation-type-get', async (req, res) => {
    try {
      const organisations = await OrganisationType.find();
      res.status(200).json(organisations);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching organisation types', error: err.message });
    }
  });
  
  // 🔍 Get by ID
  router.get('/organisation-type-getbyid/:id', async (req, res) => {
    try {
      const organisation = await OrganisationType.findById(req.params.id);
      if (!organisation) return res.status(404).json({ message: 'Organisation Type not found' });
      res.status(200).json(organisation);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching organisation type', error: err.message });
    }
  });
  
  // ✏️ Update
  router.put('/organisation-type-edit/:id', async (req, res) => {
    try {
      const updated = await OrganisationType.findByIdAndUpdate(
        req.params.id,
        { organisationName: req.body.organisationName },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Organisation Type not found' });
      res.status(200).json({ message: 'Organisation Type updated', organisation: updated });
    } catch (err) {
      res.status(500).json({ message: 'Error updating organisation type', error: err.message });
    }
  });
  
  // ❌ Delete
  router.delete('/organisation-type-delete/:id', async (req, res) => {
    try {
      const deleted = await OrganisationType.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Organisation Type not found' });
      res.status(200).json({ message: 'Organisation Type deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting organisation type', error: err.message });
    }
  });
  
  // ✅ Create
router.post('/active-status', async (req, res) => {
    try {
      const status = new ActiveStatusType({ statusName: req.body.statusName });
      await status.save();
      res.status(201).json({ message: 'Active/Deactive status created', status });
    } catch (err) {
      res.status(500).json({ message: 'Error creating status', error: err.message });
    }
  });
  
  // 📥 Get All
  router.get('/active-statuses', async (req, res) => {
    try {
      const statuses = await ActiveStatusType.find();
      res.status(200).json(statuses);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching statuses', error: err.message });
    }
  });
  
  // 🔍 Get by ID
  router.get('/active-status/:id', async (req, res) => {
    try {
      const status = await ActiveStatusType.findById(req.params.id);
      if (!status) return res.status(404).json({ message: 'Status not found' });
      res.status(200).json(status);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching status', error: err.message });
    }
  });
  
  // ✏️ Update
  router.put('/active-status/:id', async (req, res) => {
    try {
      const updated = await ActiveStatusType.findByIdAndUpdate(
        req.params.id,
        { statusName: req.body.statusName },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Status not found' });
      res.status(200).json({ message: 'Status updated', status: updated });
    } catch (err) {
      res.status(500).json({ message: 'Error updating status', error: err.message });
    }
  });
  
  // ❌ Delete
  router.delete('/active-status/:id', async (req, res) => {
    try {
      const deleted = await ActiveStatusType.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Status not found' });
      res.status(200).json({ message: 'Status deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting status', error: err.message });
    }
  });
  

module.exports = router;
