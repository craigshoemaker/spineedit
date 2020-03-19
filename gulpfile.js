const gulp = require('gulp');
const replace = require('gulp-replace');
const minify = require('gulp-minify');
const path = require('path');
const zip = require('gulp-zip');
const GA_ACCOUNT_KEY = require('./ga-config').GA_ACCOUNT_KEY;

gulp.task('minify', async () => {
  gulp
    .src(['src/*.js'])
    .pipe(replace('IS_PRODUCTION = false', 'IS_PRODUCTION = true'))
    .pipe(replace('{GA_ACCOUNT_KEY}', GA_ACCOUNT_KEY))
    .pipe(
      minify({
        ext: {
          min: [/\.(.*)\.js$/, '$1.js'],
        },
        noSource: true,
      }),
    )
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', async () => {
  gulp.src(['src/*.json', 'src/*.html', 'src/icons/*']).pipe(
    gulp.dest(file => {
      const dirname = path.dirname(file.path);
      return dirname.replace('src', 'dist');
    }),
  );
});

gulp.task('build', gulp.parallel('minify', 'copy'));

gulp.task('zip', async () => {
  gulp
    .src('dist/*')
    .pipe(zip('spineedit.zip'))
    .pipe(gulp.dest('dist'));
});
