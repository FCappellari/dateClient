angular.module('starter.controllers', ['starter.services', 'chart.js', 'chat', 'ngCordova', 'ngImgCrop','uiGmapgoogle-maps', 'ngAnimate', 'ionic.cloud'])

.constant('WEBSERVICE_URL', '192.168.25.4:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.5:8080')
//.constant('WEBSERVICE_URL', '192.168.0.103:8080')
.constant('WEBSERVICE_URL_SERVER', '192.168.25.4:8080')

/*
 * Controller: SugestionCtrl
 * Description: Reposável pelo gerenciamento das sugestões do usuário 
 */     
.controller('SugestionCtrl', function ($scope, $interval, configService, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $ionicModal, $ionicScrollDelegate, ngFB, $stateParams, $http, $rootScope, $state, $ionicLoading) {

    $scope.$on('cloud:push:notification', function(event, data) {
      var msg = data.message;
      alert(msg.title + ': ' + msg.text);
    });

    /* 
     * Autor: Fabricio Cappellari
     * Metodo para chamar o get sugestion em outro controle
     */
    $rootScope.$on("callGetUserSugestion", function(){
        $scope.getUserSugestion();
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

    /* inicializa a modal */
    $ionicModal.fromTemplateUrl('templates/profile.html', {
      scope: $scope
    }).then(function(modalProfile) {
      $scope.modalProfile = modalProfile;
    });
   
    /* inicializa a modal do perfil da sugestao*/
    $ionicModal.fromTemplateUrl('templates/sugestionProfile.html', {
      scope: $scope
    }).then(function(modalSugestionProfile) {
      $scope.modalSugestionProfile = modalSugestionProfile;
    });
   
    /* inicializa a modal settings Alert*/
    $ionicModal.fromTemplateUrl('templates/settingsAlert.html', {
      scope: $scope
    }).then(function(modalSettingAlert) {
      console.log("aiaiaia esse amor");
      $scope.modalSettingAlert = modalSettingAlert;
    });

   /*
    * Name: $scope.closeSugestionProfile()
    * Description: Método reponsavel por fechar a modal do perfil da sugestão
    * Author: Fabrício Cappellari    
    */     
    $scope.closeSugestionProfile = function(){
      $scope.modalSugestionProfile.hide();
    };

   /*
    * Name: $scope.like()
    * Description: Método reponsavel por dar like na sugestão 
    * Author: Edian Comachio    
    */         
    $scope.like = function(sugestion, index){
      
      
      console.log("$scope.like = function(sugestion)");
      $scope._index = index;
      console.log(sugestion);

      if(sugestion.status == "LIKED"){        
        matchAnimation(sugestion);
      }else if(sugestion.status == "DISLIKED"){
        
      }else{
        startChange("like");
        
      }

      setLikeWs(sugestion);    
    }

    $scope.deleteCard = function deleteCard(index){ 
      console.log("deleteCard");
      $scope.sugestions.splice(index, 1);
      if($scope.sugestions.length == 0){
        $scope.getUserSugestion();
      }
    };  

    // remove old keyframes and add new ones
    function change(anim, op)
        {
            // find our -webkit-keyframe rule
            var keyframes = findKeyframesRule(anim);
            
            console.log(keyframes);

            // remove the existing 0% and 100% rules
            keyframes.deleteRule("0%");
            keyframes.deleteRule("20%");
            keyframes.deleteRule("100%");
            
            if(op=="like"){
              keyframes.appendRule("0% { -webkit-transform: translateX(0);}");
              keyframes.appendRule("20% { -webkit-transform: translateX(-15px) rotate(-10deg) scale(1.1); }");
              keyframes.appendRule("100% { -webkit-transform: translateX(400px) rotate(90deg) scale(1.7); }");
            }else{
              keyframes.appendRule("0% { -webkit-transform: translateX(0); }");
              keyframes.appendRule("20% { -webkit-transform: translateX(15px) rotate(10deg) scale(1.1) }");
              keyframes.appendRule("100% { -webkit-transform: translateX(-400px) rotate(-90deg) scale(0.5) }");
            }
            // assign the animation to our element (which will cause the animation to run)
            angular.element(document.querySelector('animate')).css('animation', '0.5s my_animation');
    }

    function findKeyframesRule(rule)
    {
        var ss = document.styleSheets;

        for (var i = 0; i < ss.length; ++i)
        {
            for (var j = 0; j < ss[i].cssRules.length; ++j)
            {
                if (ss[i].cssRules[j].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE && ss[i].cssRules[j].cssText.indexOf(rule) !== -1)
                    return ss[i].cssRules[j];
            }
        }
        return null;
    }

    // begin the new animation process
    function startChange(op)
    {
            // remove the old animation from our object
            angular.element(document.querySelector('animate')).css('animation', '0.5s none');
            
            // call the change method, which will update the keyframe animation
            setTimeout(function(){
               change("my_animation", op);              
            },0);
    
            var deleteCardAux = function () {
                $interval.cancel(promise2);
                $scope.deleteCard($scope._index);
            }

            promise2 = $interval(deleteCardAux, 100);      

    }  

    function matchAnimation(sugestion){

      console.log("function matchAnimation(sugestion)");      

      var topModal = $ionicScrollDelegate.$getByHandle('sugestionScrollHandle').getScrollPosition().top - 5;      
      angular.element(document.querySelector('.overlay')).css({ top: topModal + 'px' });;
      angular.element(document.querySelector('.overlay')).addClass('is-active');      
      angular.element(document.querySelector('.match1')).css('background-image', 'url(' + sugestion.profilePic + ')');
      angular.element(document.querySelector('.match2')).css('background-image', 'url(' + $scope.profile.photos[0] + ')');
      
      console.log($ionicScrollDelegate.$getByHandle('sugestionScrollHandle').getScrollView());            
      angular.element(document.querySelector('.outWithHasTabsTop')).css('overflow-y', 'hidden');      
      //deshabilita o scroll :)
      $ionicScrollDelegate.$getByHandle('sugestionScrollHandle').getScrollView().options.freeze = true;

      var pauseAnimation = function () {
          $interval.cancel(promise);
          angular.element(document.querySelector('.overlay')).addClass('pausedAnimation');
          angular.element(document.querySelector('.modal')).addClass('pausedAnimation');
          angular.element(document.querySelector('.matchImg')).addClass('pausedAnimation');
          angular.element(document.querySelector('.match1')).addClass('pausedAnimation');
          angular.element(document.querySelector('.match2')).addClass('pausedAnimation');
          angular.element(document.querySelector('.matchButton1')).addClass('pausedAnimation');
          angular.element(document.querySelector('.matchButton2')).addClass('pausedAnimation');          
      }

      promise = $interval(pauseAnimation, 700);      
    }

   /*
    * Name: $scope.like()
    * Description: Método reponsavel por fazer a requisição ao webservice para persisteir o like na base
    * Author: Edian Comachio    
    */  
    function setLikeWs(sugestion){

        params = {
          userId: window.localStorage['userId'] || 'semID',
          sugestionId: sugestion.id,
          status: sugestion.status, 
          accessToken: window.localStorage['accessToken']
        };

        var config = configService;   
    
        $http.post("http://" + WEBSERVICE_URL + "/NiceDateWS/users/like", params, config).
        success(function(data, status, headers, config) {
            $scope.modalLoading.hide();              
        }).
        error(function(data, status, headers, config) {          
              console.log("setLikeWs");
              $scope.modalErro.show();
              $ionicLoading.hide();              
        }); 
    }
    
    /*
    * Name: $scope.dislike()
    * Description: Método reponsavel por dar dislike na sugestão 
    * Author: Edian Comachio    
    */         
    $scope.dislike = function(sugestion, index){

      var removeCard = function () {
          
           
      }

      startChange("dislike");     

      promise = $interval(removeCard, 400);
      
    }

    $scope.dismissMatchModal = function(sugestion, index){

      angular.element(document.querySelector('.overlay')).removeClass('pausedAnimation');      
      angular.element(document.querySelector('.modal')).removeClass('pausedAnimation');
      angular.element(document.querySelector('.matchImg')).removeClass('pausedAnimation');
      angular.element(document.querySelector('.match1')).removeClass('pausedAnimation');
      angular.element(document.querySelector('.match2')).removeClass('pausedAnimation');
      angular.element(document.querySelector('.matchButton1')).removeClass('pausedAnimation');
      angular.element(document.querySelector('.matchButton2')).removeClass('pausedAnimation');          
      
      var removeClass = function () {
          $interval.cancel(promise);
          angular.element(document.querySelector('.overlay')).removeClass('is-active');      
          //habilita o scroll denovo :)
          angular.element(document.querySelector('.outWithHasTabsTop')).css('overflow-y', 'unset');      
          console.log($scope._index);
          
      }     
      startChange("like");
      promise = $interval(removeClass, 400);      

    }

   /*
    * Name: $scope.closeProfile()
    * Description: Método reponsavel por fechar atualizar as sugestoes do usuario através do webservice
    * Author: Edian Comachio    
    */     
    $scope.doRefreshSugestion = function(){
      
      var userId = window.localStorage['userId'] || 'semID';

      $http.get('http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/sugestions?accessToken=' + accessToken)
         .success(function(newItems) {
           $scope.sugestions = newItems;
         })
         .finally(function() {
           // Stop the ion-refresher from spinning
           $scope.$broadcast('scroll.refreshComplete');
         });      
    }

    $scope.getUserInfo = function(){                
      
      var userId = window.localStorage['userId'] || 'semID';
      var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
        
        $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/' + userId +'/profile' 
         }).then(function successCallback(response) { 
             console.log("response");
             $scope.currrentProfile = response.data;  
             console.log($scope.currrentProfile);
             //console.log($scope.profile.socialLinks[0]);
             // Open the profile modal
             $scope.getUserSugestion();

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
    * Name: $scope.getUserSugestion()
    * Description: Método reponsavel por buscar as sugestões do usuário através do webservice
    * Author: Edian Comachio    
    */     
    $scope.getUserSugestion = function(){
      console.log("getUserSugestion");
      $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 }); 

      $scope.sugestions = "";
      $scope.sugestionPlaceholder = "Hold on... We are looking for new people";
      $scope.hasSugestions = false;

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
              url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/hasSettings?id=' + userId + '&accessToken=' + accessToken  
         }).then(function successCallback(response) {          
              $ionicLoading.hide();              
              console.log(response.data);                            
              //usuario tem as preferencias configuradas
              if(response.data){
                  $http({
                        method: 'GET',
                        url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/sugestions?id=' + userId + '&accessToken=' + accessToken 
                   }).then(function successCallback(response) {          
                        $ionicLoading.hide();
                        console.log("SUGESTOES");                        
                        console.log(response.data);
                        $scope.sugestions = response.data;            
                        $scope.hasSugestions = true;
                   }, function errorCallback(response) {
                      $http({
                            method: 'GET',
                            url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + userId +'/sugestions' 
                       }).then(function successCallback(response) {          
                            $ionicLoading.hide();
                            $scope.sugestions = response.data;            
                            $scope.hasSugestions = true;
                       }, function errorCallback(response) {
                          console.log("getUserSugestion");
                          $scope.modalErro.show();
                          $scope.sugestionPlaceholder = "Opsss :(";
                          $ionicLoading.hide();              
                          $scope.hasSugestions = false;      
                       });    
                   });
              }else{
                  $scope.modalSettingAlert.show();
              }
         }, function errorCallback(response) {            
              console.log("hasSettings");
              $scope.modalErro.show();
              $ionicLoading.hide();              
         });        
    };


    //Verifica se usuario possui as preferencias principais configuradas
    // Autor Edian Comachio
    function hasSettings(){      

        
    }

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
          url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/profile?sugestion=' + sugestion.id + '&user=' + userId + '&accessToken=' + accessToken 
       }).then(function successCallback(response) {
        console.log(response)
        $scope.profile = response.data;          
        
        var distanceKm = getDistanceFromLatLonInKm($scope.profile.latitude, $scope.profile.longitude, window.localStorage['geoLocalizationLat'], window.localStorage['geoLocalizationLong']);
        $scope.profile.distance = parseInt(distanceKm, 10);        
        $scope.modalSugestionProfile.show();    
        $ionicLoading.hide();

        }, function errorCallback(response) {
          $http({
              method: 'GET',
              url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + sugestion.id +'/profile' 
           }).then(function successCallback(response) {
            console.log(response)
            $scope.profile = response.data;          
            $scope.modalSugestionProfile.show();    
            $ionicLoading.hide();

            }, function errorCallback(response) {
              console.log("getUserSugestion");
              $scope.modalErro.show();
              $ionicLoading.hide();              
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