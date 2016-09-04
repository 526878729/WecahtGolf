define(['adminApp', 'bootstrapDataTables', 'fastClick', 'utility'], function (adminApp) {
  var CourseTypes = ['山地', '丘陵', '海边', '滨海', '平原', '湖景+山景', '林克斯', '河川'];
  var CoursePuttingGreenGrasses = ['老鹰草'];
  var CourseFairwayGrasses = ['台湾草'];
  var CoursePriorities = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  adminApp.controller('coursePanelController',
    ['$scope', '$http', '$compile',
      function ($scope, $http, $compile) {
        function generateDatatablesDataArrayForCourse(course) {
          var courseModifyRemoveButtonString =
            "<button class='btn btn-warning btn-sm' value='"
            + course._id
            + "' ng-click='showModifyCourseRow($event);'>修改</button>\n<button class='btn btn-danger btn-sm' value='"
            + course._idshowRemoveCourseModal
            + "' ng-click='showRemoveCourseModal($event);'>删除</button>";
          return [
            insertSpaceIntoString(course._id),
            course.name,
            course.type,
            course.address,
            courseModifyRemoveButtonString
          ];
        }

        function generateCourseSubmissionData(originalCourseData) {
          var submissionCourseData = {};
          $.extend(submissionCourseData, originalCourseData);

          delete submissionCourseData._id;

          submissionCourseData.geospatial = [parseFloat(submissionCourseData.longitude), parseFloat(submissionCourseData.latitude)];
          delete submissionCourseData.longitude;
          delete submissionCourseData.latitude;

          var teeTimesStartNumber = 0;
          var teeTimesStartArray = submissionCourseData.teeTimesStart.split(":");
          teeTimesStartNumber += 60 * parseInt(teeTimesStartArray[0]);
          teeTimesStartNumber += parseInt(teeTimesStartArray[1]);
          submissionCourseData.teeTimesStart = teeTimesStartNumber;

          var teeTimesEndNumber = 0;
          var teeTimesEndArray = submissionCourseData.teeTimesEnd.split(":");
          teeTimesEndNumber += 60 * parseInt(teeTimesEndArray[0]);
          teeTimesEndNumber += parseInt(teeTimesEndArray[1]);
          submissionCourseData.teeTimesEnd = teeTimesEndNumber;

          submissionCourseData.advanceReservationStart = 24 * 60 * submissionCourseData.advanceReservationStart;
          submissionCourseData.advanceReservationEnd = 24 * 60 * submissionCourseData.advanceReservationEnd;

          submissionCourseData.fees = parseInt(submissionCourseData.fees * 100);
          submissionCourseData.rebate = parseInt(submissionCourseData.rebate * 100);

          return submissionCourseData;
        }

        function changeIconForCourse(course, target) {
          var elementID = null;
          if (course == $scope.newCourse) {
            elementID = "#newCourseIconPreview";
          } else {
            elementID = "#updatedCourseIconPreview";
          }

          var reader = new FileReader();

          reader.onload = function (e) {
            $(elementID).attr("src", e.target.result);
            course.iconData = e.target.result;
          };

          if (target.files.length > 0) {
            var imgPath = target.value;
            var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
            if (extn == "png" || extn == "jpg" || extn == "jpeg") {
              reader.readAsDataURL(target.files[0]);
              course.iconType = extn;
            } else {
              $(elementID).attr("src", "");
              delete course.iconData;
              delete course.iconType;

              alert("请使用png,jpg或jpeg格式的图片!");
            }
          } else {
            $(elementID).attr("src", "");
            delete course.iconData;
            delete course.iconType;
          }
        }

        function changePhotoForCourse(course, target) {
          var elementID = null;
          if (course == $scope.newCourse) {
            elementID = "#newCoursePhotoPreview";
          } else {
            elementID = "#updatedCoursePhotoPreview";
          }

          var reader = new FileReader();

          reader.onload = function (e) {
            $(elementID).attr("src", e.target.result);
            course.photoData = e.target.result;
          };

          if (target.files.length > 0) {
            var imgPath = target.value;
            var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
            if (extn == "png" || extn == "jpg" || extn == "jpeg") {
              reader.readAsDataURL(target.files[0]);
              course.photoType = extn;
            } else {
              $(elementID).attr("src", "");
              delete course.photoData;
              delete course.photoType;

              alert("请使用png,jpg或jpeg格式的图片!");
            }
          } else {
            $(elementID).attr("src", "");
            delete course.photoData;
            delete course.photoType;
          }
        }

        $scope.priorities = CoursePriorities;

        $('#newCourseEstablishedDate').datepicker({format: 'yyyy-mm-dd'});
        $scope.newCourseTypes = CourseTypes;
        $scope.newCoursePuttingGreenGrasses = CoursePuttingGreenGrasses;
        $scope.newCourseFairwayGrasses = CourseFairwayGrasses;
        $("#newCourseTeeTimesStart").timepicker({
          defaultTime: '8:30',
          showInputs: false,
          showMeridian: false
        });
        $("#newCourseTeeTimesEnd").timepicker({
          defaultTime: '18:30',
          showInputs: false,
          showMeridian: false
        });

        $('#updatedCourseEstablishedDate').datepicker({format: 'yyyy-mm-dd'});
        $scope.updatedCourseTypes = CourseTypes;
        $scope.updatedCoursePuttingGreenGrasses = CoursePuttingGreenGrasses;
        $scope.updatedCourseFairwayGrasses = CourseFairwayGrasses;
        $("#updatedCourseTeeTimesStart").timepicker({
          defaultTime: '8:30',
          showInputs: false,
          showMeridian: false
        });
        $("#updatedCourseTeeTimesEnd").timepicker({
          defaultTime: '18:30',
          showInputs: false,
          showMeridian: false
        });

        $("#courseListTable").on('draw.dt', function () {
          $compile($("#courseListTable"))($scope);
        });

        $("#newCoursePhoto").on('change', function () {
          changePhotoForCourse($scope.newCourse, this);
        });

        $("#updatedCoursePhoto").on('change', function () {
          changePhotoForCourse($scope.updatedCourse, this);
        });

        /*
         * icon
         * */
        $("#newCourseIcon").on('change', function () {
          changeIconForCourse($scope.newCourse, this);
        });

        //$("#updatedCourseIcon").on('change', function () {
        //  changeIconForCourse($scope.updatedCourse, this);
        //});

        $http.get("/admin/courses")
          .success(function (response) {
            $scope.courses = response.data;
            var coursesData = [];
            for (var i = 0; i < $scope.courses.length; i++) {
              var course = $scope.courses[i];
              coursesData.push(generateDatatablesDataArrayForCourse(course));
            }

            $("#courseListTable").DataTable({
              data: coursesData,
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

        $scope.showCreateCourseRow = function () {
          $scope.newCourse = {};
          $scope.newCourse.official = false;
          $scope.newCourse.priority = CoursePriorities[4];
          $scope.newCourse.teeTimesStart = '8:30';
          $("#newCourseTeeTimesStart").timepicker('setTime', $scope.newCourse.teeTimesStart);
          $scope.newCourse.teeTimesEnd = '18:30';
          $("#newCourseTeeTimesEnd").timepicker('setTime', $scope.newCourse.teeTimesEnd);
          $scope.newCourse.enabled = true;

          $('#createCourseRow').collapse('show');
        };

        $scope.createCourse = function () {
          console.log($scope.createCourseForm.$valid);
          for (var a in $scope.createCourseForm) {
            if ($scope.createCourseForm.hasOwnProperty(a) && $scope.createCourseForm[a] != undefined) {
              if (!$scope.createCourseForm[a].$valid && $scope.createCourseForm[a].hasOwnProperty("$valid")) {
                console.log(a + " " + $scope.createCourseForm[a].$valid);
              }
            }
          }

          console.log($scope.newCourse);

          if ($scope.createCourseForm.$valid) {
            var newCourseData = generateCourseSubmissionData($scope.newCourse);

            $http.post('/admin/courses', newCourseData).success(function (response, status, headers, config) {
              var course = response.data;
              $scope.courses.push(course);

              var courseListTable = $("#courseListTable").DataTable();
              courseListTable.row.add(generateDatatablesDataArrayForCourse(course)).draw(false);
              courseListTable.page("last").draw(false);

              $('#createCourseRow').collapse('hide')
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };

        var modifyCourseIndex = -1;
        var modifyCourseID = null;
        var modifyCourseRow = null;
        $scope.showModifyCourseRow = function ($event) {
          modifyCourseID = $event.toElement.value;
          modifyCourseRow = $("#courseListTable").DataTable().row($($event.toElement).parents('tr'));

          var selectedCourse = null;
          for (var i = 0; i < $scope.courses.length; i++) {
            var course = $scope.courses[i];
            if (course._id == modifyCourseID) {
              modifyCourseIndex = i;
              selectedCourse = course;
              break;
            }
          }

          $scope.updatedCourse = {};
          $.extend($scope.updatedCourse, selectedCourse);

          $scope.updatedCourse.id = insertSpaceIntoString(modifyCourseID);
          $scope.updatedCourse.establishedDate = formatDate((new Date(selectedCourse.establishedDate)), "yyyy-MM-dd");
          $('#updatedCourseEstablishedDate').datepicker('update', $scope.updatedCourse.establishedDate);
          $scope.updatedCourse.priority = selectedCourse.priority.toString();
          $scope.updatedCourse.type = selectedCourse.type.split(',');
          $scope.updatedCourse.puttingGreenGrass = selectedCourse.puttingGreenGrass.split(',');
          $scope.updatedCourse.fairwayGrass = selectedCourse.fairwayGrass.split(',');
          $scope.updatedCourse.longitude = selectedCourse.geospatial[0];
          $scope.updatedCourse.latitude = selectedCourse.geospatial[1];

          var teeTimesStartHour = parseInt(selectedCourse.teeTimesStart / 60);
          var teeTimesStartMinute = selectedCourse.teeTimesStart % 60;
          $scope.updatedCourse.teeTimesStart = teeTimesStartHour + ':' + (teeTimesStartMinute < 10 ? teeTimesStartMinute + "0" : teeTimesStartMinute);
          $("#updatedCourseTeeTimesStart").timepicker('setTime', $scope.updatedCourse.teeTimesStart);
          var teeTimesEndHour = parseInt(selectedCourse.teeTimesEnd / 60);
          var teeTimesEndMinute = selectedCourse.teeTimesEnd % 60;
          $scope.updatedCourse.teeTimesEnd = teeTimesEndHour + ':' + (teeTimesEndMinute < 10 ? teeTimesEndMinute + "0" : teeTimesEndMinute);
          $("#updatedCourseTeeTimesEnd").timepicker('setTime', $scope.updatedCourse.teeTimesEnd);

          $scope.updatedCourse.advanceReservationStart = selectedCourse.advanceReservationStart / (60 * 24);
          $scope.updatedCourse.advanceReservationEnd = selectedCourse.advanceReservationEnd / (60 * 24);

          $scope.updatedCourse.fees = selectedCourse.fees / 100;
          $scope.updatedCourse.rebate = selectedCourse.rebate / 100;

          if ($scope.updatedCourse.photos) {
            $("#updatedCoursePhotoPreview").attr("src", $scope.updatedCourse.photos[0]);
          }

          $('#modifyCourseRow').collapse('show')
        };

        $scope.modifyCourse = function () {
          var updatedCourseData = generateCourseSubmissionData($scope.updatedCourse);
          delete updatedCourseData.id;

          if (updatedCourseData.photoData) {
            delete updatedCourseData.photos;
            delete updatedCourseData.thumbnail;
          }

          $http.put('/admin/courses/' + modifyCourseID,
            updatedCourseData).success(function (response, status, headers, config) {
              var resultUpdatedCourse = response.data;
              $scope.courses[modifyCourseIndex] = resultUpdatedCourse;
              modifyCourseRow.data(generateDatatablesDataArrayForCourse(resultUpdatedCourse)).draw(false);
              $('#modifyCourseRow').collapse('hide');
            }).error(function (response, status) {
              console.log(response);
            });
        };

        var removeCourseIndex = -1;
        var removeCourseID = null;
        var removeCourseRow = null;
        $scope.showRemoveCourseModal = function ($event) {
          removeCourseID = $event.toElement.value;
          removeCourseRow = $("#courseListTable").DataTable().row($($event.toElement).parents('tr'));

          for (var i = 0; i < $scope.courses.length; i++) {
            var course = $scope.courses[i];
            if (course._id == removeCourseID) {
              removeCourseIndex = i;
              $("#removeCourseModalContent").html("确定要移除 ID: " + insertSpaceIntoString(course._id) + " 名称: " + course.name + " 的球场吗?");
              $("#removeCourseModal").modal('show');
              break;
            }
          }
        };

        $scope.removeCourse = function () {
          if (removeCourseID != null && removeCourseRow != null) {
            $http.delete('/admin/courses/' + removeCourseID).success(function (response, status, headers, config) {
              removeCourseRow.remove().draw(false);
              $("#removeCourseModal").modal('hide');
              $scope.courses.splice(removeCourseIndex, 1);
            }).error(function (response, status) {
              console.log(response);
            });
          }
        };
      }
    ]);
});