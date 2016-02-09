var app = angular.module('EnglishMoviesSchool');

app.config(['$localStorageProvider',
    function ($localStorageProvider) {
        if (!$localStorageProvider.get('user')) {
            $localStorageProvider.set('user', {
                token: null,
                username: null
            });
        }
    }]);

app.run(['UserService', function (UserService) {
    if (!UserService.hasToken()) {
        UserService.clearUserData();
    }
}]);

app.factory('AuthService', [
    'Restangular', 'UserService', '$q', function (Restangular, UserService, $q) {
        var restAngular = Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/auth/');
        });

        return {
            login: function (email, password) {
                var deferred = $q.defer();
                var user = {
                    'email': email,
                    'password': password
                };
                restAngular.all('login').post(user).then(function (result) {
                    UserService.saveUserData(result);
                    deferred.resolve(result);
                }, function (error) {
                    UserService.clearUserData();
                    deferred.reject(error)
                });
                return deferred.promise
            },
            signIn: function (email, password, password_confirm) {
                var deferred = $q.defer();
                var user = {
                    'email': email,
                    'password': password,
                    'confirm_password': password_confirm
                };
                restAngular.all('sign-in').post(user).then(function (result) {
                    UserService.saveUserData(result);
                    deferred.resolve(result);
                }, function (error) {
                    UserService.clearUserData();
                    deferred.reject(error);
                });
                return deferred.promise
            },
            logout: function () {
                var deferred = $q.defer();
                restAngular.all('logout').post({username: UserService.getUsername()}).then(function (result) {
                    UserService.clearUserData();
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise
            }
            //checkIfLogin: function () {
            //    var deferred = $q.defer();
            //    restAngular.all('check-login').post({username: UserService.getUsername()}).then(function (result) {
            //        UserService.clearUserData();
            //        deferred.resolve(result);
            //    }, function (error) {
            //        deferred.reject(error);
            //    });
            //    return deferred.promise
            //}
        }
    }]);

app.factory('UserService', ['$rootScope', '$localStorage', function ($rootScope, $localStorage) {
    return {
        saveUserData: function (userData) {
            $localStorage.user.username = userData.username;
            $localStorage.user.token = userData.token;
            $rootScope.$broadcast('UserService:user:login');
        },
        getToken: function () {
            return $localStorage.user.token
        },
        getUsername: function () {
            return $localStorage.user.username
        },
        hasToken: function () {
            return $localStorage.user !== undefined && $localStorage.user.token;
        },
        clearUserData: function () {
            $localStorage.user = {
                username: null,
                token: null
            };
            $rootScope.$broadcast('UserService:user:logout');
        }
    }
}]);

app.factory('AuthInterceptor', ['$q', 'UserService', function ($q, UserService) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if (UserService.hasToken()) {
                config.headers.Authorization = 'Token ' + UserService.getToken();
            }
            return config;
        },

        responseError: function (response) {
            if (response.status === 401 || response.status === -1) {
                UserService.clearUserData();
            }
            return $q.reject(response);
        }
    };
}]);
