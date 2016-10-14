const gulp         = require('gulp')
const plumber      = require('gulp-plumber')
const autoprefixer = require('gulp-autoprefixer')
const source       = require('vinyl-source-stream')
const browserify   = require('browserify')
const browserSync  = require('browser-sync').create()
const ngrok        = require('ngrok')
const runSequence  = require('run-sequence')
const del          = require('del')
const config = {
          port:   8080,
          root:   '.',
          start:  'src',
          finish: 'docs'
      },
      start  = config.root + '/' + config.start,
      finish = config.root + '/' + config.finish

gulp.task('pages', function() {
  return gulp.src(start+'/index.html')
             .pipe(gulp.dest(finish))
            //  .pipe(browserSync.reload({stream: true}))
})

gulp.task('styles', function() {
  return gulp.src(start+'/main.css')
             .pipe(autoprefixer())
             .pipe(gulp.dest(finish))
             .pipe(browserSync.stream())
})

gulp.task('scripts', function() {
  browserify(start+'/main.js').bundle()
                              .pipe(source('main.js'))
                              .pipe(gulp.dest(finish))
                              // .pipe(browserSync.reload({stream: true}))
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

gulp.task('serve', function() {
  browserSync.init({
    port: config.port,
    server: {
      baseDir: finish
    }
  })
})

gulp.task('tunnel', function() {
  ngrok.connect(config.port, function (err, url) {
      console.log("Tunnel created at "+url+".");
  });
})

gulp.task('develop', function() {
  runSequence('watch', 'serve')
})

gulp.task('default', function() {
  runSequence('develop', 'tunnel')
})
