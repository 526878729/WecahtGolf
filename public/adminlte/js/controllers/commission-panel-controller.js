/**
 * Created by Leo on 2016/3/7.
 */
define(['adminApp', 'bootstrapDataTables', 'fastClick', 'utility'], function (adminApp) {
  adminApp.controller('commissionPanelController', ['$scope', '$http', '$compile',
    function ($scope, $http, $compile) {
      function buildTableForMater(commission) {
        var refereeId = commission.refereeId._id;
        var nickname = commission.refereeId.nickname;
        var orderStateString = null;
        var buttonDisableString = "";

        if (commission.payDate != null && commission.state == 1) {
          buttonDisableString = 'disabled';
        } else if ((commission.state == 0 || commission.state == 2) && commission.payDate == null) {
          buttonDisableString = 'disabled';
        } else if (commission.payDate == null && commission.state == 1) {
          buttonDisableString = "";
        }

        switch (commission.state) {
          case 0 :
            orderStateString = '待确认';
            break;
          case 1 :
            orderStateString = '待付款';
            break;
          case 2 :
            orderStateString = '待参加';
            break;
          case 3 :
            orderStateString = '已付款';
            break;
          default:
            orderStateString = '已取消';
        }

        var payStateString = null;

        if (commission.payDate == null) {
          payStateString = "未支付";
        } else {
          payStateString = "已支付";
        }

        var unconfirmedCommissionButtonString =
          "<button " + buttonDisableString + " class='btn btn-warning btn-sm' value='"
          + commission.orderId
          + "' ng-click='showConfirmCommissionModal($event);'>支付</button>\n<button class='btn btn-danger btn-sm' value='"
          + commission.orderId
          + "' ng-click='showCancelCommissionModal($event);'>取消</button>";

        return [
          insertSpaceIntoString(commission.orderId),
          insertSpaceIntoString(commission.consumerId),
          insertSpaceIntoString(refereeId),
          nickname,
          commission.fees,
          orderStateString,
          payStateString,
          formatDate(new Date(commission.creationDate), "yyyy-MM-dd hh:mm"),
          unconfirmedCommissionButtonString
        ];
      }


      $("#commissionListTable").on('draw.dt', function () {
        $compile($("#commissionListTable"))($scope);
      });

      $http.get('/admin/commission').success(function (response) {
        $scope.commission = response.data;
        var commissionData = [];
        for (var i = 0; i < $scope.commission.length; i++) {
          var commission = $scope.commission[i];
          commissionData.push(buildTableForMater(commission));
        }

        $("#commissionListTable").DataTable({
          data: commissionData,
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
      }).error(function (response) {
        console.log(response);
      });


      //var confirmCommissionID = null;
      //var confirmCommissionRow = null;
      //$scope.showConfirmCommissionModal = function ($event) {
      //    confirmCommissionID = $event.toElement.value;
      //    confirmCommissionRow = $("#unconfirmedCommissionListTable").DataTable().row($($event.toElement).parents('tr'));
      //
      //    $("#confirmCommissionModalContent").html("确定要为推荐达人支付 订单ID: " + insertSpaceIntoString(confirmCommissionID) + " 的佣金吗?");
      //    $("#confirmCommissionModal").modal('show');
      //};
      //
      //$scope.showCancelCommissionModal = function ($event) {
      //    confirmCommissionID = $event.toElement.value;
      //    confirmCommissionRow = $("#unconfirmedCommissionListTable").DataTable().row($($event.toElement).parents('tr'));
      //
      //    $("#cancelCommissionModalContent").html("确定要取消 订单ID: " + insertSpaceIntoString(confirmCommissionID) + " 的佣金吗?");
      //    $("#cancelCommissionModal").modal('show');
      //};
      //
      //$scope.confirmCommission = function(){
      //
      //};
    }]);
});