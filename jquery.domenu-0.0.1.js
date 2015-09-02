/**
 * @license Copyright © 2015 Mateusz Zawartka
 * @version 0.0.1
 * MIT license
 */

;
(function($, window, document, undefined) {
  var hasTouch = 'ontouchstart' in document;

  /**
   * Add a dot at the beginning of a string
   * @returns {string}
   */
  String.prototype.dot = function() {
    return '.' + this;
  };

  /**
   * Join a sibling string by a delimiter
   * @param sibling
   * @param delimiter
   * @returns {string}
   */
  String.prototype.join = function(sibling, delimiter) {
    var delimiter = typeof delimiter === 'string' ? delimiter : " ";
    return this + delimiter + sibling;
  };

  /**
   * Detect CSS pointer-events property
   * events are normally disabled on the dragging element to avoid conflicts
   * https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
   */
  var hasPointerEvents = (function() {
    var el    = document.createElement('div'),
        docEl = document.documentElement;
    if(!('pointerEvents' in el.style)) {
      return false;
    }
    el.style.pointerEvents = 'auto';
    el.style.pointerEvents = 'x';
    docEl.appendChild(el);
    var supports           = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
    docEl.removeChild(el);
    return !!supports;
  })();

  /**
   * @version-control +0.1.0  slide animation duration option, default is 0
   * @type {{listNodeName: string, itemNodeName: string, rootClass: string, listClass: string, itemClass: string, dragClass: string, handleClass: string, collapsedClass: string, placeClass: string, noDragClass: string, emptyClass: string, contentClass: string, removeBtnClass: string, editBoxClass: string, expandBtnHTML: string, collapseBtnHTML: string, editBtnHTML: string, data: string, slideAnimationDuration: number, group: number, maxDepth: number, threshold: number}}
   */
  var defaults = {
    listNodeName:           'ol',
    itemNodeName:           'li',
    rootClass:              'dd',
    listClass:              'dd-list',
    itemClass:              'dd-item',
    dragClass:              'dd-dragel',
    handleClass:            'dd-handle',
    collapsedClass:         'dd-collapsed',
    placeClass:             'dd-placeholder',
    noDragClass:            'dd-nodrag',
    emptyClass:             'dd-empty',
    contentClass:           'dd3-content',
    removeBtnClass:         'item-remove',
    editBoxClass:           'dd-edit-box',
    expandBtnHTML:          '<button data-action="expand" type="button">+</button>',
    collapseBtnHTML:        '<button data-action="collapse" type="button">-</button>',
    editBtnHTML:            '<button data-action="edit" type="button">edit</button>',
    data:                   '',
    slideAnimationDuration: 0,
    group:                  0,
    maxDepth:               5,
    threshold:              20
  };

  function Plugin(element, options) {
    // After $(...).domenu() is called 1:
    this.w       = $(document);
    this.el      = $(element);
    this.options = $.extend({}, defaults, options);
    // 2:
    this.init();
  }

  Plugin.prototype = {

    init:                             function() {
      // Plugin {w: m.fn.init[1], el: m.fn.init[1], options: Object, mouse: Object, isTouch: false…}
      var list = this,
          opt  = this.options;

      list.reset();

      // el = jQuery object
      // assign to el domenu-group the value user supplied as group property
      list.el.data('domenu-group', this.options.group);


      list.placeEl = $('<div class="' + list.options.placeClass + '"/>');

      // forEach itemNodeName=li element
      $.each(this.el.find(list.options.itemNodeName), function(k, el) {
        // pass the li element
        // If an element is a parent then it contains another li elements
        // and can be collapsed and expanded
        list.setParent($(el));
      });

      list.el.on('click', 'button', function(e) {
        // Don't do anything when dragging
        if(list.dragEl) {
          return;
        }
        var target = $(e.currentTarget),
            action = target.data('action'),
            item   = target.parent(list.options.itemNodeName);
        // Some internal click handlers communicating through
        // jQuery object data
        if(action === 'collapse') {
          list.collapseItem(item);
        }

        if(action === 'expand') {
          list.expandItem(item);
        }
      });

      // Declaring some custom event handlers
      var onStartEvent = function(e) {
            var handle = $(e.target);
            // Identify if the object is draggable
            if(!handle.hasClass(list.options.handleClass)) {
              if(handle.closest('.' + list.options.noDragClass).length) {
                return;
              }
              handle = handle.closest('.' + list.options.handleClass);
            }

            // If the element is not draggable, or is while dragging
            // then don't do anything
            if(!handle.length || list.dragEl) return;

            // Same here making sure if the object can be draggeds
            list.isTouch = /^touch/.test(e.type);
            if(list.isTouch && e.touches.length !== 1) {
              return;
            }

            // Don't do whatever browsers do by default
            e.preventDefault();
            // At this point object is identified as available to drag
            // so start dragging
            list.dragStart(e.touches ? e.touches[0] : e);
          },

          onMoveEvent  = function(e) {
            if(list.dragEl) {
              e.preventDefault();
              list.dragMove(e.touches ? e.touches[0] : e);
            }
          },

          onEndEvent   = function(e) {
            if(list.dragEl) {
              e.preventDefault();
              list.dragStop(e.touches ? e.touches[0] : e);
            }
          };

      // If thouch events are avialable, start listening for those events
      if(hasTouch) {
        list.el[0].addEventListener('touchstart', onStartEvent, false);
        window.addEventListener('touchmove', onMoveEvent, false);
        window.addEventListener('touchend', onEndEvent, false);
        window.addEventListener('touchcancel', onEndEvent, false);
      }

      // Start listening for the events below
      list.el.on('mousedown', onStartEvent);
      // list.w = $(document)
      list.w.on('mousemove', onMoveEvent);
      list.w.on('mouseup', onEndEvent);

      this.addNewListItemListener(this.el.find('.dd-new-item'));
    },
    addNewListItemListener:           function(addBtn, parent) {
      var _this = this,
          opt   = this.options;
      addBtn.on('click', function(e) {
        $(opt.rootClass.dot()).find(opt.listClass.dot()).first().prepend(_this.createNewListItem());
      })
    },
    /**
     * @version-control +0.0.1 lazy keypressEnterEndEditEventHandler binding
     * @version-control +0.0.1 prevent slide animation bubbling
     * @version-control +0.0.2 slide animation duration support
     */
    clickStartEditEventHandler:       function(event) {
      var opt    = this.options,
          _this  = this,
          spn    = $(event.target),
          item   = spn.parents(opt.itemClass.dot()).first(),
          rmvBtn = item.find(opt.removeBtnClass.dot()).first(),
          edtBox = item.find(opt.editBoxClass.dot()).first();

      var igniteKeypressEnterEndEditEventHandler = function(el) {
        el.each(function(c, item) {
          item.addEventListener('keypress', _this.keypressEnterEndEditEventHandler.bind(_this));
        });
      };

      // Hide the span
      spn.stop().slideToggle(opt.slideAnimationDuration, function() {

        // Hide the remove button
        rmvBtn.stop().slideToggle(opt.slideAnimationDuration, function() {

          // Use either the default title or the user specified title as the value for the input
          if(spn.text() !== 'no title') edtBox.children('input[name="title"]').first().val(spn.text());

          // Show the edit panel
          edtBox.stop().slideToggle(opt.slideAnimationDuration, function() {
            edtBox.children().first('input').focus();

            // Be ready to close the edit mode
            igniteKeypressEnterEndEditEventHandler(item);
          });
        });
      })
    },
    /**
     * @version-control +0.1.0 dynamic inputs
     * @version-control +0.0.1 prevent slide bubbling
     * @version-control +0.0.2 slide animation duration support
     * @param event
     */
    keypressEnterEndEditEventHandler: function(event) {
      var opt             = this.options,
          item            = $(event.target).parents(opt.itemClass.dot()).first(),
          edtBox          = item.find(opt.editBoxClass.dot()).first(),
          inputCollection = item.find('input'),
          spn             = item.find('span').first(),
          removeBtn       = item.find(opt.removeBtnClass.dot());

      // Listen only to the Enter key
      if(event.keyCode !== 13) return;

      // Hide the edit box
      edtBox.stop().slideUp(opt.slideAnimationDuration, function() {

        // CLear out the event binding
        item.get(0).removeEventListener('keypress', this.keypressEnterEndEditEventHandler);

        // Set the span text
        spn.text(item.find('input[name="title"]').val());
        if(spn.text() === '') spn.text('no title');

        // Save inputs
        inputCollection.each(function(c, input) {
          item.data(input.getAttribute('name'), input.value);
        });

        // Make the remove button visible
        removeBtn.stop().slideDown(opt.slideAnimationDuration);

        // Show the span content
        spn.stop().slideDown(opt.slideAnimationDuration);
      });


    },
    createNewListItem:                function(id, title, http) {
      var id        = typeof id !== 'undefined' ? id : this.getHighestId() + 1,
          title     = typeof title !== 'undefined' ? title : 'Item ' + id,
          http      = typeof http !== 'undefined' ? http : '',
          el        = this.el,
          opt       = this.options,
          blueprint = el.find('.dd-item-blueprint').first().clone();

      blueprint.data('id', id);
      blueprint.attr('class', opt.itemClass);
      blueprint.find('span').first().text(title);
      blueprint.find('input[name="title"]').first().val(title);
      blueprint.data('title', title);
      blueprint.find('input[name="http"]').first().val(http);
      blueprint.data('http', http);
      blueprint.find('.item-remove').first().on('click', function(e) {
        blueprint.remove();
      });

      blueprint.find('span').first().get(0).addEventListener('click', this.clickStartEditEventHandler.bind(this));

      return blueprint;
    },
    getHighestId:                     function() {
      var opt = this.options,
          el  = this.el,
          id  = 0;

      el.find(opt.itemNodeName).each(function(i, e) {
        var eId = $(e).data('id');
        if(eId > id) return id = eId;
      });

      return id;
    },
    serialize:                        function() {
      var data,
          depth = 0,
          list  = this;
      step      = function(level, depth) {
        var array = [],
            items = level.children(list.options.itemNodeName);
        items.each(function() {
          var li   = $(this),
              item = $.extend({}, li.data()),
              sub  = li.children(list.options.listNodeName);
          if(sub.length) {
            item.children = step(sub, depth + 1);
          }
          array.push(item);
        });
        return array;
      };
      data      = step(list.el.find(list.options.listNodeName).first(), depth);
      return data;
    },
    deserialize:                      function(data, override) {
      var data  = JSON.parse(data) || JSON.parse(this.options.data),
          _this = this,
          list  = _this.el.find('.dd-list').first();

      if(override) list.children().remove();

      var processItem = function(i, pref) {
        if(i.children) {
          var cref = $('<ol class="dd-list"></ol>'),
              item = _this.createNewListItem(i.id, i.title, i.http);
          pref.append(item);
          item.append(cref);
          _this.setParent(item, true);
          jQuery.each(i.children, function(i, e) {
            processItem(e, cref);
          })
        } else {
          var item = _this.createNewListItem(i.id, i.title, i.http);
          pref.append(item);
        }
      }

      jQuery.each(data, function(i, e) {
        processItem(e, list);
      })
    },
    serialise:                        function() {
      return this.serialize();
    },

    reset: function() {
      this.mouse      = {
        offsetX:  0,
        offsetY:  0,
        startX:   0,
        startY:   0,
        lastX:    0,
        lastY:    0,
        nowX:     0,
        nowY:     0,
        distX:    0,
        distY:    0,
        dirAx:    0,
        dirX:     0,
        dirY:     0,
        lastDirX: 0,
        lastDirY: 0,
        distAxX:  0,
        distAxY:  0
      };
      this.isTouch    = false;
      this.moving     = false;
      this.dragEl     = null;
      this.dragRootEl = null;
      this.dragDepth  = 0;
      this.hasNewRoot = false;
      this.pointEl    = null;
    },

    expandItem: function(li) {
      li.removeClass(this.options.collapsedClass);
      li.children('[data-action="expand"]').hide();
      li.children('[data-action="collapse"]').show();
      li.children(this.options.listNodeName).show();
    },

    collapseItem: function(li) {
      var lists = li.children(this.options.listNodeName);
      if(lists.length) {
        li.addClass(this.options.collapsedClass);
        li.children('[data-action="collapse"]').hide();
        li.children('[data-action="expand"]').show();
        li.children(this.options.listNodeName).hide();
      }
    },

    expandAll: function(cb) {
      var list = this;
      list.el.find(list.options.itemNodeName).each(function() {
        var item = $(this);
        if(cb && cb(item)) list.expandItem($(this));
        else list.expandItem($(this));
      });
    },

    collapseAll: function(cb) {
      var list = this;
      list.el.find(list.options.itemNodeName).each(function() {
        var item = $(this);
        if(cb && cb(item)) list.collapseItem(item);
        else list.expandItem(item);
      });
    },

    setParent: function(li, force) {
      // If the specified selector targets any element
      if(li.children(this.options.listNodeName).length || force) {
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
        li.prepend($(this.options.expandBtnHTML));
        li.prepend($(this.options.collapseBtnHTML));
        // make sure handle is the first element
        var handle = li.find('.' + this.options.handleClass).first().clone();
        li.find('.' + this.options.handleClass).first().remove();
        li.prepend(handle);
      }
      // If the selector gets targeted within the li element
      // hide it
      li.children('[data-action="expand"]').hide();
    },

    unsetParent: function(li) {
      li.removeClass(this.options.collapsedClass);
      li.children('[data-action]').remove();
      li.children(this.options.listNodeName).remove();
    },

    dragStart: function(e) {
      var mouse    = this.mouse,
          target   = $(e.target),
          dragItem = target.closest(this.options.itemNodeName);
      this.placeEl.css('height', dragItem.height());

      mouse.offsetX = e.offsetX !== undefined ? e.offsetX : e.pageX - target.offset().left;
      mouse.offsetY = e.offsetY !== undefined ? e.offsetY : e.pageY - target.offset().top;
      mouse.startX  = mouse.lastX = e.pageX;
      mouse.startY = mouse.lastY = e.pageY;

      this.dragRootEl = this.el;

      // Define the state as dragging so no other elements get attached due
      // to the identification process in init onStartDrag
      this.dragEl = $(document.createElement(this.options.listNodeName))
        .addClass(this.options.listClass + ' ' + this.options.dragClass);
      this.dragEl.css('width', dragItem.width());

      // this.placeEl -> $('<div class="' + list.options.placeClass + '"/>');
      // Put the targeted element into the dragEl which will work as a kind of a bag
      // while dragging
      dragItem.after(this.placeEl);
      dragItem[0].parentNode.removeChild(dragItem[0]);
      dragItem.appendTo(this.dragEl);

      $(document.body).append(this.dragEl);
      // Adjust the dragging bag (dragEl) initial position within the
      // element
      this.dragEl.css({
        'left': e.pageX - mouse.offsetX,
        'top':  e.pageY - mouse.offsetY
      });

      // what is the deepest element within dragEl?
      var i, depth,
          items = this.dragEl.find(this.options.itemNodeName);
      for(i = 0; i < items.length; i++) {
        depth = $(items[i]).parents(this.options.listNodeName).length;
        if(depth > this.dragDepth) {
          this.dragDepth = depth;
        }
      }
    },
    dragStop:  function(e) {
      var el = this.dragEl.children(this.options.itemNodeName).first();
      el[0].parentNode.removeChild(el[0]);
      this.placeEl.replaceWith(el);

      this.dragEl.remove();
      this.el.trigger('change');
      if(this.hasNewRoot) {
        this.dragRootEl.trigger('change');
      }
      this.reset();
    },

    dragMove: function(e) {
      var list, parent, prev, next, depth,
          opt   = this.options,
          mouse = this.mouse;

      // Placeholder will be dragged around, the member list will actually
      // hide itself and replace the placeholder on dragStop
      this.dragEl.css({
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

      // mouse position last events
      mouse.lastX = mouse.nowX;
      mouse.lastY = mouse.nowY;
      // mouse position this events
      mouse.nowX = e.pageX;
      mouse.nowY = e.pageY;
      // distance mouse moved between events
      mouse.distX = mouse.nowX - mouse.lastX;
      mouse.distY = mouse.nowY - mouse.lastY;
      // direction mouse was moving
      mouse.lastDirX = mouse.dirX;
      mouse.lastDirY = mouse.dirY;

      // direction mouse is now moving (on both axis)
      mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
      mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1;

      // axis mouse is now moving on
      var newAx = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;

      // do nothing on first move
      if(!mouse.moving) {
        mouse.dirAx  = newAx;
        mouse.moving = true;
        return;
      }

      // calc distance moved on this axis (and direction)
      // if the direction has changed
      if(mouse.dirAx !== newAx) {
        mouse.distAxX = 0;
        mouse.distAxY = 0;
      } else {
        mouse.distAxX += Math.abs(mouse.distX);
        if(mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) {
          mouse.distAxX = 0;
        }
        mouse.distAxY += Math.abs(mouse.distY);
        if(mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) {
          mouse.distAxY = 0;
        }
      }
      mouse.dirAx = newAx;

      /**
       * move horizontal only to right
       */
      if(mouse.dirAx && mouse.distAxX >= opt.threshold) {
        // reset move distance on x-axis for new phase
        mouse.distAxX = 0;
        // this.placeEl placeholder element
        prev = this.placeEl.prev(opt.itemNodeName);
        // increase horizontal level if previous sibling exists and is not collapsed
        if(mouse.distX > 0 && prev.length && !prev.hasClass(opt.collapsedClass)) {
          // cannot increase level when item above is collapsed
          list = prev.find(opt.listNodeName).last();
          // check if depth limit has reached
          depth = this.placeEl.parents(opt.listNodeName).length;
          if(depth + this.dragDepth <= opt.maxDepth) {
            // create new sub-level if one doesn't exist
            if(!list.length) {
              list = $('<' + opt.listNodeName + '/>').addClass(opt.listClass);
              list.append(this.placeEl);
              prev.append(list);
              this.setParent(prev);
            } else {
              // else append to next level up
              list = prev.children(opt.listNodeName).last();
              list.append(this.placeEl);
            }
          }
        }
        // decrease horizontal level
        if(mouse.distX < 0) {
          // we can't decrease a level if an item preceeds the current one
          next = this.placeEl.next(opt.itemNodeName);
          if(next.length) {
            this.placeEl.before(next);
          }
          if(!next.length) {
            parent = this.placeEl.parent();
            this.placeEl.closest(opt.itemNodeName).after(this.placeEl);
            if(!parent.children().length) {
              this.unsetParent(parent.parent());
            }
          }
        }
      }

      var isEmpty = false;

      // find list item under cursor
      if(!hasPointerEvents) {
        this.dragEl[0].style.visibility = 'hidden';
      }
      this.pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));
      if(!hasPointerEvents) {
        this.dragEl[0].style.visibility = 'visible';
      }
      if(this.pointEl.hasClass(opt.handleClass)) {
        this.pointEl = this.pointEl.parent(opt.itemNodeName);
      }
      if(this.pointEl.hasClass(opt.emptyClass)) {
        isEmpty = true;
      }
      else if(!this.pointEl.length || !this.pointEl.hasClass(opt.itemClass)) {
        return;
      }

      // find parent list of item under cursor
      var pointElRoot = this.pointEl.closest('.' + opt.rootClass),
          isNewRoot   = this.dragRootEl.data('domenu-id') !== pointElRoot.data('domenu-id');

      /**
       * move vertical
       */
      if(!mouse.dirAx || isNewRoot || isEmpty) {
        // check if groups match if dragging over new root
        if(isNewRoot && opt.group !== pointElRoot.data('domenu-group')) {
          return;
        }
        // check depth limit
        depth = this.dragDepth - 1 + this.pointEl.parents(opt.listNodeName).length;
        if(depth > opt.maxDepth) {
          return;
        }
        var before = e.pageY < (this.pointEl.offset().top + this.pointEl.height() / 2);
        parent     = this.placeEl.parent();
        // if empty create new list to replace empty placeholder
        if(isEmpty) {
          list = $(document.createElement(opt.listNodeName)).addClass(opt.listClass);
          list.append(this.placeEl);
          this.pointEl.replaceWith(list);
        }
        else if(before) {
          this.pointEl.before(this.placeEl);
        }
        else {
          this.pointEl.after(this.placeEl);
        }
        if(!parent.children().length) {
          this.unsetParent(parent.parent());
        }
        if(!this.dragRootEl.find(opt.itemNodeName).length) {
          this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>');
        }
        // parent root list has changed
        if(isNewRoot) {
          this.dragRootEl = pointElRoot;
          this.hasNewRoot = this.el[0] !== this.dragRootEl[0];
        }
      }
    }

  };

  /**
   * Works like a proxy to Plugin prototype.
   * Separates the API of the developer from the API
   * of the user, so we can change whatever we'd like
   * in the future.
   * @param {Object, Plugin} plugin
   * @param {????} lists  [????] (don't have time to check, can't recall)
   */
  function PublicPlugin(plugin, lists) {
    if(!plugin) throw new TypeError('expected object, got ' + typeof plugin);
    this._plugin = plugin,
      this._lists = lists;
  }

  PublicPlugin.prototype = {
    getLists:     function(params) {
      return this._lists;
    },
    parseJson:    function(data, override) {
      var data = data || null, override = override || false;
      this._plugin.deserialize(data, override);
      return this;
    },
    toJson:       function() {
      var data = this._plugin.serialize();
      return JSON.stringify(data);
    },
    expandAll:    function() {
      this._plugin.expandAll();
      return this;
    },
    collapseAll:  function() {
      this._plugin.collapseAll();
      return this;
    },
    expand:       function(cb) {
      this._plugin.expandAll(cb);
      return this;
    },
    collapse:     function(cb) {
      this._plugin.collapseAll(cb);
      return this;
    },
    getListNodes: function(cb) {
      var opt       = this._plugin.options,
          listNodes = this._plugin.el.find(opt.listNodeName);
      return listNodes;
    }
  }

  /**
   * @version-control +0.0.1 unused variables cleanup
   * @version-control +0.0.1
   * @param params
   * @returns {*|PublicPlugin}
   */
  // $('#domenu').domenu();
  $.fn.domenu = function(params) {
    // jQuery DOM Element
    // <div class="dd" id="domenu">
    //  <ol class="dd-list"></ol>
    // </div>
    // I.e. returns the element on which domenu() was called on
    // $('#example').domenu() jQuery will assign $('#example') to this
    // within this function

    lists      = this.first();
    var retval = null,
        domenu = $(this),
        plugin, pPlugin;

    lists.each(function() {
      // lists = jQuery object
      // each sets this, to the current element in iteration
      if(!domenu.data("domenu")) {
        // Binds new Plugin to $('#domenu').data('domenu')... with specified params
        domenu.data("domenu", new Plugin(this, params));
        domenu.data("domenu-id", new Date().getTime());
      }
      else {
        if(typeof params === 'string') {
          if(typeof pPlugin[params] === 'function') {
            // proxy
            var retval = pPlugin[params]();
          }
          else if(typeof plugin[params] === 'function') {
            var retval = plugin[params]();
          }
        }
      }
    });

    plugin  = domenu.data("domenu");
    pPlugin = new PublicPlugin(plugin, lists);
    return retval || pPlugin;
  };

})(window.jQuery || window.Zepto, window, document);
