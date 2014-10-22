(function() {
  'use strict';
  angular.module('viroscope-app').controller('NavbarCtrl', function($scope, $location) {
    $scope.menu = [
      {
        title: '千帆渡',
        link: 'http://www.qianfandu.com'
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