var gobble = require('gobble');
var sander = require('sander');
var path = require('path');

var parts = [], dev = gobble.env() !== 'production';

var transpilerOptions = {
  blacklist: ['modules']
};

// in dev mode, make libraries and the sandbox available
if (dev) {
  parts.push(gobble('sandbox').moveTo('sandbox'));
  parts.push(gobble('giblets').transform('giblets').moveTo('lib'));
}

var source = gobble('src');

var es5source = gobble(source).transform('6to5', transpilerOptions);

// build the main UMD module
var moduled = gobble(es5source)
  .transform('esperanto-bundle', {
    entry: 'index.js',
    dest: 'ractive-grid.js',
    type: 'umd',
    name: 'RactiveGrid',
    strict: true
  });

// for production, build the component too
if (!dev) {
  parts.push(gobble(es5source).transform('esperanto-bundle', {
    entry: 'index.js',
    dest: 'component/index.js',
    type: 'cjs',
    strict: true
  }));
}

parts.push(moduled.
  transform('relative-sourcemaps', { prefix: 'ractive-grid' })
);

// copy the assets
parts.push(gobble('assets').moveTo('assets'));

module.exports = gobble(parts);
