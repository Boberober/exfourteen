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
        // $location.path('/magic');
      } else {
        // $scope.showButton = true;
      }
    });
    $scope.authenticate = function() {
        var popupWarning = setTimeout(function(){
          $scope.error = "Psst! Se till att du inte har popups avstängda!";
        }, 500);
        Facebook.login(function(response) {
          if (response.status == 'connected') {
            $scope.logged = true;
            // $scope.me(); 
            $location.path('/profilbild');
          } else {
            $location.path('/');
            // Do something with response. Don't forget here you are on Facebook scope so use $scope.$apply
          }
        }, { scope: 'publish_stream,photo_upload,user_photos' });
      };
  })
  .controller('CoverCtrl', function ($scope, $http, Facebook, $location, User) {
    
  })
  .controller('ProfileCtrl', function ($scope, $http, Facebook, $location, User, userData) {

    $scope.profile = '';
    $scope.loading = true;


    $scope.resultSource = 'gello';
    $scope.error = '';


    Facebook.getLoginStatus(function(response) {
      if (response.status == 'connected') {
        $scope.logged = true;
        $scope.me(); 
      }
      else {
        $scope.login();
      }

    });

    $scope.login = function() {
      Facebook.login(function(response) {
        if (response.status == 'connected') {
          $scope.logged = true;
          $scope.me(); 
        } else {
          $location.path('/');
          // Do something with response. Don't forget here you are on Facebook scope so use $scope.$apply
        }
      }, { scope: 'publish_stream,photo_upload,user_photos' });
    };
    $scope.uploadImage = function() {
      $loading = true;
        $http.post('/upload', { imgData: $scope.resultSource, id: $scope.user.id } ).success( function( data ) {
          $loading = false;
          // console.log(data);
          window.location.assign(data.path);

        }).error( function( data ) {
          $scope.error = "Ajaj, något gick snett. Sorry 'bout that.";
        });
    };

    $scope.hasError = function() {
      if($scope.error !== '') {
        return true;
      }
      return false;
    }
    $scope.checkAlbums = function() {

      // $location.path('/done');
      // $scope.fbUrl = 'http://www.facebook.com/photo?fbid=1&makeprofile=1&makeuserprofile=1';
      // userData.setUrl($scope.fbUrl);
      // return;

      if($scope.user.permissions.data[0].photo_upload !== 1) {
        return;
      }

      $scope.loading = true;

      $http.post('/upload', { imgData: $scope.resultSource, id: $scope.user.id } ).success( function( data ) {

        var pictureName = data.name;
        var url = window.location.origin + data.path;

	      console.log(url);

        Facebook.api('/me?fields=albums', function(response) {

          if(!response.hasOwnProperty('albums')) {
            return;
          }
	
          var albums = response.albums.data;
          var profileAlbum = {}, 
              coverPhotoAlbum = {}

          for (var i = albums.length - 1; i >= 0; i--) {

            if( jQuery.isEmptyObject( profileAlbum ) || jQuery.isEmptyObject( coverPhotoAlbum ) ) {

              if(albums[i].name === "Cover Photos") {

                coverPhotoAlbum = albums[i];  
              }

              if(albums[i].name === 'Profile Pictures') {

                profileAlbum = albums[i];

              }
              
            } else {

              break;

            }

          }
          

          Facebook.api('/' + profileAlbum.id + '/photos', 'post', { url : url }, function( response ) {

            $scope.loading = false;
            console.log(response);
            if(!response.hasOwnProperty('error')) {

              $location.path('/klar');

              $scope.fbUrl = 'http://www.facebook.com/photo?fbid='+response.id+'&makeprofile=1&makeuserprofile=1';

              window.location = $scope.fbUrl;

              ga('send', 'profile_upload');

              userData.setUrl($scope.fbUrl);
            } else {
              ga('send', 'profile_upload_error');
              $scope.error = "Ajaj, något gick snett. Sorry 'bout that.";
            }
	          // window.location = 'http://www.facebook.com/photo?fbid='+response.id+'&makeprofile=1&makeuserprofile=1';

          });
        });

      }).error( function( data ) {
          $scope.error = "Ajaj, något gick snett. Sorry 'bout that.";
      });
      

    }

    $scope.me = function() {
      Facebook.api('/me?fields=first_name,permissions,picture.height(500)', function(response) {
        /**
         * Using $scope.$apply since this happens outside angular framework.
         */
         // console.log(response);
         $scope.user = response;
         userData.setUser($scope.user);
         console.log($scope.user);

         var imgUrl = response.picture.data.url;
         // var imgUrl = '/images/kajsa.jpg';

      // img.src = 'images/oscar.jpg';
      // img.src = 'images/testimage.jpg';

         dragger = {
          imgUrl: imgUrl,
          img: {},
          targetWidth: 1250,
          canvas: document.getElementById('canvas'),
          ctx: canvas.getContext('2d'),
          isDragging: false,
          startDrag: {
            x: 0,
            y: 0
          },
          imgPos : {
            x: 0,
            y: 0
          },
          init : function() {
            dragger.img = document.createElement('IMG');
            // dragger.img.src = dragger.imgUrl;
            dragger.img.crossOrigin = "Anonymous";

            // debugger;

            // dragger.watch("startDrag", function (id, oldval, newval) {
            //     console.log( "o." + id + " changed from " + oldval + " to " + newval );
            //     return newval;
            // });


            dragger.img.onload = function() {

              if ( dragger.img.width < dragger.targetWidth ) {
                console.log( 'oj, vad liten bild du har.. ajjajaj' );
              }
              // console.log(dragger.img.width, dragger.img.height);

              dragger.transformImage({}, function(result) {

                $scope.loading = false;

                $scope.$apply(function() {
                  $scope.resultSource = result;
                });


              });

              canvas.addEventListener('mousedown', function(e){
                dragger.isDragging = true;
                // dragger.startDrag.x = dragger.imgPos.x;
                // dragger.startDrag.y = dragger.imgPos.x; 
                // console.log('MOUSEDOWN', dragger);
                try {


                  dragger.startDrag.x = e.offsetX - dragger.startDrag.x;
                  dragger.startDrag.y = e.offsetY - dragger.startDrag.y;
                } catch(e) {
                  console.log(e);
                }
              });

              canvas.addEventListener('mouseup', function(e){

                dragger.startDrag.x = dragger.imgPos.x; 
                dragger.startDrag.y = dragger.imgPos.y; 

                dragger.isDragging = false;

                dragger.transformImage({
                    ev: e,
                    startDrag : {
                      x: dragger.startDrag.x,
                      y: dragger.startDrag.y
                    }
                  }, function(result) {

                     $scope.loading = false;

                    $scope.$apply(function() {
                      $scope.resultSource = result;
                    });


                   });
              });


              canvas.addEventListener('mousemove', function(e) {

                if(isNaN(dragger.startDrag.x)) {
                  dragger.startDrag = {
                    x: 0, 
                    y: 0
                  }
                }
                if(dragger.isDragging) {

                  dragger.transformImage({
                    ev : e,
                    startPos : dragger.startDrag
                  }, function(result) {

                     $scope.loading = false;

                    $scope.$apply(function() {
                      $scope.resultSource = result;
                    });


                   });
                }
              });
            };
            dragger.img.src = dragger.imgUrl;
            if ( dragger.img.complete || dragger.img.complete === undefined ) {
                // dragger.img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                dragger.img.src = dragger.imgUrl;
            }
          },
          transformImage : function(imgData, callback) {
          
            var canvas = dragger.canvas;
            var ctx = dragger.ctx;

            // keep context for later use.
            var cb = callback;
            var img = dragger.img;

            var offset = 0;

            img.crossOrigin = "Anonymous";


            // When the image is loaded, draw it
              canvas.height = img.height;
              canvas.width = img.width;

                ctx.globalCompositeOperation = 'normal';

                ctx.fillStyle = "#fff";
                ctx.fillRect (0, 0, canvas.width, canvas.height);
                ctx.fill();

                // Save the state, so we can undo the clipping

                var main = (canvas.width >= canvas.height) ? 'width' : 'height';
                var secondary = (main === 'width') ? 'height' : 'width';
                
                var ratio = img[secondary] / img[main];

                img[secondary] = (img[secondary] > dragger.targetWidth) ? dragger.targetWidth : img[secondary];
                img[secondary] = dragger.targetWidth;
                img[main] = img[secondary] / ratio;


                var target = dragger.targetWidth * 0.2;
                console.log(target);
                offset = target;
                // offset = 0;


                // var target = img['height'] * 0.7;

                // offset = (img['width'] - target) / 2;
                // offset = 300;

                canvas[secondary] = dragger.targetWidth;
                canvas[main] = dragger.targetWidth;


                var maskCanvas = document.createElement('canvas');
                // Ensure same dimensions
                maskCanvas.width = canvas.width;
                maskCanvas.height = canvas.height;
                var maskCtx = maskCanvas.getContext('2d');

                maskCtx.translate(0.5, 0.5)
                maskCtx.fillStyle = "white";
                maskCtx.strokeStyle = "#000";
                maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
                maskCtx.globalCompositeOperation = 'destination-out';

                ctx.drawImage(maskCanvas, 0, 0);
              
                // Mask
                ctx.moveTo(offset/2, canvas.height/4);
                ctx.lineTo(canvas.width/2, 0);
                ctx.lineTo(canvas.width - offset/2, canvas.height/4);
                ctx.lineTo(canvas.width - offset/2, canvas.height - canvas.height/4);
                ctx.lineTo(canvas.width/2, canvas.height);
                ctx.lineTo(offset/2, canvas.height - canvas.height/4);
                ctx.lineTo(offset/2, canvas.height/4);

                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.clip();

                if(dragger.isDragging) {

                  xPos = imgData.ev.layerX - dragger.startDrag.x; 
                  yPos = imgData.ev.layerY - dragger.startDrag.y;

                }

                // Don't allow pictures to be dragged out of bounds.
                if(xPos > offset/2) {
                  xPos = offset/2;
                }
                if((xPos + img.width) < canvas.width - offset/2) {
                  xPos = canvas.width - offset/2 - img.width;
                }

                ctx.drawImage(img, xPos, 0, img.width, img.height);

                dragger.imgPos.x = xPos;
                dragger.imgPos.y = yPos;

                // Greyscale
                var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var pix = imgd.data;

                if(!dragger.isDragging) {

                  for (var i = 0, n = pix.length; i < n; i += 4) {
                    var grayscale = pix[i  ] * .3 + pix[i+1] * .59 + pix[i+2] * .11;
                    pix[i  ] = grayscale;   
                    pix[i+1] = grayscale; 
                    pix[i+2] = grayscale;   
                  }

                }

                ctx.putImageData(imgd, 0, 0);
                
                // Don't apply filter if you're positioning the image
                if(!dragger.isDragging) {


                  var overlayImage = document.createElement('IMG');

                  overlayImage.onload = function() {

                    overlayImage.width = canvas.width;
                    overlayImage.height = canvas.height;
                    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);

                    // Done drawing, make it rain.
                    
                    cb(canvas.toDataURL("image/png"));

                  } 

                  overlayImage.src = 'images/overlay.png';
                  ctx.restore();

                }

                // ctx.fill();

            }
        };
    
        dragger.init();

        $scope.$apply(function() {
          $scope.user = response;
          userData.setUser($scope.user);
        });
        
      });
    }
    function dataURItoBlob(dataURI) {
      var byteString = atob(dataURI.split(',')[1]);
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: 'image/png' });
    }

      var xPos = 0;
      var yPos = 0;
})
.controller('DoneCtrl', function ($scope, $http, Facebook, $location, userData) {
  $scope.user = userData.getUser();
  $scope.fbUrl = userData.getUrl();
})
