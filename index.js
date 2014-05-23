var Ractive = require('ractive');

var template = "<table class='ractive-grid'>" +
  "  <thead>" +
  "    <tr>{{#headers:i}}<th on-click='headerClicked:{{i}}' class='{{#sortDir(i) === 1}}header-sort-asc{{/}}{{#sortDir(i) === 2}}header-sort-desc{{/}}'>{{.}}</th>{{/headers}}</tr>" +
  "  </thead>" +
  "  <tbody>" +
  "    {{#rendered}}" +
  "      {{#itemsView:i}}" +
  "        {{#editingRow(i)}}" +
  "        <tr><td colspan='{{columns.length}}'>Editing!</td></tr>" +
  "        {{/}}" +
  "        {{^editingRow(i)}}" +
  "        <tr on-dblclick='rowDoubleClicked:{{i}}'>{{>row}}</tr>" +
  "        {{/}}" +
  "      {{/items}}" +
  "    {{/rendered}}" +
  "  </tbody>" +
  "</table>";

(function() {
  var getProp = function getProp(obj, path) {
    var parts = path.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (!!!obj) return obj;
      var p = parts[i];
      obj = obj[p];
    }
    return obj;
  };

  var Grid;
  Grid = Ractive.extend({
    template: template,
    init: function() {
      var grid = this;
      grid.on('rowDoubleClicked', function(e, i) {
        grid.fire('rowSelected', e, grid.get('itemsView.' + i), i);
      });
      grid.on('colDoubleClicked', function(e, arr) {
        grid.fire('colSelected', e, grid.get('itemsView.' + arr[0]), arr[1], arr[0]);
      });
      grid.on('headerClicked', function(e, i) {
        var sorts = grid.get('sorts');
        var state = sorts[i];
        var nstate;
        if (e.original.ctrlKey && grid.get('multisortable')) {
          nstate = 3;
          if (!!!state || state > 2) nstate = 1;
          else if (state === 1) nstate = 2;
          if (nstate > 0 && nstate < 3) {
            if (sorts.order.indexOf(i) < 0) sorts.order.push(i);
          }
          grid.set('sorts.' + i, nstate);
        } else if (grid.get('sortable')) {
          for (var s in sorts) {
            if (s !== 'order') grid.set('sorts.' + s, 3);
          }
          nstate = 3;
          if (!!!state || state > 2) nstate = 1;
          else if (state === 1) nstate = 2;
          else {
            grid.set('sorts.order', []);
          }
          if (nstate > 0 && nstate < 3) grid.set('sorts.order', [i]);
          grid.set('sorts.' + i, nstate);
        }
      });
    },
    data: {
      rendered: false,
      editingRow: function(idx) {
        return (this.get('editingRows') || []).indexOf(idx) >= 0;
      },
      sortDir: function(idx) {
        return this.get('sorts')[idx];
      },
      editingRows: [],
      columns: [],
      sorts: {order: []},
      sortable: true,
      multisortable: true
    },
    computed: {
      itemsView: function() {
        var grd = this;
        this.get('sorts');
        var sorts = this.get('sorting') || [];
        var items = (this.get('items') || []).slice(0);
        var columns = this.get('_columns' + '') || [];
        items.sort(function(a, b) {
          for (var i in sorts) {
            var s = sorts[i];
            var dir = 1;
            var ai = getProp(a, columns[s.field].path);
            var bi = getProp(b, columns[s.field].path);

            if (s.dir === 2) dir = -1;
            else if (s.dir > 2) continue;

            if (ai < bi) return -1 * dir;
            else if (ai > bi) return 1 * dir;
            else continue;
          }
          return 0;
        });
        return items;
      },
      sorting: function() {
        var res = [];
        var sorts = this.get('sorts');
        var orders = sorts.order || [];
        for (var i in orders) {
          res.push({ field: orders[i], dir: sorts[orders[i]] });
        }
        return res;
      },
      headers: function() {
        var cols = this.get('columns');
        var res = [];
        for (var i in cols) {
          var c = cols[i];
          if (!!c.label) res.push(c.label);
          else if (!!!c.compute) {
            var nm = c.path || 'Column ' + i;
            res.push(nm.substring(nm.lastIndexOf('.') + 1));
          } else res.push('Column ' + i);
        }
        return res;
      },
      columns: function() {
        var cols = this.get('_columns');
        if (cols === undefined) cols = this.columns();
        cols = cols.slice(0);
        cols.sort(function(a, b) {
          var ai = a.order || 0;
          var bi = b.order || 1;
          if (ai < bi) return -1;
          else if (ai > bi) return 1;
          else return 0;
        });
        return cols;
      }
    },
    partials: {
      row: '',
    },
    columns: function(arr) {
      if (!!!arr) { // init columns from items
        var item = this.get('items').slice(0).pop();
        var res = [];
        if (!!item) {
          var okTypes = ['String', 'Number', 'Boolean', 'Date'];
          for (var i in item) {
            if (item.hasOwnProperty(i) && !!item[i]) {
              var t = item[i].constructor.name;
              if (okTypes.indexOf(t) >= 0) res.push({ label: i, path: i });
            }
          }
        }
        return this.columns(res);
      } else {
        arr.sort(function(a, b) {
          var ai = a.order || 100;
          var bi = b.order || 100;
          if (ai < bi) return -1;
          else if (ai > bi) return 1;
          else return 0;
        });
        this.set('_columns', arr);
        var str = '';
        for (var c in arr) {
          str += '<td on-dblclick=\'colDoubleClicked:[{{i}},' + c + ']\'>{{' + arr[c].path + '}}</td>';
        }
        this.partials.row = str;
        this.set('rendered', false);
        this.set('rendered', true);
        return arr;
      }
    }
  });

  module.exports = Grid;
})();
