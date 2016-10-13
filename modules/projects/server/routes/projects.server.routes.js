'use strict';

/**
 * Module dependencies
 */
var projectsPolicy = require('../policies/projects.server.policy'),
  projects = require('../controllers/projects.server.controller'),
  users = require('../../../users/server/controllers/users.server.controller');

module.exports = function(app) {
  // Projects Routes
  app.route('/api/projects')
    .get(projects.list)
    .post(users.requiresLogin, projects.create);

  app.route('/api/projects/:projectId')
    .get(users.requiresLogin, projects.read)
    .post(users.requiresLogin, projects.apply)
    .put(users.requiresLogin, projects.hasAuthorization, projects.update)
    .delete(users.requiresLogin, projects.hasAuthorization, projects.delete);

  app.route('/api/projects/:projectId/applications')
    .get(users.requiresLogin, projects.hasAuthorization, projects.getApplications)
    .put(users.requiresLogin, projects.hasAuthorization, projects.updateApplication)
    .delete(users.requiresLogin, projects.hasAuthorization, projects.deleteApplication);

  // Finish by binding the Project middleware
  app.param('projectId', projects.projectByID);
};
