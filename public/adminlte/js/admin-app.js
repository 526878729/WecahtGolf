define(['js/routes', 'js/services/dependency-resolver', 'ckeditor'], function (config, dependencyResolverFor) {
  var adminApp = angular.module('adminApp', ['ngRoute', 'ngAnimate', 'ui.select']);

  adminApp.config(
    [
      '$routeProvider',
      '$locationProvider',
      '$controllerProvider',
      '$compileProvider',
      '$filterProvider',
      '$provide',

      function ($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
        adminApp.controller = $controllerProvider.register;
        adminApp.directive = $compileProvider.directive;
        adminApp.filter = $filterProvider.register;
        adminApp.factory = $provide.factory;
        adminApp.service = $provide.service;

        $locationProvider.html5Mode(true);

        if (config.routes !== undefined) {
          angular.forEach(config.routes, function (route, path) {
            var routeObject = {};
            $.extend(routeObject, route);
            if (route.dependencies != null && route.dependencies != 'undefined') {
              routeObject.resolve = dependencyResolverFor(route.dependencies);
              delete routeObject.dependencies;
            }
            $routeProvider.when(path, routeObject);
          });
        }

        if (config.defaultRoutePaths !== undefined) {
          $routeProvider.otherwise({redirectTo: config.defaultRoutePaths});
        }
      }
    ]);

  adminApp.directive('uiSelectRequired', function () {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        ctrl.$validators.uiSelectRequired = function (modelValue, viewValue) {
          if (modelValue && modelValue.length > 0)
            return true;
          return false;
        };
      }
    };
  });

  adminApp.directive('ckeditor', function () {
    return {
      require: '?ngModel',
      link: function (scope, elm, attr, ngModel) {
        var ck = CKEDITOR.replace(elm[0]);
        if (!ngModel) return;
        ck.on('instanceReady', function () {
          ck.setData(ngModel.$viewValue);
        });

        function updateModel() {
          scope.$apply(function () {
            ngModel.$setViewValue(ck.getData());
          });
        }

        ck.on('pasteState', updateModel);
        ck.on('change', updateModel);
        ck.on('key', updateModel);

        ngModel.$render = function (value) {
          ck.setData(ngModel.$viewValue);
        };
      }
    };
  });

  return adminApp;
});