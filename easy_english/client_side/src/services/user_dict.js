var app = angular.module('EnglishMoviesSchool');

app.factory('UserDictionaryService', [
    '$q', '$rootScope', 'Restangular', function ($q, $rootScope, Restangular) {
        var restAngular = Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/api/v1/');
        });

        var _dictionaryService = restAngular.all('user-dict');

        return {
            addNewWord: function (word) {
                var deferred = $q.defer();
                _dictionaryService.post(word).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise
            }
        }
    }]);
