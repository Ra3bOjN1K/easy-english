var app = angular.module('EnglishMoviesSchool');

app.directive('subtitlesLimiterSlider', [function () {

    function _msecToMin(msec) {
        var sec = parseInt(msec / 1000);
        var min = parseInt(sec / 60);
        sec = sec % 60;
        sec = parseInt(sec / 10) === 0 ? '0' + sec : sec;
        return min + 'мин ' + sec + 'сек'
    }

    function _toSliderVal(data) {
        return data * 1000;
    }

    function _fromSliderVal(data) {
        return data / 1000;
    }

    return {
        scope: {
            subLimStart: '=subLimStart',
            subLimEnd: '=subLimEnd'
        },
        link: function(scope, element, attrs) {
            var startInput = $("<input type=\"text\" disabled=\"disabled\" title=\"\" class=\"subtitle-limit-input\">");
            var endInput = $("<input type=\"text\" disabled=\"disabled\" title=\"\" class=\"subtitle-limit-input\">");
            var slider = $("<div class=\"limit-slider\"></div>");
            $(element).append(startInput, endInput, slider);
            var sliderMin = _toSliderVal(scope.subLimStart);
            var sliderMax = _toSliderVal(scope.subLimEnd);

            slider.slider({
                min: sliderMin,
                max: sliderMax,
                values: [sliderMin, sliderMax],
                range: true,
                step: 1000
            });

            startInput.val(_msecToMin(sliderMin));
            endInput.val(_msecToMin(sliderMax));

            slider.slider({
                slide: function(event, ui) {
                    startInput.val(_msecToMin(ui.values[0]));
                    endInput.val(_msecToMin(ui.values[1]));
                    scope.subLimStart = _fromSliderVal(ui.values[0]);
                    scope.subLimEnd = _fromSliderVal(ui.values[1]);
                    scope.$apply();
                }
            });
        }
    }
}]);
