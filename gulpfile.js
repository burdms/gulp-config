/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */
const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const del = require('del');
const plumber = require('gulp-plumber');
const rigger = require('gulp-rigger');
const imagemin = require('gulp-imagemin');
const babel = require("gulp-babel");
const gcmq = require("gulp-group-css-media-queries");

const PATH = {
  src: './src/',
  build: './build/',
  assets: './build/assets/',
};

function pugCompile(done) {
  gulp
    .src(`${PATH.src}views/pages/**/*.pug`)
    .pipe(plumber())
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(gulp.dest(PATH.build))
    .on('end', browserSync.reload);

  done();
}

function sassDev(done) {
  gulp
    .src(`${PATH.src}styles/styles.scss`)
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
    .pipe(gcmq())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${PATH.assets}styles/`))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );

  done();
}

function sassProd(done) {
  gulp
    .src(`${PATH.src}styles/styles.scss`)
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
    .pipe(gcmq())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${PATH.assets}styles/`))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );

  done();
}

function scriptsDev(done) {
  gulp
    .src(`${PATH.src}scripts/main.js`)
    .pipe(plumber())
    .pipe(rigger())
    .pipe(sourcemaps.init())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${PATH.assets}scripts/`))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );

  done();
}

function scriptsProd(done) {
  gulp
    .src(`${PATH.src}scripts/main.js`)
    .pipe(plumber())
    .pipe(rigger())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${PATH.assets}scripts/`))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );

  done();
}

function imagesDev(done) {
  gulp
    .src(`${PATH.src}images/**/*`)
    .pipe(plumber())
    .pipe(gulp.dest(`${PATH.assets}images/`))
    .pipe(browserSync.stream());

  done();
}

function imagesProd(done) {
  gulp
    .src(`${PATH.src}images/**/*`)
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
    .pipe(gulp.dest(`${PATH.assets}images/`))
    .pipe(browserSync.stream());

  done();
}

function fonts(done) {
  gulp
    .src(`${PATH.src}fonts/**/*`)
    .pipe(gulp.dest(`${PATH.assets}fonts`))
    .on('end', browserSync.reload);

  done();
}

function resources(done) {
  gulp
    .src(`${PATH.src}resources/**/*`)
    .pipe(gulp.dest(PATH.build))
    .on('end', browserSync.reload);

  done();
}

function clean() {
  return del(`${PATH.build}**/*`, { force: true });
}

function watch() {
  gulp.watch(`${PATH.src}**/*.pug`, pugCompile);
  gulp.watch(`${PATH.src}styles/**/*.scss`, sassDev);
  gulp.watch(`${PATH.src}scripts/**/*.js`, scriptsDev);
  gulp.watch(`${PATH.src}resources/**/*`, resources);
  gulp.watch(`${PATH.src}images/**/*`, imagesDev);
  gulp.watch(`${PATH.src}fonts/**/*`, fonts);
}

function serve(done) {
  browserSync.init({
    server: {
      baseDir: PATH.build,
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
    fonts,
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
      fonts,
      imagesProd,
      pugCompile,
      scriptsProd,
      sassProd
    )
  )
);

// Clean build directory
gulp.task(clean);
