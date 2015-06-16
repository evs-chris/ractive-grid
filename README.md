# Ractive Grid

A grid-like component built on [Ractive](https://github.com/ractivejs/ractive)

## Where to get it?

Racive Grid is available as a [giblet](https://github.com/evs-chris/gobble-giblet), a [component](https://github.com/componentjs/component), and a pre-assembled UMD module. Each flavor does not declare an explicit dependency on Ractive, but it is expected to be available as a global.

All of the pre-build files live in tags on the build branch.

### Development

Ractive Grid uses [gobble](https://github.com/gobblejs/gobble) as its build tool, which makes it easy to build and play around with. The default mode in the gobble file is `development`, which will automatically pull in the edge version of Ractive and make it available along with the sandbox. There is an example file provided along with the source, which you can access by running gobble and pointing you browser at http://localhost:4567/sandbox/example.html.

## Usage

Include the grid as a Ractive component and then add a component reference to it somewhere in your template. You can map the data in the grid to your base instance with the `items` attribute.

```html
<Grid items="{{myGridItems}}" />
```

By default, Grid will name your columns based on the keys of the objects in your items list. You can also supply a `columns` array containing objects with `label`, `path`, `class`, and `order` keys that specify the content of your grid columns and their header labels. You can also create button fields with a `{ type: 'button', action: function(item) { ... }, buttonLabel: 'Foo?', buttonClass: 'bar' }` single button or `{ buttons: [{ label: 'Foo?', class: 'bar', action: function(row, rowNum, colNum, btnNum, btn) { ... } }] }` multiple buttons.

Grid makes columns sortable by default. Clicking on a column header will toggle sorting for that column, and clicking again will switch the sort direction. Clicking a third time will remove any sorting. Multiple columns can participate in a sort if their headers are clicked while the `CTRL` key is held down.

Grid supplies an event handler for an input box to be used for navigation of the grid while the input is focused. The handler will cause the Grid to fire a selection event on `Enter` and will change the currently selected row with `Up` and `Down`.

## License

Copyright (c) 2014 Chris Reeves. Released under an [MIT license](https://github.com/evs-chris/ractive-window/blob/master/LICENSE.md).
