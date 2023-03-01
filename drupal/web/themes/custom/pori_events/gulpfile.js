/**
 * Created by lisette on 28/07/16. (Updated on 5.11.2019 for Gulp 4)
 */
// General plugins
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const gulpif = require('gulp-if');

// Sass plugins
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const autoprefix = require('gulp-autoprefixer');

// Javascript plugins
const uglify = require('gulp-uglify');

// Config
const basePath = {
  src: './src/',
  dist: './dist/',
  templates: './templates/'
};
const path = {
  styles: {
    src: basePath.src + 'scss/',
    dist: basePath.dist + 'css/'
  },
  scripts: {
    src: basePath.src + 'js/',
    dist: basePath.dist + 'js/'
  },
  templates: {
    dist: basePath.templates
  },
  env: {
    dev: !!gutil.env.development,
    prod: !!gutil.env.production
  },
  sourcemaps: {
    dev: !!gutil.env.development,
    prod: !gutil.env.production
  },
  bower: 'bower_components/',
  fontAwesome: 'font-awesome/scss/'
}

const changeEvent = function (evt) {
  gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePath.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};

console.log(gutil.env.production);

// BrowserSync task
gulp.task('browserSync', gulp.series(function () {
  browserSync.init({
    //files: path.styles.dist + '*.css', // Does not work when stylesheets have
    // @import
    files: path.styles.src + '**/*.scss',
    // proxy: 'localhost:8080/pori-web/',
    // browser: '<browser>'
  })
}));

// Sass task
gulp.task('sass', gulp.series(function (minify) {
  return gulp.src(path.styles.src + '**/*.scss')
    .pipe(gulpif(path.sourcemaps.prod, sourcemaps.init()))
    .pipe(sassGlob())
    .pipe(sass({
      includePaths: [
        path.bower + path.fontAwesome,
        './'
      ],
      outputStyle: 'expanded'
    }))
    .on("error", function (err) {
      gutil.log(gutil.colors.black.bgRed(" SASS ERROR", gutil.colors.white.bgBlack(" " + (err.message.split("  ")[2]))));
      gutil.log(gutil.colors.black.bgRed(" FILE:", gutil.colors.white.bgBlack(" " + (err.message.split("\n")[0]))));
      gutil.log(gutil.colors.black.bgRed(" LINE:", gutil.colors.white.bgBlack(" " + err.line)));
      gutil.log(gutil.colors.black.bgRed(" COLUMN:", gutil.colors.white.bgBlack(" " + err.column)));
      gutil.log(gutil.colors.black.bgRed(" ERROR:", gutil.colors.white.bgBlack(" " + err.formatted.split("\n")[0])));
      return this.emit("end");
    })
    .pipe(autoprefix())
    // .pipe(path.env.prod === true ? cleanCss() : gutil.noop())
    .pipe(gulpif(path.sourcemaps.prod, sourcemaps.write()))
    .pipe(gulp.dest(path.styles.dist));
}));

// Watch task
gulp.task('watch', gulp.series(['sass', 'browserSync'], function () {
  gulp.watch(path.styles.src + '**/*.scss', ['sass']);
  gulp.watch(path.styles.src + '**/**/*.scss', ['sass']);
  gulp.watch(path.templates.dist + '**/*.html.twig', browserSync.reload);
  gulp.watch(path.scripts.src + '*.js', ['scripts']).on('change', browserSync.reload);
}));

// Uglify task
gulp.task('scripts', gulp.series(function () {
  gulp.src(path.scripts.src + '/*.js')
    .pipe(path.env.prod === true ? uglify() : gutil.noop())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(path.scripts.dist));
}));

// Default tasks
gulp.task('default', gulp.series(['sass', 'watch', 'scripts'], function () {
  console.log('Running default tasks');
}));

gulp.task('build', gulp.series(['sass', 'scripts'], function () {
  console.log('Running build tasks');
}));
