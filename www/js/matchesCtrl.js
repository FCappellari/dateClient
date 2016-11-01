angular.module('starter.controllers', ['starter.services', 'chart.js', 'chat', 'ngCordova', 'ngImgCrop','uiGmapgoogle-maps', 'ngAnimate', 'ionic.cloud'])

.constant('WEBSERVICE_URL', '192.168.25.4:8080')
//.constant('WEBSERVICE_URL', '52.34.48.120:8180')
//.constant('WEBSERVICE_URL', '192.168.25.5:8080')
//.constant('WEBSERVICE_URL', '192.168.0.103:8080')
.constant('WEBSERVICE_URL_SERVER', '192.168.25.4:8080')

/*
 * Controller: MatchesCtrl
 * Description: Reposável pelo gerenciamento das combinações do usuário
 */    
.controller('MatchesCtrl', function ($scope, configService, orderByFilter, WEBSERVICE_URL, WEBSERVICE_URL_SERVER, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state, $ionicLoading) {
  
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

    $scope.getUserMatches = function(){
      
        console.log("aqui matches");

      $ionicLoading.show({content: 'Loading',animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 }); 

      var userId = window.localStorage['userId'] || 'semID';
      var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
      $http({
            method: 'GET',
            url: 'http://' + WEBSERVICE_URL + '/NiceDateWS/users/matches?user=' + userId + '&accessToken=' + accessToken 
       }).then(function successCallback(response) {          
            $ionicLoading.hide();
            console.log("MATCHES");
            console.log(response.data);
            $scope.matches = response.data.matches;            
       }, function errorCallback(response) {
          $http({
                method: 'GET',
                url: 'http://' + WEBSERVICE_URL_SERVER + '/NiceDateWS/users/' + userId +'/sugestions' 
           }).then(function successCallback(response) {          
                $ionicLoading.hide();
                $scope.sugestions = response.data;            
           }, function errorCallback(response) {
                 console.log("getUserMatches");
                 $scope.modalErro.show();
                 $ionicLoading.hide();
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
                console.log("callMatchProfile");
                $scope.modalErro.show();
                $ionicLoading.hide();            
          });        
      });        
      
      // Open the login modal
     
    };

    $scope.getMatchDetails = function(match){              
      $scope.modalMatchDetail.show();     

      console.log(match);       
      $scope.match = match;
      var interests = match.interestsInCommon;      

      interests.sort(function(a, b) {
          return parseFloat(a.relevance) - parseFloat(b.relevance);
      });

      interests.reverse();      

      $scope.buildGraph(interests);
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

    $scope.buildGraph = function(interests){  
      //doughnut      
      console.log($scope.match.interestsInCommon);

      $scope.doughnut = {};                  
      $scope.doughnut.visible = true;            
      $scope.doughnut.data = [[interests[0].relevance, 
                               interests[1].relevance, 
                               interests[2].relevance, 
                               interests[3].relevance, 
                               interests[4].relevance]];
      $scope.doughnut.labels = [interests[0].name, 
                                interests[1].name, 
                                interests[2].name, 
                                interests[3].name, 
                                interests[4].name];    
      $scope.doughnut.series = ['Series']
      //$scope.doughnut.colours;
      $scope.doughnut.legend = true;

      //line
      console.log(interests);

      $scope.bar = {};                  
      $scope.bar.labels = [interests[0].name.substring(0, 19), 
                           interests[1].name.substring(0, 19), 
                           interests[2].name.substring(0, 19), 
                           interests[3].name.substring(0, 19), 
                           interests[4].name.substring(0, 19)];      
      $scope.bar.data = [
        [interests[0].relevance, 
         interests[1].relevance, 
         interests[2].relevance, 
         interests[3].relevance, 
         interests[4].relevance]
      ];
      
      //$scope.bar.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];      
      
    };

    
})