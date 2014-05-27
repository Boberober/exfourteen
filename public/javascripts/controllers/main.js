app.controller('MainCtrl', function ($scope, $http, Facebook, $location, User) {
    $scope.user = User;
    $scope.btnText = 'Logga in med Facebook';
    // $scope.showButton = false;
    $scope.showButton = false;

    $scope.$watch(function() {
      return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
    }, function(newVal) {
        $scope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
    });

    Facebook.getLoginStatus(function(response) {
      $scope.showButton = true;
      if (response.status == 'connected') {

        $scope.btnText = 'Hämta profilbild';
        $scope.logged = true;
      } else {
      }
    });
    $scope.authenticate = function() {
        var popupWarning = setTimeout(function(){
          $scope.error = "Psst! Se till att du inte har popups avstängda!";
        }, 500);
        Facebook.login(function(response) {
          if (response.status == 'connected') {
            $scope.logged = true;
            $location.path('/profilbild');
          } else {
            $location.path('/');
          }
        }, { scope: 'publish_stream,photo_upload,user_photos' });
      };
  });
