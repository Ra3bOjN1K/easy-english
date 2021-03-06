var app = angular.module('EnglishMoviesSchool');

app.factory('TranslatorDialog', ['$rootScope', 'DictionaryService', function ($rootScope, DictionaryService) {

    var _isVisible = null;
    var _isWordTranslated = false;
    var _translatedWordObj = null;

    function _clear() {
        _translatedWordObj = null;
        _isWordTranslated = false;
    }

    function _handleTranslatedResult(result) {
        return result;
    }

    return {
        show: function (forceApply) {
            _clear();
            _isVisible = true;
            if (forceApply || forceApply === undefined) {
                $rootScope.$apply();
            }
        },
        close: function (forceApply) {
            _clear();
            _isVisible = false;
            if (forceApply || forceApply === undefined) {
                $rootScope.$apply();
            }
        },
        isVisible: function () {
            return _isVisible;
        },
        translate: function (sourceObj) {
            _translatedWordObj = {word: sourceObj.origText};
            this.show();
            DictionaryService.translate(sourceObj).then(function (resultData) {
                _translatedWordObj = _handleTranslatedResult(resultData);
                _translatedWordObj.context = sourceObj.context;
                _isWordTranslated = true;
            });
        },
        isWordTranslated: function () {
            return _isWordTranslated;
        },
        getTranslatedWord: function () {
            return _translatedWordObj;
        }
    }
}]);
