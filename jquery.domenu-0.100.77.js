/**
 * @license Copyright © 2016 Mateusz Zawartka
 * @version 0.100.77
 * MIT license
 */

;
(function ($, window, document, undefined) {
  var hasTouch = 'ontouchstart' in document;

  /**
   * Add a dot at the beginning of a string
   * @returns {string}
   */
  String.prototype.dot = function () {
    return '.' + this;
  };

  /**
   * For each chunk prepend the current string
   * @param chunk
   * @param knife
   * @param innerGlue
   * @param outerGlue
   * @returns {string}
   */
  String.prototype.eachHas = function (chunk, knife, innerGlue, outerGlue) {
    var subject   = this,
        opt       = [],
        knife     = knife || ', ',
        innerGlue = innerGlue || ' ',
        outerGlue = outerGlue || knife,
        chunks    = chunk.split(knife);

    chunks.forEach(function (chunk, c) {
      opt.push(subject + innerGlue + chunk);
    });

    return opt.join(outerGlue);
  };

  /**
   * Pad a string with a specified value, till a min length has been reached
   * @param val
   * @param minLength
   * @returns {String}
   */
  String.prototype.padLength = function (val, minLength) {
    var subject = this;
    while (subject.length < minLength) {
      subject = val + subject;
    }
    return subject;
  };

  /**
   * Join a sibling string by a delimiter
   * @param sibling
   * @param delimiter
   * @returns {string}
   */
  String.prototype.join = function (sibling, delimiter) {
    var delimiter = typeof delimiter === 'string' ? delimiter : " ";
    return this + delimiter + sibling;
  };

  Function.prototype.setName = function (name) {
    Object.defineProperty(this, 'name', {
      get: function () {
        return name;
      }
    });
    return this;
  };

  Function.prototype.clone = function () {
    var newfun = new Function('return ' + this.toString())();
    for (var key in this)
      newfun[key] = this[key];
    return newfun;
  };


  /**
   * Detect CSS pointer-events property
   * events are normally disabled on the dragging element to avoid conflicts
   * https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
   */
  var hasPointerEvents = (function () {
    var el    = document.createElement('div'),
        docEl = document.documentElement;
    if (!('pointerEvents' in el.style)) {
      return false;
    }
    el.style.pointerEvents = 'auto';
    el.style.pointerEvents = 'x';
    docEl.appendChild(el);
    var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
    docEl.removeChild(el);
    return !!supports;
  })();

  /**
   * @version-control +0.1.0 slide animation duration option, default is 0
   * @version-control +0.0.1 max depth default set to 20
   * @dev-since 0.13.29
   * @version-control +0.1.0 option endItemEditBtnClass
   * @version-control +0.1.0 option itemAddBtnClass
   * @version-control +0.1.0 option refuseConfirmDelay (ms), default is 2000ms
   * @version-control +0.1.0 option addBtnSelector
   * @dev-since 0.48.53
   * @version-control +0.5.0 enhancement setup expandBtnHTML, collapseBtnHTML and editBtnHTML in your HTML markup #21
   * @version-control +0.1.0 option expandBtnClass
   * @version-control +0.1.0 option collapseBtnClass
   * @version-control +0.1.0 option event
   * @version-control +0.5.0 deprecated option onItemExpand
   * @version-control +0.5.0 deprecated option onItemCollapse
   * @version-control +0.1.0 option onItemExpanded
   * @version-control +0.1.0 option onItemCollapsed
   * @version-control +0.1.0 option paramsDataKey
   * @version-control +0.0.0 fix commenting typos
   * @dev-since 0.87.53
   * @version-control +0.1.0 deprecated option group (see option allowListMerging)
   * @version-control +0.1.0 option onItemMaxDepth
   * @version-control +0.1.0 option onItemSetParent
   * @version-control +0.1.0 option onItemUnsetParent
   */
  var defaults = {
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
    noDragClass:            'dd-nodrag', // Items with this class will be undraggable
    emptyClass:             'dd-empty',
    contentClass:           'dd3-content',
    itemAddBtnClass:        'item-add',
    removeBtnClass:         'item-remove',
    itemRemoveBtnConfirmClass: 'confirm-class',
    addBtnSelector:         '', // Provide a global selector for an add button
    addBtnClass:            'dd-new-item',
    editBoxClass:           'dd-edit-box',
    inputSelector:          'input, select, textarea', // Selects input fields to serialize to JSON
    collapseBtnClass:       'collapse',
    expandBtnClass:         'expand',
    endEditBtnClass:        'end-edit',
    itemBtnContainerClass:  'dd-button-container',
    itemNameClass:          'item-name',
    data:                   '', // JSON data to build an instance from (don't forget to call parseJson)
    allowListMerging:       false,   // Accept incoming items from foreign lists e.g:
                                    // true – accept all
                                    // false – deny all
                                    // ['domenu-2'] – accept from instances matching #domenu-2
    select2:                {

      support:     false, // Enable Select2 support
      selectWidth: '45%', // Any CSS-supported value is valid
      params:      {}     // Provide Select2 params
    },
    slideAnimationDuration: 0,
    maxDepth:               5,    // Item nesting limit
    threshold:              15,   // Dragging sensitivity
    refuseConfirmDelay:     2000, // Time (in ms) to wait on confirmation of an item removal
    newItemFadeIn:          350,  // Set 0 for no fadeIn effect
    event:                  {
      onToJson:           [],
      onParseJson:        [],
      onSaveEditBoxInput: [],
      onItemDrag:         [],
      onItemAddChildItem: [],
      onItemDrop:         [],
      onItemAdded:        [],
      onItemExpanded:     [],
      onItemCollapsed:    [],
      onItemRemoved:      [],
      onItemStartEdit:    [],
      onItemEndEdit:      [],
      onCreateItem:       [],
      onItemMaxDepth:     [],
      onItemSetParent:    [],
      onItemUnsetParent:  []
    },
    paramsDataKey:          '__domenu_params' // The property under which internal settings will be serialized
  };

  /**
   * @dev-since 0.48.53
   * @version-control +0.0.0 prevent event overlapping with deep clone
   * @param element
   * @param options
   * @constructor
   */
  function Plugin(element, options) {
    // After $(...).domenu() is called 1:
    this.w = $(document);
    this.$instance = $(element);
    this.options = $.extend(true, {}, defaults, options);
    // 2:
    this.init();
  }

  Plugin.prototype = {

    init:                             function () {
      // Plugin {w: m.fn.init[1], $instance: m.fn.init[1], options: Object, mouse: Object, isTouch: false…}
      var plugin = this,
          opt    = this.options;

      plugin.reset();

      plugin.$placeholder = $('<div class="' + plugin.options.placeClass + '"/>');

      // forEach itemNodeName=li element
      $.each(this.$instance.find(plugin.options.itemNodeName), function (k, el) {
        // pass the li element
        // If an element is a parent then it contains another li elements
        // and can be collapsed and expanded
        plugin.setParent($(el));
      });

      plugin.$instance.on('click', 'button', function (e) {
        // Don't do anything when dragging
        if (plugin.$dragItem) {
          return;
        }
        var target = $(e.currentTarget),
            action = target.data('action'),
            item   = target.parent(plugin.options.itemNodeName);
        // Some internal click handlers communicating through
        // jQuery object data
        if (action === 'collapse') {
          plugin.collapseItem(item);
        }

        if (action === 'expand') {
          plugin.expandItem(item);
        }
      });

      // Declaring some custom event handlers
      var onStartEvent = function (e) {
            var handle = $(e.target);

            // Identify if the object is draggable
            if (!handle.hasClass(plugin.options.handleClass)) {
              if (handle.closest(plugin.options.noDragClass.dot()).length) {
                return;
              }
              handle = handle.closest(plugin.options.handleClass.dot());
            }

            // If the element is not draggable, or is while dragging
            // then don't do anything
            if (!handle.length || plugin.$dragItem) return;

            // Same here making sure if the object can be draggeds
            plugin.isTouch = /^touch/.test(e.type);
            if (plugin.isTouch && e.touches.length !== 1) {
              return;
            }

            // Don't do whatever browsers do by default
            e.preventDefault();
            // At this point object is identified as available to drag
            // so start dragging
            plugin.dragStart(e.touches ? e.touches[0] : e);
          },

          onMoveEvent  = function (e) {
            if (plugin.$dragItem) {
              e.preventDefault();
              plugin.dragMove(e.touches ? e.touches[0] : e);
            }
          },

          onEndEvent   = function (e) {
            if (plugin.$dragItem) {
              e.preventDefault();
              plugin.dragStop(e.touches ? e.touches[0] : e);
            }
          };

      // If thouch events are avialable, start listening for those events
      if (hasTouch) {
        plugin.$instance[0].addEventListener('touchstart', onStartEvent, false);
        window.addEventListener('touchmove', onMoveEvent, false);
        window.addEventListener('touchend', onEndEvent, false);
        window.addEventListener('touchcancel', onEndEvent, false);
      }

      // Start listening for the events below
      plugin.$instance.on('mousedown', onStartEvent);
      // list.w = $(document)
      plugin.w.on('mousemove', onMoveEvent);
      plugin.w.on('mouseup', onEndEvent);

      // @dev-since 0.13.29
      // @version-control +0.1.0 support global add button selector
      if (opt.addBtnSelector) this.addNewListItemListener($(opt.addBtnSelector));
      else this.addNewListItemListener(this.$instance.find(opt.addBtnClass.dot()));
    },
    /**
     * @dev-since 0.13.29
     * @version-control +0.1.0 default add button removed
     * @dev-since 0.48.53
     * @version-control +0.1.0 fix onItemAdded event for addNewListItemListener
     * @version-control +0.5.0 enhancement remember items folding (collapse state)
     * @param addBtn
     * @param parent
     */
    addNewListItemListener:           function (addBtn, parent) {
      var _this = this,
          opt   = this.options;
      addBtn.on('click', function (e) {
        var list = _this.$instance.find(opt.listClass.dot()).first(),
            item = _this.createNewListItem();
        if (!item) return;


        item.css('display', 'none');
        list.prepend(item);
        item.fadeIn(opt.newItemFadeIn);

        // Call item addition event listeners
        _this.options.event.onItemAdded.forEach(function (cb, i) {
          cb($(item), e);
        });
      });
    },
    /**
     * @dev-since 0.13.29
     * @version-control +0.0.5 support end edit on click
     * @param event
     */
    clickEndEditEventHandler:         function (item) {
      var _this      = this,
          opt        = _this.options,
          endEditBtn = item.find(opt.endEditBtnClass.dot()).first();

      endEditBtn.on('click', null, {forced: true}, _this.keypressEnterEndEditEventHandler.bind(_this));
    },
    /**
     * @version-control +0.0.1 lazy keypressEnterEndEditEventHandler binding
     * @version-control +0.0.1 prevent slide animation bubbling
     * @version-control +0.0.2 slide animation duration support
     */
    clickStartEditEventHandler:       function (event) {
      var opt          = this.options,
          _this        = this,
          item         = $(event.target).parents(opt.itemClass.dot()).first(),
          spn          = item.find(opt.itemNameClass.dot()).first(),
          firstInput   = item.find(opt.inputSelector).first(),
          btnContainer = item.find(opt.itemBtnContainerClass.dot()).first(),
          edtBox       = item.find(opt.editBoxClass.dot()).first();

      var igniteKeypressEnterEndEditEventHandler = function (el) {
        el.each(function (c, item) {
          var item                             = $(item),
              keypressEnterEndEditEventHandler = _this.keypressEnterEndEditEventHandler;

          if (item.data('domenu_keypressEnterEndEditEventHandler')) return;

          item.data('domenu_keypressEnterEndEditEventHandler', true);

          item.on('keypress', keypressEnterEndEditEventHandler.bind(_this));
        });
      };


      // Setup on click endEdit event listener
      if (item.data('domenu_clickEndEditEventHandler') !== true) {
        _this.clickEndEditEventHandler(item);
        item.data('domenu_clickEndEditEventHandler', true);
      }

      // Hide the span
      spn.stop().hide(opt.slideAnimationDuration, function () {

        // Use either the default title or the user specified title as the value for the input
        if (firstInput.get(0).nodeName !== 'SELECT')
          firstInput.val(spn.text());
        else firstInput.val(firstInput.find('option:contains(' + spn.text() + ')').val());


        // Hide the remove button
        btnContainer.stop().hide(opt.slideAnimationDuration, function () {
          // Show the edit panel
          edtBox.stop().show(opt.slideAnimationDuration, function () {
            edtBox.children().first('input').select().focus();
            // Be ready to close the edit mode
            igniteKeypressEnterEndEditEventHandler(item);
          });
        });
      });

      // Call start edit event listeners
      opt.event.onItemStartEdit.forEach(function (cb, i) {
        cb(item, event);
      });
    },
    /**
     * @version-control +0.1.0 support default value tokens and placeholder tokens
     * @param token
     * @param input
     * @returns {*}
     */
    resolveToken:                     function (token, input) {
      if (typeof token !== "string") return;

      var out       = token,
          tagRegex  = /\{\?[a-z\-\.]+\}/ig,
          tags      = out.match(tagRegex),
          tagsCount = tags && tags.length || 0;

      // As long as there are tags available
      for (var currentTag = 0; currentTag < tagsCount; currentTag++) {

        // Process each tag and replace it it in the output string
        switch (tags[currentTag]) {
          case "{?date.gregorian-slashed-DMY}":
            var dateTime = new Date(Date.now()),
                date     = dateTime.getDay().toString().padLength('0', 2) + '/' +
                  dateTime.getMonth().toString().padLength('0', 2) + '/' +
                  dateTime.getFullYear();

            out = out.replace(tags[currentTag], date);
            break;

          case "{?date.mysql-datetime}":
            var date = new Date(Date.now());
            date = date.getUTCFullYear() + '-' +
              ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
              ('00' + date.getUTCDate()).slice(-2) + ' ' +
              ('00' + date.getUTCHours()).slice(-2) + ':' +
              ('00' + date.getUTCMinutes()).slice(-2) + ':' +
              ('00' + date.getUTCSeconds()).slice(-2);
            out = out.replace(tags[currentTag], date);
            break;

          case "{?numeric.increment}":
            // We begin with 1 - evaluate to true on check..
            this.incrementIncrement = this.incrementIncrement || 1;
            out = out.replace(tags[currentTag], this.incrementIncrement);
            this.incrementIncrement += 1;
            break;

          case "{?value}":
            out = out.replace(tags[currentTag], input.value);
            break;

          default:
            out = token;
            break;
        }
      }

      return out;
    },
    /**
     * @version-control +0.0.1 shared way to save input state
     * @version-control +0.0.5 tokens support
     * @param inputCollection jQuery Selection
     */
    saveEditBoxInput:                 function (inputCollection) {
      var _this = this,
          opt   = this.options,
          $item;

      inputCollection.each(function (c, input) {
        var itemDataValue     = $(input).parents(opt.itemClass.dot().join(',').join(opt.itemBlueprintClass.dot())).first().data(input.getAttribute('name')),
            inputDefaultValue = $(input).data('default-value') || '';
        $item = $(input).parents(opt.itemClass.dot()).first();
        if (!(itemDataValue || input.value)) var tokenizedDefault = _this.resolveToken(inputDefaultValue, $(input));
        $item.data(input.getAttribute('name'), $(input).val() || itemDataValue || tokenizedDefault);
      });

      // Call on save edit box event listeners
      opt.event.onSaveEditBoxInput.forEach(function (cb, i) {
        cb($item, inputCollection);
      });
    },
    /**
     * @version-control +0.1.0 dynamic inputs
     * @version-control +0.0.1 prevent slide bubbling
     * @version-control +0.0.2 slide animation duration support
     * @dev-since 0.13.29
     * @version-control +0.0.1 removeBtn first
     * @version-control +0.0.2 support add button
     * @param event
     */
    keypressEnterEndEditEventHandler: function (event) {
      var _this           = this,
          opt             = this.options,
          item            = $(event.target).parents(opt.itemClass.dot()).first(),
          edtBox          = item.find(opt.editBoxClass.dot()).first(),
          inputCollection = item.find(opt.inputSelector),
          spn             = item.find('span').first(),
          btnContainer    = item.find(opt.itemBtnContainerClass.dot()).first();

      // Listen only to the Enter key, unless you'll forced otherwise
      if (event.keyCode !== 13 && !(event.data && event.data.forced && event.data.forced === true)) return;

      // Set title
      _this.determineAndSetItemTitle(item);

      // Don't leave empty strings
      if (spn.text() === '') spn.text(_this.determineAndSetItemTitle(item));

      // Hide the edit box
      edtBox.stop().slideUp(opt.slideAnimationDuration, function () {

        // Save inputs
        _this.saveEditBoxInput(inputCollection);

        // Show the button container
        btnContainer.attr('style', '');

        // Call end edit event listeners
        opt.event.onItemEndEdit.forEach(function (cb, i) {
          cb($(item), event);
        });

        // Show the span content
        spn.stop().slideDown(opt.slideAnimationDuration);
      });


    },
    resolveInputDataEntryByName:      function (name) {
      var item = this.$instance
      opt = this.options,

        item.find(opt.editBoxClass.dot().join(opt.inputSelector)).each(function (i, input) {
          if (input.getAttribute('name') === name) return $(input).data('name');
        })
    },
    setItemTitle:                     function (item, title) {
      var _this = this,
          opt   = this.options;
      item.find(opt.contentClass.dot().join('span')).first().text(title);
    },
    determineAndSetItemTitle:         function (item) {
      var _this                                 = this,
          opt                                   = this.options,
          firstInput                            = item.find(opt.inputSelector).first(),
          firstInputText                        = firstInput.find('option:selected').first().text() || firstInput.text(),
          firstInputValue                       = item.find(opt.editBoxClass.dot().eachHas(opt.inputSelector)).first().val(),
          itemDataValue                         = item.data(item.find(opt.inputSelector).first().attr('name')),
          firstEditBoxInputPlaceholderValue     = item.find(opt.editBoxClass.dot().eachHas(opt.inputSelector)).first().attr('placeholder'),
          firstEditBoxInputDataPlaceholderValue = item.find(opt.editBoxClass.dot().eachHas(opt.inputSelector)).first().data('placeholder'),
          choice                                = firstInputText || firstInputValue || itemDataValue || _this.resolveToken(firstEditBoxInputDataPlaceholderValue) || firstEditBoxInputPlaceholderValue;

      item.find(opt.contentClass.dot().join('span')).first().text(choice);
    },
    /**
     * @version-control +0.0.4 fix fill inputs with placeholders #3
     * @version-control +0.1.0 fix populate inputs with values whenever possible #5
     * @dev-since 0.24.53
     * @version-control +0.5.0 feature create missing options
     * @param item
     * @param inputCollection
     */
    setInputCollectionPlaceholders:   function (item, inputCollection) {
      var _this = this;
      $(inputCollection).each(function (c, input) {
        if (input.nodeName === 'SELECT') {
          $(input).find('option[selected="selected"]').removeAttr('selected');
          var selectedOption = $(input).find('option[value="' + item.data($(input).attr('name')) + '"]');
          if (selectedOption.length !== 0) selectedOption.attr('selected', 'selected');
          else if (item.data($(input).attr('name'))) $(input).append('<option value="' + item.data($(input).attr('name')) + '">' + item.data($(input).attr('name')) + '</option>');
          else return;
        }
        // Set the placeholder value of the input
        $(input).attr('placeholder', _this.resolveToken($(input).data('placeholder'), $(input)) || $(input).attr('placeholder'));
        // And set the value of the input
        $(input).val(item.data($(input).attr('name')));
      });
    },
    /**
     * @version-control +0.0.5 support dynamic inputs
     * @version-control +0.0.5 support tokenization
     * @version-control +0.0.2 support dyanmic titles
     * @dev-since 0.13.29
     * @version-control +0.1.0 feature confirm item deletion
     * @version-control +0.1.0 feature add a child item
     * @version-control +0.0.1 support itemAddChildItem onItemAdded events
     * @dev-since 0.48.53
     * @version-control +0.5.0 feature mixing instances items (data) together
     * @param data
     * @returns {*}
     */
    createNewListItem:                function (data) {
      var _this           = this,
          el              = this.$instance,
          opt             = this.options,
          blueprint       = el.find(opt.itemBlueprintClass.dot()).first().clone(),
          inputCollection = blueprint.find(opt.editBoxClass.dot()).find(opt.inputSelector);

      /**
       * @dev-since 0.13.29
       * @version-control +0.1.0 fix ghost parent elements
       * @dev-since 0.24.53
       * @version-control +0.1.0 fix onItemRemoved event listener
       * @dev-since 0.99.77
       * @version-control +0.1.0 feature added id as second argument to the callback
       */
      blueprint.remove = function () {
        var parent = blueprint.parents(_this.options.itemClass.dot()).first();
        var id = blueprint.data("id");

        jQuery(this).remove();
        _this.unsetEmptyParent(parent);
        jQuery.each(opt.event.onItemRemoved, function (i, cb) {
          cb(blueprint, id);
        });
      };

      blueprint.setParameter = function (key, value) {
        blueprint.data(opt.paramsDataKey, $.extend(true, blueprint.data(opt.paramsDataKey), {key: value}));
      };

      blueprint.getParameter = function (key) {
        return blueprint.data(key);
      };

      // Use user supplied JSON data to fill the data fields
      $.each(data || {}, function (key, value) {
        blueprint.data(key, value);
      });


      /**
       * @dev-since 0.87.53
       * @version-control +0.0.5 fix item id #19
       */
      blueprint.data('id', blueprint.data('id') || _this.getHighestId() + 1);

      // Set the item-class
      /*
       * @dev-since 0.48.53
       * @version-control +0.1.0 feature inherit blueprint's HTML user-set classes #21
       */
      var currentBlueprintClass = blueprint.attr('class'),
          blueprintClass        = opt.itemClass + currentBlueprintClass.replace(opt.itemBlueprintClass, '');
      blueprint.attr('class', blueprintClass);

      // Set intial input values (needed on deserialization)
      this.setInputCollectionPlaceholders(blueprint, inputCollection);

      // Save input state
      this.saveEditBoxInput(inputCollection);

      // Set title
      this.determineAndSetItemTitle(blueprint);

      // Parse tokens etc..
      this.setInputCollectionPlaceholders(inputCollection);

      // Set the remove button click event handler
      blueprint.find(opt.removeBtnClass.dot()).first().on('click', function (e) {
        var rmvBtn       = $(this),
            confirmClass = rmvBtn.data(opt.itemRemoveBtnConfirmClass);

        // When there is a confirmation class...
        if (confirmClass) {

          // And that class has been already applied to the item, then just remove the item
          if (rmvBtn.hasClass(confirmClass)) blueprint.remove();

          // If the confirmation class hasn't been yet applied to the item, then apply the class...
          else {
            rmvBtn.addClass(confirmClass);

            // but only for a limited amount of time
            var revertAddClass = setTimeout(function () {
              rmvBtn.removeClass(confirmClass);
            }, opt.refuseConfirmDelay);
          }

          // When there is no confirmation class just remove the item
        } else {
          blueprint.remove();

          // Call item remove event listeners
          opt.event.onItemRemoved.forEach(function (cb, i) {
            cb(blueprint, e);
          });
        }
      });

      // Set the add button click event handler
      blueprint.find(opt.itemAddBtnClass.dot()).first().on('click', function (event) {
        _this.itemAddChildItem(blueprint);

        // Call item addition event listeners
        opt.event.onItemAdded.forEach(function (cb, i) {
          cb(blueprint, event);
        });

        // Call item add child item event listeners
        opt.event.onItemAddChildItem.forEach(function (cb, i) {
          cb(blueprint, event);
        });
      });

      // Setup editing; on every mouse click clickStartEditEventHandler will be called
      blueprint.find('span').first().get(0).addEventListener('click', _this.clickStartEditEventHandler.bind(this));

      if (_this.options.select2.support) {
        blueprint.find('select').css('width', _this.options.select2.selectWidth);
        blueprint.find('select').select2(_this.options.select2.params);
      }

      blueprint.data(opt.paramsDataKey, blueprint.data(opt.paramsDataKey) || {});

      // Call onCreateItem event listeners
      opt.event.onCreateItem.forEach(function (cb, i) {
        var callbackResponse = cb(blueprint, blueprint.data());
        blueprint = typeof  callbackResponse === "undefined" ? blueprint : callbackResponse;
      });

      // Give back a ready itemClass element
      return blueprint;
    },
    /**
     * @dev-since 0.87.53
     * @version-control +0.0.1 fix max depth item add child item
     * @version-control +0.0.3 fix stuck last child item
     */
    itemAddChildItem:                 function ($parentElement) {
      var _this    = this,
          opt      = _this.options,
          listElement,
          $newItem = _this.createNewListItem();

      if (!$newItem) return;
      else if ($parentElement.parents(opt.listClass.dot()).length > opt.maxDepth) {
        var $addButton = $parentElement.find(opt.itemAddBtnClass.dot());
        $addButton.addClass(opt.removeBtnClass);

        setTimeout(function() {
          $addButton.removeClass(opt.removeBtnClass);
        }, opt.refuseConfirmDelay);

        opt.event.onItemMaxDepth.forEach(function (cb, i) {
          cb();
        });
        return;
      }

      if ($parentElement.children(opt.listClass.dot()).length) $parentElement.children(opt.listClass.dot()).first().append($newItem);
      else {
        listElement = $('<' + opt.listNodeName + '/>').addClass(opt.listClass);
        listElement.append($newItem);
        $parentElement.append(listElement);
      }
      _this.setParent($parentElement);
    },
    getHighestId:                     function () {
      var opt = this.options,
          el  = this.$instance,
          id  = 0;

      el.find(opt.itemNodeName).each(function (i, e) {
        var eId = $(e).data('id');
        if (eId > id) return id = eId;
      });

      return id;
    },
    /**
     * @version-control +0.0.2 itemClass li prefix support
     * @returns {*}
     */
    serialize:                        function () {
      // Call toJson event listeners
      this.options.event.onToJson.forEach(function (cb, i) {
        cb();
      });

      var data,
          depth = 0,
          list  = this;
      step = function (level, depth) {
        var array = [],
            items = level.children(list.options.itemNodeName);
        items.each(function () {
          var li           = $(this),
              sub          = li.children(list.options.listNodeName),
              filteredData = {};

          // Filter out domenu_ prefixed data values
          $.each(li.data(), function (key, i) {

            // Skip when the prefix is present
            if (key.indexOf('domenu_') === 0) return;

            // Include the value if not skipped
            filteredData[key] = li.data(key);
          });

          var item = $.extend({}, filteredData);

          if (sub.length) {
            item.children = step(sub, depth + 1);
          }

          array.push(item);
        });
        return array;
      };
      data = step(list.$instance.find(list.options.listNodeName).first(), depth);
      return data;
    },
    deserialize:                      function (data, override) {
      var data  = JSON.parse(data) || JSON.parse(this.options.data),
          _this = this,
          opt   = this.options,
          list  = _this.$instance.find(opt.listClass.dot()).first();

      if (override) list.children().remove();

      var processItem = function (i, pref) {
        if (i.children) {
          var cref = $('<ol class="' + opt.listClass + '"></ol>'),
              item = _this.createNewListItem(i);

          if (!item) return;

          pref.append(item);
          item.append(cref);
          _this.setParent(item, true);
          jQuery.each(i.children, function (i, e) {
            processItem(e, cref);
          })
        } else {
          var item = _this.createNewListItem(i);

          if (!item) return;

          pref.append(item);
        }
      }

      jQuery.each(data, function (i, e) {
        processItem(e, list);
      })

      _this.$instance.find(_this.options.itemClass.dot()).each(function (i, item) {
        if ($(item).data(_this.options.paramsDataKey).collapsed) _this.collapseItem($(item));
      });

      // Call start edit event listeners
      this.options.event.onParseJson.forEach(function (cb, i) {
        cb();
      });
    },
    serialise:                        function () {
      return this.serialize();
    },

    reset: function () {
      this.mouse = {
        offsetX:                0,
        offsetY:                0,
        startX:                 0,
        startY:                 0,
        lastX:                  0,
        lastY:                  0,
        nowX:                   0,
        nowY:                   0,
        lastCurrentDistXChange: 0,
        lastCurrentDistYChange: 0,
        isMovingOnXAxis:        null,
        dirX:                   0,
        dirY:                   0,
        lastDirX:               0,
        lastDirY:               0,
        distAxX:                0,
        distAxY:                0,
        distXtotal:             0,
        distYtotal:             0
      };
      this.isTouch = false;
      this.moving = false;
      this.$dragItem = null;
      this.dragRootEl = null;
      this.dragDepth = 0;
      this.hasNewRoot = false;
      this.$pointEl = null;
    },

    expandItem: function ($item) {
      $item.removeClass(this.options.collapsedClass);
      $item.children(this.options.listClass.dot()).children(this.options.itemClass.dot()).show();
      $item.children(this.options.expandBtnClass.dot()).hide();
      $item.children(this.options.collapseBtnClass.dot()).show();
      $item.data(this.options.paramsDataKey, $.extend(true, $item.data(this.options.paramsDataKey), {collapsed: false}));

      // Call start edit event listeners
      this.options.event.onItemExpanded.forEach(function (cb, i) {
        cb($item);
      });
    },

    collapseItem: function ($item) {
      $item.addClass(this.options.collapsedClass);
      $item.children(this.options.listClass.dot()).children(this.options.itemClass.dot()).hide();
      $item.children(this.options.collapseBtnClass.dot()).hide();
      $item.children(this.options.expandBtnClass.dot()).show();
      $item.data(this.options.paramsDataKey, $.extend(true, $item.data(this.options.paramsDataKey), {collapsed: true}));

      // Call start edit event listeners
      this.options.event.onItemCollapsed.forEach(function (cb, i) {
        cb($item);
      });
    },

    expandAll:                          function (cb) {
      var list            = this,
          recursiveExpand = function ($item) {
            if (!cb || !cb($item)) return;
            list.expandItem($item);
            var listBag = $item.children(list.options.listNodeName);
            if (listBag.length) {
              jQuery.each(listBag, function (i, item) {
                recursiveExpand($(item));
              });
            }
          };

      list.$instance.find(this.options.collapsedClass.dot()).each(function (e, item) {
        recursiveExpand($(item));
      });
    },
    /**
     * @version-control +0.0.1 collapse all fix
     * @param cb
     */
    collapseAll:                        function (cb) {
      var list              = this,
          recursiveCollapse = function ($item) {
            if (!cb || !cb($item)) return;
            var listBag = $item.children(list.options.listNodeName);
            if (listBag.length) {
              list.collapseItem($item);
              jQuery.each(listBag, function (i, item) {
                recursiveCollapse($(item));
              });
            }
          };

      list.$instance.find(list.options.listNodeName).children(list.options.itemClass.dot()).each(function (e, item) {
        recursiveCollapse($(item));
      });
    },
    /**
     * @dev-since 0.13.29
     * @version-control +0.0.5 prevent setting multiple parents on a parent element
     * @param li
     * @param force
     */
    setParent:                          function ($item, force) {
      var opt = this.options;
      // If the specified selector targets any element
      if ($item.children(this.options.listNodeName).length || force) {
        // LI STRUCTURE
        // <li class="dd-item dd3-item" data-id="15">
        //  <button data-action="collapse" type="button">Collapse</button>
        //  <button data-action="expand" type="button" style="display: none;">Expand</button>
        //     <div class="dd-handle dd3-handle">Drag</div><div class="dd3-content">Item 15</div>
        //     <ol class="dd-list">
        //         <li class="dd-item dd3-item" data-id="16">
        //             <div class="dd-handle dd3-handle">Drag</div><div class="dd3-content">Item 16</div>
        //         </li>
        //         <li class="dd-item dd3-item" data-id="17">
        //             <div class="dd-handle dd3-handle">Drag</div><div class="dd3-content">Item 17</div>
        //         </li>
        //         <li class="dd-item dd3-item" data-id="18">
        //             <div class="dd-handle dd3-handle">Drag</div><div class="dd3-content">Item 18</div>
        //         </li>
        //     </ol>
        // </li>
        $item.children('[data-action="collapse"]').show();
        // make sure handle is the first element
        var handle = $item.find(this.options.handleClass.dot()).first().clone();
        $item.find(this.options.handleClass.dot()).first().remove();
        $item.prepend(handle);
      }
      // If the selector gets targeted within the li element
      // hide it
      $item.children('[data-action="expand"]').hide();

      // Call start edit event listeners
      opt.event.onItemSetParent.forEach(function (cb, i) {
        cb($item);
      });
    },
    /**
     * @dev-since 0.13.29
     * @version-control +0.1.0 fix clean item data when unsetting a parent #4
     * @dev-since 0.48.53
     * @version-control +0.1.0 fix disappearing lists on unsetParent with multiple list instances
     * @param $item
     */
    unsetParent:                        function ($item) {
      var opt = this.options;

      $item.removeClass(this.options.collapsedClass);
      // Clear collapse/expand controls from the parent
      $item.children('[data-action]').hide();
      $item.children(this.options.listNodeName).remove();
      $item.removeData('children');

      // Call start edit event listeners
      opt.event.onItemUnsetParent.forEach(function (cb, i) {
        cb($item, event);
      });
    },
    /**
     * @dev-since 0.13.29
     * @version-control +0.0.5 unsetEmptyParent
     * @param parent
     */
    unsetEmptyParent:                   function (parent) {
      var _this = this;
      if (parent.find(this.options.itemClass.dot()).length === 0) _this.unsetParent(parent);
    },
    // How many list items does an element have?
    getChildrenCount:                   function ($placeholder) {
      return $placeholder.parents(this.options.listClass.dot()).length + this.$dragItem.find(this.options.listClass.dot()).length - 1;
    },
    updatePlaceholderMaxDepthApperance: function () {
      if (this.getChildrenCount(this.$placeholder) >= this.options.maxDepth) {
        this.$placeholder.addClass('max-depth');
      } else {
        this.$placeholder.removeClass('max-depth');
      }
    },
    dragStart:                          function (e) {
      var mouse    = this.mouse,
          opt      = this.options,
          target   = $(e.target),
          dragItem = target.closest(this.options.itemNodeName);

      /**
       * @dev-since 0.48.53
       * @version-control +0.2.0 enhancement adding noDragClass to an item makes it undraggable
       */
      if (dragItem.attr('class').match(opt.noDragClass)) return;

      this.$placeholder.css('height', dragItem.height());

      mouse.offsetX = e.offsetX !== undefined ? e.offsetX : e.pageX - target.offset().left;
      mouse.offsetY = e.offsetY !== undefined ? e.offsetY : e.pageY - target.offset().top;
      mouse.startX = mouse.lastX = e.pageX;
      mouse.startY = mouse.lastY = e.pageY;

      this.dragRootEl = this.$instance;

      // Define the state as dragging so no other elements get attached due
      // to the identification process in init onStartDrag
      this.$dragItem = $(document.createElement(this.options.listNodeName))
      .addClass(this.options.listClass + ' ' + this.options.dragClass);
      this.$dragItem.css('width', dragItem.width());

      // this.$placeholder -> $('<div class="' + list.options.placeClass + '"/>');
      // Put the targeted element into the $dragItem which will work as a kind of a bag
      // while dragging
      dragItem.after(this.$placeholder);
      dragItem[0].parentNode.removeChild(dragItem[0]);
      dragItem.appendTo(this.$dragItem);

      $(document.body).append(this.$dragItem);
      // Adjust the dragging bag ($dragItem) initial position within the
      // element
      this.$dragItem.css({
        'left': e.pageX - mouse.offsetX,
        'top':  e.pageY - mouse.offsetY
      });

      this.updatePlaceholderMaxDepthApperance();

      // Call start drag event listeners
      this.options.event.onItemDrag.forEach(function (cb, i) {
        cb($(dragItem), e);
      });
    },
    dragStop:                           function (e) {
      var el    = this.$dragItem.children(this.options.itemNodeName).first(),
          _this = this;

      el[0].parentNode.removeChild(el[0]);
      this.$placeholder.replaceWith(el);

      this.$dragItem.remove();
      this.$instance.trigger('change');
      if (this.hasNewRoot) {
        this.dragRootEl.trigger('change');
      }
      this.reset();

      this.mouse.distXtotal = 0;
      this.mouse.distYtotal = 0;

      // Call end drag event listeners
      this.options.event.onItemDrop.forEach(function (cb, i) {
        cb($(el), e);
      });

      if ($(el).parents(this.options.rootClass).data('domenu-id') !== $(this.$instance).data('domenu-id')) {
        $(el).parents(this.options.rootClass.dot()).domenu()._plugin.options.event.onItemDrop.forEach(function (cb, i) {
          cb(el, e);
        });
      }
    },


    /**
     * @dev-since 0.24.53
     * @version-control +0.10.0 enchancement of item dragging/repositioning
     * @version-control +0.3.0  fix unsetting parents
     */
    dragMove: function (e) {
      var list, parent, prev, next, depth, $rootListOfPointingElement, hasRootChanged,
          isEmpty = false,
          opt     = this.options,
          mouse   = this.mouse;

      /**
       * @dev-since 0.87.53
       * @version-control +0.0.5 fix ghost first movement
       * @type {number|Number}
       */
      // mouse position last events
      mouse.lastX = mouse.nowX || e.pageX;
      mouse.lastY = mouse.nowY || e.pageY;

      // mouse position this events
      mouse.nowX = e.pageX;
      mouse.nowY = e.pageY;

      // distance mouse moved between events
      mouse.lastCurrentDistXChange = mouse.nowX - mouse.lastX;
      mouse.lastCurrentDistYChange = mouse.nowY - mouse.lastY;

      // set the direction mouse was moving for future events
      mouse.lastDirX = mouse.dirX;
      mouse.lastDirY = mouse.dirY;

      // direction mouse is now moving (on both axis)
      // 0 for no direction, 1 for right -1 for left
      mouse.dirX = mouse.lastCurrentDistXChange === 0 ? 0 : mouse.lastCurrentDistXChange > 0 ? 1 : -1;
      mouse.dirY = mouse.lastCurrentDistYChange === 0 ? 0 : mouse.lastCurrentDistYChange > 0 ? 1 : -1;

      /**
       * @dev-since 0.87.53
       * @version-control 0.0.5 fix telepathic child dragging
       * @type {number}
       */
      // placeELSP – placeholder pixel strand, how far removed is the $dragItem from placeEL in pixels?
      // placeELSEF – placeholder elastic strand factor, how far removed is the $dragItem from placeEL in elastic units?
      var placeElSPY = Math.abs(this.$placeholder.offset().top - this.$dragItem.offset().top),
          placeElSPX = Math.abs(this.$placeholder.offset().left - this.$dragItem.offset().left),
          placeElSEF = (2 / Math.PI) * Math.atan((Math.PI / 2) * (placeElSPY + placeElSPX) * 0.1 / opt.threshold);

      // Placeholder will be dragged around, the member list will actually
      // hide itself and replace the placeholder on dragStop
      this.$dragItem.css({
        // Place element on the document following the mouse
        // position change
        //
        // e.pageX position of the mouse relative to the whole page
        // e.offsetX position of the mouse relative to .dd3-handle
        // mouse absolute position - the position offset in the element =
        // = begin offset of the element
        'left': e.pageX - mouse.offsetX,
        'top':  e.pageY - mouse.offsetY
      });

      this.$pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));

      // find parent list of item under cursor
      $rootListOfPointingElement = this.$pointEl.closest(opt.rootClass.dot());
      hasRootChanged = this.dragRootEl.data('domenu-id') !== $rootListOfPointingElement.data('domenu-id');

      if ($rootListOfPointingElement.length && !hasRootChanged) {
        this.$placeholder.css({
          'opacity': 1
        });
      } else {
        this.$placeholder.css({
          // fade out the placeholder as the distance of the cursor and placeholder increases
          'opacity': 1 - placeElSEF
        });
      }

      // do nothing when the root list is not found and the mouse is removed far away from the placeholder
      if ($rootListOfPointingElement.length === 0 && placeElSEF > 0.4) return;

      // axis mouse is moving on: 1 for x-axis, 0 for y-axis
      var isMovingOnXAxis = Math.abs(mouse.lastCurrentDistXChange) > Math.abs(mouse.lastCurrentDistYChange) &&
      // the difference of covered distance between both axis must be at least 2px for isMovingOnXAxis to change
      Math.abs(mouse.lastCurrentDistXChange - mouse.lastCurrentDistYChange) > 2 ? true : false;

      // intialize variables on first move event
      if (mouse.moving === false) {
        mouse.isMovingOnXAxis = isMovingOnXAxis;
        mouse.moving = true;
      }

      function setTotalDistance(x, y) {
        mouse.distXtotal = x;
        mouse.distYtotal = y;

        if (x == 0) mouse.lastX = mouse.startX = mouse.nowX;
        if (y == 0) mouse.lastY = mouse.startY = mouse.nowY;
      }

      setTotalDistance(mouse.nowX - mouse.startX, mouse.nowY - mouse.startY);
      mouse.isMovingOnXAxis = isMovingOnXAxis;

      this.updatePlaceholderMaxDepthApperance();

      if (this.$pointEl.parents(opt.rootClass.dot()).length === 0) setTotalDistance(0, 0);

      /**
       * move horizontal only to right
       */
      if (Math.abs(mouse.distXtotal) >= opt.threshold) {
        // reset move distance on x-axis for new phase
        // this.$placeholder placeholder element
        var $precedingSiblingItem = this.$placeholder.prev(opt.itemNodeName);
        var $precedingSiblingItemList = $precedingSiblingItem.find(opt.listNodeName).last();

        // Handle moving to right
        if (mouse.distXtotal > 0 && mouse.dirX === 1 && $precedingSiblingItem.length > 0 && !$precedingSiblingItem.hasClass(opt.collapsedClass)) {
          // check if depth limit has reached
          if (this.getChildrenCount(this.$placeholder) < opt.maxDepth) {
            if ($precedingSiblingItemList.length > 0) {
              var $lastItem = $precedingSiblingItem.children(opt.listNodeName).last();
              $lastItem.append(this.$placeholder);
              setTotalDistance(0, 0);
            } else {
              var $list = $(document.createElement((opt.listNodeName))).addClass(opt.listClass);
              $list.append(this.$placeholder);
              $precedingSiblingItem.append($list);
              this.setParent($precedingSiblingItem);
              setTotalDistance(0, 0);
            }
          } else if (this.getChildrenCount(this.$placeholder) >= opt.maxDepth) {
            this.updatePlaceholderMaxDepthApperance();
            opt.event.onItemMaxDepth.forEach(function (cb, i) {
              cb($precedingSiblingItem);
            });
          }
        } else if (mouse.distXtotal < 0 && mouse.dirX === -1) {
          var $parent = this.$placeholder.parents(opt.itemClass.dot()).first();
          if ($parent.length) {
            $parent.after(this.$placeholder);
            if ($parent.children(opt.itemClass.dot()).length === 0) this.unsetEmptyParent($parent);
            setTotalDistance(0, 0);
          }
        }
      }

      // find list item under cursor
      if (!hasPointerEvents) {
        this.$dragItem[0].style.visibility = 'hidden';
      }


      /**
       * @dev-since 0.87.53
       * @version-control +0.0.5 fix disappearing list when mixing items from multiple instances
       */
      if (!this.$instance.children(this.options.listClass.dot()).length) {
        this.$instance.append($('<' + this.options.listNodeName + '/>').attr('class', this.options.listClass));
      }

      /**
       * @dev-since 0.87.53
       * @version-control +0.1.0 feature restrict list merging
       */
      if (this.options.allowListMerging !== true) {
        if (hasRootChanged && this.options.allowListMerging === false) return;
        else if (hasRootChanged && $rootListOfPointingElement.data('domenu') && $rootListOfPointingElement.data('domenu').options.allowListMerging.indexOf(this.$instance.attr('id')) === -1) return;
      }
      /**
       * @dev-since 0.48.59
       * @version-control +0.1.0 fix snapping items to an empty list  (multiple instances)
       */
      if (this.$pointEl.hasClass(opt.listClass) && !this.$pointEl.children(opt.itemClass.dot()).length) this.$pointEl.append(this.$placeholder);

      if (!this.$pointEl.parents(opt.rootClass.dot()).length || this.$pointEl.hasClass(opt.listClass) || this.$pointEl.hasClass(opt.placeClass)) return;

      if (!this.$pointEl.hasClass(opt.itemClass)) this.$pointEl = $(this.$pointEl).parents(opt.itemClass.dot()).first();

      if (!hasPointerEvents) {
        this.$dragItem[0].style.visibility = 'visible';
      }
      if (this.$pointEl.hasClass(opt.handleClass)) {
        this.$pointEl = this.$pointEl.parent(opt.itemNodeName);
      }
      // When no pointer element has been found or when the pointer element has no options.itemClass
      else if (!this.$pointEl.length || !this.$pointEl.hasClass(opt.itemClass)) {
        return;
      }


      /**
       * move vertical
       */

      if (mouse.isMovingOnXAxis === false && Math.abs(mouse.distYtotal) >= 5) {
        // check if groups match if dragging over new root
        if (hasRootChanged && opt.allowListMerging === false) {
          return;
        } else if (hasRootChanged && typeof opt.allowListMerging === "object") {
          if(opt.allowListMerging.indexOf($rootListOfPointingElement.attr('id')) === -1) return;
        }

        setTotalDistance(0, 0);

        // check depth limit
        var depth = this.dragDepth - 1 + this.$pointEl.parents(opt.listNodeName).length;
        var $placeholderParent = this.$placeholder.parent();

        if (depth > opt.maxDepth) {
          opt.event.onItemMaxDepth.forEach(function (cb, i) {
            cb(this.$dragItem);
          });
          // if empty create new list to replace empty placeholder
        }

        // note: while dragging from up to down the placeholder will push the item upwards, therefore
        // we need to calculate position using an element with absolute position
        var before = e.pageY < (this.$pointEl.offset().top + this.$pointEl.height() / 2);

        if (this.$pointEl.hasClass(opt.emptyClass)) {
          var $list = $(document.createElement(opt.listNodeName)).addClass(opt.listClass);
          $list.append(this.$placeholder);
          this.$pointEl.replaceWith($list);
        }
        // $placeholderParent !== this.$pointEl make sure we drag up/down only
        else if (before && $placeholderParent !== this.$pointEl) {
          this.$pointEl.before(this.$placeholder);
        }
        else if (mouse.dirY > 0 && $placeholderParent !== this.$pointEl) {
          this.$pointEl.after(this.$placeholder);
        }

        if ($placeholderParent.children().length === 0) {
          this.unsetEmptyParent($placeholderParent.parent());
        }

        if (this.dragRootEl.find(opt.itemNodeName).length === 0) {
          this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>');
        }

        if (hasRootChanged) {
          this.dragRootEl = $rootListOfPointingElement;
          this.hasNewRoot = this.$instance[0] !== this.dragRootEl[0];
        }
      }
    }
  };

  /**
   * Works like a proxy to Plugin prototype.
   * Separates the API of the developer from the API
   * of the user.
   */
  function PublicPlugin(plugin, lists) {
    if (!plugin) throw new TypeError('expected object, got ' + typeof plugin);
    this._plugin = plugin,
      this._lists = lists;
  }

  PublicPlugin.prototype = {
    getLists:           function () {
      return this._lists;
    },
    parseJson:          function (data, override) {
      var data = data || null, override = override || false;
      this._plugin.deserialize(data, override);
      return this;
    },
    toJson:             function () {
      var data = this._plugin.serialize();
      return JSON.stringify(data);
    },
    expandAll:          function () {
      this._plugin.expandAll(function () {
        return true;
      });
      return this;
    },
    collapseAll:        function () {
      this._plugin.collapseAll(function () {
        return true;
      });
      return this;
    },
    /**
     * @desc Expand items one by one. If callback returns then the item will be expanded.
     * @callback-params $item
     * @param cb
     * @returns {PublicPlugin}
     */
    expand:             function (cb) {
      this._plugin.expandAll(cb);
      return this;
    },
    /**
     * @desc Collapse items one by one. If callback returns then the item will be expanded.
     * @callback-params $item
     * @param cb
     * @returns {PublicPlugin}
     */
    collapse:           function (cb) {
      this._plugin.collapseAll(cb);
      return this;
    },
    /**
     * @desc  Listen toParse calls
     * @callback-params
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since >0.0.1
     * @version-control +0.1.0 feature onParseJson event listener
     * @returns {PublicPlugin}
     */
    onParseJson:        function (callback) {
      var _this = this;
      _this._plugin.options.event.onParseJson.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc  Fires after an item becomes a parent
     * @callback-params $item
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since 0.87.53
     * @version-control +0.1.0 feature onItemSetParent event listener
     * @returns {PublicPlugin}
     */
    onItemSetParent:    function (callback) {
      var _this = this;
      _this._plugin.options.event.onItemSetParent.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc  Fires after a parent is unset
     * @callback-params $parent
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since 0.87.53
     * @version-control +0.1.0 feature onItemSetParent event listener
     * @returns {PublicPlugin}
     */
    onItemUnsetParent:  function (callback) {
      var _this = this;
      _this._plugin.options.event.onItemUnsetParent.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc Listen to toJson calls
     * @callback-params
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since >0.0.1
     * @version-control +0.1.0 feature listen to toJson calls
     * @returns {PublicPlugin}
     */
    onToJson:           function (callback) {
      var _this = this;
      _this._plugin.options.event.onToJson.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc Listen for save events
     * @callback-params jQueryCollection inputCollection
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since >0.0.1
     * @version-control +0.1.0 feature listen for editBoxSave events
     * @returns {PublicPlugin}
     */
    onSaveEditBoxInput: function (callback) {
      var _this = this;
      _this._plugin.options.event.onSaveEditBoxInput.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc Fires when user starts to drag an item
     * @callback-params jQueryCollection dragItem, MouseEvent event
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since >0.0.1
     * @version-control +0.1.0 feature listen for itemDrag events
     * @returns {PublicPlugin}
     */
    onItemDrag:         function (callback) {
      var _this = this;
      _this._plugin.options.event.onItemDrag.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc Fires when the user stops to drag an item
     * @callback-params jQueryCollection dragItem, MouseEvent event
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since >0.0.1
     * @version-control +0.1.0 feature listen from itemDrop events
     * @returns {PublicPlugin}
     */
    onItemDrop:         function (callback) {
      var _this = this;
      _this._plugin.options.event.onItemDrop.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc Fires when an item has been added to the list
     * @callback-params jQueryCollection item, MouseEvent event
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since >0.0.1
     * @version-control +0.1.0 feature listen for itemAdded events
     * @returns {PublicPlugin}
     */
    onItemAdded:        function (callback) {
      var _this = this;
      _this._plugin.options.event.onItemAdded.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc Fires when an item has been removed
     * @callback-params jQueryCollection item, MouseEvent event
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since >0.0.1
     * @version-control +0.1.0 feature listen for itemRemoved events
     * @returns {PublicPlugin}
     */
    onItemRemoved:      function (callback) {
      var _this = this;
      this._plugin.options.event.onItemRemoved.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc Fires when an item is entering the edit mode
     * @callback-params jQueryCollection item, MouseEvent event
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since >0.0.1
     * @version-control +0.1.0 feature listen for itemStartEdit events
     * @returns {PublicPlugin}
     */
    onItemStartEdit:    function (callback) {
      var _this = this;
      this._plugin.options.event.onItemStartEdit.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc Fires when an item is exiting the edit mode
     * @callback-params jQueryCollection item, MouseEvent event
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since >0.0.1
     * @version-control +0.1.0 feature listen for itemEndEdit events
     * @returns {PublicPlugin}
     */
    onItemEndEdit:      function (callback) {
      var _this = this;
      this._plugin.options.event.onItemEndEdit.push(callback.bind(_this));
      return _this;
    },
    /**
     * @desc Fires when an item adds a child item
     * @callback-params jQueryCollection item, MouseEvent event
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since 0.13.29
     * @version-control +0.1.0 feature listen for itemAddChildItem events
     * @returns {PublicPlugin}
     */
    onItemAddChildItem: function (callback) {
      var _this = this;
      this._plugin.options.event.onItemAddChildItem.push(callback.bind(_this));
      return _this;
    },

    /**
     * @desc Fires when an item is being created
     * @dev-since 0.48.53
     * @version-control +0.1.0 feature listen for onCreateItem events
     */
    onCreateItem: function (callback) {
      var _this = this;
      this._plugin.options.event.onCreateItem.push(callback.bind(_this));
      return _this;
    },

    /**
     * @desc Fires when an item has been collapsed
     * @callback-params jQueryCollection item, MouseEvent event
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since 0.48.53
     * @version-control +0.1.0 feature listen for onItemCollapsed events
     * @returns {PublicPlugin}
     */
    onItemCollapsed: function (callback) {
      var _this = this;
      this._plugin.options.event.onItemCollapsed.push(callback.bind(_this));
      return _this;
    },

    /**
     * @desc Fires when an item has been expanded
     * @callback-params jQueryCollection item, MouseEvent event
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since 0.48.53
     * @version-control +0.1.0 feature listen for onItemCollapsed events
     * @returns {PublicPlugin}
     */
    onItemExpanded: function (callback) {
      var _this = this;
      this._plugin.options.event.onItemExpanded.push(callback.bind(_this));
      return _this;
    },

    /**
     * @desc Fires when the max depth of an item prevents nesting additional children
     * @callback-params jQueryCollection parentElement
     * @callback-context PublicPlugin
     * @param callback
     * @dev-since 0.87.53
     * @version-control +0.1.0 feature listen for onItemMaxDepth events
     * @returns {PublicPlugin}
     */
    onItemMaxDepth: function (callback) {
      var _this = this;
      this._plugin.options.event.onItemMaxDepth.push(callback.bind(_this));
      return _this;
    },

    /**
     * @desc Setup a callback for multiple events
     * @dev-since 0.48.53
     * @param eventBag array or string containing event names
     * @version-control +0.1.0 feature listen on many events simultaneously, use '*' to listen for all events
     * @returns {PublicPlugin}
     */
    on: function (eventBag, callback) {
      var _this = this;
      if (typeof eventBag === "object") {
        eventBag.forEach(function (event, i) {
          _this._plugin.options.event[event].push(callback.bind(_this));
        });
      } else if (eventBag === "*") {
        Object.keys(_this._plugin.options.event).forEach(function (event, c) {
          _this._plugin.options.event[event].push(callback.bind(_this))
        });
      } else if (typeof eventBag === "string") {
        _this._plugin.options.event[eventBag].push(callback.bind(_this));
      }
      return _this;
    },

    getListNodes: function () {
      var opt       = this._plugin.options,
          listNodes = this._plugin.$instance.find(opt.listNodeName);
      return listNodes;
    },

    /**
     * @desc Get the current plugin configuration
     * @dev-since 0.0.1
     * @version-control +0.1.0 feature get current plugin configuration
     * @returns Object
     */
    getPluginOptions: function () {
      return this._plugin.options;
    }
  };

  /**
   * @dev-since 0.0.1
   * @version-control +0.0.1 unused variables cleanup
   * @version-control +0.0.1
   * @dev-since 0.13.29
   * @version-control +0.0.5 random key generation improvements
   */
  $.fn.domenu = function (params) {
    var lists   = this.first(),
        domenu  = $(this),
        plugin  = domenu.data("domenu") || new Plugin(this, params),
        pPlugin = new PublicPlugin(plugin, lists);

    if (params) plugin.options = $.extend(true, {}, defaults, params);
    if (!domenu.data("domenu") || params) domenu.data("domenu", plugin);
    if (!domenu.data("domenu-id")) {
      var pseudoRandomNumericKey = Math.random().toString().replace(/\D/g, '');
      domenu.data('domenu-id', pseudoRandomNumericKey);
    }

    return pPlugin || plugin;

  }
})(window.jQuery || window.Zepto, window, document);
