var app = angular.module('EnglishMoviesSchool');

app.factory('DictionaryService', [
    'Restangular', function (Restangular) {
        var restAngular = Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/');
        });

        var _dictionaryService = restAngular.all('dictionary');

    return {
        translate: function (source) {
            return _dictionaryService.customGET('', {'action': 'translate', 'source': source.origText});
        }
    }
}]);
