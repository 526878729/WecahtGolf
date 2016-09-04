require.config({
  baseUrl: '/adminlte',
  paths: {
    'angular': 'https://cdn.bootcss.com/angular.js/1.4.9/angular.min',
    'angular-route': 'https://cdn.bootcss.com/angular.js/1.4.9/angular-route.min',
    'angular-animate': 'https://cdn.bootcss.com/angular.js/1.4.9/angular-animate.min',
    'angular-ui-select': 'https://cdn.bootcss.com/angular-ui-select/0.14.2/select.min',
    'bootstrap': 'bootstrap/js/bootstrap.min',
    'jquery': 'plugins/jQuery/jQuery-2.1.4.min',
    'datatables': 'plugins/datatables/jquery.dataTables.min',
    'bootstrapDataTables': 'plugins/datatables/dataTables.bootstrap.min',
    'jquerySlimScroll': 'plugins/slimScroll/jquery.slimscroll.min',
    'fastClick': 'plugins/fastclick/fastclick.min',
    'moment': 'https://cdn.bootcss.com/moment.js/2.10.2/moment.min',
    'datePicker': 'plugins/datepicker/bootstrap-datepicker',
    'select2': 'plugins/select2/select2.min',
    'timePicker': 'plugins/timepicker/0.5.2/bootstrap-timepicker.min',
    'ckeditor': 'https://cdn.bootcss.com/ckeditor/4.5.4/ckeditor',
    'adminLTE': 'dist/js/app.min',
    'adminApp': 'js/admin-app',
    'utility': 'js/utility'
  },
  shim: {
    'adminApp': {
      deps: ['angular', 'angular-route', 'angular-animate', 'angular-ui-select', 'adminLTE']
    },
    'angular-route': {
      deps: ['angular']
    },
    'angular-animate': {
      deps: ['angular']
    },
    'angular-ui-select': {
      deps: ['angular']
    },
    'bootstrap': {
      deps: ['jquery']
    },
    'datePicker': {
      deps: ['jquery', 'bootstrap']
    },
    'timePicker': {
      deps: ['jquery', 'bootstrap']
    },
    'jquerySlimScroll': {
      deps: ['jquery']
    },
    'adminLTE': {
      deps: ['jquery', 'bootstrap', 'datePicker', 'select2', 'timePicker', 'jquerySlimScroll']
    }
  }
});

require
(
  [
    'adminApp'
  ],
  function (adminApp) {
    angular.bootstrap(document, ['adminApp']);
  }
);