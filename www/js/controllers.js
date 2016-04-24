angular.module('starter.controllers', ['starter.services'])

.constant('WEBSERVICE_URL', 'localhost:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.8:8080')

.controller('AppCtrl', function ($scope, WEBSERVICE_URL, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state, $q, UserService, $ionicLoading) {

  $scope.fbLogin = function () {
    ngFB.login({
                scope: 'user_birthday,user_religion_politics,user_relationships,user_relationship_details,user_hometown,' +
                       'user_location,user_likes,user_education_history,user_work_history, user_website, user_managed_groups,' +
                       'user_events,user_photos,user_videos,user_friends,user_about_me,user_status,user_games_activity,'+
                       'user_tagged_places,user_posts,user_actions.books,user_actions.music,user_actions.video,user_actions.news,'+
                       'user_actions.fitness,public_profile'}).then(
        function (response) {
            if (response.status === 'connected') {
                console.log(response.authResponse.accessToken);
                window.localStorage['accessToken'] = response.authResponse.accessToken;          
                $scope.getFbUser();
            } else {
                alert('Facebook login failed');
            }
        });
  };

  $scope.getFbUser = function(){
    ngFB.api({
         path: '/me',
        params: {fields: 'id,name,email,gender,location'}
    }).then(function (user) {
      console.log(user);
      $scope.user = user;
      $rootScope.userId = user.id;
      $rootScope.accessToken = user.accessToken;
      window.localStorage['userId'] = user.id;
      
      console.log(window.localStorage['accessToken']);
      $scope.checkIfUserExist();
    },
    function (error) {
      alert('Facebook error: ' + error.error_description);
    });
  }  

  $scope.checkIfUserExist =function(){
            console.log("checkIfUserExist");
            console.log(window.localStorage['accessToken']);
            $scope.userConfig = {accessToken: window.localStorage['accessToken'],
                                 id: $rootScope.userId}
            var config = {headers:  {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };                                   
                                 
            $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/login", $scope.userConfig, config).
            success(function(data, status, headers, config) {             
                $state.go('tabs.sugestion');
            }).
            error(function(data, status, headers, config) {
            
            });
        };


  /*------------------- AQUI COISA NOVA COPIADA ----------------------------*/
  console.log("WelcomeCtrl WelcomeCtrl WelcomeCtrl");
  // This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      // For the purpose of this example I will store user data on local storage
      UserService.setUser({
        authResponse: authResponse,
        userID: profileInfo.id,
        name: profileInfo.name,
        email: profileInfo.email,
        picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
      });
      $ionicLoading.hide();
      $state.go('app.home');
    }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
        console.log(response);
        info.resolve(response);
      },
      function (response) {
        console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
     console.log("AQUI facebookSignIn");
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

        // Check if we have our user saved
        var user = UserService.getUser('facebook');

        if(!user.userID){
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {
            // For the purpose of this example I will store user data on local storage
            UserService.setUser({
              authResponse: success.authResponse,
              userID: profileInfo.id,
              name: profileInfo.name,
              email: profileInfo.email,
              picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
            });

             console.log("aqui 2 edian");
            console.log(profileInfo);
            $scope.user = profileInfo;
            $rootScope.userId = profileInfo.id;
            $rootScope.accessToken = profileInfo.accessToken;
            console.log("aqui 3 edian");
            window.localStorage['userId'] = profileInfo.id;
            
            console.log(window.localStorage['accessToken']);
            console.log("aqui 4 edian");
            $scope.checkIfUserExist();
            console.log("aqui 5 edian")
;          }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
          });
        }else{
          console.log("aqui 1 edian");
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {
            console.log("aqui 2 edian");
            console.log(profileInfo);
            $scope.user = profileInfo;
            $rootScope.userId = profileInfo.id;
            $rootScope.accessToken = profileInfo.accessToken;
            console.log("aqui 3 edian");
            window.localStorage['userId'] = profileInfo.id;
            
            console.log(window.localStorage['accessToken']);
            console.log("aqui 4 edian");
            $scope.checkIfUserExist();
            console.log("aqui 5 edian");
          });
        }
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
        // but has not authenticated your app
        // Else the person is not logged into Facebook,
        // so we're not sure if they are logged into this app or not.

        console.log('getLoginStatus', success.status);

        $ionicLoading.show({
          template: 'Logging in...'
        });

        // Ask the permissions you need. You can learn more about
        // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['user_birthday','user_religion_politics','user_relationships','user_relationship_details','user_hometown','' +
                       'user_location','user_likes','user_education_history','user_work_history',' user_website',' user_managed_groups','' +
                       'user_events','user_photos','user_videos','user_friends','user_about_me','user_status','user_games_activity',''+
                       'user_tagged_places','user_posts','user_actions.books','user_actions.music','user_actions.video','user_actions.news',''+
                       'user_actions.fitness','public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };
  /*-------------------------- FIM DAS COISA NOVA -----------------------*/
})

.controller('ProfileCtrl', function ($scope, $state, $stateParams, WEBSERVICE_URL, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal) {  
 
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.getUserInfo = function(){        
        
        var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
        $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/profile' 
         }).then(function successCallback(response) {                        
             $scope.profile = response.data;          
             console.log("getUserInfo");
             console.log($scope.profile);
          }, function errorCallback(response) {
              console.log("FALHA");
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    }; 

    console.log("$stateParams.profileId = " + $stateParams.idProfile);

    if($stateParams.idProfile==""||$stateParams.idProfile==undefined){
      var userId = window.localStorage['userId'] || 'semID';
    }else{
      var userId =$stateParams.idProfile;
    }

    //$scope.getUserInfo();

    $scope.repeatDone = function() {
      $ionicSlideBoxDelegate.update();
      //$ionicSlideBoxDelegate.slide($scope.week.length - 1, 1);
    };

    $scope.getLoggedUserProfile = function(){
      console.log("e nois");
      $scope.getUserInfo();
      
      // Open the login modal
      $scope.modal.show();
    };    

    //close modal 
    $scope.closeProfile = function() {
      $scope.modal.hide();      
    };  

})

.controller('SugestionCtrl', function ($scope, WEBSERVICE_URL, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state) {
    
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope
    }).then(function(modal2) {
      $scope.modal2 = modal2;
    });

    $scope.getUserSugestion = function(){
        
        /* sugestion object 
         * id = id facebook
         * name = Nome          
         * interestsInCommon = Interesses em comum com o usuário logado
         * photos = foto da sugestão         
         */
 
        console.log("chamando sugestion");
        var userId = window.localStorage['userId'] || 'semID';
        var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
        $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/sugestions' 
         }).then(function successCallback(response) {          
            console.log(response);
            $scope.sugestions = response.data;            
         }, function errorCallback(response) {
              console.log("FALHA");
            
        });
    };

    $scope.getUserSugestion();

    $scope.callSugestionProfile = function(sugestion){                       
      
      console.log("callSugestionProfile");     
      console.log(sugestion);     

      var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
      $http({
          method: 'GET',
          url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + sugestion.id +'/profile' 
       }).then(function successCallback(response) {

        $scope.profile = response.data;          
        console.log($scope.profile);

        $scope.modal2.show();    
        }, function errorCallback(response) {
            console.log("FALHA");
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });        
      
      // Open the login modal
     
    };

    //close modal 
    $scope.closeProfile = function() {
      $scope.modal2.hide();      
    }; 
})

.controller('LoginCtrl', function ($scope, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope) {
  
})

.controller('MenuCtrl', function ($scope, WEBSERVICE_URL, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state) {

  console.log("MenuCtrl");

  var userId = window.localStorage['userId'] || 'semID';
  var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
  $http({
      method: 'GET',
      url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/profile' 
   }).then(function successCallback(response) {                        
       $scope.profile = response.data;                 
       console.log($scope.profile);
    }, function errorCallback(response) {
        console.log("FALHA");
        // called asynchronously if an error occurs
        // or server returns response with an error status.
  });
})

.controller('HomeCtrl', function($scope, UserService, $ionicActionSheet, $state, $ionicLoading){
  $scope.user = UserService.getUser();

  $scope.showLogOutMenu = function() {
    var hideSheet = $ionicActionSheet.show({
      destructiveText: 'Logout',
      titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
      cancelText: 'Cancel',
      cancel: function() {},
      buttonClicked: function(index) {
        return true;
      },
      destructiveButtonClicked: function(){
        $ionicLoading.show({
          template: 'Logging out...'
        });

        // Facebook logout
        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();
          $state.go('welcome');
        },
        function(fail){
          $ionicLoading.hide();
        });
      }
    });
  };
})

.controller('WelcomeCtrl', function($scope, $state, $q, UserService, $ionicLoading) {

})

.service('UserService', function() {
  // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
})