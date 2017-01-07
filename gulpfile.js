var gulp        = require("gulp")
var less        = require("gulp-less")
var concat      = require('gulp-concat');
var clean       = require('gulp-clean-css')
var uglify      = require("gulp-uglify")
var htmlminify  = require("gulp-html-minify");
var connect     = require('gulp-connect');
var gulpOpen    = require('gulp-open');
var os          = require('os');

var browser = os.platform() === 'linux' ? 'google-chrome' : (
        os.platform() === 'darwin' ? 'google chrome' : (
                os.platform() === 'win32' ? 'chrome' : 'firefox'));

gulp.task('build-style', function() {
    return gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(concat('index.css'))
        .pipe(clean())
        .pipe(gulp.dest('css/'))
        .pipe(connect.reload());
});

gulp.task('build-js', function() {
    return gulp.src(['src/lib/*.js', 'src/js/*.js'])
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(gulp.dest('js/'))
});

gulp.task("build-html", function () {
    return gulp.src('src/index.html')
        .pipe(htmlminify())
        .pipe(gulp.dest(''))
        .pipe(connect.reload());
})

gulp.task('web', function() {
    connect.server({
        port: 8000,
        livereload: true
    });
    gulp.src(__filename)
        .pipe(gulpOpen({
            uri: 'http://localhost:8000',
            app: browser
        }));
});

gulp.task('reload-style', function() {
    return gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(concat('index.css'))
        .pipe(gulp.dest('css/'))
        .pipe(connect.reload());
});

gulp.task('reload-js', function() {
    return gulp.src(['src/lib/*.js', 'src/js/*.js'])
        .pipe(concat('index.js'))
        .pipe(gulp.dest('js/'))
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(['./src/*.html'], ['build-html']);
    gulp.watch(['./src/js/*.js'], ['reload-js']);
    gulp.watch(['./src/less/*.less'], ['reload-style']);
});

gulp.task("build", ["build-style", "build-js", "build-html"]);
gulp.task('dev', ['web', 'watch']);