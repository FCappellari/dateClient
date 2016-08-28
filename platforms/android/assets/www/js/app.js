 // Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'ngOpenFB', 'ionic-native-transitions', 'chart.js'])

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

.constant( 'config', {
    //
    // Get your PubNub API Keys in the link above.
    // Senha PubNub Totvs@123
    //
    "pubnub": {
        "publish-key"   : "pub-c-48850936-e46f-454d-91bf-37719fcdadde",
        "subscribe-key" : "sub-c-2571490a-6267-11e6-962a-02ee2ddab7fe"
    }
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  //import 'ionic-native-transitions';
  //require('ionic-native-transitions');
  $ionicConfigProvider.scrolling.jsScrolling(false);
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl',
      nativeTransitionsAndroid: {
        "type": "flip",
        "direction": "right"
      },
    })  

    .state('crop', {
      url: '/crop',      
      templateUrl: 'templates/editPhoto.html',
      controller: 'cropImageController'            
    })  

    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html',
      controller: 'ProfileCtrl',
      nativeTransitionsAndroid: {
        "type": "flip",
        "direction": "right"
      },
    })
    .state('tabs.profile', {
      url: '/profile/:idProfile ',
      views: {
        'profile-tab': {
          templateUrl: 'templates/profile.html',
          controller: 'ProfileCtrl',
        }
      },
      nativeTransitionsAndroid: {
        "type": "flip",
        "direction": "right"
      },
    })
    .state('tabs.sugestion', {
      url: '/sugestion',
      views: {
        'sugestion-tab': {
          templateUrl: 'templates/sugestion.html',
           controller: 'SugestionCtrl'
        }
      }      
    })
   .state('tabs.matches', {
      url: '/matches',
      views: {
        'matches-tab': {
          templateUrl: 'templates/matches.html',
           controller: 'MatchesCtrl'
        }
      }
    });
   
 
  $ionicConfigProvider.tabs.position("top");

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