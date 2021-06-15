/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */
const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const del = require('del');
const plumber = require('gulp-plumber');
const rigger = require('gulp-rigger');
const imagemin = require('gulp-imagemin');

function pugCompile(done) {
  gulp
    .src('./src/*.pug')
    .pipe(plumber())
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(gulp.dest('./build/'))
    .on('end', browserSync.reload);

  done();
}

function sassDev(done) {
  gulp
    .src('./src/styles/styles.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        errorLogToConsole: true,
      })
    )
    .on('error', console.error.bind(console))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/styles/'))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );

  done();
}

function sassProd(done) {
  gulp
    .src('./src/styles/styles.scss')
    .pipe(plumber())
    .pipe(
      sass({
        errorLogToConsole: true,
        outputStyle: 'compressed',
      })
    )
    .on('error', console.error.bind(console))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./build/styles/'))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );

  done();
}

function scriptsDev(done) {
  gulp
    .src('./src/scripts/main.js')
    .pipe(plumber())
    .pipe(rigger())
    .pipe(sourcemaps.init())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/scripts/'))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );

  done();
}

function scriptsProd(done) {
  gulp
    .src('./src/scripts/main.js')
    .pipe(plumber())
    .pipe(rigger())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./build/scripts/'))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );

  done();
}

function imagesDev(done) {
  gulp
    .src('src/images/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('build/images/'))
    .pipe(browserSync.stream());

  done();
}

function imagesProd(done) {
  gulp
    .src('src/images/**/*')
    .pipe(plumber())
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: false },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(gulp.dest('build/images/'))
    .pipe(browserSync.stream());

  done();
}

function resources(done) {
  gulp
    .src('./src/resources/**/*')
    .pipe(gulp.dest('./build/'))
    .on('end', browserSync.reload);

  done();
}

function clean() {
  return del('./build/**/*', { force: true });
}

function watch() {
  gulp.watch('./src/**/*.pug', pugCompile);
  gulp.watch('./src/styles/**/*.scss', sassDev);
  gulp.watch('./src/scripts/**/*.js', scriptsDev);
  gulp.watch('./src/resources/**/*', resources);
  gulp.watch('./src/images/**/*', imagesDev);
}

function serve(done) {
  browserSync.init({
    server: {
      baseDir: './build',
    },
    host: 'localhost',
    port: 9000,
  });

  done();
}

// Default task for development
gulp.task('default',
  gulp.series(
    resources,
    imagesDev,
    gulp.parallel(pugCompile, scriptsDev),
    sassDev,
    gulp.parallel(watch, serve)
  )
);

// Task to build for production
gulp.task('build',
  gulp.series(
    clean,
    gulp.series(
      resources,
      imagesProd,
      pugCompile,
      scriptsProd,
      sassProd
    )
  )
);

// Clean build directory
gulp.task(clean);
