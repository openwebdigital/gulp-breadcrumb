// Exporting the plugin main function
module.exports = function (options) {

    "use strict";

    var
        PLUGIN_NAME = 'gulp-breadcrumb',
        through = require('through2'),
        debug = false,

        crumb = function (route, options) {

            var
                parts,
                results,
                path = '';

            if (debug) console.log('crumbs: ' + route);

            // ensure default options are available if ot set by user.
            options = options ? options : {};
            options.rootHTML = options.rootHTML ? options.rootHTML : 'Home';
            options.rootDir = options.rootDir ? options.rootDir : 'src';

            // if no route is passed in, stick in a dummy one
            if (!route) {
                route = 'error/no/route/passed/to/gulp-breadcrumb/bail/out/skipper';
            }

            parts = route.split('\\');
            results = `<nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/">${options.rootHTML}</a></li>`;

            var ignoreCount = parts.indexOf(options.rootDir) > -1 ? parts.indexOf(options.rootDir) + 1 : 0;

            for (var i = ignoreCount; i < parts.length; i++) {
                path += '/' + parts[i];
                if (path !== '/' && parts[i] !== '') {
                    var extension = parts[i].split('.');

                    if (extension.length < 2) {
                        results += `<li class="breadcrumb-item">
                                    <a href="${path}">${capitalizeFirstLetter(extension[0])}</a>
                                    </li>`;
                    } else if (options.showPageName === true) {
                        results += `<li class="breadcrumb-item active">${capitalizeFirstLetter(extension[0].replace(/-/g, ' '))}</li>`;
                    }
                }
            }
            results += '</ol></nav>';

            if (debug) console.log('crumbs: ' + results);

            return results;
        },

        capitalizeFirstLetter = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        cb = function (file, enc, callback) {
            var str, bc;

            str = file.contents.toString();

            bc = crumb(file.path, options);

            str = str.replace('<!-- breadcrumb -->', bc);

            file = file.clone();
            file.contents = new Buffer(str);

            this.push(file);
            callback();
        };

    return through.obj(cb);
};
