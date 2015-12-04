'use strict';

import browserify from 'browserify';
import es from 'event-stream';
import gulp from 'gulp';
import rimraf from 'rimraf';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import ts from 'gulp-typescript';
import typescript from 'typescript';

const tsProject = ts.createProject('tsconfig.json', {
  typescript: typescript,
  noExternalResolve: true
});

gulp.task('default', ['watch']);

gulp.task('watch', () => {
  gulp.watch('src/js/**/*.ts', ['build:js']);
});

gulp.task('build:all', ['build:js']);

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
    'js/main.js', // TODO: for test
    'js/background.js'
  ];
  return es.merge.apply(es, entries.map((path)=> {
    return browserify(`./_dist/src/${path}`, { debug: true })
      .bundle()
      .pipe(source(path))
      .pipe(gulp.dest('./_dist'))
  }));
});

gulp.task('clean', (cb) => {
  return rimraf('./_dist', cb);
});
