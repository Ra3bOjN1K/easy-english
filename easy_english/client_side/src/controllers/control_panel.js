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

        function userLogOut() {
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

app.controller('UserWordsManagerCtrl', [
    'UserService', 'UserDictionaryService', '$q', '$timeout', '$scope',
    function (UserService, UserDictionaryService, $q, $timeout, $scope) {
        var vm = this;

        var DEFAULT_WORDS_PER_PAGE = 15;
        var DEFAULT_CURRENT_PAGE = 1;

        vm.panel = {
            isOpened: false,
            open: openPanel,
            close: closePanel
        };

        vm.actualWords = {
            list: [],
            checkedList: [],
            isAllWordsChecked: false,
            isLoaded: false,
            maxPageSize: 4,
            currentPage: DEFAULT_CURRENT_PAGE,
            totalWords: 1,
            wordsPerPage: DEFAULT_WORDS_PER_PAGE,
            onTabSelect: onActualWordsTabSelect,
            changePage: onChangeActualWordsPage,
            changeItemsPerPage: onChangeActualWordsItemsPerPage,
            checkActualWord: onCheckActualWord,
            checkAllWords: onCheckAllActualWords,
            deleteWord: deleteActualWord,
            sendWordToLearned: sendActualWordToLearned,
            exportCheckedToAnki: exportCheckedToAnki
        };

        vm.isUserLoggedIn = function () {
            return UserService.hasToken()
        };

        vm.isWordAddedToday = function (word) {
            var date = moment(word.created);
            var today = moment();
            return date.isSame(today.format('YYYY-MM-DD'), 'day')
        };

        function exportCheckedToAnki() {
            UserDictionaryService.exportWordsToCsv(vm.actualWords.checkedList);
        }

        function loadUserActualWords(currentPage, itemsPerPage) {
            var deferred = $q.defer();
            UserDictionaryService.getActualWords({
                'target_page': currentPage,
                'items_per_page': itemsPerPage
            }).then(function (result) {
                $timeout(function () {
                    vm.actualWords.totalWords = result.total_count;
                    vm.actualWords.list = angular.copy(result.foreign_words);
                    vm.actualWords.isLoaded = true;
                    markCheckedActualWords();
                });
                deferred.resolve(result)
            });
            return deferred.promise
        }

        function onActualWordsTabSelect() {
            $timeout(function () {
                initActualWordsTab();
                clearLearnedWordData();
            }, 10);
        }

        function onChangeActualWordsPage() {
            loadUserActualWords(vm.actualWords.currentPage, vm.actualWords.wordsPerPage);
        }

        function onChangeActualWordsItemsPerPage() {
            vm.actualWords.currentPage = DEFAULT_CURRENT_PAGE;
            loadUserActualWords(vm.actualWords.currentPage, vm.actualWords.wordsPerPage);
        }

        function markCheckedActualWords() {
            angular.forEach(vm.actualWords.checkedList, function (checkedId) {
                angular.forEach(vm.actualWords.list, function (actualWord) {
                    if (actualWord.id === checkedId) {
                        actualWord.isChecked = true
                    }
                })
            });
            setCheckedAllActualWords()
        }

        function onCheckActualWord(word) {
            if (word.isChecked) {
                checkActualWord(word)
            }
            else {
                uncheckActualWord(word)
            }
        }

        function onCheckAllActualWords() {
            if (vm.actualWords.isAllWordsChecked) {
                checkAllActualWords()
            }
            else {
                uncheckAllActualWords()
            }
        }

        function checkAllActualWords() {
            angular.forEach(vm.actualWords.list, function (word) {
                checkActualWord(word)
            })
        }

        function uncheckAllActualWords() {
            angular.forEach(vm.actualWords.list, function (word) {
                uncheckActualWord(word)
            })
        }

        function checkActualWord(word) {
            if (vm.actualWords.checkedList.indexOf(word.id) === -1) {
                word.isChecked = true;
                vm.actualWords.checkedList.push(word.id);
            }
            setCheckedAllActualWords()
        }

        function uncheckActualWord(word) {
            if (vm.actualWords.checkedList.indexOf(word.id) !== -1) {
                word.isChecked = false;
                delete vm.actualWords.checkedList[vm.actualWords.checkedList.indexOf(word.id)]
            }
            setCheckedAllActualWords()
        }

        function setCheckedAllActualWords() {
            var isAllChecked = vm.actualWords.list.length > 0;
            angular.forEach(vm.actualWords.list, function (word) {
                if (!word.isChecked) {
                    isAllChecked = false;
                }
            });
            vm.actualWords.isAllWordsChecked = isAllChecked;
        }

        function deleteActualWord(word_id) {
            UserDictionaryService.deleteWord(word_id).then(function () {
                if (vm.actualWords.checkedList.indexOf(word_id) !== -1) {
                    delete vm.actualWords.checkedList[vm.actualWords.checkedList.indexOf(word_id)];
                }
                loadUserActualWords(vm.actualWords.currentPage, vm.actualWords.wordsPerPage)
            })
        }

        function sendActualWordToLearned(word_id) {
            UserDictionaryService.markWordIsLearned(word_id, true).then(function () {
                if (vm.actualWords.checkedList.indexOf(word_id) !== -1) {
                    delete vm.actualWords.checkedList[vm.actualWords.checkedList.indexOf(word_id)];
                }
                loadUserActualWords(vm.actualWords.currentPage, vm.actualWords.wordsPerPage)
            })
        }

        function initActualWordsTab() {
            vm.actualWords.wordsPerPage = DEFAULT_WORDS_PER_PAGE;
            vm.actualWords.currentPage = DEFAULT_CURRENT_PAGE;
            loadUserActualWords(vm.actualWords.currentPage, vm.actualWords.wordsPerPage);
        }

        function clearActualWordData() {
            vm.actualWords.list = [];
            vm.actualWords.checkedList = [];
            vm.actualWords.isAllWordsChecked = false;
            vm.actualWords.isLoaded = false;
        }


        vm.learnedWords = {
            list: [],
            checkedList: [],
            isAllWordsChecked: false,
            isLoaded: false,
            maxPageSize: 4,
            currentPage: DEFAULT_CURRENT_PAGE,
            totalWords: 1,
            wordsPerPage: DEFAULT_WORDS_PER_PAGE,
            onTabSelect: onLearnedWordsTabSelect,
            changePage: onChangeLearnedWordsPage,
            changeItemsPerPage: onChangeLearnedWordsItemsPerPage,
            checkLearnedWord: onCheckLearnedWord,
            checkAllWords: onCheckAllLearnedWords,
            deleteWord: deleteLearnedWord,
            sendWordToActual: sendLearnedWordToActual
        };

        function loadUserLearnedWords(currentPage, itemsPerPage) {
            var deferred = $q.defer();
            UserDictionaryService.getLearnedWords({
                'target_page': currentPage,
                'items_per_page': itemsPerPage
            }).then(function (result) {
                vm.learnedWords.totalWords = result.total_count;
                vm.learnedWords.list = angular.copy(result.foreign_words);
                vm.learnedWords.isLoaded = true;
                markCheckedLearnedWords();
                deferred.resolve(result)
            });
            return deferred.promise
        }

        function onLearnedWordsTabSelect() {
            initLearnedWordsTab();
            clearActualWordData();
        }

        function onChangeLearnedWordsPage() {
            loadUserLearnedWords(vm.learnedWords.currentPage, vm.learnedWords.wordsPerPage);
        }

        function onChangeLearnedWordsItemsPerPage() {
            vm.learnedWords.currentPage = DEFAULT_CURRENT_PAGE;
            loadUserLearnedWords(vm.learnedWords.currentPage, vm.learnedWords.wordsPerPage);
        }

        function markCheckedLearnedWords() {
            angular.forEach(vm.learnedWords.checkedList, function (checkedId) {
                angular.forEach(vm.learnedWords.list, function (learnedWord) {
                    if (learnedWord.id === checkedId) {
                        learnedWord.isChecked = true
                    }
                })
            });
            setCheckedAllLearnedWords()
        }

        function onCheckLearnedWord(word) {
            if (word.isChecked) {
                checkLearnedWord(word)
            }
            else {
                uncheckLearnedWord(word)
            }
        }

        function onCheckAllLearnedWords() {
            if (vm.learnedWords.isAllWordsChecked) {
                checkAllLearnedWords()
            }
            else {
                uncheckAllLearnedWords()
            }
        }

        function checkAllLearnedWords() {
            angular.forEach(vm.learnedWords.list, function (word) {
                checkLearnedWord(word)
            })
        }

        function uncheckAllLearnedWords() {
            angular.forEach(vm.learnedWords.list, function (word) {
                uncheckLearnedWord(word)
            })
        }

        function checkLearnedWord(word) {
            if (vm.learnedWords.checkedList.indexOf(word.id) === -1) {
                word.isChecked = true;
                vm.learnedWords.checkedList.push(word.id);
            }
            setCheckedAllLearnedWords()
        }

        function uncheckLearnedWord(word) {
            if (vm.learnedWords.checkedList.indexOf(word.id) !== -1) {
                word.isChecked = false;
                delete vm.learnedWords.checkedList[vm.learnedWords.checkedList.indexOf(word.id)]
            }
            setCheckedAllLearnedWords()
        }

        function setCheckedAllLearnedWords() {
            var isAllChecked = vm.learnedWords.list.length > 0;
            angular.forEach(vm.learnedWords.list, function (word) {
                if (!word.isChecked) {
                    isAllChecked = false;
                }
            });
            vm.learnedWords.isAllWordsChecked = isAllChecked;
        }

        function deleteLearnedWord(word_id) {
            UserDictionaryService.deleteWord(word_id).then(function () {
                if (vm.learnedWords.checkedList.indexOf(word_id) !== -1) {
                    delete vm.learnedWords.checkedList[vm.learnedWords.checkedList.indexOf(word_id)];
                }
                loadUserLearnedWords(vm.learnedWords.currentPage, vm.learnedWords.wordsPerPage)
            })
        }

        function sendLearnedWordToActual(word_id) {
            UserDictionaryService.markWordIsLearned(word_id, false).then(function () {
                if (vm.learnedWords.checkedList.indexOf(word_id) !== -1) {
                    delete vm.learnedWords.checkedList[vm.learnedWords.checkedList.indexOf(word_id)];
                }
                loadUserLearnedWords(vm.learnedWords.currentPage, vm.learnedWords.wordsPerPage)
            })
        }

        function initLearnedWordsTab() {
            vm.learnedWords.wordsPerPage = DEFAULT_WORDS_PER_PAGE;
            vm.learnedWords.currentPage = DEFAULT_CURRENT_PAGE;
            loadUserLearnedWords(vm.learnedWords.currentPage, vm.learnedWords.wordsPerPage);
        }

        function clearLearnedWordData() {
            vm.learnedWords.list = [];
            vm.learnedWords.checkedList = [];
            vm.learnedWords.isAllWordsChecked = false;
            vm.learnedWords.isLoaded = false;
        }

        function openPanel() {
            vm.panel.isOpened = true;
        }

        function closePanel() {
            vm.panel.isOpened = false;
            clearActualWordData();
            clearLearnedWordData();
        }
    }]);
