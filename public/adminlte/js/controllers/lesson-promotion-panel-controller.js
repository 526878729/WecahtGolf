define(['adminApp', 'bootstrapDataTables', 'fastClick', 'utility'], function (adminApp) {

  adminApp.controller('lessonPromotionPanelController',
    ['$scope', '$http', '$compile',
      function ($scope, $http, $compile) {
        function generateDatatablesDataArrayForLessonPromotion(lessonPromotion) {
          var lessonPromotionModifyRemoveButtonString =
            "<button class='btn btn-warning btn-sm' value='"
            + lessonPromotion._id
            + "' ng-click='showModifyLessonPromotionRow($event);'>修改</button>\n<button class='btn btn-danger btn-sm' value='"
            + lessonPromotion._id
            + "' ng-click='showRemoveLessonPromotionModal($event);'>删除</button>";
          return [
            insertSpaceIntoString(lessonPromotion._id),
            lessonPromotion.lessonTitle,
            lessonPromotion.title,
            lessonPromotion.fees / 100,
            formatDate((new Date(lessonPromotion.activityDate)), "yyyy-MM-dd"),
            lessonPromotionModifyRemoveButtonString
          ];
        }

        function generateLessonPromotionSubmissionData(originalLessonPromotionData) {
          var submissionLessonPromotionData = {};
          $.extend(submissionLessonPromotionData, originalLessonPromotionData);

          delete submissionLessonPromotionData._id;
          delete submissionLessonPromotionData.lessonTitle;

          submissionLessonPromotionData.fees = parseInt(submissionLessonPromotionData.fees * 100);

          return submissionLessonPromotionData;
        }

        $('#newLessonPromotionActivityDate').datepicker({format: 'yyyy-mm-dd'});

        $('#updatedLessonPromotionActivityDate').datepicker({format: 'yyyy-mm-dd'});

        $("#lessonPromotionListTable").on('draw.dt', function () {
          $compile($("#lessonPromotionListTable"))($scope);
        });

        $http.get("/admin/lessons")
          .success(function (response) {
            $scope.lessons = response.data;

            $http.get("/admin/lessonPromotions")
              .success(function (response) {
                $scope.lessonPromotions = response.data;
                var lessonPromotionsData = [];
                for (var i = 0; i < $scope.lessonPromotions.length; i++) {
                  var lessonPromotion = $scope.lessonPromotions[i];
                  for (var j = 0; j < $scope.lessons.length; j++) {
                    if ($scope.lessons[j]._id == lessonPromotion.lessonId) {
                      lessonPromotion.lessonTitle = $scope.lessons[j].title;
                      break;
                    }
                  }
                  lessonPromotionsData.push(generateDatatablesDataArrayForLessonPromotion(lessonPromotion));
                }

                $("#lessonPromotionListTable").DataTable({
                  data: lessonPromotionsData,
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

          }).error(function (response, status) {
          console.log(response);
        });

        $scope.showCreateLessonPromotionRow = function () {
          $scope.newLessonPromotion = {};
          if ($scope.lessons && $scope.lessons.length > 0) {
            $scope.newLessonPromotion.lessonId = $scope.lessons[0]._id;
          }
          $scope.newLessonPromotion.inStock = true;

          $('#createLessonPromotionRow').collapse('show');
        };

        $scope.createLessonPromotion = function () {
          console.log($scope.createLessonPromotionForm.$valid);
          for (var a in $scope.createLessonPromotionForm) {
            if ($scope.createLessonPromotionForm.hasOwnProperty(a) && $scope.createLessonPromotionForm[a] != undefined) {
              if (!$scope.createLessonPromotionForm[a].$valid && $scope.createLessonPromotionForm[a].hasOwnProperty("$valid")) {
                console.log(a + " " + $scope.createLessonPromotionForm[a].$valid);
              }
            }
          }

          console.log($scope.newLessonPromotion);

          if ($scope.createLessonPromotionForm.$valid) {
            var newLessonPromotionData = generateLessonPromotionSubmissionData($scope.newLessonPromotion);

            $http.post('/admin/lessonPromotions', newLessonPromotionData).success(function (response, status, headers, config) {
              var lessonPromotion = response.data;
              $scope.lessonPromotions.push(lessonPromotion);

              var lessonPromotionListTable = $("#lessonPromotionListTable").DataTable();
              lessonPromotionListTable.row.add(generateDatatablesDataArrayForLessonPromotion(lessonPromotion)).draw(false);
              lessonPromotionListTable.page("last").draw(false);

              $('#createLessonPromotionRow').collapse('hide')
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };

        var modifyLessonPromotionIndex = -1;
        var modifyLessonPromotionID = null;
        var modifyLessonPromotionRow = null;
        $scope.showModifyLessonPromotionRow = function ($event) {
          modifyLessonPromotionID = $event.toElement.value;
          modifyLessonPromotionRow = $("#lessonPromotionListTable").DataTable().row($($event.toElement).parents('tr'));

          var selectedLessonPromotion = null;
          for (var i = 0; i < $scope.lessonPromotions.length; i++) {
            var lessonPromotion = $scope.lessonPromotions[i];
            if (lessonPromotion._id == modifyLessonPromotionID) {
              modifyLessonPromotionIndex = i;
              selectedLessonPromotion = lessonPromotion;
              break;
            }
          }

          $scope.updatedLessonPromotion = {};
          $.extend($scope.updatedLessonPromotion, selectedLessonPromotion);

          $scope.updatedLessonPromotion.id = insertSpaceIntoString(modifyLessonPromotionID);
          $scope.updatedLessonPromotion.activityDate = formatDate((new Date(selectedLessonPromotion.activityDate)), "yyyy-MM-dd");
          $('#updatedLessonPromotionActivityDate').datepicker('update', $scope.updatedLessonPromotion.activityDate);
          $scope.updatedLessonPromotion.fees = selectedLessonPromotion.fees / 100;

          if ($scope.updatedLessonPromotion.photos) {
            $("#updatedLessonPromotionPhotoPreview").attr("src", $scope.updatedLessonPromotion.photos[0]);
          }

          $('#modifyLessonPromotionRow').collapse('show')
        };

        $scope.modifyLessonPromotion = function () {
          var updatedLessonPromotionData = generateLessonPromotionSubmissionData($scope.updatedLessonPromotion);
          delete updatedLessonPromotionData.id;

          if (updatedLessonPromotionData.photoData) {
            delete updatedLessonPromotionData.photos;
            delete updatedLessonPromotionData.thumbnail;
          }

          $http.put('/admin/lessonPromotions/' + modifyLessonPromotionID,
            updatedLessonPromotionData).success(function (response, status, headers, config) {
            var resultUpdatedLessonPromotion = response.data;
            $scope.lessonPromotions[modifyLessonPromotionIndex] = resultUpdatedLessonPromotion;

            for (var j = 0; j < $scope.lessons.length; j++) {
              if ($scope.lessons[j]._id == resultUpdatedLessonPromotion.lessonId) {
                resultUpdatedLessonPromotion.lessonTitle = $scope.lessons[j].title;
                break;
              }
            }

            modifyLessonPromotionRow.data(generateDatatablesDataArrayForLessonPromotion(resultUpdatedLessonPromotion)).draw(false);
            $('#modifyLessonPromotionRow').collapse('hide');
          }).error(function (response, status) {
            console.log(response);
          });
        };

        var removeLessonPromotionIndex = -1;
        var removeLessonPromotionID = null;
        var removeLessonPromotionRow = null;
        $scope.showRemoveLessonPromotionModal = function ($event) {
          removeLessonPromotionID = $event.toElement.value;
          removeLessonPromotionRow = $("#lessonPromotionListTable").DataTable().row($($event.toElement).parents('tr'));

          for (var i = 0; i < $scope.lessonPromotions.length; i++) {
            var lessonPromotion = $scope.lessonPromotions[i];
            if (lessonPromotion._id == removeLessonPromotionID) {
              removeLessonPromotionIndex = i;
              $("#removeLessonPromotionModalContent").html("确定要移除 ID: " + insertSpaceIntoString(lessonPromotion._id) + " 名称: " + lessonPromotion.title + " 的课程促销吗?");
              $("#removeLessonPromotionModal").modal('show');
              break;
            }
          }
        };

        $scope.removeLessonPromotion = function () {
          if (removeLessonPromotionID != null && removeLessonPromotionRow != null) {
            $http.delete('/admin/lessonPromotions/' + removeLessonPromotionID).success(function (response, status, headers, config) {
              removeLessonPromotionRow.remove().draw(false);
              $("#removeLessonPromotionModal").modal('hide');
              $scope.lessonPromotions.splice(removeLessonPromotionIndex, 1);
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };
      }
    ]);
});