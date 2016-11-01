angular.module('starter.controllers', ['starter.services', 'chart.js', 'chat', 'ngCordova', 'ngImgCrop','uiGmapgoogle-maps', 'ngAnimate', 'ionic.cloud'])

.constant('WEBSERVICE_URL', '192.168.25.4:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.5:8080')
//.constant('WEBSERVICE_URL', '192.168.0.103:8080')
.constant('WEBSERVICE_URL_SERVER', '192.168.25.4:8080')

/*
 * Controller: MenuCtrl
 * Description: Reponsável pelo gerenciamento do menu
 */  
.controller('MenuCtrl', function ($scope, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state) {

  var userId = window.localStorage['userId'] || 'semID';
  var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
  $http({
      method: 'GET',
      url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/profile' 
   }).then(function successCallback(response) {                        
       console.log("AQUI JESUS");
       console.log(response);
       $scope.profile = response.data;                 
       console.log($scope.profile);
    }, function errorCallback(response) {
       console.log("getUserSugestion");
       $scope.modalErro.show();
       $ionicLoading.hide();              
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

.controller( 'ChatCtrl', [ 'Messages','$scope','$ionicModal','WEBSERVICE_URL', '$timeout','$stateParams','$http','$rootScope','$state', '$ionicLoading',
                  function( Messages, $scope, $ionicModal, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $timeout, $stateParams, $http, $rootScope, $state, $ionicLoading ){
    
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

    /* inicializa a modal */
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope
    }).then(function(modalProfile) {
      $scope.modalProfile = modalProfile;
    });

    // Message Inbox
        // Self Object
    var chat = this;

    // Sent Indicator
    chat.status = "";

    // Keep an Array of Messages
    chat.messages = [];

    // Set User Data

    Messages.user({ name : "teste" });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Get Received Messages and Add it to Messages Array.
    // This will automatically update the view.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    var chatmessages = document.querySelector(".chat-messages");
    Messages.receive(function(msg){
        console.log(msg);
        chat.messages.push(msg);
        setTimeout( function() {
            chatmessages.scrollTop = chatmessages.scrollHeight;
        }, 10 );
    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Send Messages
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    chat.send = function() {
        Messages.send({ data : chat.textbox });
        chat.status = "sending";
        chat.textbox = "";
        setTimeout( function() { chat.status = "" }, 1200 );
    };

    $scope.closeProfile = function() {       
       $scope.modalProfile.hide();
    };
    
    $scope.closeChat = function() {       
       $scope.modalChat.hide();
    };

    /*
    * Name: $scope.callSugestionProfile()
    * Description: Método reponsavel por buscar o perfil das sugestões ao clicar no card, através do webservice
    * Author: Edian Comachio    
    */     
    $scope.callMatchProfile = function(match){                       
      $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 }); 
      console.log("callMatchProfile");     
      console.log(match);     

      var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
      $http({
          method: 'GET',
          url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + match.id +'/profile' 
       }).then(function successCallback(response) {

        $scope.profile = response.data;          

        $scope.modalSugestionProfile.show();
        $ionicLoading.hide();

        }, function errorCallback(response) {
          $http({
              method: 'GET',
              url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + match.id +'/profile' 
           }).then(function successCallback(response) {

            $scope.profile = response.data;          

            $scope.modalSugestionProfile.show();
            $ionicLoading.hide();

            }, function errorCallback(response) {
                console.log("callMatchProfile");
                $scope.modalErro.show();
                $ionicLoading.hide();              
          });     
      });        
      
      // Open the login modal
     
    };
} ] )
