var app = angular.module('EnglishMoviesSchool');

app.config(function (formlyConfigProvider) {
    formlyConfigProvider.setWrapper({
        name: 'validation',
        types: ['input'],
        templateUrl: 'error-messages.html'
    });

    formlyConfigProvider.removeChromeAutoComplete = true;
});

app.factory('Validators', [function () {
    var validators = {};

    validators.required = {
        expression: function (viewValue, modelValue, scope) {
            var value = modelValue || viewValue;
            value = value === typeof string ? value.trim() : value;
            return !!value;
        },
        message: '"Это обязательное поле!"'
    };

    validators.confirmPassword = {
        expression: function (viewValue, modelValue, scope) {
            var value = modelValue || viewValue;
            return value == scope.model.password;
        },
        message: '"Пароли не совпадают!"'
    };

    return validators;
}]);

app.factory('UserLoginForm', ['Validators', function (Validators) {
    var loginForm = {};

    loginForm.getFieldsOptions = function (user) {
        return [
            {
                type: 'input',
                key: 'email',
                templateOptions: {
                    id: 'userEmailId',
                    type: 'email',
                    label: 'Email',
                    required: true
                },
                validators: {
                    'required': Validators.required
                },
                controller: function ($scope) {
                    if (user !== undefined && !!user) {
                        $scope.model.email = user.email;
                    }
                }
            },
            {
                type: 'input',
                key: 'password',
                templateOptions: {
                    id: 'userPasswordId',
                    type: 'password',
                    label: 'Пароль',
                    required: true
                },
                validators: {
                    'required': Validators.required
                }
            }
        ]
    };

    return loginForm;
}]);

app.factory('UserRegistrationForm', ['Validators', function (Validators) {
    var regForm = {};

    regForm.getFieldsOptions = function (user) {
        return [
            {
                type: 'input',
                key: 'email',
                templateOptions: {
                    id: 'userEmailId',
                    type: 'email',
                    label: 'Email',
                    required: true
                },
                validators: {
                    'required': Validators.required
                },
                controller: function ($scope) {
                    if (user !== undefined && !!user) {
                        $scope.model.email = user.email;
                    }
                }
            },
            {
                type: 'input',
                key: 'password',
                templateOptions: {
                    id: 'clientPasswordId',
                    type: 'password',
                    label: 'Пароль',
                    required: true
                },
                validators: {
                    'required': Validators.required
                }
            },
            {
                type: 'input',
                key: 'password_confirm',
                templateOptions: {
                    id: 'clientPasswordConfirmId',
                    type: 'password',
                    label: 'Пароль еще раз',
                    required: true
                },
                validators: {
                    'required': Validators.required,
                    'has_difference': Validators.confirmPassword
                }
            }
        ]
    };

    return regForm;
}]);
