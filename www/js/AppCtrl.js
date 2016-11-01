angular.module('starter.controllers', ['starter.services', 'chart.js', 'chat', 'ngCordova', 'ngImgCrop','uiGmapgoogle-maps', 'ngAnimate', 'ionic.cloud'])

.constant('WEBSERVICE_URL', '192.168.25.4:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.5:8080')
//.constant('WEBSERVICE_URL', '192.168.0.103:8080')
.constant('WEBSERVICE_URL_SERVER', '192.168.25.4:8080')

/*
 * Controller: AppCrt1l
 * Description: Gerenciamento geral da aplicação
 */
.controller('AppCtrl', function ($scope, $ionicPush, $ionicUser, $ionicAuth, $ionicPlatform, $cordovaGeolocation, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state, $q, UserService, $ionicLoading) {
    
    $scope.$on('cloud:push:notification', function(event, data) {
      var msg = data.message;
      alert(msg.title + ': ' + msg.text);
    });

    /* 
     * Autor: Edian Comachio
     * Trecho que trata Erros exibidos para o usuario 
     */
    /*inicializa modal de erro */
    $ionicModal.fromTemplateUrl('templates/errorDefaultPage.html', {
      scope: $scope
    }).then(function(modalErro) {
      $scope.modalErro = modalErro;
    });

    $scope.closeError = function() {
      console.log("errorclose");
      $scope.modalErro.hide();      
    };

  /* inicializa modal */
  $ionicModal.fromTemplateUrl('templates/createLoading.html', {
      scope: $scope
  }).then(function(modalLoading) {
      $scope.modalLoading = modalLoading;
  });

  /*
   * Name: Login() 
   * Description: Método reponsavel por direcionar o login conforme a plataforma WEB ou Dispositivo movel
   * Author: Edian Comachio
   */
  $scope.login = function(){       

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {        
        window.localStorage['geoLocalizationLat'] = position.coords.latitude;
        window.localStorage['geoLocalizationLong'] = position.coords.longitude;
        console.log(window.localStorage['geoLocalizationLong']);
    }, function(err) {
        console.log("ERRO AO PEGAR LOCALIZACAO");
    });

    console.log("ANDROID:", ionic.Platform.isAndroid());

    if (ionic.Platform.isAndroid()) {
      window.cordova = true;
      console.log("DEVICE:", window.cordova);
      $scope.facebookSignIn();
    } else {
      console.log("WEB");
      $scope.fbLogin();
    }
  }

  /*
   * Name: fbLogin() 
   * Description: Método reponsavel pela autenticacao do facebook via browser 
   * Author: Edian Comachio
   */
  $scope.fbLogin = function () {       
  
    ngFB.login({
                scope: 'user_birthday,user_religion_politics,user_relationships,user_relationship_details,user_hometown,' +
                       'user_location,user_likes,user_education_history,user_work_history, user_website, user_managed_groups,' +
                       'user_events,user_photos,user_videos,user_friends,user_about_me,user_status,user_games_activity,'+
                       'user_tagged_places,user_posts,user_actions.books,user_actions.music,user_actions.video,user_actions.news,'+
                       'user_actions.fitness,public_profile'}).then(
        function (response) {
            
            $scope.modalLoading.show();            
            $scope.message = "Keep calm, we dont post anything on your Facebook";

            if (response.status === 'connected') {
                console.log(response.status);
                console.log(response.authResponse.accessToken);
                window.localStorage['accessToken'] = response.authResponse.accessToken;          

                $scope.getFbUser();                
            } else {
                alert('Facebook login failed');
                $ionicLoading.hide()
            }            
        });
  };
  
  /*
   * Name: getFbUser() 
   * Desription: Método reponsavel por buscar o usuario do facebook com inf basicas
   * Author: Edian Comachio
   */
  $scope.getFbUser = function(){
    ngFB.api({
         path: '/me',
        params: {fields: 'id,name,email,gender,location'}
    }).then(function (user) {      
      $scope.user = user;
      $rootScope.userId = user.id;
      $rootScope.accessToken = user.accessToken;

      ionicUserPush();

      window.localStorage['userId'] = user.id;     
      console.log(user);

      checkIfUserExist();     
      
    },
    function (error) {
      alert('Facebook error: ' + error.error_description);
    });
  }  
  
  function ionicUserPush(){
      $scope.data = {
        'email': $rootScope.userId + '@date.com',
        'password': $rootScope.userId
      }

      if ($ionicAuth.isAuthenticated()) {
          // Make sure the user data is going to be loaded
          $ionicUser.load().then(function() {}); 

          $ionicPush.register().then(function(t) {
            return $ionicPush.saveToken(t);
          }).then(function(t) {
            console.log('Token saved:', t.token);
          });     
          
      }else{
        console.log("aqui 1");
        $ionicAuth.login('basic', $scope.data).then(function(){}, function(err){
          console.log("aqui 2");
          $ionicAuth.signup($scope.data).then(function() {
              // `$ionicUser` is now registered
              console.log("aqui 3");
              $ionicAuth.login('basic', $scope.data).then(function(){
                  console.log("CRIOU USUARIO IONIC");
              });
          }, function(err) {
              console.log(err);
              var error_lookup = {
                  'required_email': 'Missing email field',
                  'required_password': 'Missing password field',
                  'conflict_email': 'A user has already signed up with that email',
                  'conflict_username': 'A user has already signed up with that username',
                  'invalid_email': 'The email did not pass validation'
              }    
          
              $scope.error = error_lookup[err.details[0]];
          });
        })
      }
  }

  /*
   * Name: checkIfUserExist() 
   * Description: Método reponsavel por verificar se o usuario existe no bando de dados
   * Author: Edian Comachio
   */  
  checkIfUserExist = function(){
      $scope.message = "Calibrating your heart...";
      $http({
        method: 'GET',
        url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + $rootScope.userId +'/exists' 
      }).then(function successCallback(response) {           
        console.log("exists result");
        console.log(response.data);
        if(response.data){
            updateUser();
        }else{
            createUser();
        }
      }, function errorCallback(response) {
          $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + $rootScope.userId +'/exists' 
          }).then(function successCallback(response) {           
            if(response.data){
                updateUser();
            }else{
                createUser();
            }
          }, function errorCallback(response) {
              console.log("checkIfUserExist");
              $scope.modalErro.show();
              $scope.modalLoading.hide();              
              $ionicLoading.hide();                        
          });
        });
  }

  
  /*
   * Name: updateUser() 
   * Description: Método reponsavel por atualizar o usuario na base
   * Author: Edian Comachio
   */  
  updateUser = function(){
      //headers
      $scope.message = "Updating your type...";
      var config = {
        headers:  {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }

      //objeto usuario
      $scope.userConfig = {
        accessToken: window.localStorage['accessToken'],
        id: $rootScope.userId,
        location: {
          latitude: window.localStorage['geoLocalizationLat'],
          longitude: window.localStorage['geoLocalizationLong']
        }
      }

      $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/update", $scope.userConfig, config).
      success(function(data, status, headers, config) {
          $scope.modalLoading.hide();                        
          $state.go('tabs.sugestion');
      }).
      error(function(data, status, headers, config) {          
        $http.post("http://" + WEBSERVICE_URL_SERVER + "/NiceDateWS/users/update", $scope.userConfig, config).
        success(function(data, status, headers, config) {
            $scope.modalLoading.hide();    
            $state.go('tabs.sugestion');
        }).
        error(function(data, status, headers, config) {          
            console.log("updateUser");
            $scope.modalErro.show();
            modalLoading.hide();
            $ionicLoading.hide();              
        });        
      });
  }

  /*
   * Name: createUser() 
   * Description: Método reponsavel por criar o usuario na base
   * Author: Edian Comachio
   */     
  createUser = function(){
      $scope.message = "Your taste is complex... We're creating your profile!";
      
      //headers
      var config = {
        headers:  {
          'Accept': 'application/json',
          'Content-Type': 'application/json'        
        }
      }

      //objeto usuario
      $scope.userConfig = {
        accessToken: window.localStorage['accessToken'],
        id: $rootScope.userId,
        location: {
          latitude: window.localStorage['geoLocalizationLat'],
          longitude: window.localStorage['geoLocalizationLong']
        }
      }

      console.log($scope.userConfig);
      
      $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/create", $scope.userConfig, config).
      success(function(data, status, headers, config) {
        $scope.modalLoading.hide();
        $state.go('tabs.sugestion');
      }).
      error(function(data, status, headers, config) {          
        $http.post("http://" + WEBSERVICE_URL_SERVER + "/NiceDateWS/users/create", $scope.userConfig, config).
          success(function(data, status, headers, config) {
            $scope.modalLoading.hide();
            $state.go('tabs.sugestion');
          }).
          error(function(data, status, headers, config) {          
              console.log("createUser");
              $scope.modalErro.show();
              modalLoading.hide();
              $ionicLoading.hide();                        
          });        
      });
  }  
  
  /*
   * Name: fbLoginSuccess() 
   * Description: Método reponsavel por gerenciar o callback da API do facebook - login com sucesso   
   * Author: Edian Comachio
   */     
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
      //$state.go('app.home');
    }, function(fail){
        // Fail get profile info
        console.log('profile info fail', fail);
    });
  };

  /*
   * Name: fbLoginError() 
   * Description: Método reponsavel por gerenciar o callback da API do facebook - falha no login
   * Author: Edian Comachio
   */
  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  /*
   * Name: getFacebookProfileInfo() 
   * Description: Método reponsavel por buscar o informções basicas do usuário através da API do facebook   
   * Author: Edian Comachio
   */
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

  /*
   * Name: $scope.facebookSignIn() 
   * Description: Método reponsavel por realizar a autenticação e o login através da API do facebook - Via dispositivo movel
   * Author: Edian Comachio
   */
  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {    
    
    $scope.modalLoading.show();
    $scope.message = "Keep calm, we dont post anything on your Facebook";
    facebookConnectPlugin.getLoginStatus(function(success){

      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        
        // Check if we have our user saved
        var user = UserService.getUser('facebook');
        console.log(success.authResponse);
        window.localStorage['accessToken'] = success.authResponse.accessToken;
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
            console.log(profileInfo);

            $scope.user = profileInfo;
            $rootScope.userId = profileInfo.id;
            $rootScope.accessToken = profileInfo.accessToken;            

            ionicUserPush();

            window.localStorage['userId'] = profileInfo.id;                  

            checkIfUserExist();            

           }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
          });
        }else{
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {            
            $scope.user = profileInfo;
            $rootScope.userId = profileInfo.id;
            $rootScope.accessToken = profileInfo.accessToken;

            ionicUserPush();
            
            window.localStorage['userId'] = profileInfo.id;
            
            console.log(window.localStorage['accessToken']);
            
            checkIfUserExist();
            
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
})