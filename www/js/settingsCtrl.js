angular.module('starter.controllers', ['starter.services', 'chart.js', 'chat', 'ngCordova', 'ngImgCrop','uiGmapgoogle-maps', 'ngAnimate', 'ionic.cloud'])

.constant('WEBSERVICE_URL', '192.168.25.4:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.5:8080')
//.constant('WEBSERVICE_URL', '192.168.0.103:8080')
.constant('WEBSERVICE_URL_SERVER', '192.168.25.4:8080')

/*
 * Controller: SettingsCtrl
 * Description: Reposável pelo gerenciamento do perfil do usuário 
 */     
.controller('SettingsCtrl', function ($scope, $state, configService, $stateParams, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading) {  

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

    $scope.settings = {'choice' : 'Both',
                       'distance':0,
                       'beginAge':0,
                       'finalAge':100,
                       'latitude':0,
                       'longitude':0
                     }; 

    //objeto usuario
    $scope.userConfig = {
      accessToken: window.localStorage['accessToken'],
      id: window.localStorage['userId'],
      settings:  $scope.settings
    }

    console.log($scope.userConfig);

    var config = configService;    


    /*inicializa modal dos perfis */
    $ionicModal.fromTemplateUrl('templates/settings.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
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
      
       console.log(window.localStorage['userId']);
       $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });
       
       // Open the profile modal
       $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + window.localStorage['userId'] +'/settings' 
         }).then(function successCallback(response) { 
             console.log(response);
             $scope.settings = response.data;                   
             
            console.log($scope.settings.distance);

             //$state.go('settings');
             $ionicLoading.hide();

             //buildMap();             
             var latitude = window.localStorage['geoLocalizationLat'];
             var longitude = window.localStorage['geoLocalizationLong'];
             var distance = 100;
             
             console.log("distance", distance);

             var latLng = new google.maps.LatLng(latitude, longitude);      

             console.log("$scope");
             console.log(latLng);

             var center = latLng;

            $scope.map = {
                center: center,
                pan: true,
                zoom: 7,
                refresh: false,
                events: {},
                bounds: {},          
                options: {
                  navigationControl: false,
                  mapTypeControl: false,
                  scaleControl: false,
                  draggable: false,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  disableDefaultUI: true
                }
              };        

              $scope.map.circle = {
                id: 1,
                center: center,
                radius: $scope.settings.distance * 1000,
                stroke: {
                  color: '#08B21F',
                  weight: 2,
                  opacity: 1
                },
                fill: {
                  color: '#08B21F',
                  opacity: 0.4
                },
                geodesic: false, // optional: defaults to false
                draggable: false, // optional: defaults to false
                clickable: false, // optional: defaults to true
                editable: false, // optional: defaults to false
                visible: true, // optional: defaults to true
                events:{
                  dblclick: function(){
                    window.alert("circle dblclick");
                  },
                  radius_changed: function(){
                      //window.alert("circle radius radius_changed");
                      console.log("circle radius radius_changed");
                  }
                }
              }      
             $scope.modal.show();            
             
          }, function errorCallback(response) {
            $http({
                method: 'GET',
                url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + $rootScope.userId +'/settings' 
             }).then(function successCallback(response) { 
                 console.log($scope.settings);
                 $scope.settings = response.data;          

                 // Open the profile modal
                 //$scope.modal.show();
                 $ionicLoading.hide();

              }, function errorCallback(response) {
                  console.log("getUserSettings");
                  $scope.modalErro.show();
                  $ionicLoading.hide();                                    
            });                      
        });
      
       //$scope.modal.show();
       //$ionicLoading.hide();
     };

     $scope.saveSettings = function(){
        
        $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

        $scope.settings.latitude = window.localStorage['geoLocalizationLat'];
        $scope.settings.longitude = window.localStorage['geoLocalizationLong'];

        $scope.userConfig.settings = $scope.settings;
 
        $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/updateUserSettings", $scope.userConfig, config).
          success(function(data, status, headers, config) {
              $ionicLoading.hide();    
              swal("Alright!", "Everything saved!", "success");
              $scope.modal.hide();
              $scope.$emit("callGetUserSugestion", {});             
              
          }).error(function(data, status, headers, config) {          
              $http.post("http://" + WEBSERVICE_URL_SERVER + "/NiceDateWS/users/updateUserSettings", $scope.userConfig, config).
              success(function(data, status, headers, config) {
                  $scope.modalLoading.hide();    
                  swal("Alright!", "Everything saved!", "success");
                  $scope.modal.hide();
                  $scope.$emit("callGetUserSugestion", {});

              }).
              error(function(data, status, headers, config) {                          
                  console.log("save");
                  $scope.modalErro.show();
                  $ionicLoading.hide();                                      
              });        

          });          
     }
  
     $scope.closeSettings = function(){
        $scope.modal.hide();
     }

     $scope.$watch("settings.distance", function(newValue, oldValue){                
        $scope.map.circle.radius = newValue * 1000;
     });

     buildMap = function(){

     }
})