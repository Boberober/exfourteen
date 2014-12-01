var gulp = require('gulp'),
	ngmin = require('gulp-ngmin'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

var paths = {
	scripts: ['public/javascripts/main.js']
}
var javascripts = ['public/javasripts/app.js', 'public/javascripts/controllers/*']

var sass = require('gulp-sass'),
    lr = require('tiny-lr'),
    livereload = require('gulp-livereload'),
    gutil = require('gulp-util'),
    server = lr();

gulp.task('sass', function () {
    gulp.src('sass/*.scss')
        .pipe(sass({debug: true}))
        .on('error', gutil.log)
        .pipe(gulp.dest('./public/stylesheets'))
        .pipe(livereload(server));
});

gulp.task('reload', function () {
    gulp.src(['public/javascripts/*.js', 'public/partials/*.html'])
        .pipe(livereload(server));
});

gulp.task('ngminify', function () {
    return gulp.src(paths.scripts)
    .pipe(ngmin())
    .pipe(gulp.dest('public/javascripts/min/'));
});

gulp.task('scripts', function() {
  return gulp.src(javascripts)
    .pipe(concat('main.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('public/javascripts/dist'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('watch', function () {
    server.listen(35729, function (err) {

        if (err) return console.log(err);

        gulp.watch('*.scss', ['sass']);
        gulp.watch(['public/javascripts/*.js', 'public/partials/*.html'], ['reload']);

    });
});

gulp.task('build', ['sass', 'scripts']);

gulp.task('default', ['sass', 'watch']);
