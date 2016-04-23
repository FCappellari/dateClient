// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'ngOpenFB'])

.run(function ($ionicPlatform, ngFB) {  
  ngFB.init({appId: '973158726110069'});

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })    
    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })
    .state('tabs.profile', {
      url: '/profile/:idProfile ',
      views: {
        'profile-tab': {
          templateUrl: 'templates/profile.html',
          controller: 'ProfileCtrl'
        }
      }
    })
    .state('tabs.sugestion', {
      url: '/sugestion',
      views: {
        'sugestion-tab': {
          templateUrl: 'templates/sugestion.html',
           controller: 'SugestionCtrl'
        }
      }
    });
   
   /*if(!ionic.Platform.isIOS())*/
      $ionicConfigProvider.scrolling.jsScrolling(false);

   $urlRouterProvider.otherwise('/login');

})

.controller('LoginCtrl', function($scope, $state) {
  
  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    $state.go('tabs.home');
  };
  
})

.directive('repeatDone', function () {
   return function (scope, element, attrs) {
     if (scope.$last) { // all are rendered
       scope.$eval(attrs.repeatDone);
     }
   }
})