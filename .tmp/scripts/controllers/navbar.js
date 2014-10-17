(function() {
  'use strict';
  angular.module('viroscope-app').controller('NavbarCtrl', function($scope, $location) {
    $scope.menu = [
      {
        title: 'About',
        link: '/'
      }
    ];
    return $scope.isActive = function(route) {
      return route === $location.path();
    };
  });

}).call(this);

/*
//@ sourceMappingURL=navbar.js.map
*/