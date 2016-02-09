var app = angular.module('EnglishMoviesSchool', [
    'ngAnimate', 'ngMessages', 'formly', 'formlyBootstrap', 'pageslide-directive', 'ngStorage', 'cfp.hotkeys',
    'restangular', 'ui.bootstrap']);

app.config(
    function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor')
    }
);
