const gulp          = require("gulp");
const sass          = require("gulp-sass");
const sourcemaps    = require("gulp-sourcemaps");
const autoprefixer  = require("gulp-autoprefixer");
const plumber       = require("gulp-plumber");
const colors        = require("ansi-colors");
const notifier      = require("node-notifier")
const rename        = require("gulp-rename");
const wait          = require("gulp-wait");
const csso          = require("gulp-csso");
const browserSync     = require("browser-sync").create();
const webpack         = require("webpack");

function showError(err) {
    notifier.notify({
        title: "Error in sass",
        message: err.messageFormatted
      });

    console.log(colors.red("==============================="));
    console.log(colors.red(err.messageFormatted));
    console.log(colors.red("==============================="));
    this.emit("end");
}


gulp.task("browseSync", function() {
    browserSync.init({
        server: "./",
        notify: false,
        //host: "192.168.0.24",
        //port: 3000,
        open: true,
        //browser: "google chrome" //https://stackoverflow.com/questions/24686585/gulp-browser-sync-open-chrome-only
    });
});


gulp.task("sass", function() {
    return gulp.src("src/scss/style.scss")
        .pipe(wait(500))
        .pipe(plumber({
            errorHandler: showError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: "compressed" //nested, expanded, compact, compressed
        }))
        .pipe(autoprefixer({
            browsers: ["> 5%"]
        })) //autoprefixy https://github.com/browserslist/browserslist#queries
        .pipe(csso())
        .pipe(rename({
            suffix: ".min",
            basename: "style"
        }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream({match: "**/*.css"}));
});


gulp.task("es6", function(cb) { //https://github.com/webpack/docs/wiki/usage-with-gulp#normal-compilation
    return webpack(require("./webpack.config.js"), function(err, stats) {
        if (err) throw err;
        console.log(stats.toString());
        browserSync.reload();
        cb();
    })
})


gulp.task("watch", function() {
    gulp.watch("src/scss/**/*.scss", gulp.series("sass"));
    gulp.watch("src/js/**/*.js", gulp.series("es6"));
    gulp.watch("*.html").on("change", browserSync.reload);
});


gulp.task("default", gulp.parallel("sass", "es6", "browseSync", "watch"));