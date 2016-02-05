var app = angular.module('EnglishMoviesSchool');

app.factory('SubtitlesParserService', ['$q', '$timeout', '$http', function ($q, $timeout, $http) {

    function _splitIntoWords(subtitleQuote) {
        var resArr = subtitleQuote.match(/[\w'"-]+|[!\?,.-:;]+|<[\w/]+>/g);
        var wordsLine = '<div class="word-container">';
        angular.forEach(resArr, function (word) {
            if (([',', '.', '!', '?', ':', ';'].indexOf(word) === -1) && (word.substring(0, 1) !== '<' && word.substring(word.length - 2, 1) !== '>')) {
                word = ' <span class="wrd">' + word + '</span>';
            }
            wordsLine += word;
        });
        wordsLine += '</div>';
        return wordsLine;
    }


    return {
        getSubtitlesList: function (file) {
            var deferred = $q.defer();
            var formData = new FormData();
            formData.append("file", file);

            $http.post("/api/v1/subtitles/", formData, {
                withCredentials: true,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            }).success(function (result) {
                if (typeof result === 'string') {
                    result = JSON.parse(result)
                }
                deferred.resolve(result);
            }).error(function (error) {
                console.error(error);
            });

            return deferred.promise;
        },

        splitSubtitlesIntoWords: function (subtitles) {
            var deferred = $q.defer();
            var resArr = [];

            $timeout(function () {
                angular.forEach(subtitles, function (sub) {
                    var item = angular.copy(sub);
                    item.quote = _splitIntoWords(item.quote);
                    resArr.push(item)
                })
            }).then(function () {
                deferred.resolve(resArr)
            });

            return deferred.promise;
        },

        findSubtitleById: function (subtitleList, id) {
            var targetItem = null;

            return $timeout(function () {
                angular.forEach(subtitleList, function (item) {
                    if (angular.equals(item.id, id)) {
                        targetItem = item;
                    }
                })
            }).then(function () {
                return targetItem;
            })
        },

        getSubtitleItemOnTimestamp: function (subtitlesItemsList, timestamp, getNearIfNull) {
            var start_idx = 0,
                end_idx = subtitlesItemsList.length,
                mid,
                nearTargetSub;

            return $timeout(function () {

                while (start_idx < end_idx) {
                    mid = Math.floor((start_idx + end_idx) / 2);
                    var arrEl = subtitlesItemsList[mid];
                    var nextElem = subtitlesItemsList[mid + 1];

                    if (getNearIfNull && (arrEl.end < timestamp && timestamp < nextElem.start)) {
                        start_idx = mid;
                        end_idx = mid;
                        nearTargetSub = subtitlesItemsList[mid];
                    }
                    else if (timestamp < arrEl.start) {
                        end_idx = mid;
                    }
                    else if (timestamp > arrEl.end) {
                        start_idx = mid + 1;
                    }
                    else if (timestamp >= arrEl.start && timestamp <= arrEl.end) {
                        start_idx = mid;
                        end_idx = mid;
                    }
                }

            }).then(function () {

                if (subtitlesItemsList.length === 0) return null;

                var foundItem = subtitlesItemsList[start_idx];

                if (timestamp >= foundItem.start && timestamp <= foundItem.end) {
                    return subtitlesItemsList[start_idx];
                }
                else if (getNearIfNull && !!nearTargetSub) {
                    return nearTargetSub;
                }
                else {
                    return null
                }

            })
        }
    }
}]);
