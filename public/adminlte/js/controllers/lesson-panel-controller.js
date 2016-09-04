define(['adminApp', 'bootstrapDataTables', 'fastClick', 'utility'], function (adminApp) {

  adminApp.controller('lessonPanelController',
    ['$scope', '$http', '$compile',
      function ($scope, $http, $compile) {
        function generateDatatablesDataArrayForLesson(lesson) {
          var lessonModifyRemoveButtonString =
            "<button class='btn btn-warning btn-sm' value='"
            + lesson._id
            + "' ng-click='showModifyLessonRow($event);'>修改</button>\n<button class='btn btn-danger btn-sm' value='"
            + lesson._id
            + "' ng-click='showRemoveLessonModal($event);'>删除</button>";
          return [
            insertSpaceIntoString(lesson._id),
            lesson.title,
            lesson.fees / 100,
            lesson.description,
            lessonModifyRemoveButtonString
          ];
        }

        function generateLessonSubmissionData(originalLessonData) {
          var submissionLessonData = {};
          $.extend(submissionLessonData, originalLessonData);

          delete submissionLessonData._id;

          submissionLessonData.type = 0;
          submissionLessonData.fees = parseInt(submissionLessonData.fees * 100);

          return submissionLessonData;
        }

        function changePhotoForLesson(lesson, target) {
          var elementID = null;
          if (lesson == $scope.newLesson) {
            elementID = "#newLessonPhotoPreview";
          } else {
            elementID = "#updatedLessonPhotoPreview";
          }

          var reader = new FileReader();

          reader.onload = function (e) {
            $(elementID).attr("src", e.target.result);
            lesson.photoData = e.target.result;
          };

          if (target.files.length > 0) {
            var imgPath = target.value;
            var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
            if (extn == "png" || extn == "jpg" || extn == "jpeg") {
              reader.readAsDataURL(target.files[0]);
              lesson.photoType = extn;
            } else {
              $(elementID).attr("src", "");
              delete lesson.photoData;
              delete lesson.photoType;

              alert("请使用png,jpg或jpeg格式的图片!");
            }
          } else {
            $(elementID).attr("src", "");
            delete lesson.photoData;
            delete lesson.photoType;
          }
        }

        $('#newLessonDateStart').datepicker({format: 'yyyy-mm-dd'});
        $('#newLessonDateEnd').datepicker({format: 'yyyy-mm-dd'});

        $('#updatedLessonDateStart').datepicker({format: 'yyyy-mm-dd'});
        $('#updatedLessonDateEnd').datepicker({format: 'yyyy-mm-dd'});

        $("#lessonListTable").on('draw.dt', function () {
          $compile($("#lessonListTable"))($scope);
        });

        $("#newLessonPhoto").on('change', function () {
          changePhotoForLesson($scope.newLesson, this);
        });

        $("#updatedLessonPhoto").on('change', function () {
          changePhotoForLesson($scope.updatedLesson, this);
        });

        $http.get("/admin/lessons")
          .success(function (response) {
            $scope.lessons = response.data;
            var lessonsData = [];
            for (var i = 0; i < $scope.lessons.length; i++) {
              var lesson = $scope.lessons[i];
              lessonsData.push(generateDatatablesDataArrayForLesson(lesson));
            }

            $("#lessonListTable").DataTable({
              data: lessonsData,
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

        $scope.showCreateLessonRow = function () {
          $scope.newLesson = {};
          $scope.newLesson.inStock = true;

          $('#createLessonRow').collapse('show');
        };

        $scope.createLesson = function () {
          console.log($scope.createLessonForm.$valid);
          for (var a in $scope.createLessonForm) {
            if ($scope.createLessonForm.hasOwnProperty(a) && $scope.createLessonForm[a] != undefined) {
              if (!$scope.createLessonForm[a].$valid && $scope.createLessonForm[a].hasOwnProperty("$valid")) {
                console.log(a + " " + $scope.createLessonForm[a].$valid);
              }
            }
          }

          console.log($scope.newLesson);

          if ($scope.createLessonForm.$valid) {
            var newLessonData = generateLessonSubmissionData($scope.newLesson);

            $http.post('/admin/lessons', newLessonData).success(function (response, status, headers, config) {
              var lesson = response.data;
              $scope.lessons.push(lesson);

              var lessonListTable = $("#lessonListTable").DataTable();
              lessonListTable.row.add(generateDatatablesDataArrayForLesson(lesson)).draw(false);
              lessonListTable.page("last").draw(false);

              $('#createLessonRow').collapse('hide')
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };

        var modifyLessonIndex = -1;
        var modifyLessonID = null;
        var modifyLessonRow = null;
        $scope.showModifyLessonRow = function ($event) {
          modifyLessonID = $event.toElement.value;
          modifyLessonRow = $("#lessonListTable").DataTable().row($($event.toElement).parents('tr'));

          var selectedLesson = null;
          for (var i = 0; i < $scope.lessons.length; i++) {
            var lesson = $scope.lessons[i];
            if (lesson._id == modifyLessonID) {
              modifyLessonIndex = i;
              selectedLesson = lesson;
              break;
            }
          }

          $scope.updatedLesson = {};
          $.extend($scope.updatedLesson, selectedLesson);

          $scope.updatedLesson.id = insertSpaceIntoString(modifyLessonID);
          $scope.updatedLesson.dateStart = formatDate((new Date(selectedLesson.dateStart.toString())), "yyyy-MM-dd");
          $scope.updatedLesson.dateEnd = formatDate((new Date(selectedLesson.dateEnd.toString())), "yyyy-MM-dd");
          $scope.updatedLesson.fees = selectedLesson.fees / 100;

          if ($scope.updatedLesson.photos) {
            $("#updatedLessonPhotoPreview").attr("src", $scope.updatedLesson.photos[0]);
          }

          $('#modifyLessonRow').collapse('show')
        };

        $scope.modifyLesson = function () {
          var updatedLessonData = generateLessonSubmissionData($scope.updatedLesson);
          delete updatedLessonData.id;

          if (updatedLessonData.photoData) {
            delete updatedLessonData.photos;
            delete updatedLessonData.thumbnail;
          }

          $http.put('/admin/lessons/' + modifyLessonID,
            updatedLessonData).success(function (response, status, headers, config) {
            var resultUpdatedLesson = response.data;
            $scope.lessons[modifyLessonIndex] = resultUpdatedLesson;
            modifyLessonRow.data(generateDatatablesDataArrayForLesson(resultUpdatedLesson)).draw(false);
            $('#modifyLessonRow').collapse('hide');
          }).error(function (response, status) {
            console.log(response);
          });
        };

        var removeLessonIndex = -1;
        var removeLessonID = null;
        var removeLessonRow = null;
        $scope.showRemoveLessonModal = function ($event) {
          removeLessonID = $event.toElement.value;
          removeLessonRow = $("#lessonListTable").DataTable().row($($event.toElement).parents('tr'));

          for (var i = 0; i < $scope.lessons.length; i++) {
            var lesson = $scope.lessons[i];
            if (lesson._id == removeLessonID) {
              removeLessonIndex = i;
              $("#removeLessonModalContent").html("确定要移除 ID: " + insertSpaceIntoString(lesson._id) + " 名称: " + lesson.title + " 的课程吗?");
              $("#removeLessonModal").modal('show');
              break;
            }
          }
        };

        $scope.removeLesson = function () {
          if (removeLessonID != null && removeLessonRow != null) {
            $http.delete('/admin/lessons/' + removeLessonID).success(function (response, status, headers, config) {
              removeLessonRow.remove().draw(false);
              $("#removeLessonModal").modal('hide');
              $scope.lessons.splice(removeLessonIndex, 1);
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };
      }
    ]);
});