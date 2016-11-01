angular.module('starter.controllers', ['starter.services', 'chart.js', 'chat', 'ngCordova', 'ngImgCrop','uiGmapgoogle-maps', 'ngAnimate', 'ionic.cloud'])

.constant('WEBSERVICE_URL', '192.168.25.4:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.5:8080')
//.constant('WEBSERVICE_URL', '192.168.0.103:8080')
.constant('WEBSERVICE_URL_SERVER', '192.168.25.4:8080')


/*
 * Controller: editProfileController
 * Description: Reposável pela edição do perfil do usuário 
 */ 
.controller('editProfileCtrl' , function ($scope, configService, $state, $stateParams, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading, $cordovaImagePicker, $interval) {  

$scope.$on('cloud:push:notification', function(event, data) {
      var msg = data.message;
      alert(msg.title + ': ' + msg.text);
    });

    /*inicializa modal para edicao dos perfis */
    $ionicModal.fromTemplateUrl('templates/editSocialLinks.html', {
      scope: $scope
    }).then(function(modalEditSocialLinks) {
      $scope.modalEditSocialLinks = modalEditSocialLinks;
    });    

    /*inicializa modal para edicao de um link social */
    $ionicModal.fromTemplateUrl('templates/socialSetting.html', {
      scope: $scope
    }).then(function(modalSocialSetting) {
      $scope.modalSocialSetting = modalSocialSetting;
    });    

      $ionicModal.fromTemplateUrl('templates/editPhoto.html', {
      scope: $scope
    }).then(function(modaleditPhoto) {
      $scope.modaleditPhoto = modaleditPhoto;
    });    

   $ionicModal.fromTemplateUrl('templates/addSocialLink.html', {
      scope: $scope
    }).then(function(modalAddSocialLink) {
      $scope.modalAddSocialLink = modalAddSocialLink;
    });   

    $ionicModal.fromTemplateUrl('templates/addSocialLinks.html', {
      scope: $scope
    }).then(function(modalAddSocialLinks) {
      $scope.modalAddSocialLinks = modalAddSocialLinks;
    });   

    $scope.closeAddSocialLink = function(){    
      $scope.modalAddSocialLink.hide();
    } 

    $scope.closeAddSocialLinks = function(){    
      $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

        var userId = window.localStorage['userId'] || 'semID';

        $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId + '/getSocialLinks' 
         }).then(function successCallback(response) { 
             console.log(response);
             $scope.socialLinks = response.data.socialLink;          
             
             $ionicLoading.hide();

          }, function errorCallback(response) {
                console.log("closeAddSocialLinks");
                $scope.modalErro.show();
                $ionicLoading.hide();                                    
        })

      $scope.modalAddSocialLinks.hide();
    } 

    $scope.addSocialLink2 = function(index){
      $scope.modalAddSocialLink.show();      
      $scope.socialLink = index;
    }

    $scope.addSocialLink = function(){
        $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

        var userId = window.localStorage['userId'] || 'semID';

        $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/socialLink/' + userId + '/getSocialLinks' 
         }).then(function successCallback(response) { 
            console.log("addSocialLinks");
             $scope.socialLinks = response.data.socialLinks;          
             
             $ionicLoading.hide();

          }, function errorCallback(response) { 
                console.log("addSocialLink");
                $scope.modalErro.show();
                $ionicLoading.hide();                                    
          })
         $scope.modalAddSocialLinks.show();
    }

    $scope.saveEditProfile = function(){
        $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });
       
        var config = configService;     

        $scope.userConfig = {
            userId: window.localStorage['userId'],
            accessToken: window.localStorage['accessToken'],
            profile : $scope.profile
        }

        $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/updateUserBio", $scope.userConfig, config).
        success(function(data, status, headers, config) {
            $ionicLoading.hide();
            $scope.modalEditProfile.hide();
            swal("Alright!", "Everything saved!", "success"); 
        }).
        error(function(data, status, headers, config) {          
          $http.post("http://" + WEBSERVICE_URL_SERVER + "/NiceDateWS/users/updateUserBio", $scope.userConfig, config).
          success(function(data, status, headers, config) {
             $ionicLoading.hide();         
             $scope.modalEditProfile.hide(); 
             swal("Alright!", "Everything saved!", "success"); 
          }).
          error(function(data, status, headers, config) {          
                console.log("saveEditProfile");
                $scope.modalErro.show();
                $ionicLoading.hide();                                    
          });        
        });
    }

    $scope.editSocialLinks = function(){
        $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

        var userId = window.localStorage['userId'] || 'semID';

        $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId + '/getSocialLinks' 
         }).then(function successCallback(response) { 
             console.log(response);
             $scope.socialLinks = response.data.socialLink;          
             
             $ionicLoading.hide();

          }, function errorCallback(response) {
                console.log("editSocialLinks");
                $scope.modalErro.show();
                $ionicLoading.hide();                                    
          })
         $scope.modalEditSocialLinks.show();

    }

    $scope.editSocialSetting = function(index){
      $scope.socialLink = index;

      if ($scope.socialLink.visibility == "ONLYMATCHES"){
        console.log("aqui 1");
        $scope.socialLink.onlytomatches = true;
        $scope.socialLink.everyone = false;
      } 

      if ($scope.socialLink.visibility == "EVERYONE"){
        console.log("aqui 2");
        $scope.socialLink.onlytomatches = false;
        $scope.socialLink.everyone = true;
      }     

      $scope.modalSocialSetting.show();
    }

    $scope.closeSocialSetting = function(){    
      $scope.modalSocialSetting.hide();
    }    

    /*
    * Name: $scope.closeEditSocialLinks()
    * Description: Método reponsavel por fechar a modal das redes socias
    * Author: Edian Comachio    
    */     
    $scope.closeEditSocialLinks = function() {      
      $scope.modalEditSocialLinks.hide();      
    }

    $scope.saveSocialLink = function(){
      console.log($scope.socialLink.onlytomatches);
      console.log($scope.socialLink.everyone);

      $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

      var config = configService;     

      $scope.userConfig = {
          userId: window.localStorage['userId'],
          accessToken: window.localStorage['accessToken'],
          socialLink: $scope.socialLink
      }
     
      console.log($scope.userConfig);

      $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/createSocialLink", $scope.userConfig, config).
      success(function(data, status, headers, config) {
        $ionicLoading.hide();
        $scope.modalAddSocialLink.hide();  
        $scope.modalAddSocialLinks.hide();            
        $scope.modalEditSocialLinks.hide();      
        swal("Alright!", "Everything saved!", "success"); 
      }).
      error(function(data, status, headers, config) {          
        $http.post("http://" + WEBSERVICE_URL_SERVER + "/NiceDateWS/users/createSocialLink", $scope.userConfig, config).
        success(function(data, status, headers, config) {
            $ionicLoading.hide();
            $scope.modalAddSocialLink.hide();
            $scope.modalAddSocialLinks.hide();
            $scope.modalEditSocialLinks.hide();      
            swal("Alright!", "Everything saved!", "success");            
        }).
        error(function(data, status, headers, config) {          
                console.log("saveSocialLink");
                $scope.modalErro.show();
                $ionicLoading.hide();                                    
        });        
      });
     }

      $scope.deleteSocialLink = function(){
        console.log("deleteSocialLink");
        $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

        var config = configService;    

        console.log($scope.socialLink);
        console.log($scope.socialLinks);

        $scope.userConfig = {
            userId: window.localStorage['userId'],
            accessToken: window.localStorage['accessToken'],
            socialLink: $scope.socialLink
        }

        console.log($scope.userConfig);

        $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/deleteSocialLink", $scope.userConfig, config).
        success(function(data, status, headers, config) {
          $ionicLoading.hide();
          $scope.modalSocialSetting.hide();
          $scope.modalEditSocialLinks.hide();   
          swal("Alright!", "SocialLink deleted!", "success"); 
        }).
        error(function(data, status, headers, config) {          
          $http.post("http://" + WEBSERVICE_URL_SERVER + "/NiceDateWS/users/deleteSocialLink", $scope.userConfig, config).
          success(function(data, status, headers, config) {
              $ionicLoading.hide();
              $scope.modalSocialSetting.hide();
              $scope.modalEditSocialLinks.hide();
              swal("Alright!", "SocialLink deleted!", "success");            
          }).
          error(function(data, status, headers, config) {          
                console.log("deleteSocialLink");
                $scope.modalErro.show();
                $ionicLoading.hide();                                    
          });        
        });
      }

      $scope.changeVisibilityEveryone = function(){
        if ($scope.socialLink.everyone)
          $scope.socialLink.onlytomatches =  false;
      }

      $scope.changeVisibilityOnlytomatches = function(){                
        if ($scope.socialLink.onlytomatches)
          $scope.socialLink.everyone = false;
      }

      $scope.saveEditSocialLink = function(){
        console.log("editSocialLink");
        $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

        var config = configService;     

        $scope.userConfig = {
            userId: window.localStorage['userId'],
            accessToken: window.localStorage['accessToken'],
            socialLink: $scope.socialLink
        }

        console.log($scope.socialLink.everyone);
        console.log($scope.socialLink.onlytomatches);

        $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/editSocialLink", $scope.userConfig, config).
        success(function(data, status, headers, config) {
          $ionicLoading.hide();
          $scope.modalAddSocialLink.hide(); 
          $scope.modalSocialSetting.hide();
          $scope.modalEditSocialLinks.hide();
          swal("Alright!", "Everything saved!", "success"); 
        }).
        error(function(data, status, headers, config) {          
          $http.post("http://" + WEBSERVICE_URL_SERVER + "/NiceDateWS/users/editSocialLink", $scope.userConfig, config).
          success(function(data, status, headers, config) {
              $ionicLoading.hide();
              $scope.modalAddSocialLink.hide();      
              $scope.modalSocialSetting.hide();
              $scope.modalEditSocialLinks.hide();
              swal("Alright!", "Everything saved!", "success");            
          }).
          error(function(data, status, headers, config) {          
                console.log("editSocialLink");
                $scope.modalErro.show();
                $ionicLoading.hide();                                    
          });        
        });
      }

    $scope.editPhoto = function(){

      console.log($ionicSlideBoxDelegate.$getByHandle('editSlide').currentIndex());
      console.log($scope.profile.photos[$ionicSlideBoxDelegate.$getByHandle('editSlide').currentIndex()]);     
                  
      $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

      //$ionicSlideBoxDelegate.$getByHandle('editSlide')
      $scope.imageFromGallery = {}; 
      // Image picker will load images according to these settings
      var options = {
          maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
          width: 0,
          height: 0,
          quality: 100            // Higher is better
      };
      if (window.cordova) {
        $cordovaImagePicker.getPictures(options).then(function (results) {
          // Loop through acquired images
          for (var i = 0; i < results.length; i++) {
              var selectedImage = results[i];   // We loading only one image so we can use it like this
 
              window.plugins.Base64.encodeFile(selectedImage, function(base64){  // Encode URI to Base64 needed for contacts plugin
                  selectedImage = base64;
                  $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });                                    
                  
                  $scope.imageFromGallery = {src : results[0],
                                             base64 : base64,
                                             profileIndex: $ionicSlideBoxDelegate.$getByHandle('editSlide').currentIndex(),
                                             profileId: $scope.profile.idProfile}
                  
                  console.log($scope.imageFromGallery);

                  $scope.modaleditPhoto.show();
                  $ionicLoading.hide();
                  $scope.$emit("cropImage", {});
                  
                  //$scope.profile.photos[$ionicSlideBoxDelegate.$getByHandle('editSlide').currentIndex()] = results[0];                  

                  $timeout(function() { 
                     
                  }, 1300); // delay 250 ms

                                   
              });
          }
        }, function(error) {
            console.log('Error: ' + JSON.stringify(error));    // In case of error
        });
      }else{
          
          $scope.imageFromGallery.src = $scope.profile.photos[3];
          $scope.imageFromGallery.profileIndex = 3;
          $scope.modaleditPhoto.show();
          $scope.$emit("cropImage", {});
         // $state.go('crop');
          $ionicLoading.hide();
      }
    };  
})