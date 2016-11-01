angular.module('starter.controllers', ['starter.services', 'chart.js', 'chat', 'ngCordova', 'ngImgCrop','uiGmapgoogle-maps', 'ngAnimate', 'ionic.cloud'])

.constant('WEBSERVICE_URL', '192.168.25.4:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.5:8080')
//.constant('WEBSERVICE_URL', '192.168.0.103:8080')
.constant('WEBSERVICE_URL_SERVER', '192.168.25.4:8080')

/*
 * Controller: ProfileCtrl
 * Description: Reposável pelo gerenciamento do perfil do usuário 
 */     
.controller('ProfileCtrl', function ($scope, $state, $stateParams, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading) {  
 
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

    /*inicializa modal dos perfis */
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });



  /*
    * Name: $scope.getUserInfoSibebar() 
    * Description: Método reponsavel por buscar perfil do usuário no webservice.
    * Author: Edian Comachio
    * TODO - tratamento de erro do webservice
    */ 
    $scope.getUserInfoSibebar = function(){                
        var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
        $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/profile' 
         }).then(function successCallback(response) { 
             console.log(response);
             $scope.currentProfile = response.data;               

          }, function errorCallback(response) {
            $http({
                method: 'GET',
                url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + userId +'/profile' 
             }).then(function successCallback(response) { 
                 console.log(response);
                 $scope.currentProfile = response.data;          

              }, function errorCallback(response) {
                  console.log("getUserInfo");
                  $scope.modalErro.show();
                  $ionicLoading.hide();                                    
            });                      
        });
    };         
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
             console.log(response);
             $scope.currentProfile = response.data;  
             //console.log($scope.profile.socialLinks[0]);
             // Open the profile modal
             $scope.modal.show();
             $ionicLoading.hide();

          }, function errorCallback(response) {
            $http({
                method: 'GET',
                url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + userId +'/profile' 
             }).then(function successCallback(response) { 
                 console.log(response);
                 $scope.currentProfile = response.data;          

                 // Open the profile modal
                 $scope.modal.show();
                 $ionicLoading.hide();

              }, function errorCallback(response) {
                  console.log("getUserInfo");
                  $scope.modalErro.show();
                  $ionicLoading.hide();                                    
            });                      
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
    * Name: $scope.closeProfile()
    * Description: Método reponsavel por fechar a modal com o perfil do usuário
    * Author: Edian Comachio    
    */     
    $scope.closeEditProfile = function() {      
      $scope.modalEditProfile.hide();      
    };  

})