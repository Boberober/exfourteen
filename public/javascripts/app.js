var facebookID = '644745582229859';

var app = angular.module('ex14', [
  'ngRoute',
  'facebook'
])
  .config(function ($routeProvider, $locationProvider, $httpProvider, FacebookProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl'
      })
      .when('/profilbild', {
        templateUrl: 'partials/profilbild.html',
        controller: 'ProfileCtrl'
      })
      .when('/klar', {
        templateUrl: 'partials/done.html',
        controller: 'DoneCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
      
    FacebookProvider.init(facebookID);
    // Intercept 401s and 403s and redirect you to login
    $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
      return {
        'responseError': function(response) {
          if(response.status === 401 || response.status === 403) {
            $location.path('/login');
            return $q.reject(response);
          }
          else {
            return $q.reject(response);
          }
        }
      };
    }]);  
  })
  .factory("User",function(){
        return {};
  })
  .directive('exError', function() {
  return {
    link: function(scope, element, attrs) {
  
      var container = element[0].firstChild;

      container.addEventListener('click', dismiss);

      function dismiss(e) {
        scope.error = '';
        scope.$apply();
      }
    },
    templateUrl: 'partials/ex-error.html'
  };
})
.directive('droppable', function() {
  return {
    link: function(scope, element, attrs) {
      var el = element[0];

      el.addEventListener('dragleave dragend', function(e) {
        // e.preventDefault();
        // e.stopPropagation();

        // console.log('out');
        $(el).removeClass('over');

        return false;
      });
      el.addEventListener('dragenter', function(e) {
        // e.preventDefault();
        $(el).addClass('over');
      });
      el.addEventListener('dragover', function(e) {
        e.preventDefault();
        $(el).addClass('over');
      });
      el.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var file = e.dataTransfer.files[0];
        alert(e.dataTransfer.files);
        
        $(el).removeClass('over')
    
      });
    }
  };
})
.service('userData', function() {
  var fbUrl = '';
  var user = {};

  return {
    getUrl: function() {
      return fbUrl;
    },
    setUrl: function(url) {
      fbUrl = url;
    },
    getUser: function() {
      return user;
    },
    setUser: function(user) {
      user = user;
    }
  }
});


