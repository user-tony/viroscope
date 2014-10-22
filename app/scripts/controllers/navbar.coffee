'use strict'

angular.module('viroscope-app')
  .controller 'NavbarCtrl', ($scope, $location) ->
    $scope.menu = [
      title: '千帆渡'
      link: 'http://www.qianfandu.com'
    ]

    $scope.isActive = (route) ->
      route is $location.path()
