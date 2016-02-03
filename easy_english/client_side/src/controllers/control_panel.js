var app = angular.module('EnglishMoviesSchool');

app.controller('ControlPanelCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

}]);

app.controller('VideoFilesManageCtrl', [
    '$rootScope', '$scope', '$timeout', 'hotkeys', function ($rootScope, $scope, $timeout, hotkeys) {

        $scope.panel = {
            isOpened: false,
            open: openPanel,
            close: closePanel,
            engSubDelay: 1,
            rusSubDelay: 1,
            onBtnChangeVideoFileClick: onBtnChangeVideoFileClick,
            onBtnChangeEngSubtitlesClick: onBtnChangeEngSubtitlesClick,
            onBtnChangeRusSubtitlesClick: onBtnChangeRusSubtitlesClick,
            onEngSubtitlesChangeDelay: onEngSubtitlesChangeDelay,
            onRusSubtitlesChangeDelay: onRusSubtitlesChangeDelay
        };

        function openPanel() {
            $scope.panel.isOpened = true;
        }

        function closePanel() {
            $scope.panel.isOpened = false;
        }

        function onBtnChangeVideoFileClick() {
            $("#add-file").trigger('click');
        }

        function onBtnChangeEngSubtitlesClick() {
            $("#add-en-sub").trigger('click');
        }

        function onBtnChangeRusSubtitlesClick() {
            $("#add-ru-sub").trigger('click');
        }

        function onEngSubtitlesChangeDelay() {
            $rootScope.$broadcast('VideoFilesManageCtrl:eng_sub_delay:changed', $scope.panel.engSubDelay)
        }

        function onRusSubtitlesChangeDelay() {
            $rootScope.$broadcast('VideoFilesManageCtrl:rus_sub_delay:changed', $scope.panel.rusSubDelay)
        }

        // HOTKEYS
        hotkeys.bindTo($scope)
            .add({
                combo: 'esc',
                description: 'Close panel',
                callback: closePanel
            })
            .add({
                combo: 'ctrl+alt+f',
                description: 'Open panel',
                callback: openPanel
            })
            .add({
                combo: 'ctrl+alt+v',
                description: 'Open video dialog',
                callback: onBtnChangeVideoFileClick
            })
            .add({
                combo: 'ctrl+alt+e',
                description: 'Open eng subtitle dialog',
                callback: onBtnChangeEngSubtitlesClick
            })
            .add({
                combo: 'ctrl+alt+r',
                description: 'Open rus subtitle dialog',
                callback: onBtnChangeRusSubtitlesClick
            })

    }]);
