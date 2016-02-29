##doMenu
Specialized version of Nestable plugin, for back-end hierahical menu creation. 

#### Feedback
Are you having any suggestions, awesome ideas, or just would like to share what you think? Leave [Feedback](https://github.com/mechanicious/domenu/labels/feedback)!

#### Next ★ milestone 
Help us reach [★ 80](https://www.javascripting.com/submit) and get applied to the Javascripting family!

##Quick Overiew
- [Demo](http://mechanicious.github.io/domenu/)
- [Showcase](https://github.com/mechanicious/domenu#showcase)
- [Quick API Reference](https://github.com/mechanicious/domenu#quick-api-reference)
- [Options](https://github.com/mechanicious/domenu#options)
- [Tokens (beta)](https://github.com/mechanicious/domenu#tokens-beta-request-a-token)
- [Attributes](https://github.com/mechanicious/domenu#attributes)
- [New Features in v0.24.53](https://github.com/mechanicious/domenu#new-features-in-v02453)
- [Migrating from v0.13.29 to v0.24.53](https://github.com/mechanicious/domenu#migrating-from-v01329-to-v02453)
- [License & Credits](https://github.com/mechanicious/domenu#license--credits)

### Showcase
---
[![](https://raw.githubusercontent.com/mechanicious/domenu/gh-pages/jquery.domenu-0.24.53.gif)](http://mechanicious.github.io/domenu/)

Events at work of doMenu
[![](https://raw.githubusercontent.com/mechanicious/domenu/gh-pages/do-menu-events.gif)](http://mechanicious.github.io/domenu/)

One of the upcoming themes for doMenu.
![](https://raw.githubusercontent.com/mechanicious/domenu/gh-pages/domenu-flat-gass-preview.gif)

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
pPlugin onItemAddChildItem(callback)
object getPluginOptions()
```

### Options
---
```js
// Selectors used in your HTML blueprint template
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
itemAddBtnClass:        'item-add',
removeBtnClass:         'item-remove',
endEditBtnClass:        'end-edit',
addBtnClass:            'dd-new-item',
editBoxClass:           'dd-edit-box',
inputSelector:          'input, select, textarea',
// If you need add button to be outside the default doMenu DOM, use a global add button selector 
addBtnSelector:         '',
expandBtnHTML:          '<button data-action="expand"   type="button">+</button>',
collapseBtnHTML:        '<button data-action="collapse" type="button">-</button>',
// The JSON data to build a menu list with, see toJson()
data:                   '',
slideAnimationDuration: 0,
group:                  0,
// Amount of parents(=an item containg a child) an item can contain
maxDepth:               20,
// Treshold for snapping when dragging an item 
threshold:              20,
// Amount of ms to wait on a confirmation(=second click) from an user to remove an item
refuseConfirmDelay:     2000,
// Bags for event handlers
onToJson:               [],
onParseJson:            [],
onDomenuInitialized:    [],
onSaveEditBoxInput:     [],
onItemDrag:             [],
onItemAddChildItem:     [],
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
Use tokens inside of your `data-placeholder` and `data-default-value` [attributes](https://github.com/mechanicious/domenu#attributes) of your `input`. E.g.
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
- `data-default-value` the value of this attribute will be used by `toJson` as a default `value` when no user supplied `value` is present

### New Features in v0.24.53
---
- List-item controls (add and remove)
- Confirm removing a list-item
- Global add new list-item button selector (see addBtnSelector option)
- Parent adds a child event (see onItemAddChildItem option)
- End edit by pressing the pencil icon (default) (see endEditBtnClass option)
- Pseudo-randomness generation improvements
- Fix custom field value retain [#5](https://github.com/mechanicious/domenu/issues/5)
- Fix item duplication in JSON output [#4](https://github.com/mechanicious/domenu/issues/4)

### v0.13.37
---
- Fix autofill inputs see [#3](https://github.com/mechanicious/domenu/issues/3)

### New Features in v0.13.29
---
- Dynamic inputs – you can add your own `input` `select` and `textarea` fields of any kind; doMenu will handle them all
- Tokens and new supported attributes for `data-placeholder` and `data-default-value`
- Lazy event bindings – higher performance
- Lots of new event listeners and few new options as well as few new methods e.g. `getPluginOptions`
- Source code improvements for developers

[for more technical information see the dev branch...](https://github.com/mechanicious/domenu/tree/dev)

### Migrating from v0.13.29 to v0.24.53
---
Your blueprint html template will need customization (see comments in the index.html file)

**For information about migrating from earlier versions see the corresponding branch**


### License & Credits 
---
Copyright © 2015 Mateusz Zawartka | BSD & MIT license

Built upon Nestable from [David Bushell](http://dbushell.com/)
