angular.module('starter.controllers', ['starter.services'])

//.constant('WEBSERVICE_URL', 'localhost:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
.constant('WEBSERVICE_URL', '192.168.25.7:8080')

/*
 * Controller: AppCrtl
 * Description: Gerenciamento geral da aplicação
 */
.controller('AppCtrl', function ($scope, WEBSERVICE_URL, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state, $q, UserService, $ionicLoading) {

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
    if (window.cordova) {
      console.log("DEVICE");
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
      window.localStorage['userId'] = user.id;     

      checkIfUserExist();     
    },
    function (error) {
      alert('Facebook error: ' + error.error_description);
    });
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
        console.log(response.data);
        if(response.data){
            updateUser();
        }else{
            createUser();
        }
      }, function errorCallback(response) {
        console.log("FALHA");  
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
        id: $rootScope.userId
      }

      $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/update", $scope.userConfig, config).
      success(function(data, status, headers, config) {
          $scope.modalLoading.hide();    
          $state.go('tabs.sugestion');
      }).
      error(function(data, status, headers, config) {          
        console.log("Erro ao atualizar usuario");
        $scope.modalLoading.hide();
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
        id: $rootScope.userId
      }

      console.log($scope.userConfig);
      
      $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/create", $scope.userConfig, config).
      success(function(data, status, headers, config) {
        $scope.modalLoading.hide();
        $state.go('tabs.sugestion');
      }).
      error(function(data, status, headers, config) {          
        console.log("Erro ao criar usuario");
        $ionicLoading.hide()
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
      $state.go('app.home');
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

/*
 * Controller: SettingsCtrl
 * Description: Reposável pelo gerenciamento do perfil do usuário 
 */     
.controller('SettingsCtrl', function ($scope, $state, $stateParams, WEBSERVICE_URL, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading) {  

    $scope.settings = {'distance':0,
                       'beginAge':0,
                       'finalAge':0
                      };

    /*inicializa modal dos perfis */
    $ionicModal.fromTemplateUrl('templates/settings.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });  

    /*inicializa modal de erro */
    $ionicModal.fromTemplateUrl('templates/errorDefaultPage.html', {
      scope: $scope
    }).then(function(modalErro) {
      $scope.modalErro = modalErro;
    });

   /*
    * Name: $scope.getLoggedUserProfile()
    * Description: Método reponsavel por gerenciar os eventos da view e apresentar o loading.
    * Author: Edian Comachio    

    $scope.getLoggedUserProfile = function(){
      $ionicLoading.show();
      $scope.getUserInfo();     
    };  
    */     
   /*
    * Name: $scope.getUserSettings() 
    * Description: Método reponsavel por buscar as configurações do usuário no webservice.
    * Author: Edian Comachio
    * TODO - tratamento de erro do webservice
    */ 
    $scope.getUserSettings = function(){
       console.log("asdasd");
       // Open the profile modal
       $scope.modal.show();
       $ionicLoading.hide();
     };


})

/*
 * Controller: ProfileCtrl
 * Description: Reposável pelo gerenciamento do perfil do usuário 
 */     
.controller('ProfileCtrl', function ($scope, $state, $stateParams, WEBSERVICE_URL, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading) {  
 
    /*inicializa modal para edicao dos perfis */
    $ionicModal.fromTemplateUrl('templates/editProfile.html', {
      scope: $scope
    }).then(function(modalEditProfile) {
      $scope.modalEditProfile = modalEditProfile;
    });    

    /*inicializa modal dos perfis */
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });
    
    /*inicializa modal de erro */
    $ionicModal.fromTemplateUrl('templates/errorDefaultPage.html', {
      scope: $scope
    }).then(function(modalErro) {
      $scope.modalErro = modalErro;
    });

   /*
    * Name: $scope.getUserInfo() 
    * Description: Método reponsavel por buscar perfil do usuário no webservice.
    * Author: Edian Comachio
    * TODO - tratamento de erro do webservice
    */ 
    $scope.getUserInfo = function(){                
        var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
        $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/profile' 
         }).then(function successCallback(response) {                        
             $scope.profile = response.data;          
             console.log("getUserInfo");
             console.log($scope.profile);
             
             // Open the profile modal
             $scope.modal.show();
             $ionicLoading.hide();

          }, function errorCallback(response) {
             $scope.modalErro.show();
             $ionicLoading.hide();              
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    };     
    
    $scope.editProfile = function(){
      
      // Open the profile modal
      $scope.modalEditProfile.show();
      $ionicLoading.hide();      

    }

    //Nao lembro mais o que isso faz, mas funciona. TODO verificar possibilidade de retirar
    if($stateParams.idProfile==""||$stateParams.idProfile==undefined){
      var userId = window.localStorage['userId'] || 'semID';
    }else{
      var userId = $stateParams.idProfile;
    }    

   /*
    * Name: $scope.repeatDone()
    * Description: Método reponsavel por atualizar o sliderbox (não sei direito como)
    * Author: Edian Comachio
    * TODO - descobrir funcionamento correto do método
    */ 
    $scope.repeatDone = function() {
      $ionicSlideBoxDelegate.update();
      //$ionicSlideBoxDelegate.slide($scope.week.length - 1, 1);
    };

   /*
    * Name: $scope.getLoggedUserProfile()
    * Description: Método reponsavel por gerenciar os eventos da view e apresentar o loading.
    * Author: Edian Comachio    
    */     
    $scope.getLoggedUserProfile = function(){
      $ionicLoading.show();
      $scope.getUserInfo();     
    };    

   /*
    * Name: $scope.closeProfile()
    * Description: Método reponsavel por fechar a modal com o perfil do usuário
    * Author: Edian Comachio    
    */     
    $scope.closeProfile = function() {
      $scope.modal.hide();      
    };  

   /*
    * Name: $scope.closeError()
    * Description: Método reponsavel por fechar a modal com o Erro
    * Author: Edian Comachio    
    */     
    $scope.closeError = function() {
      console.log("errorclose");
      $scope.modalErro.hide();      
    };  

})

.controller('MatchesCtrl', function ($scope, WEBSERVICE_URL, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state, $ionicLoading) {
  
    $scope.getUserSugestion = function(){

      $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 }); 

      /* sugestion object 
       * id = id facebook
       * name = Nome          
       * interestsInCommon = Interesses em comum com o usuário logado
       * photos = foto da sugestão         
       */        
      var userId = window.localStorage['userId'] || 'semID';
      var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
      $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/sugestions' 
       }).then(function successCallback(response) {          
            $ionicLoading.hide();
            console.log(response.data);
            $scope.sugestions = response.data;            
       }, function errorCallback(response) {
            $ionicLoading.hide();
            console.log("FALHA");            
       });
    };

    //Busca sugestões automaticamente ao abrir a tela de sugestões
    $scope.getUserSugestion();  
})

/*
 * Controller: SugestionCtrl
 * Description: Reposável pelo gerenciamento das sugestões do usuário 
 */     
.controller('SugestionCtrl', function ($scope, WEBSERVICE_URL, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state, $ionicLoading) {
    
    /* inicializa a modal */
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope
    }).then(function(modal2) {
      $scope.modal2 = modal2;
    });

   /*
    * Name: $scope.closeProfile()
    * Description: Método reponsavel por fechar atualizar as sugestoes do usuario através do webservice
    * Author: Edian Comachio    
    */     
    $scope.doRefreshSugestion = function(){
      
      var userId = window.localStorage['userId'] || 'semID';

      $http.get('http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/sugestions' )
         .success(function(newItems) {
           $scope.sugestions = newItems;
         })
         .finally(function() {
           // Stop the ion-refresher from spinning
           $scope.$broadcast('scroll.refreshComplete');
         });      
    }

   /*
    * Name: $scope.getUserSugestion()
    * Description: Método reponsavel por buscar as sugestões do usuário através do webservice
    * Author: Edian Comachio    
    */     
    $scope.getUserSugestion = function(){

      $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 }); 

      /* sugestion object 
       * id = id facebook
       * name = Nome          
       * interestsInCommon = Interesses em comum com o usuário logado
       * photos = foto da sugestão         
       */        
      var userId = window.localStorage['userId'] || 'semID';
      var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
      $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/sugestions' 
       }).then(function successCallback(response) {          
            $ionicLoading.hide();
            $scope.sugestions = response.data;            
       }, function errorCallback(response) {
            $ionicLoading.hide();
            console.log("FALHA");            
       });
    };

    //Busca sugestões automaticamente ao abrir a tela de sugestões
    $scope.getUserSugestion();

   /*
    * Name: $scope.callSugestionProfile()
    * Description: Método reponsavel por buscar o perfil das sugestões ao clicar no card, através do webservice
    * Author: Edian Comachio    
    */     
    $scope.callSugestionProfile = function(sugestion){                       
      $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 }); 
      console.log("callSugestionProfile");     
      console.log(sugestion);     

      var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
      $http({
          method: 'GET',
          url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + sugestion.id +'/profile' 
       }).then(function successCallback(response) {

        $scope.profile = response.data;          

        $scope.modal2.show();    
        $ionicLoading.hide();

        }, function errorCallback(response) {
            console.log("FALHA");
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });        
      
      // Open the login modal
     
    };

    /*
    * Name: $scope.closeProfile()
    * Description: Método reponsavel por fechar a modal
    * Author: Edian Comachio    
    */     
    $scope.closeProfile = function() {
      $scope.modal2.hide();      
    }; 
})

//TODO - tirar do AppCtrl os metodos de login e passar pra cá
.controller('LoginCtrl', function ($scope, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope) {
 


})

//TODO - Avaliar se isso é usado em algum lugar
.controller('MenuCtrl', function ($scope, WEBSERVICE_URL, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state) {

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

//TODO ver se isso é chamado em algum lugar
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