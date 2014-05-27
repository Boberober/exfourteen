app.controller('ProfileCtrl', function ($scope, $http, Facebook, $location, userData) {

  $scope.profile = '';
  $scope.loading = true;

  $scope.resultSource = '';
  $scope.error = '';

  Facebook.getLoginStatus( function( response ) {

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
      }
    }, { scope: 'publish_stream,photo_upload,user_photos' });

  };
  $scope.uploadImage = function() {
    $loading = true;
      $http.post('/upload', { imgData: $scope.resultSource, id: $scope.user.id } ).success( function( data ) {
        $loading = false;

        window.location.assign(data.path);

      }).error( function( data ) {
        $scope.error = "Ajaj, något gick snett. Sorry 'bout that.";
      });
  };

  $scope.hasError = function() {
    return ($scope.error !== '') ? true : false;
  }
  // Rename dis shiet
  $scope.checkAlbums = function() {

    if($scope.user.permissions.data[0].photo_upload !== 1) {
      return;
    }

    $scope.loading = true;

    $http.post('/upload', { imgData: $scope.resultSource, id: $scope.user.id } ).success( function( data ) {

      var pictureName = data.name;
      var url = window.location.origin + data.path;

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

        });
      });

    }).error( function( data ) {
        $scope.error = "Ajaj, något gick snett. Sorry 'bout that.";
    });
    

  }

  $scope.me = function() {
    Facebook.api('/me?fields=first_name,permissions,picture.height(500)', function(response) {

      $scope.user = response;
      userData.setUser($scope.user);

      var imgUrl = response.picture.data.url;
      
       // Gör om gör rätt!
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
          dragger.img.crossOrigin = "Anonymous";


          dragger.img.onload = function() {

            if ( dragger.img.width < dragger.targetWidth ) {
              console.log( 'oj, vad liten bild du har.. ajjajaj' );
            }

            dragger.transformImage({}, function(result) {

              $scope.loading = false;

              $scope.$apply(function() {
                $scope.resultSource = result;
              });

            });

            canvas.addEventListener('mousedown', function(e){
              dragger.isDragging = true;

              try {

                dragger.startDrag.x = e.offsetX - dragger.startDrag.x;
                dragger.startDrag.y = e.offsetY - dragger.startDrag.y;

              } catch(e) {
                console.log(e);
              }
            });

            canvas.addEventListener('mouseup', function(e) {

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

          canvas.height = img.height;
          canvas.width = img.width;

          ctx.globalCompositeOperation = 'normal';

          ctx.fillStyle = "#fff";
          ctx.fillRect (0, 0, canvas.width, canvas.height);
          ctx.fill();

          var main = (canvas.width >= canvas.height) ? 'width' : 'height';
          var secondary = (main === 'width') ? 'height' : 'width';
          
          var ratio = img[secondary] / img[main];

          img[secondary] = (img[secondary] > dragger.targetWidth) ? dragger.targetWidth : img[secondary];
          img[secondary] = dragger.targetWidth;
          img[main] = img[secondary] / ratio;


          var offset = dragger.targetWidth * 0.2;

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

            // Refactor dis shiet. 
            overlayImage.src = 'images/overlay.png';
            ctx.restore();

          }

        }
    };
  
      dragger.init();

      $scope.$apply(function() {
        $scope.user = response;
        userData.setUser($scope.user);
      });
      
    });
  }
    var xPos = 0;
    var yPos = 0;
});
