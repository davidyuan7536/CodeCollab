(function () {
  'use strict';

  angular
    .module('projects')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('projects', {
        abstract: true,
        url: '/projects',
        template: '<ui-view/>'
      })
      .state('projects.list', {
        url: '',
        templateUrl: 'modules/projects/client/views/list-projects.client.view.html',
        controller: 'ProjectsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Projects List'
        }
      })
      .state('projects.create', {
        url: '/create',
        templateUrl: 'modules/projects/client/views/form-project.client.view.html',
        controller: 'ProjectsController',
        controllerAs: 'vm',
        resolve: {
          projectResolve: newProject,
          applicationsResolve: getApplicationService
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Projects Create'
        }
      })
      .state('projects.edit', {
        url: '/:projectId/edit',
        templateUrl: 'modules/projects/client/views/form-project.client.view.html',
        controller: 'ProjectsController',
        controllerAs: 'vm',
        resolve: {
          projectResolve: getProject,
          applicationsResolve: getApplicationService
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Project {{ projectResolve.projectName }}'
        }
      })
      .state('projects.applications', {
        url: '/:projectId/applications',
        templateUrl: 'modules/projects/client/views/applications-project.client.view.html',
        controller: 'ProjectsController',
        controllerAs: 'vm',
        resolve: {
          projectResolve: getProject,
          applicationsResolve: getApplicationService
        }
      })
      .state('projects.view', {
        url: '/:projectId',
        templateUrl: 'modules/projects/client/views/view-project.client.view.html',
        controller: 'ProjectsController',
        controllerAs: 'vm',
        resolve: {
          projectResolve: getProject,
          applicationsResolve: getApplicationService
        },
        data: {
          pageTitle: 'Project {{ projectResolve.name }}'
        }
      });
  }

  getProject.$inject = ['$stateParams', 'ProjectsService'];

  function getProject($stateParams, ProjectsService) {

    return ProjectsService.get({
      projectId: $stateParams.projectId
    }).$promise;
  }

  newProject.$inject = ['ProjectsService'];

  function newProject(ProjectsService) {
    return new ProjectsService();
  }

  getApplicationService.$inject = ['ProjectApplicationsService'];

  function getApplicationService(ProjectApplicationsService){
    return new ProjectApplicationsService();
  }

  getApps.$inject = ['$stateParams', 'ProjectApplicationsService'];

  function getApps($stateParams, ProjectApplicationsService) {
    console.log($stateParams);
    return ProjectApplicationsService.query({
      projectId: $stateParams.projectId
    }).$promise;
  }


}());
