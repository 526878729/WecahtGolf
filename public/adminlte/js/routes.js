define([], function () {
  return {
    defaultRoutePath: '/',
    routes: {
      '/': {
        templateUrl: '/adminlte/views/home-panel.html',
        dependencies: [
          'js/controllers/home-panel-controller'
        ]
      },
      '/coursePanel': {
        templateUrl: '/adminlte/views/course-panel.html',
        dependencies: [
          'js/controllers/course-panel-controller'
        ]
      },
      '/drivingRangePanel': {
        templateUrl: '/adminlte/views/driving-range-panel.html',
        dependencies: [
          'js/controllers/driving-range-panel-controller'
        ]
      },
      '/lessonPanel': {
        templateUrl: '/adminlte/views/lesson-panel.html',
        dependencies: [
          'js/controllers/lesson-panel-controller'
        ]
      },
      '/lessonPromotionPanel': {
        templateUrl: '/adminlte/views/lesson-promotion-panel.html',
        dependencies: [
          'js/controllers/lesson-promotion-panel-controller'
        ]
      },
      '/unconfirmedOrderPanel': {
        templateUrl: '/adminlte/views/unconfirmed-order-panel.html',
        dependencies: [
          'js/controllers/unconfirmed-order-panel-controller'
        ]
      },
      '/orderPanel': {
        templateUrl: '/adminlte/views/order-panel.html',
        dependencies: [
          'js/controllers/order-panel-controller'
        ]
      },
      '/userPanel': {
        templateUrl: '/adminlte/views/user-panel.html',
        dependencies: [
          'js/controllers/user-panel-controller'
        ]
      },
      '/unconfirmedCommissionPanel': {
        templateUrl: '/adminlte/views/unconfirmed-commission-panel.html',
        dependencies: [
          'js/controllers/unconfirmed-commission-panel-controller'
        ]
      },
      '/commissionPanel': {
        templateUrl: '/adminlte/views/commission-panel.html',
        dependencies: [
          'js/controllers/commission-panel-controller'
        ]
      },
      '/logout': {
        template: '',
        controller: function ($window) {
          $window.location.reload();
        }
      }
    }
  };
});