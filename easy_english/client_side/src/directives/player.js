var app = angular.module('EnglishMoviesSchool');

app.directive('videoPlayerAutoSize', ['PlayerService', '$document', '$timeout', function (PlayerService, $document, $timeout) {
    return {
        link: function (scope, element, attrs, ctrl) {

            function _getOptimalSize() {
                var playerThings = $($document).find('.player-things');

                var targetWidth = parseInt(playerThings.width() * 0.82);
                var targetHeight = parseInt(targetWidth * 9 / 16);

                if (targetHeight * 1.05 > playerThings.height()) {
                    targetHeight = parseInt(playerThings.height() * 0.82);
                    targetWidth = parseInt(targetHeight * 16 / 9);
                }

                return {width: targetWidth, height: targetHeight}
            }

            function _resizePlayer() {
                var size = _getOptimalSize();

                $timeout(function () {
                    PlayerService.getPlayer(scope.player.id).then(function (player) {
                        player.dimension('width', size.width);
                        player.dimension('height', size.height);
                        $($document).find('.video-js').fadeIn(300);
                        $($document).find('.vjs-tech').fadeIn();
                    });
                });
            }

            $(window).on("resize", function () {
                _resizePlayer();
            });

            $($document).find('.video-js').hide();

            _resizePlayer();
        },
        restrict: 'A'
    }
}]);

app.directive('translateWordDialogWrapper', [
    '$document', '$compile', 'TranslatorDialog', function ($document, $compile, TranslatorDialog) {
        return {
            link: function (scope, element, attrs, ctrl) {

                function manageVisibility(showDialog) {
                    var translatedWordDlgWrapper = $(element).find('.translated-word-dlg-wrapper-block');
                    var translatedWordDlg = translatedWordDlgWrapper.find('.translated-word-dlg');
                    var vjsTech = $($document).find('.vjs-tech');
                    if (!translatedWordDlg.length) {
                        var dlgTemplate = '<div class="translated-word-dlg" ng-show="player.canShowTranslateDlg()" ng-include="\'/templates/translate_word_dialog_template.html\'"></div>';
                        translatedWordDlgWrapper.append($compile(dlgTemplate)(scope));

                        vjsTech.on('mouseover', function () {
                            TranslatorDialog.close();
                        });
                    }
                    if (showDialog === false) {
                        translatedWordDlgWrapper.fadeOut('fast');
                    }
                    else {
                        translatedWordDlgWrapper.fadeIn('fast');
                    }
                }

                scope.$watch(function () {
                    return TranslatorDialog.isVisible()
                }, function (newVal) {
                    if (newVal !== null) {
                        manageVisibility(newVal);
                    }
                }, true);
            }
        }
    }]);

app.directive('wordVotesHandler', ['$timeout', function ($timeout) {
    return {
        link: function (scope, element, attrs, ctrl) {

            function getColorGroupName(votes) {
                if (votes === 0) return 'group-0';
                else if (votes > 100000) return 'group-1';
                else if (votes > 50000) return 'group-2';
                else if (votes > 10000) return 'group-3';
                else if (votes > 3000) return 'group-4';
                else if (votes > 500) return 'group-5';
                else if (votes > 50) return 'group-6';
                else if (votes > 0) return 'group-7';
                else return '';
            }

            function roundVotes(votes) {
                if (votes > 100000) return '> 100000';
                else if (votes > 50000) return '> 50000';
                else if (votes > 30000) return '> 30000';
                else if (votes > 10000) return '> 10000';
                else if (votes > 5000) return '> 5000';
                else if (votes > 3000) return '> 3000';
                else if (votes > 1000) return '> 1000';
                else if (votes > 500) return '> 500';
                else if (votes > 300) return '> 300';
                else if (votes > 100) return '> 100';
                else if (votes > 50) return '> 50';
                else if (votes > 30) return '> 30';
                else if (votes > 10) return '> 10';
                else return votes.toString();
            }

            $timeout(function () {
                var votesReg = $(element).text().match(/\d+/g);
                if (votesReg.length > 0) {
                    var votesInt = parseInt(votesReg[0]);
                    $(element).addClass(getColorGroupName(votesInt));
                    $(element).text(roundVotes(votesInt));
                }
            });
        }
    }
}]);

app.directive('subtitlesWrapperManager', [
    '$document', '$rootScope', '$compile', function ($document, $rootScope, $compile) {
        return {
            link: function (scope, element, attrs, ctrl) {

                function manageVisibility(subButtons) {
                    var subtitlesWrapper = $(element).find('.subtitles-wrapper-block');
                    if (subButtons.enBtn.checked === false && subButtons.ruBtn.checked === false) {
                        subtitlesWrapper.fadeOut('fast');
                    }
                    else {
                        subtitlesWrapper.fadeIn('fast');
                    }
                }

                function createSubtitleFieldsIfNotExists() {
                    var subtitlesWrapper = $(element).find('.subtitles-wrapper-block');
                    var engSubField = subtitlesWrapper.find('.eng-subtitle-field');
                    var rusSubField = subtitlesWrapper.find('.rus-subtitle-field');
                    var vjsTech = $($document).find('.vjs-tech');

                    if (!engSubField.length) {
                        var engFieldTemplate = '<div class="eng-subtitle-field {{!!subtitles.engCurrentQuote ? \'\' : \'hide\'}}" ng-show="player.subButtons.enBtn.checked" ng-bind-html="subtitles.engCurrentQuote"></div>';
                        subtitlesWrapper.append($compile(engFieldTemplate)(scope));
                        engSubField = subtitlesWrapper.find('.eng-subtitle-field');

                        engSubField.on('mouseover', function () {
                            if (!engSubField.hasClass('hide')) {
                                $rootScope.isMouseOverEngSubField = true;
                                $rootScope.$broadcast('subtitlesWrapperManager:eng_sub_field:mouseover');
                            }
                        });

                        vjsTech.on('mouseover', function () {
                            if (!engSubField.hasClass('hide') && $rootScope.isMouseOverEngSubField === true) {
                                $rootScope.isMouseOverEngSubField = false;
                                $rootScope.$broadcast('subtitlesWrapperManager:eng_sub_field:mouseout');
                            }
                        });

                        var actionFlag = 0;
                        engSubField.on('mousedown', function () {
                            actionFlag = 0;
                        });
                        engSubField.on('mousemove', function () {
                            actionFlag = 1;
                        });
                        engSubField.on('mouseup', function () {
                            if (actionFlag === 1 && !engSubField.hasClass('hide')) {
                                var sourceText = window.getSelection().toString().replace(/[\r\n]+/g, ' ').trim();
                                if (sourceText.length > 0) {
                                    $rootScope.$broadcast('subtitlesWrapperManager:on_translate', sourceText)
                                }
                            }
                        });

                        scope.$watch('subtitles.engCurrentItem', function () {
                            var words = engSubField.find('.wrd');
                            words.on('click', function () {
                                if (!engSubField.hasClass('hide')) {
                                    $rootScope.$broadcast('subtitlesWrapperManager:on_translate', $(this).text())
                                }
                            });
                        }, true);

                    }
                    if (!rusSubField.length) {
                        var rusFieldTemplate = '<div class="rus-subtitle-field {{!!subtitles.rusCurrentQuote ? \'\' : \'hide\'}}" ng-show="player.subButtons.ruBtn.checked" ng-bind-html="subtitles.rusCurrentQuote"></div>';
                        subtitlesWrapper.append($compile(rusFieldTemplate)(scope));
                        rusSubField = subtitlesWrapper.find('.rus-subtitle-field');

                        rusSubField.on('mouseover', function () {
                            if (!rusSubField.hasClass('hide')) {
                                $rootScope.$broadcast('subtitlesWrapperManager:rus_sub_field:mouseover');
                            }
                        });

                        rusSubField.on('mouseout', function () {
                            if (!rusSubField.hasClass('hide')) {
                                $rootScope.$broadcast('subtitlesWrapperManager:rus_sub_field:mouseout');
                            }
                        })
                    }
                }

                scope.$watch('player.subButtons', function (subButtons) {
                    createSubtitleFieldsIfNotExists();
                    manageVisibility(subButtons);
                }, true);
            }
        }
    }]);

app.directive('subtitleCtrlButtonsWrapper', function () {
    return {
        link: function (scope, element, attrs, ctrl) {
            scope.$watch('player.loadedVideoFileData', function (newValue) {
                var controlBar = $(element).find('.vjs-control-bar');
                if (controlBar.length) {
                    controlBar.find('.vjs-fullscreen-control').before('<div class="subtitle-buttons-wrapper"></div>');
                    var sub_buttons_wrapper = controlBar.find('.subtitle-buttons-wrapper');
                    sub_buttons_wrapper.append('<button class="en-sub">En</button>');
                    sub_buttons_wrapper.append('<button class="ru-sub">Ru</button>');

                    var enSubBtn = sub_buttons_wrapper.find('.en-sub');
                    enSubBtn.addClass(scope.subtitles.engList.length > 0 ? '' : 'disabled');
                    var ruSubBtn = sub_buttons_wrapper.find('.ru-sub');
                    ruSubBtn.addClass(scope.subtitles.rusList.length > 0 ? '' : 'disabled');

                    enSubBtn.on('click', function () {
                        if (!enSubBtn.hasClass('disabled')) {
                            scope.player.subButtons.enBtn.checked = !scope.player.subButtons.enBtn.checked;
                            scope.$apply();
                        }
                    });

                    ruSubBtn.on('click', function () {
                        if (!ruSubBtn.hasClass('disabled')) {
                            scope.player.subButtons.ruBtn.checked = !scope.player.subButtons.ruBtn.checked;
                            scope.$apply();
                        }
                    });

                    scope.$watchCollection('subtitles.engList', function (newVal, oldVal) {
                        if (oldVal.length === 0 && newVal.length > 0) {
                            var sub_buttons_wrapper = $(element).find('.vjs-control-bar').find('.subtitle-buttons-wrapper');
                            var enSubBtn = sub_buttons_wrapper.find('.en-sub');
                            enSubBtn.removeClass('disabled');
                        }
                    });

                    scope.$watchCollection('subtitles.rusList', function (newVal, oldVal) {
                        if (oldVal.length === 0 && newVal.length > 0) {
                            var sub_buttons_wrapper = $(element).find('.vjs-control-bar').find('.subtitle-buttons-wrapper');
                            var ruSubBtn = sub_buttons_wrapper.find('.ru-sub');
                            ruSubBtn.removeClass('disabled');
                        }
                    });
                }
            });

            scope.$watch('player.subButtons.enBtn.checked', function (newVal) {
                var enSubBtn = $(element).find('.vjs-control-bar').find('.en-sub');
                if (newVal === true) {
                    enSubBtn.addClass('active');
                }
                else {
                    enSubBtn.removeClass('active');
                }
            });

            scope.$watch('player.subButtons.ruBtn.checked', function (newVal) {
                var ruSubBtn = $(element).find('.vjs-control-bar').find('.ru-sub');
                if (newVal === true) {
                    ruSubBtn.addClass('active');
                }
                else {
                    ruSubBtn.removeClass('active');
                }
            });
        },
        restrict: 'A'
    }
});
