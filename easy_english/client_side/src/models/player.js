var app = angular.module('EnglishMoviesSchool');

app.factory('PlayerService', ['$q', function ($q) {

    var _player = null;

    var _subtitlesWrapperEl = null;
    var _translatedWordWrapperEl = null;

    function _createSubtitlesWrapperComponent() {
        if (_player !== null) {
            var VjsComponent = videojs.getComponent('Component');
            var SubtitlesWrapper = videojs.extend(VjsComponent, {});
            VjsComponent.registerComponent('SubtitlesWrapper', SubtitlesWrapper);

            _subtitlesWrapperEl = _player.addChild('SubtitlesWrapper');
            _subtitlesWrapperEl.addClass('subtitles-wrapper-block hidden');
        }
    }

    function _createTranslatedWordWrapperComponent() {
        if (_player !== null) {
            var VjsComponent = videojs.getComponent('Component');
            var TranslatedWordDlgWrapper = videojs.extend(VjsComponent, {});
            VjsComponent.registerComponent('TranslatedWordDlgWrapper', TranslatedWordDlgWrapper);

            _translatedWordWrapperEl = _player.addChild('TranslatedWordDlgWrapper');
            _translatedWordWrapperEl.addClass('translated-word-dlg-wrapper-block');
        }
    }

    function _initPlayer() {
        if (_player !== null) {
            _createTranslatedWordWrapperComponent();
            _createSubtitlesWrapperComponent();
        }
    }

    return {
        getPlayer: function (playerId) {
            var deferred = $q.defer();

            if (_player === null) {
                videojs(playerId).ready(function () {
                    _player = this;
                    _initPlayer();
                    deferred.resolve(_player);
                });
            }
            else {
                deferred.resolve(_player);
            }

            return deferred.promise;
        }
    }
}]);

//.factory('ClickableSubtitlesPlugin', [function () {
//
//    var _plugin = null;
//
//    return {
//        initPlugin: function () {
//            _initSubtitlesWrapper();
//
//            var pluginFn = function (options) {
//                var shareComponent = new videojs.SubtitlesWrapper(this, options);
//                var subtitlesWrapper = this.addChild(shareComponent);
//            };
//
//            videojs.plugin('clickableSubtitlesPlugin', pluginFn);
//        }
//    };
//
//    function _initSubtitlesWrapper() {
//        videojs.SubtitlesWrapper = videojs.Button.extend({
//            init: function (player, options) {
//                videojs.Component.call(this, player, options);
//            }
//        });
//
//        videojs.SubtitlesWrapper.prototype.options_ = {
//            children: {}
//        };
//
//        videojs.SubtitlesWrapper.prototype.createEl = function (tagName, props) {
//            var overlay = videojs.createEl('div', {
//                className: 'vjs-subtitles-wrapper-overlay'
//            });
//
//            this.contentEl_ = videojs.createEl('div', {
//                className: 'vjs-subtitles-wrapper-container'
//            });
//
//            overlay.appendChild(this.contentEl_);
//
//            return overlay;
//        };
//    }
//
//}]);