'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Project = mongoose.model('Project'),
  Application = mongoose.model('Application'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Project
 */
exports.create = function(req, res) {
  var project = new Project(req.body);
  project.user = req.user;
  project.leaders = [req.user];

  project.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * Show the current Project
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON

  var project = req.project ? req.project.toJSON() : {};

  var leader = false;
  for (var i = 0; i < project.leaders.length; i++) {
    if(req.user && project.leaders[i] && project.leaders[i]._id.toString() === req.user._id.toString()){
      leader = true;
    }
  }

  project.isALeader = leader;

  var member =false;
  for (i = 0; i < project.members.length; i++) {
    if(req.user && project.members[i] && project.members[i]._id.toString() === req.user._id.toString()){
      member = true;
    }
  }
  project.isAMember = member;

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  project.isCurrentUserOwner = req.user && project.user && project.user._id.toString() === req.user._id.toString();


  res.jsonp(project);
};

/**
 * Update a Project
 */
exports.update = function(req, res) {
  var project = req.project;

  project = _.extend(project, req.body);

  project.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * Apply to a Project
 */
exports.apply = function(req, res) {

  var app = new Application(req.body.app);
  app.user = req.user;

  var project = req.project;
  project = _.extend(project, req.body);

  project.applications.push(app);
  project.numberOfApplications += 1;

  app.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      project.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(project);
        }
      });
    }
  });

};


/**
 * Delete an Project
 */
exports.delete = function(req, res) {
  var project = req.project;

  project.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * List of Projects
 */
exports.list = function(req, res) {
  Project.find().sort('-created').populate('user', 'displayName profileImageURL').populate('leaders', 'displayName profileImageURL').populate('members', 'displayName profileImageURL').exec(function(err, projects) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(projects);
    }
  });
};

/**
 * Project middleware
 */
exports.projectByID = function(req, res, next, id) {


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Project is invalid'
    });
  }

  Project.findById(id).populate('user', 'displayName profileImageURL').populate('leaders', 'displayName profileImageURL').populate('members', 'displayName profileImageURL').populate('applications').exec(function (err, project) {

    var options = {
      path: 'applications.user',
      model: 'User'
    };

    if (err) {
      return next(err);
    } else if (!project) {
      return res.status(404).send({
        message: 'No Project with that identifier has been found'
      });
    }
    Project.populate(project, options, function (err, projects) {
      req.project = projects;
      next();
    });

  });
};


exports.getApplications = function(req, res){

};

exports.updateApplication = function(req, res){

  var application = req.body.application;

  var decision = req.body.decision;
  var app_id = req.body.application._id;
  var project_id = req.body.project_id;
  var projectMembers;
  var projectLeaders;

  if(decision === 2){
    Application.update({ _id: app_id }, { showInProject: false }, function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      else{
        res.jsonp(application);
      }
    });
  }
  else{
    Project.findById(project_id).select('members').select('leaders').exec(function (err, project) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        projectLeaders = project.leaders;
        projectMembers = project.members;
      }
    });



    Application.update({ _id: app_id }, { status: decision }, function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      else{
        var alreadyMember = false;
        for(var i = 0; i < projectMembers.length; i++){
          if(projectMembers[i].toString() === application.user._id.toString()){
            alreadyMember = true;
          }
        }
        if(!alreadyMember){
          for(i = 0; i < projectLeaders.length; i++){
            if(projectLeaders[i].toString() === application.user._id.toString()){
              alreadyMember = true;
            }
          }
        }
        if(!alreadyMember){
          projectMembers.push(application.user);
          Project.update({ _id: project_id }, { members: projectMembers }, function(err) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            }
            else{
              res.jsonp(application);
            }
          });
        }
        else{
          res.jsonp(application);
        }
      }
    });
  }
};

exports.deleteApplication = function(req, res, id){

};



exports.hasAuthorization = function(req, res, next) {

  var project = req.project ? req.project.toJSON() : {};
  var authorized = false;
  for(var i = 0; i < project.leaders.length; i++){
    if(req.user && project.leaders[i] && project.leaders[i]._id.toString() === req.user._id.toString()){
      authorized = true;
    }
  }
  if(req.user && project.user && project.user._id.toString() === req.user._id.toString()){
    authorized = true;
  }

  if (authorized === false) {
    return res.status(403).send({
      message: 'User is not authorized'
    });
  }
  next();
};
