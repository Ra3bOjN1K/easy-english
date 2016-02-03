var app = angular.module('EnglishMoviesSchool');

app.factory('DictionaryService', [
    'Restangular', '$q', function (Restangular, $q) {
        var restAngular = Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/');
            RestangularConfigurer.setRequestSuffix('/');
        });

        var _dictionaryService = restAngular.all('dictionary');

    return {
        translate: function (source) {
            return _dictionaryService.all('translate').post(source.origText);
        }
    }
}]);
