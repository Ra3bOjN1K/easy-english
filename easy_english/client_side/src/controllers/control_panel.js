var app = angular.module('EnglishMoviesSchool');

app.controller('ControlPanelCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

}]);

app.controller('AuthorizationCtrl', [
    '$scope', 'AuthService', 'UserService', 'UserLoginForm', 'UserRegistrationForm',
    function ($scope, AuthService, UserService, UserLoginForm, UserRegistrationForm) {

        var vm = this;

        vm.panel = {
            isOpened: false,
            open: openPanel,
            close: closePanel
        };

        vm.login = {};
        vm.reg = {};
        vm.userLogOut = userLogOut;

        function initLoginForm() {
            return {
                model: {
                    email: null,
                    password: null
                },
                fields: angular.copy(UserLoginForm.getFieldsOptions()),
                formErrors: [],
                onSubmit: onLoginSubmit
            }
        }

        function initRegForm() {
            return {
                model: {
                    email: null,
                    password: null,
                    password_confirm: null
                },
                fields: angular.copy(UserRegistrationForm.getFieldsOptions()),
                formErrors: [],
                onSubmit: onRegSubmit
            }
        }

        function onLoginSubmit() {
            if (vm.login.form.$valid) {
                AuthService.login(vm.login.model.email, vm.login.model.password).then(function () {
                    closePanel();
                }, function (error) {
                    if (error.data && error.data.non_field_errors) {
                        vm.login.formErrors = error.data.non_field_errors;
                    }
                })
            }
        }

        function onRegSubmit() {
            if (vm.reg.form.$valid) {
                AuthService.signIn(
                    vm.reg.model.email,
                    vm.reg.model.password,
                    vm.reg.model.password_confirm
                ).then(function () {
                    closePanel();
                }, function (error) {
                    if (error.data) {
                        angular.forEach(error.data, function (attr) {
                            vm.reg.formErrors.push.apply(vm.reg.formErrors, attr);
                        })
                    }
                })
            }
        }

        function userLogOut () {
            AuthService.logout()
        }

        function clearLoginForm() {
            vm.login = {};
        }

        function clearRegForm() {
            vm.reg = {};
        }

        function openPanel() {
            vm.login = initLoginForm();
            vm.reg = initRegForm();
            vm.panel.isOpened = true;
        }

        function closePanel() {
            vm.panel.isOpened = false;
            clearLoginForm();
            clearRegForm();
        }

        vm.isUserLoggedIn = function () {
            return UserService.hasToken()
        };
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
