DoMenu
========

Specialized version of Nestable plugin, for back-end hierahical menu creation.
Originally created for the Paperclip CMS.

### Demo
[doMenu v0.0.1](http://mechanicious.github.io/domenu/)

### Quick API Reference
Access the public plugin (pPlugin) API with `$('#your-domenu-instance').domenu()`
```js
array getLists(params)
string parseJson(data, override)
string toJson()
pPlugin expandAll()
pPlugin collapseAll()
pPluginexpand(callback)
pPlugin collapse(callback)
array getListNodes()
```
### License & Credits 
Copyright © 2015 Mateusz Zawartka | BSD & MIT license
Build upon Nestable from (David Bushell)[http://dbushell.com/]
