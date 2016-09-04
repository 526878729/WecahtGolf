/**
 * Created by Leo on 2016/3/2.
 */
define(['adminApp', 'bootstrapDataTables', 'fastClick', 'utility'], function (adminApp) {
  adminApp.controller('userPanelController', ['$scope', '$http', '$compile',
    function ($scope, $http, $compile) {
      //生成用户列表信息模板
      function buildTableForUsers(user) {
        var disabledString = null;
        var followedWeChatString = null;
        var masterCommission = null;
        if(user.commissionRate){
          masterCommission = user.commissionRate;
        }else{
          masterCommission = 0;
        }
        if (user.followed) {
          disabledString = '';
          followedWeChatString = '是';
        } else {
          disabledString = 'disabled';
          followedWeChatString = '否';
        }

        var commissionRateInputString = "<input " + disabledString + " type='text' name='commissionRate' id='commissionRate" + user._id + "' placeholder='" + masterCommission + "'>";

        var isRecommendMaster = false;
        var setRecommendedMasterButtonString = "";

        if (user.isMaster) {
          isRecommendMaster = '是';
          setRecommendedMasterButtonString = "<button " + disabledString + " class='btn btn-warning btn-sm' value='"
            + user._id
            + "' data-ng-click='showChangeCommissionModal($event)' id='"+ user.nickname +"'>修改</button>\n";
        } else {
          isRecommendMaster = '否';
          setRecommendedMasterButtonString = "<button " + disabledString + " class='btn btn-warning btn-sm' value='"
            + user._id
            + "' data-ng-click='showSetMasterModal($event)' id='"+ user.nickname +"'>设置推荐达人</button>\n";
        }


        var userRecommendMasterButtonString =
          "<form>" +
          "<div class='input-group'>" +
          //"<span class='input-group-addon'>佣金(%):</span>" +
          //commissionRateInputString +
          //"</div>" +
          //setRecommendedMasterButtonString
          //+
          //"<button " + disabledString + " class='btn btn-danger btn-sm' value='"
          //+ user._id
          //+ "' ng-click='showCancelSetMasterModal($event);' id='"+ user.nickname +"'>取消推荐达人</button>"
          + "</div></form>";
        return [
          insertSpaceIntoString(user._id),
          insertSpaceIntoString(user.wechatOpenId),
          user.nickname,
          isRecommendMaster,
          followedWeChatString,
          userRecommendMasterButtonString
        ];
      }

      $("#userListTable").on('draw.dt', function () {
        $compile($("#userListTable"))($scope);
      });

      $http.get('/admin/users').success(function (response) {
        $scope.users = response.data;
        var usersData = [];
        for (var i = 0; i < $scope.users.length; i++) {
          var user = $scope.users[i];
          usersData.push(buildTableForUsers(user));
        }

        $("#userListTable").DataTable({
          data: usersData,
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


      var setMasterID = null;
      var setMasterRow = null;
      var setMasterCommissionRate = null;
      $scope.showSetMasterModal = function ($event) {
        setMasterID = $event.toElement.value;
        var nickname = $event.toElement.getAttribute('id');
        setMasterCommissionRate = document.getElementById("commissionRate" + setMasterID).value;//推荐达人的佣金
        if(setMasterCommissionRate == null || setMasterCommissionRate == 0){
          setMasterCommissionRate = 0;
        }
        var confirmString = "";
        if (setMasterCommissionRate > 0 && setMasterCommissionRate != null) {
          confirmString = "（佣金比例为" + setMasterCommissionRate + "%）";
        } else {
          confirmString = "（您没有设置佣金比例!）";
        }

        setMasterRow = $("#userListTable").DataTable().row($($event.toElement).parents('tr'));

        $("#setMasterModalContent").html("确定将 <strong>微信用户: <i>  " + nickname + "</i></strong> 设置为推荐达人吗?" + confirmString);
        $("#setMasterModal").modal('show');
      };

      var cancelMasterId = null;
      var cancelMasterRow = null;
      $scope.showCancelSetMasterModal = function ($event) {
        cancelMasterId = $event.toElement.value;
        var nickname = $event.toElement.getAttribute('id');
        cancelMasterRow = $("#userListTable").DataTable().row($($event.toElement).parents('tr'));

        $("#cancelSetMasterModalContent").html("确定要取消 微信用户: " + nickname + " 的推荐达人身份吗?");
        $("#cancelSetMasterModal").modal('show');
      };

      var changeCommissionId = null;
      var changeCommissionRow = null;
      var changeCommissionRate = null;
      $scope.showChangeCommissionModal = function ($event) {
        changeCommissionId = $event.toElement.value;
        var nickname = $event.toElement.getAttribute('id');
        var commissionRate = document.getElementById("commissionRate" + changeCommissionId).value;
        if(!commissionRate){
          changeCommissionRate = document.getElementById("commissionRate" + changeCommissionId).getAttribute('placeholder');
        }else{
          changeCommissionRate = commissionRate;
        }
        changeCommissionRow = $("#userListTable").DataTable().row($($event.toElement).parents('tr'));

        $("#changeCommissionModalContent").html("确定要修改 微信用户: " + nickname + " 的佣金为" + changeCommissionRate + "%吗?");
        $("#changeCommissionModal").modal('show');
      };

      //设置用户为推荐达人
      $scope.setRecommendedMaster = function () {
        var master = {};
        master.id = setMasterID;
        master.commissionRate = setMasterCommissionRate;
        $http.post('/admin/users', master).success(function (response) {
          //modifyUserRow = $("#userListTable").DataTable().row($($event.toElement).parents('tr'));
          setMasterRow.data(buildTableForUsers(response.data)).draw(false);
          $("#setMasterModal").modal('hide');
        }).error(function (response) {
          console.log(response);
        });
      };

      //修改佣金
      $scope.changeMasterCommissionRate = function () {
        $http.put('/admin/users/' + changeCommissionId, {commissionRate: changeCommissionRate}).success(function (response) {
          //modifyUserRow = $("#userListTable").DataTable().row($($event.toElement).parents('tr'));
          changeCommissionRow.data(buildTableForUsers(response.data)).draw(false);
          $("#changeCommissionModal").modal('hide');
        }).error(function (response) {
          console.log(response);
        });
      };
      //取消推荐达人
      $scope.cancelRecommendedMaster = function () {
        $http.delete('/admin/users/' + cancelMasterId).success(function (response) {
          cancelMasterRow.data(buildTableForUsers(response.data)).draw(false);
          $("#cancelSetMasterModal").modal('hide');
        }).error(function (response) {
          console.log(response);
        });
      };
    }

  ]);
});
