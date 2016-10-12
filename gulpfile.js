const gulp         = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const browserify   = require('gulp-browserify')
const runSequence  = require('run-sequence')
const del          = require('del')
const config = {
          root:   '.',
          start:  'src',
          finish: 'dist'
      },
      start  = config.root + '/' + config.start,
      finish = config.root + '/' + config.finish

gulp.task('pages', function() {
  return gulp.src(start+'/index.html')
             .pipe(gulp.dest(finish))
})

gulp.task('styles', function() {
  return gulp.src(start+'/main.css')
             .pipe(autoprefixer())
             .pipe(gulp.dest(finish))
})

gulp.task('scripts', function() {
  return gulp.src(start+'/main.js')
             .pipe(browserify())
             .pipe(gulp.dest(finish))
})

gulp.task('clean', function() {
  return del(finish+'/**/*', {force: true})
})

gulp.task('build', ['clean'], function() {
  runSequence(['scripts', 'styles', 'pages'])
})

gulp.task('watch', ['build'], function() {
  gulp.watch(start+'/**/*.html', ['pages'])
  gulp.watch(start+'/**/*.css', ['styles'])
  gulp.watch(start+'/**/*.js', ['scripts'])
})

gulp.task('default', ['watch'])
