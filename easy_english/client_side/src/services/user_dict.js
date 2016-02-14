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
            },
            getActualWords: function (params) {
                var deferred = $q.defer();
                _dictionaryService.customGET('', {
                    'target_page': params.target_page,
                    'items_per_page': params.items_per_page,
                    'type_words': 'actual'
                }).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise
            },
            getLearnedWords: function (params) {
                var deferred = $q.defer();
                _dictionaryService.customGET('', {
                    'target_page': params.target_page,
                    'items_per_page': params.items_per_page,
                    'type_words': 'learned'
                }).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise
            },
            deleteWord: function (wordId) {
                var deferred = $q.defer();
                _dictionaryService.post({word_id: wordId}, {action: 'delete'}).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise
            },
            markWordIsLearned: function (wordId, isLearned) {
                var deferred = $q.defer();
                _dictionaryService.post({word_id: wordId}, {action: 'send_to_learned', value: isLearned}).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise
            },
            exportWordsToCsv: function (wordIdList) {
                var deferred = $q.defer();
                _dictionaryService.post({exported_ids: wordIdList}, {action: 'anki_export'}).then(function (result) {
                    var file = new Blob([result], {
                        type: 'application/csv'
                    });
                    saveAs(file, 'anki_export.csv');
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise
            }
        }
    }]);
