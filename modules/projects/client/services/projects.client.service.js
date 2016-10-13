// Projects service used to communicate Projects REST endpoints
(function () {
  'use strict';

  angular
    .module('projects')
    .factory('ProjectsService', ProjectsService)
    .factory('ProjectApplicationsService', ProjectApplicationsService);

  ProjectsService.$inject = ['$resource'];

  function ProjectsService($resource) {
    return $resource('api/projects/:projectId', { projectId: '@_id' }, {
      apply: {
        method: 'POST'
      },
      update: {
        method: 'PUT'
      }
    });
  }

  ProjectApplicationsService.$inject = ['$resource'];

  function ProjectApplicationsService($resource) {
    return $resource('api/projects/:projectId/applications', { projectId: '@project_id' }, {
      handleApp: {
        method: 'PUT'
      }
    });

  }

}());
