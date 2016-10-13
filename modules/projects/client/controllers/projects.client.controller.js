(function () {
  'use strict';

  // Projects controller
  angular
    .module('projects')
    .controller('ProjectsController', ProjectsController);

  ProjectsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'projectResolve', 'applicationsResolve', '$uibModal', '$log', '$document'];

  function ProjectsController ($scope, $state, $window, Authentication, project, applicationResolve, $uibModal, $log, $document) {
    var vm = this;

    vm.authentication = Authentication;

    vm.project = project;
    vm.application = applicationResolve;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.makeLeader = makeLeader;
    vm.makeMember = makeMember;
    vm.removeUser = removeUser;

    vm.apply = apply;
    vm.handleApp = handleApp;
    vm.modalUpdate = modalUpdate;



    // Remove existing Project
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.project.$remove($state.go('projects.list'));
      }
    }

    function parseStackFunction(dataToServer){
      if(vm.project.stack === undefined || vm.project.stack === null){
        vm.project.stack = [];
      }
      var arrayLength = dataToServer.length;
      for (var i = 0; i < arrayLength; i++) {
        vm.project.stack.push(dataToServer[i].text);
      }
    }

    function initializeStackFunction(dataFromServer){
      if(vm.project.stack === undefined || vm.project.stack === null){
        return;
      }
      var arrayLength = dataFromServer.length;
      for (var i = 0; i < arrayLength; i++) {
        var scopeStack = {
          text : dataFromServer[i]
        };
        $scope.stack.push(scopeStack);
      }
    }

    function initializeStartAndEndDate(){

      var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      if(vm.project.startDate !== undefined && vm.project.startDate !== null){
        if(vm.project.startDate.month !== -1){
          $scope.startMonth = monthNames[vm.project.startDate.month-1];
        }
        else{
          $scope.startMonth = '';
        }
        if(vm.project.startDate.year !== -1){
          $scope.startYear = vm.project.startDate.year;
        }
        else{
          $scope.startYear = '';
        }
      }
      if(vm.project.endDate !== undefined && vm.project.endDate !== null){
        if(vm.project.endDate.month !== -1){
          $scope.endMonth = monthNames[vm.project.endDate.month-1];
        }
        else{
          $scope.endMonth = '';
        }
        if(vm.project.endDate.year !== -1){
          $scope.endYear = vm.project.endDate.year;
        }
        else{
          $scope.endYear = '';
        }
      }
    }
    function getMonthFromString(mon){
      var d = Date.parse(mon + '1, 2012');
      if(!isNaN(d)){
        return new Date(d).getMonth() + 1;
      }
      return -1;
    }

    function saveStartAndEndDate(){
      if($scope.startMonth !== ''){
        vm.project.startDate.month = getMonthFromString($scope.startMonth);
      }
      if($scope.startYear !== ''){
        vm.project.startDate.year = $scope.startYear;
      }
      if($scope.endMonth !== ''){
        vm.project.endDate.month = getMonthFromString($scope.endMonth);
      }
      if($scope.startMonth !== ''){
        vm.project.endDate.year = $scope.endYear;
      }
    }

    // Save Project
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.projectForm');
        return false;
      }

      // TODO: move create/update logic to service
      vm.project.stack = [];
      vm.project.startDate = { month:0, year:0 };
      vm.project.endDate = { month:0, year:0 };
      parseStackFunction($scope.stack);
      saveStartAndEndDate();


      if (vm.project._id) {
        vm.project.$update(successCallback, errorCallback);
      } else {
        vm.project.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('projects.view', {
          projectId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    //Apply to a Project
    function apply() {

      var newApp = {
        application : $scope.application
      };

      if(vm.project.applications === undefined || vm.project.applications === null){
        vm.project.applications = [];
      }
      vm.project.app = newApp;
      vm.project.$apply(successCallback, errorCallback);
      function successCallback(res) {
        $scope.application = '';
      }

      function errorCallback(res) {
        vm.error = res.data.message;
        console.log('error' + vm.error);
        $scope.application = '';
      }
    }



    function makeLeader(member){
      if(vm.project.leaders !== undefined || vm.project.applications !== null){
        vm.project.leaders.push(member);
      }
      else{
        vm.project.leaders = [];
        vm.project.leaders.push(member);
      }
      for(var i = 0; i < vm.project.members.length; i++){
        if(vm.project.members[i] === member){
          vm.project.members.splice(i, 1);
          break;
        }
      }
    }

    function makeMember(leader){
      if(vm.project.members !== undefined || vm.project.members !== null){
        vm.project.members.push(leader);
      }
      else{
        vm.project.members = [];
        vm.project.members.push(leader);
      }
      for(var i = 0; i < vm.project.leaders.length; i++){
        if(vm.project.leaders[i] === leader){
          vm.project.leaders.splice(i, 1);
          break;
        }
      }
    }

    function removeUser(user){
      for(var i = 0; i < vm.project.members.length; i++){
        if(vm.project.members[i] === user){
          vm.project.members.splice(i, 1);
          return;
        }
      }
      for(i = 0; i < vm.project.leaders.length; i++){
        if(vm.project.leaders[i] === user){
          vm.project.leaders.splice(i, 1);
          return;
        }
      }
    }

    function handleApp(application, decision){
      vm.application.application = application;
      vm.application.decision = decision;
      vm.application.project_id = vm.project._id;
      vm.application.$handleApp(successCallback, errorCallback);
      function successCallback(res) {

        for (var i = 0; i < vm.project.applications.length; i++) {

          if(vm.project.applications[i]._id === res._id){

            if(decision === 1){
              vm.project.applications[i].status = 1;
            }
            else if(decision === -1){
              vm.project.applications[i].status = -1;
            }
            else if(decision === 2){
              vm.project.applications[i].showInProject = false;
            }
          }
        }
      }
      function errorCallback(res) {
        vm.error = res.data.message;
        console.log(vm.error);
      }
    }



    function modalUpdate(size, parentSelector, application) {

      var parentElem = parentSelector ? angular.element($document[0].querySelector(parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'modules/projects/client/views/application-modal.client.view.html',
        controller: function ($uibModalInstance, application){
          var $ctrl = this;
          $ctrl.application = application;

          $ctrl.close = function(){
            $uibModalInstance.dismiss('cancel');
          };
        },
        controllerAs: '$modalCtrl',
        size: size,
        appendTo: parentElem,
        resolve: {
          application: function () {
            return application;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.selected = selectedItem;
      }, function () {

      });
    }



    var date = new Date();
    var year = date.getFullYear();

    $scope.months = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
    $scope.years = [year, year + 1, year + 2, year + 3, year + 4, year + 5, year + 6, year + 7, year +8, year + 9, year + 10];
    $scope.startMonth = '';
    $scope.startYear = '';
    $scope.endMonth = '';
    $scope.endYear = '';
    $scope.stack = [];

    initializeStackFunction(vm.project.stack);
    initializeStartAndEndDate();

    $scope.startMonthSelected = function(month){
      if(month==='unspecified'){
        $scope.startMonth = '';
        return;
      }
      $scope.startMonth = month;
    };

    $scope.startYearSelected = function(year){
      if(year==='unspecified'){
        $scope.startYear = '';
        return;
      }
      $scope.startYear = year;
    };

    $scope.endMonthSelected = function(month){
      if(month==='unspecified'){
        $scope.endMonth = '';
        return;
      }
      $scope.endMonth = month;
    };

    $scope.endYearSelected = function(year){
      if(year==='unspecified'){
        $scope.endYear = '';
        return;
      }
      $scope.endYear = year;
    };
  }


}());
