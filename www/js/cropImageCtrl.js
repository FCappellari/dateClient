angular.module('starter.controllers', ['starter.services', 'chart.js', 'chat', 'ngCordova', 'ngImgCrop','uiGmapgoogle-maps', 'ngAnimate', 'ionic.cloud'])

.constant('WEBSERVICE_URL', '192.168.25.4:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.5:8080')
//.constant('WEBSERVICE_URL', '192.168.0.103:8080')
.constant('WEBSERVICE_URL_SERVER', '192.168.25.4:8080')

.controller('cropImageCtrl' , function ($scope, $state, configService, $stateParams, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $stateParams, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading, $cordovaImagePicker, $interval) {  
  
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

  $scope.cropImage = function(){    
      console.log("cropImage()") ;
      $scope.image = {};
      $scope.myImage = $scope.imageFromGallery.src;
      $scope.myCroppedImage='';   
      console.log($scope.imageFromGallery);
  }

   $scope.onChange=function($dataURI) {      
      //JESUS FINALMENTE FUNCIONOU
      $scope.auxImg = $dataURI;
   };

  $scope.saveCroppedImage = function(){        
     
    console.log("slide update");         
    console.log($scope.imageFromGallery.profileIndex);
    $ionicLoading.show();

    var config = configService;

    $scope.userConfig = {
      userId: window.localStorage['userId'] || 'semID',
      index:$scope.imageFromGallery.profileIndex,
      imageBase64: $scope.auxImg
    }

    $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/updatePhoto", $scope.userConfig, config).
       success(function(data, status, headers, config) {

          $scope.profile.photos[$scope.imageFromGallery.profileIndex] = $scope.auxImg;
          $ionicSlideBoxDelegate.$getByHandle('editSlide').update();
         
          $ionicLoading.hide();
          swal("Alright!", "Everything saved!", "success");
          $scope.closeCropModal();

          swal("Alright!", "Everything saved!", "success"); 
        }).
        error(function(data, status, headers, config) {          
          $http.post("http://" + WEBSERVICE_URL_SERVER + "/NiceDateWS/users/createSocialLink", $scope.userConfig, config).
          success(function(data, status, headers, config) {
              $ionicLoading.hide();
              $scope.modalAddSocialLink.hide();      
              swal("Alright!", "Everything saved!", "success");            
          }).
          error(function(data, status, headers, config) {          
                  console.log("saveCroppedImage");
                  $scope.modalErro.show();
                  $ionicLoading.hide();                                    
          });        
    });    

  }  

  $rootScope.$on("cropImage", function(){
      $scope.cropImage();
  });

  /*
    * Name: $scope.closeProfile()
    * Description: Método reponsavel por fechar a modal com o perfil do usuário
    * Author: Edian Comachio    
    */     
    $scope.closeCropModal = function() {      
      $scope.modaleditPhoto.hide();      
    };  

})