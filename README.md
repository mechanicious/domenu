##doMenu
Specialized version of Nestable plugin, for back-end hierahical menu creation.
Originally created for Paperclip CMS.

##Quick Overiew
- [Demo](https://github.com/mechanicious/domenu/#Demo)
- [Quick API Reference](https://github.com/mechanicious/domenu/#Quick API Reference)
- [Options](https://github.com/mechanicious/domenu/#Options)
- [Tokens (beta)](https://github.com/mechanicious/domenu/#Tokens (beta))
- [Attributes](https://github.com/mechanicious/domenu/#Attributes)
- [New Features in v0.13.29](https://github.com/mechanicious/domenu/#New Features in v0.13.29)
- [Migrating from v0.0.1 to v0.13.19](https://github.com/mechanicious/domenu/#Migrating from v0.0.1 to v0.13.19)
- [License & Credits](https://github.com/mechanicious/domenu/#License & Credits)

### Demo
---
[doMenu v0.13.29](http://mechanicious.github.io/domenu/)

[![](https://github.com/mechanicious/domenu/blob/gh-pages/domenu-0.0.1-gif.gif?raw=true)](http://mechanicious.github.io/domenu/)
[![](https://raw.githubusercontent.com/mechanicious/domenu/gh-pages/do-menu-events.gif)](http://mechanicious.github.io/domenu/)


### Quick API Reference
---
Access the public plugin (pPlugin) API with `$('#your-domenu-instance').domenu()`
```js
array getLists([params])
string parseJson(string data[, bool override = false])
string toJson()
pPlugin expandAll()
pPlugin collapseAll()
pPlugin expand([function callback([item])])
pPlugin collapse([function callback([item])])
array getListNodes()
pPlugin onParseJson(callback)
pPlugin onToJson(callback)
pPlugin onSaveEditBoxInput(callback)
pPlugin onItemDrag(callback)
pPlugin onItemDrop(callback)
pPlugin onItemAdded(callback)
pPlugin onItemRemoved(callback)
pPlugin onItemStartEdit(callback)
pPlugin onItemEndEdit(callback)
object getPluginOptions()
```

### Options
---
```js
listNodeName:           'ol',
itemNodeName:           'li',
rootClass:              'dd',
listClass:              'dd-list',
itemClass:              'dd-item',
itemBlueprintClass:     'dd-item-blueprint',
dragClass:              'dd-dragel',
handleClass:            'dd-handle',
collapsedClass:         'dd-collapsed',
placeClass:             'dd-placeholder',
noDragClass:            'dd-nodrag',
emptyClass:             'dd-empty',
contentClass:           'dd3-content',
removeBtnClass:         'item-remove',
addBtnClass:            'dd-new-item',
editBoxClass:           'dd-edit-box',
inputSelector:          'input, select, textarea',
expandBtnHTML:          '<button data-action="expand"   type="button">+</button>',
collapseBtnHTML:        '<button data-action="collapse" type="button">-</button>',
editBtnHTML:            '<button data-action="edit"     type="button">edit</button>',
data:                   '',
slideAnimationDuration: 0,
group:                  0,
maxDepth:               20,
threshold:              20,
onToJson:               [],
onParseJson:            [],
onDomenuInitialized:    [],
onSaveEditBoxInput:     [],
onItemDrag:             [],
onItemDrop:             [],
onItemAdded:            [],
onItemExpand:           [],
onItemCollapse:         [],
onItemRemoved:          [],
onItemStartEdit:        [],
onItemEndEdit:          []
```


### Tokens (beta) [request a token](https://github.com/mechanicious/domenu/labels/token-request)
---
Use tokens inside of your `data-placeholder` and `data-default-value` attributes of your `input`. E.g.
```html
 <input type="text" name="title" placeholder="Item" data-placeholder="Item {?numeric.increment}" data-default-value="Item {?numeric.increment}">
```
---
- `{?date.gregorian-slashed-DMY}` current date in gregorian DMY format
- `{?date.mysql-datetime}` valid MySQL datetime format
- `{?numeric.increment}` increments itself and outputs a number
- `{?value}` current value of the input

### Attributes
---
- `data-placeholder` works like the `placeholder` attribute but has a higher priority and supports `Tokens`
- `data-default-value` the value of this attribute will be use by `toJson` as a default `value` when no use supplied `value` is present

### New Features in v0.13.29
---
- Dynamic inputs – you can add your own `input` `select` and `textarea` fields of any kind; doMenu will handle them all
- Tokens and new supported attributes for `data-placeholder` and `data-default-value`
- Lazy event bindings – higher performance
- Lots of new event listeners and few new options as well as few new methods e.g. `getPluginOptions`
- Source code improvements for developers

[for more technical information see the dev branch...](https://github.com/mechanicious/domenu/tree/dev)

### Migrating from v0.0.1 to v0.13.19
---
Just replace your old plugin files with v0.13.29 plugin files; and enjoy the new features!

### License & Credits 
---
Copyright © 2015 Mateusz Zawartka | BSD & MIT license

Built upon Nestable from [David Bushell](http://dbushell.com/)
