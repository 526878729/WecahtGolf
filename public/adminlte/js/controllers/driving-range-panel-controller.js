define(['adminApp', 'bootstrapDataTables', 'fastClick', 'utility'], function (adminApp) {
  var DrivingRangeTypes = ['山地', '丘陵', '海边', '滨海', '平原', '湖景+山景', '林克斯', '河川'];
  var DrivingRangePuttingGreenGrasses = ['老鹰草'];
  var DrivingRangeFairwayGrasses = ['台湾草'];
  var DrivingRangePriorities = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  adminApp.controller('drivingRangePanelController',
    ['$scope', '$http', '$compile',
      function ($scope, $http, $compile) {
        function generateDatatablesDataArrayForDrivingRange(drivingRange) {
          var drivingRangeModifyRemoveButtonString =
            "<button class='btn btn-warning btn-sm' value='"
            + drivingRange._id
            + "' ng-click='showModifyDrivingRangeRow($event);'>修改</button>\n<button class='btn btn-danger btn-sm' value='"
            + drivingRange._id
            + "' ng-click='showRemoveDrivingRangeModal($event);'>删除</button>";
          return [
            insertSpaceIntoString(drivingRange._id),
            drivingRange.name,
            drivingRange.type,
            drivingRange.address,
            drivingRangeModifyRemoveButtonString
          ];
        }

        function generateDrivingRangeSubmissionData(originalDrivingRangeData) {
          var submissionDrivingRangeData = {};
          $.extend(submissionDrivingRangeData, originalDrivingRangeData);

          delete submissionDrivingRangeData._id;

          submissionDrivingRangeData.geospatial = [parseFloat(submissionDrivingRangeData.longitude), parseFloat(submissionDrivingRangeData.latitude)];
          delete submissionDrivingRangeData.longitude;
          delete submissionDrivingRangeData.latitude;

          var teeTimesStartNumber = 0;
          var teeTimesStartArray = submissionDrivingRangeData.teeTimesStart.split(":");
          teeTimesStartNumber += 60 * parseInt(teeTimesStartArray[0]);
          teeTimesStartNumber += parseInt(teeTimesStartArray[1]);
          submissionDrivingRangeData.teeTimesStart = teeTimesStartNumber;

          var teeTimesEndNumber = 0;
          var teeTimesEndArray = submissionDrivingRangeData.teeTimesEnd.split(":");
          teeTimesEndNumber += 60 * parseInt(teeTimesEndArray[0]);
          teeTimesEndNumber += parseInt(teeTimesEndArray[1]);
          submissionDrivingRangeData.teeTimesEnd = teeTimesEndNumber;

          submissionDrivingRangeData.advanceReservationStart = 24 * 60 * submissionDrivingRangeData.advanceReservationStart;
          submissionDrivingRangeData.advanceReservationEnd = 24 * 60 * submissionDrivingRangeData.advanceReservationEnd;

          submissionDrivingRangeData.fees = parseInt(submissionDrivingRangeData.fees * 100);
          submissionDrivingRangeData.rebate = parseInt(submissionDrivingRangeData.rebate * 100);

          return submissionDrivingRangeData;
        }

        function changePhotoForDrivingRange(drivingRange, target) {
          var elementID = null;
          if (drivingRange == $scope.newDrivingRange) {
            elementID = "#newDrivingRangePhotoPreview";
          } else {
            elementID = "#updatedDrivingRangePhotoPreview";
          }

          var reader = new FileReader();

          reader.onload = function (e) {
            $(elementID).attr("src", e.target.result);
            drivingRange.photoData = e.target.result;
          };

          if (target.files.length > 0) {
            var imgPath = target.value;
            var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
            if (extn == "png" || extn == "jpg" || extn == "jpeg") {
              reader.readAsDataURL(target.files[0]);
              drivingRange.photoType = extn;
            } else {
              $(elementID).attr("src", "");
              delete drivingRange.photoData;
              delete drivingRange.photoType;

              alert("请使用png,jpg或jpeg格式的图片!");
            }
          } else {
            $(elementID).attr("src", "");
            delete drivingRange.photoData;
            delete drivingRange.photoType;
          }
        }

        $scope.priorities = DrivingRangePriorities;

        $('#newDrivingRangeEstablishedDate').datepicker({format: 'yyyy-mm-dd'});
        $scope.newDrivingRangeTypes = DrivingRangeTypes;
        $scope.newDrivingRangePuttingGreenGrasses = DrivingRangePuttingGreenGrasses;
        $scope.newDrivingRangeFairwayGrasses = DrivingRangeFairwayGrasses;
        $("#newDrivingRangeTeeTimesStart").timepicker({
          defaultTime: '8:30',
          showInputs: false,
          showMeridian: false
        });
        $("#newDrivingRangeTeeTimesEnd").timepicker({
          defaultTime: '18:30',
          showInputs: false,
          showMeridian: false
        });

        $('#updatedDrivingRangeEstablishedDate').datepicker({format: 'yyyy-mm-dd'});
        $scope.updatedDrivingRangeTypes = DrivingRangeTypes;
        $scope.updatedDrivingRangePuttingGreenGrasses = DrivingRangePuttingGreenGrasses;
        $scope.updatedDrivingRangeFairwayGrasses = DrivingRangeFairwayGrasses;
        $("#updatedDrivingRangeTeeTimesStart").timepicker({
          defaultTime: '8:30',
          showInputs: false,
          showMeridian: false
        });
        $("#updatedDrivingRangeTeeTimesEnd").timepicker({
          defaultTime: '18:30',
          showInputs: false,
          showMeridian: false
        });

        $("#drivingRangeListTable").on('draw.dt', function () {
          $compile($("#drivingRangeListTable"))($scope);
        });

        $("#newDrivingRangePhoto").on('change', function () {
          changePhotoForDrivingRange($scope.newDrivingRange, this);
        });

        $("#updatedDrivingRangePhoto").on('change', function () {
          changePhotoForDrivingRange($scope.updatedDrivingRange, this);
        });

        $http.get("/admin/drivingRanges")
          .success(function (response) {
            $scope.drivingRanges = response.data;
            var drivingRangesData = [];
            for (var i = 0; i < $scope.drivingRanges.length; i++) {
              var drivingRange = $scope.drivingRanges[i];
              drivingRangesData.push(generateDatatablesDataArrayForDrivingRange(drivingRange));
            }

            $("#drivingRangeListTable").DataTable({
              data: drivingRangesData,
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

        $scope.showCreateDrivingRangeRow = function () {
          $scope.newDrivingRange = {};
          $scope.newDrivingRange.official = false;
          $scope.newDrivingRange.priority = DrivingRangePriorities[4];
          $scope.newDrivingRange.teeTimesStart = '8:30';
          $("#newDrivingRangeTeeTimesStart").timepicker('setTime', $scope.newDrivingRange.teeTimesStart);
          $scope.newDrivingRange.teeTimesEnd = '18:30';
          $("#newDrivingRangeTeeTimesEnd").timepicker('setTime', $scope.newDrivingRange.teeTimesEnd);
          $scope.newDrivingRange.enabled = true;

          $('#createDrivingRangeRow').collapse('show');
        };

        /*
         * 增加和删除退款规则事件
         * */
        //$scope.refundRule = [];

        $scope.refundType = '%';

        $scope.refundElementList = ['1'];
        var i = 1;
        $scope.addRefundRule = function(){
          $scope.refundElementList[i] = 2;
          i++;
        };
        $scope.deleteRefundRule = function(key){
          $scope.refundElementList.splice(key, 1);
          i--;
        };

        //更改退款类型点击事件
        $scope.changRefundType = function(){
          if($scope.refundType=="%") {
            $scope.refundType = "元";
          }else{
            $scope.refundType="%";
          }
        };


        $scope.createDrivingRange = function () {
          console.log($scope.createDrivingRangeForm.$valid);
          for (var a in $scope.createDrivingRangeForm) {
            if ($scope.createDrivingRangeForm.hasOwnProperty(a) && $scope.createDrivingRangeForm[a] != undefined) {
              if (!$scope.createDrivingRangeForm[a].$valid && $scope.createDrivingRangeForm[a].hasOwnProperty("$valid")) {
                console.log(a + " " + $scope.createDrivingRangeForm[a].$valid);
              }
            }
          }

          console.log($scope.newDrivingRange);

          if ($scope.createDrivingRangeForm.$valid) {
            var newDrivingRangeData = generateDrivingRangeSubmissionData($scope.newDrivingRange);

            $http.post('/admin/drivingRanges', newDrivingRangeData).success(function (response, status, headers, config) {
              var drivingRange = response.data;
              $scope.drivingRanges.push(drivingRange);

              var drivingRangeListTable = $("#drivingRangeListTable").DataTable();
              drivingRangeListTable.row.add(generateDatatablesDataArrayForDrivingRange(drivingRange)).draw(false);
              drivingRangeListTable.page("last").draw(false);

              $('#createDrivingRangeRow').collapse('hide')
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };

        var modifyDrivingRangeIndex = -1;
        var modifyDrivingRangeID = null;
        var modifyDrivingRangeRow = null;
        $scope.showModifyDrivingRangeRow = function ($event) {
          modifyDrivingRangeID = $event.toElement.value;
          modifyDrivingRangeRow = $("#drivingRangeListTable").DataTable().row($($event.toElement).parents('tr'));

          var selectedDrivingRange = null;
          for (var i = 0; i < $scope.drivingRanges.length; i++) {
            var drivingRange = $scope.drivingRanges[i];
            if (drivingRange._id == modifyDrivingRangeID) {
              modifyDrivingRangeIndex = i;
              selectedDrivingRange = drivingRange;
              break;
            }
          }

          $scope.updatedDrivingRange = {};
          $.extend($scope.updatedDrivingRange, selectedDrivingRange);

          $scope.updatedDrivingRange.id = insertSpaceIntoString(modifyDrivingRangeID);
          $scope.updatedDrivingRange.establishedDate = formatDate((new Date(selectedDrivingRange.establishedDate)), "yyyy-MM-dd");
          $('#updatedDrivingRangeEstablishedDate').datepicker('update', $scope.updatedDrivingRange.establishedDate);
          $scope.updatedDrivingRange.priority = selectedDrivingRange.priority.toString();
          $scope.updatedDrivingRange.type = selectedDrivingRange.type.split(',');
          $scope.updatedDrivingRange.puttingGreenGrass = selectedDrivingRange.puttingGreenGrass.split(',');
          $scope.updatedDrivingRange.fairwayGrass = selectedDrivingRange.fairwayGrass.split(',');
          $scope.updatedDrivingRange.longitude = selectedDrivingRange.geospatial[0];
          $scope.updatedDrivingRange.latitude = selectedDrivingRange.geospatial[1];

          var teeTimesStartHour = parseInt(selectedDrivingRange.teeTimesStart / 60);
          var teeTimesStartMinute = selectedDrivingRange.teeTimesStart % 60;
          $scope.updatedDrivingRange.teeTimesStart = teeTimesStartHour + ':' + (teeTimesStartMinute < 10 ? teeTimesStartMinute + "0" : teeTimesStartMinute);
          $("#updatedDrivingRangeTeeTimesStart").timepicker('setTime', $scope.updatedDrivingRange.teeTimesStart);
          var teeTimesEndHour = parseInt(selectedDrivingRange.teeTimesEnd / 60);
          var teeTimesEndMinute = selectedDrivingRange.teeTimesEnd % 60;
          $scope.updatedDrivingRange.teeTimesEnd = teeTimesEndHour + ':' + (teeTimesEndMinute < 10 ? teeTimesEndMinute + "0" : teeTimesEndMinute);
          $("#updatedDrivingRangeTeeTimesEnd").timepicker('setTime', $scope.updatedDrivingRange.teeTimesEnd);

          $scope.updatedDrivingRange.advanceReservationStart = selectedDrivingRange.advanceReservationStart / (60 * 24);
          $scope.updatedDrivingRange.advanceReservationEnd = selectedDrivingRange.advanceReservationEnd / (60 * 24);

          $scope.updatedDrivingRange.fees = selectedDrivingRange.fees / 100;
          $scope.updatedDrivingRange.rebate = selectedDrivingRange.rebate / 100;

          if ($scope.updatedDrivingRange.photos) {
            $("#updatedDrivingRangePhotoPreview").attr("src", $scope.updatedDrivingRange.photos[0]);
          }

          $('#modifyDrivingRangeRow').collapse('show')
        };



        $scope.modifyDrivingRange = function () {
          var updatedDrivingRangeData = generateDrivingRangeSubmissionData($scope.updatedDrivingRange);
          delete updatedDrivingRangeData.id;

          if (updatedDrivingRangeData.photoData) {
            delete updatedDrivingRangeData.photos;
            delete updatedDrivingRangeData.thumbnail;
          }

          $http.put('/admin/drivingRanges/' + modifyDrivingRangeID,
            updatedDrivingRangeData).success(function (response, status, headers, config) {
            var resultUpdatedDrivingRange = response.data;
            $scope.drivingRanges[modifyDrivingRangeIndex] = resultUpdatedDrivingRange;
            modifyDrivingRangeRow.data(generateDatatablesDataArrayForDrivingRange(resultUpdatedDrivingRange)).draw(false);
            $('#modifyDrivingRangeRow').collapse('hide');
          }).error(function (response, status) {
            console.log(response);
          });
        };

        var removeDrivingRangeIndex = -1;
        var removeDrivingRangeID = null;
        var removeDrivingRangeRow = null;
        $scope.showRemoveDrivingRangeModal = function ($event) {
          removeDrivingRangeID = $event.toElement.value;
          removeDrivingRangeRow = $("#drivingRangeListTable").DataTable().row($($event.toElement).parents('tr'));

          for (var i = 0; i < $scope.drivingRanges.length; i++) {
            var drivingRange = $scope.drivingRanges[i];
            if (drivingRange._id == removeDrivingRangeID) {
              removeDrivingRangeIndex = i;
              $("#removeDrivingRangeModalContent").html("确定要移除 ID: " + insertSpaceIntoString(drivingRange._id) + " 名称: " + drivingRange.name + " 的练习场吗?");
              $("#removeDrivingRangeModal").modal('show');
              break;
            }
          }
        };

        $scope.removeDrivingRange = function () {
          if (removeDrivingRangeID != null && removeDrivingRangeRow != null) {
            $http.delete('/admin/drivingRanges/' + removeDrivingRangeID).success(function (response, status, headers, config) {
              removeDrivingRangeRow.remove().draw(false);
              $("#removeDrivingRangeModal").modal('hide');
              $scope.drivingRanges.splice(removeDrivingRangeIndex, 1);
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };
      }
    ]);
});