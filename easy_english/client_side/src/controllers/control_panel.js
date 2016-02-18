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
            currentPage: 1,
            totalWords: 1,
            wordsPerPage: DEFAULT_WORDS_PER_PAGE,
            onTabSelect: onActualWordsTabSelect,
            changePage: onChangeActualWordsPage,
            changeItemsPerPage: onChangeActualWordsItemsPerPage,
            hasCheckedActualWords: hasCheckedActualWords,
            checkActualWord: onCheckActualWord,
            checkAllWords: onCheckAllActualWords,
            markExportedWords: markExportedWords,
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

        // toggle marker
        function markExportedWords() {
            UserDictionaryService.markExportedWords(vm.actualWords.checkedList).then(function () {
                loadUserActualWords(vm.actualWords.currentPage, vm.actualWords.wordsPerPage);
            });
        }

        function loadUserActualWords(currentPage, itemsPerPage) {
            var deferred = $q.defer();
            UserDictionaryService.getActualWords({
                'target_page': currentPage,
                'items_per_page': itemsPerPage
            }).then(function (result) {
                $timeout(function () {
                    vm.actualWords.totalWords = parseInt(result.total_count);
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
            }, 100);
        }

        function onChangeActualWordsPage() {
            loadUserActualWords(vm.actualWords.currentPage, vm.actualWords.wordsPerPage);
        }

        function onChangeActualWordsItemsPerPage() {
            vm.actualWords.currentPage = DEFAULT_CURRENT_PAGE;
            loadUserActualWords(vm.actualWords.currentPage, vm.actualWords.wordsPerPage);
        }

        function hasCheckedActualWords() {
            var res = false;
            angular.forEach(vm.actualWords.checkedList, function (w) {
                res = true;
            });
            return res;
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
                vm.learnedWords.list = angular.copy(result.foreign_words);
                vm.learnedWords.totalWords = result.total_count;
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

app.controller('NewWordsSelectionCtrl', [
    'UserService', 'SubtitlesContainerService', 'SubtitlesSeparatorService', 'DictionaryService', 'UserDictionaryService',
    '$timeout', '$sanitize',
    function (UserService, SubtitlesContainerService, SubtitlesSeparatorService, DictionaryService, UserDictionaryService,
              $timeout, $sanitize) {
        var vm = this;

        vm.panel = {
            isOpened: false,
            open: openPanel,
            close: closePanel
        };

        vm.subtitlesLimit = {
            start: 0,
            end: 0,
            apply: applySubtitlesLimit
        };

        vm.NEW_WORDS_TAB = 'newWords';
        vm.DICT_WORDS_TAB = 'wordsFromDict';
        vm.LEARNED_WORDS_TAB = 'learnedWords';

        vm.tab = {
            name: null,
            newWordList: [],
            wordsFromDict: [],
            learnedWords: [],
            onTabSelect: onTabSelect
        };

        vm.words = {
            list: [],
            selectedWord: {},
            selectedWordContests: [],
            selectedWordTranslation: {},
            onSelectWord: onSelectWord
        };

        vm.selectedWordHasCheckedContexts = false;
        vm.isUserLoggedIn = function () {return UserService.hasToken()};
        vm.engSubtitlesWasLoaded = function () {return SubtitlesContainerService.isEngSubtitlesSet()};
        vm.addUserWord = addUserWord;
        vm.onContextCheck = onContextCheck;
        vm.addWordToLearned = addWordToLearned;
        vm.delWordFromLearned = delWordFromLearned;

        function onTabSelect(tabName) {
            vm.tab.name = tabName;
            $timeout(function () {
                clearTabs();
                vm.words.selectedWord = {};
                vm.words.selectedWordContests = [];
                vm.words.selectedWordTranslation = {};
                initSelectedTab();
            });
        }

        function initSelectedTab() {
            if (vm.words.list.length > 0) {
                if (vm.tab.name === vm.NEW_WORDS_TAB) {
                    vm.tab.newWordList = filterNewWordsOnly(vm.words.list);
                }
                else if (vm.tab.name === vm.DICT_WORDS_TAB) {
                    vm.tab.wordsFromDict = filterWordsFromUserDictOnly(vm.words.list);
                }
                else if (vm.tab.name === vm.LEARNED_WORDS_TAB) {
                    vm.tab.learnedWords = filterLearnedWordsOnly(vm.words.list);
                }
                vm.words.selectedWord = {};
                vm.words.selectedWordTranslation = {};
                vm.words.selectedWordContests = [];
            }
        }

        function filterNewWordsOnly(wordList) {
            var newWords = [];
            angular.forEach(wordList, function (word) {
                if (!word.is_added) {
                    newWords.push(word);
                }
            });
            return newWords;
        }

        function filterWordsFromUserDictOnly(wordList) {
            var words = [];
            angular.forEach(wordList, function (word) {
                if (word.is_added && !word.is_learned) {
                    words.push(word);
                }
            });
            return words;
        }

        function filterLearnedWordsOnly(wordList) {
            var words = [];
            angular.forEach(wordList, function (word) {
                if (word.is_added && word.is_learned) {
                    words.push(word);
                }
            });
            return words;
        }

        function addWordToLearned(word) {
            UserDictionaryService.addWordToLearned(word.word).then(function () {
                angular.forEach(vm.words.list, function (w, idx) {
                    if (angular.equals(w.word, word.word)) {
                        vm.words.list[idx].is_learned = true;
                        vm.words.list[idx].is_added = true;
                    }
                });
                initSelectedTab();
            })
        }

        function delWordFromLearned(word) {
            UserDictionaryService.delWordFromLearned(word.word).then(function () {
                angular.forEach(vm.words.list, function (w, idx) {
                    if (angular.equals(w.word, word.word)) {
                        vm.words.list[idx].is_learned = false;
                        vm.words.list[idx].is_added = false;
                    }
                });
                initSelectedTab();
            })
        }

        function clearTabs() {
            vm.tab.newWordList = [];
            vm.tab.wordsFromDict = [];
            vm.tab.learnedWords = [];
        }

        function onSelectWord(word) {
            vm.words.selectedWordContests = [];
            vm.words.selectedWordTranslation = {};
            vm.selectedWordHasCheckedContexts = false;
            vm.words.selectedWord = word;
            $timeout(function () {
                setContextsForSelectedWord(SubtitlesContainerService.getEngSubtitles(), word);
            });
            $timeout(function () {
                setTranslationsForSelectedWord(word);
            })
        }

        function addUserWord(translation) {
            var word = {
                foreign_word: vm.words.selectedWord.word,
                translation: translation.word,
                votes: translation.votes,
                contexts: getCheckedContextsText()
            };

            UserDictionaryService.addNewWord(word).then(function () {
                angular.forEach(vm.words.selectedWordTranslation.translations, function (tr, idx) {
                    if (angular.equals(translation.word, tr.word)) {
                        vm.words.selectedWordTranslation.translations[idx].is_added = true;
                    }
                });
                angular.forEach(vm.words.list, function (w, idx) {
                    if (angular.equals(w.word, word.foreign_word)) {
                        vm.words.list[idx].is_added = true;
                    }
                });
                initSelectedTab();
            })
        }

        function getCheckedContextsText() {
            var contexts = [];
            angular.forEach(vm.words.selectedWordContests, function (context) {
                if (context.isChecked) {
                    contexts.push(context.text);
                }
            });
            return contexts;
        }

        function onContextCheck() {
            vm.selectedWordHasCheckedContexts = getCheckedContextsText().length > 0;
        }

        function setContextsForSelectedWord(subtitles, word) {
            vm.words.selectedWordContests = [];
            angular.forEach(SubtitlesSeparatorService.findContextsForWord(subtitles, word), function (context) {
                vm.words.selectedWordContests.push({isChecked: false, text: $sanitize(context)});
            })
        }

        function setTranslationsForSelectedWord(selectedWord) {
            DictionaryService.translate({origText: selectedWord.word}).then(function (translation) {
                vm.words.selectedWordTranslation = translation;
            });
        }

        function setInitialSubtitlesLimits() {
            var subList = SubtitlesContainerService.getEngSubtitles();
            var firstSubtitle = subList[0];
            var lastSubtitle = subList[subList.length - 1];
            vm.subtitlesLimit.start = firstSubtitle.start;
            vm.subtitlesLimit.end = lastSubtitle.end;
        }

        function applySubtitlesLimit() {
            var limitedSubtitles = SubtitlesContainerService.getSubtitlesLimitedByTime(
                vm.subtitlesLimit.start, vm.subtitlesLimit.end);
            var wordList = SubtitlesSeparatorService.separateSubtitlesToWords(limitedSubtitles);
            UserDictionaryService.markWordsStatus(wordList).then(function (words) {
                vm.words.list = words;
                initSelectedTab();
            });
        }

        function clearData() {
            clearTabs();
            vm.words.list = [];
            vm.words.selectedWordContests = [];
            vm.words.selectedWord = {};
            vm.words.selectedWordTranslation = {};
        }

        function openPanel() {
            vm.panel.isOpened = true;
            setInitialSubtitlesLimits();
        }

        function closePanel() {
            clearData();
            vm.panel.isOpened = false;
        }
    }]);
