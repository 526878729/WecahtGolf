define(['adminApp', 'bootstrapDataTables', 'fastClick', 'utility'], function (adminApp) {
  adminApp.controller('unconfirmedOrderPanelController',
    [
      '$scope', '$http', '$compile',

      function ($scope, $http, $compile) {
        function filterOrdersForType(type) {
          var filteredOrders = null;
          switch (type) {
            case 0:
              filteredOrders = $scope.unconfirmedOrders.courseOrders;
              break;
            case 1:
              filteredOrders = $scope.unconfirmedOrders.drivingRangeOrders;
              break;
            case 2:
              filteredOrders = $scope.unconfirmedOrders.lessonOrders;
              break;
            default:
          }
          return filteredOrders;
        }

        function generateSummaryForCourseOrder(courseOrder) {
          var summary = '球场名称: ' + courseOrder.courseName + '<br/>';
          summary += '球场电话: ' + courseOrder.coursePhoneNumber + '<br/>';
          summary += '联系人: ' + courseOrder.name + '<br/>';
          summary += '联系人电话: ' + courseOrder.phoneNumber + '<br/>';
          summary += '时间: ' + formatDate(new Date(courseOrder.bookingDate), "yyyy-MM-dd hh:mm") + '<br/>';
          summary += '人数: ' + courseOrder.numberOfPeople + '<br/>';
          summary += '订单状态: ';
          switch (courseOrder.state) {
            case 0:
              summary += '待确认';
              break;
            case 1:
              summary += '待付款';
              break;
            case 2:
              summary += '待参加';
              break;
            case 3:
              summary += '已完成';
              break;
            default:
              summary += '已取消';
          }
          summary += '<br/>';
          summary += '备注: ' + courseOrder.message;

          return summary;
        }

        function generateSummaryForDrivingRangeOrder(drivingRangeOrder) {
          var summary = '练习场名称: ' + drivingRangeOrder.drivingRangeName + '<br/>';
          summary += '练习场电话: ' + drivingRangeOrder.drivingRangePhoneNumber + '<br/>';
          summary += '联系人: ' + drivingRangeOrder.name + '<br/>';
          summary += '联系人电话: ' + drivingRangeOrder.phoneNumber + '<br/>';
          summary += '时间: ' + formatDate(new Date(drivingRangeOrder.bookingDate), "yyyy-MM-dd hh:mm") + '<br/>';
          summary += '人数: ' + drivingRangeOrder.numberOfPeople + '<br/>';
          summary += '订单状态: ';
          switch (drivingRangeOrder.state) {
            case 0:
              summary += '待确认';
              break;
            case 1:
              summary += '待付款';
              break;
            case 2:
              summary += '待参加';
              break;
            case 3:
              summary += '已完成';
              break;
            default:
              summary += '已取消';
          }
          summary += '<br/>';
          summary += '备注: ' + drivingRangeOrder.message;

          return summary;
        }

        function generateSummaryForLessonOrder(lessonOrder) {
          var summary = '课程名称: ' + lessonOrder.lessonName + '<br/>';
          summary += '联系人: ' + lessonOrder.name + '<br/>';
          summary += '联系人电话: ' + lessonOrder.phoneNumber + '<br/>';
          summary += '时间: ' + formatDate(new Date(lessonOrder.bookingDate), "yyyy-MM-dd hh:mm") + '<br/>';
          summary += '人数: ' + lessonOrder.numberOfPeople + '<br/>';
          summary += '订单状态: ';
          switch (lessonOrder.state) {
            case 0:
              summary += '待确认';
              break;
            case 1:
              summary += '待付款';
              break;
            case 2:
              summary += '待参加';
              break;
            case 3:
              summary += '已完成';
              break;
            default:
              summary += '已取消';
          }
          summary += '<br/>';
          summary += '备注: ' + lessonOrder.message;

          return summary;
        }

        function generateDatatablesDataArrayForOrder(order, type) {
          var typeString = null;
          var summary = null;
          switch (type) {
            case 0:
              typeString = "球场";
              summary = generateSummaryForCourseOrder(order);
              break;
            case 1:
              typeString = "练习场";
              summary = generateSummaryForDrivingRangeOrder(order);
              break;
            case 2:
              typeString = "课程";
              summary = generateSummaryForLessonOrder(order);
              break;
            default:
          }
          var orderConfirmCancelButtonString =
            "<button class='btn btn-warning btn-sm' value='"
            + order._id
            + "' ng-click='showConfirmOrderModal($event, "
            + type
            + ");'>确认</button>\n<button class='btn btn-danger btn-sm' value='"
            + order._id
            + "' ng-click='showCancelOrderModal($event, "
            + type
            + ");'>取消</button>";
          return [
            insertSpaceIntoString(order.referenceId),
            typeString,
            summary,
            formatDate(new Date(order.creationDate), "yyyy-MM-dd hh:mm"),
            orderConfirmCancelButtonString
          ]
        }

        $("#unconfirmedOrderListTable").on('draw.dt', function () {
          $compile($("#unconfirmedOrderListTable"))($scope);
        });

        $http.get("/admin/unconfirmedOrders")
          .success(function (response) {
            $scope.unconfirmedOrders = response.data;
            var unconfirmedOrders = [];

            for (var i = 0; i < $scope.unconfirmedOrders.courseOrders.length; i++) {
              var courseOrder = $scope.unconfirmedOrders.courseOrders[i];
              unconfirmedOrders.push(generateDatatablesDataArrayForOrder(courseOrder, 0));
            }

            for (var i = 0; i < $scope.unconfirmedOrders.drivingRangeOrders.length; i++) {
              var drivingRangeOrder = $scope.unconfirmedOrders.drivingRangeOrders[i];
              unconfirmedOrders.push(generateDatatablesDataArrayForOrder(drivingRangeOrder, 1));
            }

            for (var i = 0; i < $scope.unconfirmedOrders.lessonOrders.length; i++) {
              var lessonOrder = $scope.unconfirmedOrders.lessonOrders[i];
              unconfirmedOrders.push(generateDatatablesDataArrayForOrder(lessonOrder, 2));
            }

            $("#unconfirmedOrderListTable").DataTable({
              data: unconfirmedOrders,
              language: {
                "sProcessing": "处理中...",
                "sLengthMenu": "显示 _MENU_ 项结果",
                "sZeroRecords": "没有匹配结果",
                "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
                "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                "sInfoPostFix": "",
                "sSearch": "搜索:",
                "sUrl": "",
                "sEmptyTable": "表中数据为空",
                "sLoadingRecords": "载入中...",
                "sInfoThousands": ",",
                "oPaginate": {
                  "sFirst": "首页",
                  "sPrevious": "上页",
                  "sNext": "下页",
                  "sLast": "末页"
                },
                "oAria": {
                  "sSortAscending": ": 以升序排列此列",
                  "sSortDescending": ": 以降序排列此列"
                }
              }
            });

          }).error(function (response, status) {
            console.log(response);
          });

        var confirmOrderType = null;
        var confirmOrderIndex = -1;
        var confirmOrderID = null;
        var confirmOrderRow = null;
        $scope.showConfirmOrderModal = function ($event, type) {
          confirmOrderID = $event.toElement.value;
          confirmOrderRow = $("#unconfirmedOrderListTable").DataTable().row($($event.toElement).parents('tr'));
          confirmOrderType = type;

          var selectedTypeOrders = filterOrdersForType(type);

          for (var i = 0; i < selectedTypeOrders.length; i++) {
            var selectedTypeOrder = selectedTypeOrders[i];
            if (selectedTypeOrder._id == confirmOrderID) {
              confirmOrderIndex = i;
              $("#confirmOrderModalContent").html("确定要确认 ID: " + insertSpaceIntoString(selectedTypeOrder.referenceId) + " 的订单吗?");
              $("#confirmOrderModal").modal('show');
              break;
            }
          }
        };

        $scope.confirmOrder = function () {
          if (confirmOrderID != null && confirmOrderRow != null) {
            $http.post('/admin/confirmOrder', {
              id: confirmOrderID,
              type: confirmOrderType
            }).success(function (response, status, headers, config) {
              confirmOrderRow.remove().draw(false);
              $("#confirmOrderModal").modal('hide');

              var selectedTypeOrders = filterOrdersForType(confirmOrderType);
              selectedTypeOrders.splice(confirmOrderIndex, 1);
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };

        var cancelOrderType = null;
        var cancelOrderIndex = -1;
        var cancelOrderID = null;
        var cancelOrderRow = null;
        $scope.showCancelOrderModal = function ($event, type) {
          cancelOrderID = $event.toElement.value;
          cancelOrderRow = $("#unconfirmedOrderListTable").DataTable().row($($event.toElement).parents('tr'));
          cancelOrderType = type;

          var selectedTypeOrders = filterOrdersForType(type);

          for (var i = 0; i < selectedTypeOrders.length; i++) {
            var selectedTypeOrder = selectedTypeOrders[i];
            if (selectedTypeOrder._id == cancelOrderID) {
              cancelOrderIndex = i;
              $("#cancelOrderModalContent").html("确定要取消 ID: " + insertSpaceIntoString(selectedTypeOrder.referenceId) + " 的订单吗?");
              $("#cancelOrderModal").modal('show');
              break;
            }
          }
        };

        $scope.cancelOrder = function () {
          if (cancelOrderID != null && cancelOrderRow != null) {
            $http.post('/admin/cancelOrder', {
              id: cancelOrderID,
              type: cancelOrderType
            }).success(function (response, status, headers, config) {
              cancelOrderRow.remove().draw(false);
              $("#cancelOrderModal").modal('hide');

              var selectedTypeOrders = filterOrdersForType(cancelOrderType);
              selectedTypeOrders.splice(cancelOrderIndex, 1);
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };
      }
    ]);
});