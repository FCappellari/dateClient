angular.module('starter.controllers', ['starter.services', 'chart.js', 'chat', 'ngCordova', 'ngImgCrop','uiGmapgoogle-maps'])

.constant('WEBSERVICE_URL', 'localhost:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.5:8080')
.constant('WEBSERVICE_URL_SERVER', 'localhost:8080')



/*
 * Controller: AppCrtl
 * Description: Gerenciamento geral da aplicação
 */
.controller('AppCtrl', function ($scope, $cordovaGeolocation, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state, $q, UserService, $ionicLoading) {

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
      window.localStorage['userId'] = user.id;     
      console.log(user);
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
             $scope.modalErro.show();
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
          console.log("Erro ao atualizar usuario");
          $scope.modalLoading.hide();
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
            console.log("Erro ao criar usuario");
            $ionicLoading.hide()
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
.controller('SettingsCtrl', function ($scope, $state, configService, $stateParams, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading) {  

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
       console.log(window.localStorage['userId']);
       $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });
       
       // Open the profile modal
       $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + window.localStorage['userId'] +'/settings' 
         }).then(function successCallback(response) { 
             console.log(response);
             $scope.settings = response.data;                   
             
            console.log($scope.settings.choice);

             //$state.go('settings');
             $ionicLoading.hide();

             buildMap();             
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
                 $scope.modalErro.show();
                 $ionicLoading.hide();              
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });                      
        });

       //$scope.modal.show();
       //$ionicLoading.hide();
     };

     $scope.save = function(){
        
        $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

        $scope.settings.latitude = window.localStorage['geoLocalizationLat'];
        $scope.settings.longitude = window.localStorage['geoLocalizationLong'];

        $scope.userConfig.settings = $scope.settings;
 
        $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/updateUserSettings", $scope.userConfig, config).
          success(function(data, status, headers, config) {
              $ionicLoading.hide();    
              console.log("aqui");
              swal("Alright!", "Everything saved!", "success");
              $scope.modal.hide();
              
          }).error(function(data, status, headers, config) {          
        
              $http.post("http://" + WEBSERVICE_URL_SERVER + "/NiceDateWS/users/updateUserSettings", $scope.userConfig, config).
              success(function(data, status, headers, config) {
                  $scope.modalLoading.hide();    
                  console.log("aqui2");
                  swal("Alright!", "Everything saved!", "success");
                  $scope.modal.hide();
              }).
              error(function(data, status, headers, config) {                          
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
       var latitude = window.localStorage['geoLocalizationLat'];
       var longitude = window.localStorage['geoLocalizationLong'];

       var latLng = new google.maps.LatLng(latitude, longitude);      

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

        console.log($scope.settings.distance);

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
     }
})

.controller('cropImageController' , function ($scope, $state, configService, $stateParams, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $stateParams, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading, $cordovaImagePicker, $interval) {  
  
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



.controller('editProfileController' , function ($scope, configService, $state, $stateParams, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading, $cordovaImagePicker, $interval) {  

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
           console.log("Erro ao atualizar usuario");
           $scope.modalLoading.hide();
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

/*
 * Controller: ProfileCtrl
 * Description: Reposável pelo gerenciamento do perfil do usuário 
 */     
.controller('ProfileCtrl', function ($scope, $state, $stateParams, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate,$ionicModal,$ionicLoading) {  
 
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
             console.log(response);
             $scope.profile = response.data;  
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
                 $scope.profile = response.data;          

                 // Open the profile modal
                 $scope.modal.show();
                 $ionicLoading.hide();

              }, function errorCallback(response) {
                 $scope.modalErro.show();
                 $ionicLoading.hide();              
              // called asynchronously if an error occurs
              // or server returns response with an error status.
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

.controller('MatchesCtrl', function ($scope, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state, $ionicLoading) {
  
    /* inicializa a modal */
    $ionicModal.fromTemplateUrl('templates/chat.html', {
      scope: $scope
    }).then(function(modalChat) {
      $scope.modalChat = modalChat;
    });

    $ionicModal.fromTemplateUrl('templates/matchDetail.html', {
      scope: $scope
    }).then(function(modalMatchDetail) {
      $scope.modalMatchDetail = modalMatchDetail;
    });    

    /* inicializa a modal */
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope
    }).then(function(modalProfile) {
      $scope.modalProfile = modalProfile;
    });

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
            console.log("SUGESTOES");
            console.log(response.data);
            $scope.sugestions = response.data;            
       }, function errorCallback(response) {
         $http({
              method: 'GET',
              url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + userId +'/sugestions' 
         }).then(function successCallback(response) {          
              $ionicLoading.hide();
              console.log(response.data);
              $scope.sugestions = response.data;            
         }, function errorCallback(response) {
              $ionicLoading.hide();
              console.log("FALHA");            
         });         
       });
    };
    
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

        $scope.modalProfile.show();
        $ionicLoading.hide();

        }, function errorCallback(response) {
        $http({
              method: 'GET',
              url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + match.id +'/profile' 
           }).then(function successCallback(response) {

            $scope.profile = response.data;          

            $scope.modalProfile.show();
            $ionicLoading.hide();

            }, function errorCallback(response) {
                console.log("FALHA");
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });        
      });        
      
      // Open the login modal
     
    };

    $scope.getMatchDetails = function(){       
       $scope.modalMatchDetail.show();               
       $scope.buildGraph();
    };

    $scope.chat = function(){         
       $scope.modalChat.show();
    };

    $scope.closeMatchDetail = function() {
      $scope.modalMatchDetail.hide();      
    }; 

    $scope.closeProfile = function() {
      $scope.modalProfile.hide();      
    }; 

    $scope.buildGraph = function(){  
      //doughnut
      $scope.doughnut = {};                  
      $scope.doughnut.visible = true;            
      $scope.doughnut.data = [[80, 75, 95, 27, 97]];
      $scope.doughnut.labels = ["music", "Places", "Books", "Movies", "Sports"];    
      $scope.doughnut.series = ['Series']
      //$scope.doughnut.colours;
      $scope.doughnut.legend = true;

      //line
      $scope.line = {};                  
      $scope.line.labels = ["music", "Places", "Books", "Movies", "Sports"];
      $scope.line.series = ['Series A'];
      $scope.line.data = [
        [80, 75, 95, 27, 97]        
      ];
      
      $scope.line.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];      
      
    };

    //Busca sugestões automaticamente ao abrir a tela de sugestões
    //$scope.getUserSugestion();  
})

/*
 * Controller: SugestionCtrl
 * Description: Reposável pelo gerenciamento das sugestões do usuário 
 */     
.controller('SugestionCtrl', function ($scope, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state, $ionicLoading) {
   

    /* inicializa a modal */
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope
    }).then(function(modalProfile) {
      $scope.modalProfile = modalProfile;
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
          $http({
                method: 'GET',
                url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + userId +'/sugestions' 
           }).then(function successCallback(response) {          
                $ionicLoading.hide();
                $scope.sugestions = response.data;            
           }, function errorCallback(response) {
                $ionicLoading.hide();
                console.log("FALHA");            
           });    
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
      var userId = window.localStorage['userId'] || 'semID';
      var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
      $http({
          method: 'GET',
          url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/profile?sugestion=' + sugestion.id + '&user=' + userId
       }).then(function successCallback(response) {
        console.log(response)
        $scope.profile = response.data;          
        
        var distanceKm = getDistanceFromLatLonInKm($scope.profile.latitude, $scope.profile.longitude, window.localStorage['geoLocalizationLat'], window.localStorage['geoLocalizationLong']);
        $scope.profile.distance = parseInt(distanceKm, 10);        

        $scope.modalProfile.show();    
        $ionicLoading.hide();

        }, function errorCallback(response) {
          $http({
              method: 'GET',
              url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + sugestion.id +'/profile' 
           }).then(function successCallback(response) {
            console.log(response)
            $scope.profile = response.data;          

            $scope.modalProfile.show();    
            $ionicLoading.hide();

            }, function errorCallback(response) {
                console.log("FALHA");
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });   
      
      });        
     
    };

    /*
    * Name: $scope.closeProfile()
    * Description: Método reponsavel por fechar a modal
    * Author: Edian Comachio    
    */     
    $scope.closeProfile = function() {
      $scope.modalProfile.hide();      
    }; 

    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d;
    }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }
})

//TODO - tirar do AppCtrl os metodos de login e passar pra cá
.controller('LoginCtrl', function ($scope, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope) {
 


})

//TODO - Avaliar se isso é usado em algum lugar
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

.controller( 'ChatCtrl', [ 'Messages','$scope','$ionicModal','WEBSERVICE_URL', '$timeout','$stateParams','$http','$rootScope','$state', '$ionicLoading',
                  function( Messages, $scope, $ionicModal, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $timeout, $stateParams, $http, $rootScope, $state, $ionicLoading ){
    
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

        $scope.modalProfile.show();
        $ionicLoading.hide();

        }, function errorCallback(response) {
          $http({
              method: 'GET',
              url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + match.id +'/profile' 
           }).then(function successCallback(response) {

            $scope.profile = response.data;          

            $scope.modalProfile.show();
            $ionicLoading.hide();

            }, function errorCallback(response) {
                console.log("FALHA");
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });     
      });        
      
      // Open the login modal
     
    };
} ] )
