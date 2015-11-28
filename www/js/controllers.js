angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope, $state) {
console.log("asdsa182608422078754");
  $scope.fbLogin = function () {
    ngFB.login({
                scope: 'user_birthday,user_religion_politics,user_relationships,user_relationship_details,user_hometown,' +
                       'user_location,user_likes,user_education_history,user_work_history, user_website, user_managed_groups,' +
                       'user_events,user_photos,user_videos,user_friends,user_about_me,user_status,user_games_activity,'+
                       'user_tagged_places,user_posts,user_actions.books,user_actions.music,user_actions.video,user_actions.news,'+
                       'user_actions.fitness,public_profile'}).then(
        function (response) {
            if (response.status === 'connected') {
                console.log(response.authResponse.accessToken);
                window.localStorage['accessToken'] = response.authResponse.accessToken;          
                $scope.getFbUser();
            } else {
                alert('Facebook login failed');
            }
        });
  };

  $scope.getFbUser = function(){
    ngFB.api({
         path: '/me',
        params: {fields: 'id,name,email,gender,location'}
    }).then(function (user) {
      console.log(user);
      $scope.user = user;
      $rootScope.userId = user.id;
      $rootScope.accessToken = user.accessToken;
      window.localStorage['userId'] = user.id;
      
      console.log(window.localStorage['accessToken']);
      $scope.checkIfUserExist();
    },
    function (error) {
      alert('Facebook error: ' + error.error_description);
    });
  }  

  $scope.checkIfUserExist =function(){
            console.log("checkIfUserExist");
            console.log(window.localStorage['accessToken']);
            $scope.userConfig = {accessToken: window.localStorage['accessToken'],
                                 id: $rootScope.userId}
            var config = {headers:  {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };                                   
                                 
            $http.post("http://localhost:8080/NiceDateWS/users/login", $scope.userConfig, config).
            success(function(data, status, headers, config) {             
                $state.go('tabs.profile');
            }).
            error(function(data, status, headers, config) {
            
            });
        };
})

.controller('ProfileCtrl', function ($scope, $stateParams, $timeout, $http, $rootScope, $ionicSlideBoxDelegate) {
  console.log("ProfileCtrl ProfileCtrl ProfileCtrl");
  $scope.getUserInfo = function(){
        console.log("chamando");
        var userId = window.localStorage['userId'] || 'semID';
        var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
        $http({
            method: 'GET',
            url: 'http://localhost:8080/NiceDateWS/users/' + userId +'/profile' 
         }).then(function successCallback(response) {
          
          console.log(response);
          $scope.sugestions = response.data;
          /*$scope.profileName = response.data.name;
          $scope.profileGender = response.data.gender;    
          $scope.profileIdFacebook = response.data.fbId;                 
          $scope.profilePictureUrl = response.data.photos[2];
          $scope.profileCoverUrl = response.data.photos[7];
          $scope.profilePhotos = response.data.photos;*/
          }, function errorCallback(response) {
              console.log("FALHA");
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    }; 

    $scope.getUserInfo();

    $scope.repeatDone = function() {
      $ionicSlideBoxDelegate.update();
      //$ionicSlideBoxDelegate.slide($scope.week.length - 1, 1);
    };
})

.controller('SugestionCtrl', function ($scope, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope) {
    
     $scope.getUserSugestion = function(){
        
        console.log("chamando sugestion");
        var userId = window.localStorage['userId'] || 'semID';
        var accessToken = window.localStorage['accessToken'] || 'semAccessToken';
        $http({
            method: 'GET',
            url: 'http://localhost:8080/NiceDateWS/users/' + userId +'/sugestions' 
         }).then(function successCallback(response) {          
            console.log(response);
            $scope.photo = response.data.photos[0];
         }, function errorCallback(response) {
              console.log("FALHA");
            
        });
      };

      $scope.getUserSugestion();

})

.controller('LoginCtrl', function ($scope, $ionicModal, $timeout, ngFB, $stateParams, $http, $rootScope) {
  
})