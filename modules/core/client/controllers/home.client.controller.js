'use strict';


var app = angular.module('core');

app.controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    $scope.alerts = [
      {
        icon: 'glyphicon-globe',
        color: '',
        total: 2013,
        description: 'Number of Open Collaborations'
      },
      {
        icon: 'glyphicon-user',
        color: '',
        total: 2133,
        description: 'Number of Students Looking For Collaborations'
      }
    ];



  }
]);
