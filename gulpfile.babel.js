'use strict';

import browserify from 'browserify';
import es from 'event-stream';
import gulp from 'gulp';
import rename from 'gulp-rename';
import rimraf from 'rimraf';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import ts from 'gulp-typescript';
import typescript from 'typescript';
import uglify from 'gulp-uglify';

const tsProject = ts.createProject('tsconfig.json', {
  typescript: typescript,
  noExternalResolve: true
});

gulp.task('default', ['watch']);

gulp.task('watch', () => {
  gulp.watch('src/js/**/*.ts', ['build:js']);
  gulp.watch('src/**/*.html', ['build:html']);
  gulp.watch('src/manifest.json', ['build:manifest']);
});

gulp.task('build:all', [
  'build:js',
  'build:manifest',
  'build:html',
  'build:dict',
]);

gulp.task('build:typescript', () => {
  return tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject))
    .js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./_dist/'));
});

gulp.task('build:js', ['build:typescript'], () => {
  const entries = [
    'js/clustabs.js',
    'js/background.js',
    'js/content.js'
  ];
  return es.merge.apply(es, entries.map((path)=> {
    return browserify(`./_dist/src/${path}`, { debug: true })
      .bundle()
      .pipe(source(path))
      .pipe(gulp.dest('./_dist'));
  }));
});

gulp.task('build:html', () => {
  return gulp.src('src/**/*.html')
    .pipe(rename((path) => {
      path.dirname = path.dirname.replace('src', '');
    }))
    .pipe(gulp.dest('./_dist/'));
});

gulp.task('build:manifest', () => {
  return gulp.src('src/manifest.json')
    .pipe(gulp.dest('./_dist/'));
});

gulp.task('build:dict', () => {
  return gulp.src('./node_modules/kuromoji/dist/dict/*')
    .pipe(gulp.dest('./_dist/dict'));
});

gulp.task('clean', (cb) => {
  return rimraf('./_dist', cb);
});

gulp.task('release', ['build:all'], () => {
  rimraf('./_dist/src', () => {});
  return gulp.src(['./_dist/**/*.js', '!./_dist/src/**/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./_dist'));
});
