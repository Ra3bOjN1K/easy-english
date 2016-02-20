var app = angular.module('EnglishMoviesSchool');

app.controller('ApplicationCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

    //$scope.isBrowserChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    $scope.isBrowserChrome = true;
    $scope.onCloseVideoFileDialog = onCloseVideoFileDialog;
    $scope.onCloseEngSubtitlesDialog = onCloseEngSubtitlesDialog;
    $scope.onCloseRusSubtitlesDialog = onCloseRusSubtitlesDialog;

    function onCloseVideoFileDialog() {
        var fileElem = document.getElementById("add-file");
        var file = fileElem.files[0];

        $rootScope.$broadcast('ApplicationCtrl:video_file:change', file);
    }

    function onCloseEngSubtitlesDialog() {
        var fileElem = document.getElementById("add-en-sub");
        var file = fileElem.files[0];

        $rootScope.$broadcast('ApplicationCtrl:en_sub:change', file);
    }

    function onCloseRusSubtitlesDialog() {
        var fileElem = document.getElementById("add-ru-sub");
        var file = fileElem.files[0];

        $rootScope.$broadcast('ApplicationCtrl:ru_sub:change', file);
    }

}]);
