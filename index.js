var Ractive = require('ractive');

var templateTable = "<table class='ractive-grid' on-keydown='selection' tabindex='0'|>" +
  "  <thead>" +
  "    <tr>{{#headers:i}}<th on-click='headerClicked:{{i}}' class='{{#sortDir(i) === 1}}header-sort-asc{{/}}{{#sortDir(i) === 2}}header-sort-desc{{/}}'>{{.}}</th>{{/headers}}</tr>" +
  "  </thead>" +
  "  <tbody>" +
  "    {{#rendered}}" +
  "      {{#itemsView:i}}" +
  "        <tr on-click='rowClicked:{{i}}' on-dblclick='rowDoubleClicked:{{i}}' class='{{#isCurrentRow(i)}}current{{/}}'>{{>tableRow}}</tr>" +
  "      {{/items}}" +
  "    {{/rendered}}" +
  "  </tbody>" +
  "</table>";

var templateDiv = "<div class='ractive-grid' on-keydown='selection' tabindex='0'|>" +
  "  <div class='rg-header'>{{#headers:i}}<div on-click='headerClicked:{{i}}' class='{{#sortDir(i) === 1}}header-sort-asc{{/}}{{#sortDir(i) === 2}}header-sort-desc{{/}} {{columnClass(i)}}'>{{.}}</div>{{/headers}}</div>" +
  "  <div class='rg-body'>" +
  "    {{#rendered}}" +
  "      {{#itemsView:i}}" +
  "        <div class='rg-row{{#isCurrentRow(i)}} current{{/}}' on-dblclick='rowDoubleClicked:{{i}}' on-click='rowClicked:{{i}}' >{{>divRow}}</div>" +
  "      {{/}}" +
  "    {{/}}" +
  "  </div>" +
  "</div>";

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
    template: '{{#table}}{{>table}}{{/}}{{^table}}{{>div}}{{/}}',
    beforeInit: function(opts) {
      var transfer = ['class', 'style', 'id'];
      var str = '';
      for (var k in opts.data) if (transfer.indexOf(k) >= 0) str += ' ' + k + '="' + opts.data[k] + '"';
      opts.partials.table = templateTable.replace(/\|/, str);
      opts.partials.div = templateDiv.replace(/\|/, str);
    },
    init: function() {
      var grid = this;
      grid.on('rowDoubleClicked', function(e, i) {
        grid.fire('rowSelected', grid.get('itemsView.' + i), i, e);
      });
      grid.on('rowClicked', function(e, i) {
        grid.set('currentIndex', i);
      });
      grid.on('selection', function(e) {
        var current = grid.get('currentIndex');
        if (typeof current !== 'number') return;
        var items = grid.get('itemsView');
        if (e.original.keyCode === 38 && current > 0) current--;
        else if (e.original.keyCode === 40) current++;
        else if (e.original.keyCode === 13) {
          grid.fire('rowSelected', grid.get('current'), current, e);
          e.original.preventDefault();
          return;
        }
        else return;
        e.original.preventDefault();
        grid.current(current);
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
      columnClass: function(idx) {
        return ((this.get('_columns') || [])[idx] || {}).class;
      },
      isCurrentRow: function(idx) {
        return this.get('currentIndex') === idx;
      },
      editingRows: [],
      columns: [],
      sorts: {order: []},
      sortable: true,
      multisortable: true,
      table: true
    },
    computed: {
      itemsView: function() {
        var grd = this;
        this.get('sorts');
        var filter = this.get('_filter');
        var sorts = this.get('sorting') || [];
        var items = (this.get('items') || []).slice(0);
        var columns = this.get('_columns' + '') || [];
        var flted, i;
        if (typeof filter === 'function') {
          flted = [];
          for (i = 0; i < items.length; i++) {
            if (filter(items[i])) flted.push(items[i]);
          }
          items = flted;
        }
        if (this.get('currentIndex' + '') >= items.length) this.set('currentIndex', items.length - 1);
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
      current: function() {
        var items = this.get('itemsView');
        var idx = this.get('currentIndex');
        if (typeof idx !== 'number') return null;
        return (items || [])[idx];
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
      tableRow: '',
      divRow: '',
      table: '',
      div: ''
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
        var tstr = '', dstr = '';
        for (var c = 0; c < arr.length; c++) {
          tstr += '<td on-dblclick=\'colDoubleClicked:[{{i}},' + c + ']\' class=\'{{columnClass(i)}}\'>{{' + arr[c].path + '}}</td>';
          dstr += '<div on-dblclick=\'colDoubleClicked:[{{i}},' + c + ']\' class=\'{{columnClass(i)}}\'>{{' + arr[c].path + '}}</div>';
        }
        this.partials.tableRow = tstr;
        this.partials.divRow = dstr;
        this.set('rendered', false);
        this.set('rendered', true);
        return arr;
      }
    },
    current: function(idx) {
      if (arguments.length === 0) return this.get('current')();
      var items = this.get('itemsView');
      if (idx < 0 || idx >= items.length) return;
      this.set('currentIndex', idx);
      var tbl = this.get('table');

      var n, p;
      if (tbl) {
        n = this.el.querySelector('tbody').children[idx];
        p = this.el;
      } else {
        n = this.el.querySelector('.rg-body').children[idx];
        if (n.style.overflow !== '') p = n;
        else p = this.el;
      }

      if (n.offsetTop < p.scrollTop) p.scrollTop = n.offsetTop;
      else if (n.offsetTop > p.scrollTop + p.clientHeight) p.scrollTop = (n.offsetTop - p.clientHeight / 2);
    },
    filter: function(fn) {
      this.set('_filter', fn);
      this.update('itemsView');
    }
  });

  module.exports = Grid;
})();
