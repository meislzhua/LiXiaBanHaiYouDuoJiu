var gulp = require("gulp");
var less = require("gulp-less");
var concat = require('gulp-concat');
var clean = require('gulp-clean-css');
var uglify = require("gulp-uglify");
var htmlminify = require("gulp-html-minify");
var cheerio = require('gulp-cheerio');
var connect = require('gulp-connect');
var gulpOpen = require('gulp-open');
var os = require('os');


var browser = os.platform() === 'linux' ? 'google-chrome' : (
    os.platform() === 'darwin' ? 'google chrome' : (
        os.platform() === 'win32' ? 'chrome' : 'firefox'));

gulp.task('build-style', function () {
    return gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(concat('index.css'))
        .pipe(clean())
        .pipe(gulp.dest('css/'))
});
gulp.task('build-js', function () {
    return gulp.src(['src/lib/*.js', 'src/js/*.js'])
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(gulp.dest('js/'))
});
gulp.task("build-html", function () {
    return gulp.src('src/index.html')
        .pipe(cheerio(function ($) {
            $(".dev-depend").remove();
        }))
        .pipe(htmlminify())
        .pipe(gulp.dest(''))
});

gulp.task('web', function () {
    connect.server({
        root: 'src',
        port: 8000,
        livereload: true
    });
    gulp.src(__filename)
        .pipe(gulpOpen({
            uri: 'http://localhost:8000',
            app: browser
        }));
});
gulp.task("reload", function () {
    return gulp.src('src/**')
        .pipe(connect.reload())
});
gulp.task('watch', function () {
    gulp.watch("./src/**", ["reload"]);
});

gulp.task("build", ["build-style", "build-js", "build-html"]);
gulp.task('dev', ['web', 'watch']);