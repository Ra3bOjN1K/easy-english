var app = angular.module('EnglishMoviesSchool');

app.controller('VideoPlayerCtrl', [
    '$rootScope', '$scope', '$timeout', '$document', '$sce', 'PlayerService', 'SubtitlesParserService', 'hotkeys', 'DictionaryService', 'TranslatorDialog',
    function ($rootScope, $scope, $timeout, $document, $sce, PlayerService, SubtitlesParserService, hotkeys, DictionaryService, TranslatorDialog) {

        $scope.player = {
            id: 'video-player',
            videoFileName: null,
            loadedVideoFileData: false,
            subButtons: {
                'enBtn': {
                    'checked': false
                },
                'ruBtn': {
                    'checked': false
                }
            },
            canShowTranslateDlg: function () {
                return TranslatorDialog.isVisible();
            },
            forcePaused: false,
            changeVideoFile: changeVideoFile
        };

        $scope.subtitles = {
            engList: [],
            rusList: [],
            engCurrentItem: {},
            rusCurrentItem: {},
            engDelay: 1,
            rusDelay: 1
        };

        $rootScope.$on('ApplicationCtrl:video_file:change', function (event, file) {
            if (!!file) {
                $scope.player.changeVideoFile(file);
            }
        });

        $rootScope.$on('ApplicationCtrl:en_sub:change', function (event, file) {
            if (!!file) {
                SubtitlesParserService.getSubtitlesList(file).then(function (subtitleList) {
                    SubtitlesParserService.splitSubtitlesIntoWords(subtitleList).then(function (subList) {
                        $scope.subtitles.engList = subList;
                    })
                })
            }
        });

        $rootScope.$on('ApplicationCtrl:ru_sub:change', function (event, file) {
            if (!!file) {
                SubtitlesParserService.getSubtitlesList(file).then(function (subtitleList) {
                    $scope.subtitles.rusList = subtitleList;
                })
            }
        });

        $rootScope.$on('VideoFilesManageCtrl:eng_sub_delay:changed', function (event, delay) {
            $scope.subtitles.engDelay = delay;
        });

        $rootScope.$on('VideoFilesManageCtrl:rus_sub_delay:changed', function (event, delay) {
            $scope.subtitles.rusDelay = delay;
        });

        $rootScope.$on('subtitlesWrapperManager:eng_sub_field:mouseover', function (event) {
            PlayerService.getPlayer($scope.player.id).then(function (player) {
                if (!$scope.player.forcePaused && !player.paused()) {
                    player.pause();
                    $scope.player.forcePaused = true;
                }
            })
        });

        $rootScope.$on('subtitlesWrapperManager:eng_sub_field:mouseout', function (event) {
            PlayerService.getPlayer($scope.player.id).then(function (player) {
                if ($scope.player.forcePaused) {
                    player.play();
                    $scope.player.forcePaused = false;
                }
            })
        });

        $rootScope.$on('subtitlesWrapperManager:rus_sub_field:mouseover', function (event) {
            PlayerService.getPlayer($scope.player.id).then(function (player) {
                if (!$scope.player.forcePaused && !player.paused()) {
                    player.pause();
                    $scope.player.forcePaused = true;
                }
            })
        });

        $rootScope.$on('subtitlesWrapperManager:rus_sub_field:mouseout', function (event) {
            PlayerService.getPlayer($scope.player.id).then(function (player) {
                if ($scope.player.forcePaused) {
                    player.play();
                    $scope.player.forcePaused = false;
                }
            })
        });

        $rootScope.$on('subtitlesWrapperManager:on_translate', function (event, sourceText) {

            function htmlToPlaintext(text) {
                return text ? String(text).replace(/<[^>]+>/gm, '').trim() : '';
            }

            TranslatorDialog.translate({
                origText: sourceText,
                context: htmlToPlaintext($scope.subtitles.engCurrentItem.quote)
            });
        });

        function setVideoSubtitleStartTimeFromCurrentTime(numSubtitles) {
            numSubtitles = numSubtitles !== undefined ? numSubtitles : 0;

            PlayerService.getPlayer($scope.player.id).then(function (player) {
                if (!!$scope.subtitles.engList.length) {
                    SubtitlesParserService.getSubtitleItemOnTimestamp(
                        $scope.subtitles.engList,
                        player.currentTime(),
                        true
                    ).then(function (subItem) {
                        if (numSubtitles !== 0) {
                            var subItemId = !!subItem ? subItem.id : -1;
                            SubtitlesParserService.findSubtitleById($scope.subtitles.engList, subItemId + numSubtitles).then(function (targetSub) {
                                currentTime = !!targetSub ? (targetSub.start / $scope.subtitles.engDelay) : $scope.subtitles.engList[0];
                                player.currentTime(currentTime);
                            })
                        }
                        else {
                            var currentTime = !!subItem ? subItem.start / $scope.subtitles.engDelay : 0;
                            player.currentTime(currentTime);
                        }
                    })
                }
                else if (!!$scope.subtitles.rusList.length) {
                    SubtitlesParserService.getSubtitleItemOnTimestamp(
                        $scope.subtitles.rusList,
                        player.currentTime(),
                        true
                    ).then(function (subItem) {
                        if (numSubtitles !== 0) {
                            var subItemId = !!subItem ? subItem.id : -1;
                            SubtitlesParserService.findSubtitleById($scope.subtitles.rusList, subItemId + numSubtitles).then(function (targetSub) {
                                currentTime = !!targetSub ? (targetSub.start / $scope.subtitles.rusDelay) : $scope.subtitles.rusList[0];
                                player.currentTime(currentTime);
                            })
                        }
                        else {
                            var currentTime = !!subItem ? subItem.start / $scope.subtitles.rusDelay : 0;
                            player.currentTime(currentTime);
                        }
                    })
                }
            });
        }

        // sec=-5 or sec=5
        function playerRewindSec(sec) {
            PlayerService.getPlayer($scope.player.id).then(function (player) {
                var currentTime = player.currentTime();
                player.currentTime(currentTime + sec);
            })
        }

        //vol=1 or vol=-1
        function changePlaybackRate(vol) {
            PlayerService.getPlayer($scope.player.id).then(function (player) {
                var currentRate = player.playbackRate();
                var newRate = 1.0;
                if (vol > 0) {
                    if (currentRate >= 1.0) {
                        newRate = 1.2;
                    }
                }
                else {
                    if (currentRate <= 1.0) {
                        newRate = 0.8;
                    }
                }
                player.playbackRate(newRate);
            })
        }

        function changeVideoFile(file) {
            PlayerService.getPlayer($scope.player.id).then(function (player) {
                var fileUrl = window.URL.createObjectURL(file);

                player.src(fileUrl);
                player.load();
                player.on('loadeddata', function () {
                    $scope.player.loadedVideoFileData = true;
                    player.controls(true);
                    $scope.player.videoFileName = file.name;
                    $scope.$apply();
                });
                player.on('timeupdate', function () {
                    var currentTime = player.currentTime();
                    var engSubCurrentTime = currentTime * $scope.subtitles.engDelay;
                    var rusSubCurrentTime = currentTime * $scope.subtitles.rusDelay;

                    SubtitlesParserService.getSubtitleItemOnTimestamp($scope.subtitles.engList, engSubCurrentTime).then(function (currentItem) {
                        $scope.subtitles.engCurrentItem = currentItem;
                        $scope.subtitles.engCurrentQuote = !!currentItem ? $sce.trustAsHtml(currentItem.quote) : null;
                    });

                    SubtitlesParserService.getSubtitleItemOnTimestamp($scope.subtitles.rusList, rusSubCurrentTime).then(function (currentItem) {
                        $scope.subtitles.rusCurrentItem = currentItem;
                        $scope.subtitles.rusCurrentQuote = !!currentItem ? $sce.trustAsHtml(currentItem.quote) : null;
                    });
                })
            });
        }

        // HOTKEYS
        hotkeys.bindTo($scope)
            .add({
                combo: 'space',
                description: 'Player play/pause',
                callback: function (event) {
                    PlayerService.getPlayer($scope.player.id).then(function (player) {
                        player.paused() ? player.play() : player.pause();
                    });
                    event.preventDefault()
                }
            })
            .add({
                combo: 'alt+f',
                description: 'Player fullscreen',
                callback: function (event) {
                    PlayerService.getPlayer($scope.player.id).then(function (player) {
                        player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
                    });
                    event.preventDefault()
                }
            })
            .add({
                combo: 'f2',
                description: 'Enable/disable eng subtitles',
                callback: function (event) {
                    if ($scope.subtitles.engList.length > 0) {
                        $scope.player.subButtons.enBtn.checked = !$scope.player.subButtons.enBtn.checked;
                    }
                    event.preventDefault()
                }
            })
            .add({
                combo: 'f3',
                description: 'Enable/disable rus subtitles',
                callback: function (event) {
                    if ($scope.subtitles.rusList.length > 0) {
                        $scope.player.subButtons.ruBtn.checked = !$scope.player.subButtons.ruBtn.checked;
                    }
                    event.preventDefault()
                }
            })
            .add({
                combo: 'ctrl+left',
                description: 'prev subtitle',
                callback: function (event) {
                    setVideoSubtitleStartTimeFromCurrentTime();
                    event.preventDefault()
                }
            })
            .add({
                combo: 'ctrl+shift+left',
                description: 'prev_x2 subtitle',
                callback: function (event) {
                    setVideoSubtitleStartTimeFromCurrentTime(-1);
                    event.preventDefault()
                }
            })
            .add({
                combo: 'ctrl+right',
                description: 'next subtitle',
                callback: function (event) {
                    setVideoSubtitleStartTimeFromCurrentTime(1);
                    event.preventDefault()
                }
            })
            .add({
                combo: 'left',
                description: '5sec prev',
                callback: function (event) {
                    playerRewindSec(-5);
                    event.preventDefault()
                }
            })
            .add({
                combo: 'right',
                description: '5sec forw',
                callback: function (event) {
                    playerRewindSec(5);
                    event.preventDefault()
                }
            })
            .add({
                combo: 'ctrl+down',
                description: 'speed rate down',
                callback: function (event) {
                    changePlaybackRate(-1);
                    event.preventDefault()
                }
            })
            .add({
                combo: 'ctrl+up',
                description: 'speed rate up',
                callback: function (event) {
                    changePlaybackRate(1);
                    event.preventDefault()
                }
            })
    }]);

app.controller('TranslateWordDialogCtrl', [
    '$scope', 'TranslatorDialog', 'UserService', function ($scope, TranslatorDialog, UserService) {

    $scope.vm = {
        model: angular.copy(TranslatorDialog.getTranslatedWord()),
        isWordTranslated: false,
        canSaveTranslatedWord: canSaveTranslatedWord
    };

    function canSaveTranslatedWord() {
        return UserService.hasToken();
    }

    $scope.$watch(function() {
        return TranslatorDialog.isWordTranslated()
    }, function () {
        $scope.vm.isWordTranslated = TranslatorDialog.isWordTranslated();
        $scope.vm.model = angular.copy(TranslatorDialog.getTranslatedWord());
    })
}]);
