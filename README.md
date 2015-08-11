DoMenu
========

Specialized version of Nestable plugin, for back-end hierahical menu creation.
Originally created for the Paperclip CMS.

### Demo
[doMenu v0.0.1](http://mechanicious.github.io/domenu/)

![](https://github.com/mechanicious/domenu/blob/gh-pages/domenu-0.0.1-gif.gif?raw=true)
### Quick API Reference
Access the public plugin (pPlugin) API with `$('#your-domenu-instance').domenu()`
```js
array getLists(params)
string parseJson(data, override)
string toJson()
pPlugin expandAll()
pPlugin collapseAll()
pPlugin expand(callback)
pPlugin collapse(callback)
array getListNodes()
```
### License & Credits 
Copyright © 2015 Mateusz Zawartka | BSD & MIT license

Built upon Nestable from [David Bushell](http://dbushell.com/)
