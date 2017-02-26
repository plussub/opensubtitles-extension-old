
      suite('menu a11y tests', function() {
        test('menu has role="menu"', function() {
          var menu = fixture('basic');
          assert.equal(menu.getAttribute('role'), 'menu', 'has role="menu"');
        });

        test('first item gets focus when menu is focused', function(done) {
          var menu = fixture('basic');
          MockInteractions.focus(menu);
          Polymer.Base.async(function() {
            var ownerRoot = Polymer.dom(menu.firstElementChild).getOwnerRoot() || document;
            var activeElement = Polymer.dom(ownerRoot).activeElement;
            assert.equal(activeElement, menu.firstElementChild, 'menu.firstElementChild is focused');
            done();
          });
        });

        test('first item gets focus when menu is focused in a single item menu', function(done) {
          var menu = fixture('single-item');
          MockInteractions.focus(menu);
          Polymer.Base.async(function() {
            var ownerRoot = Polymer.dom(menu.firstElementChild).getOwnerRoot() || document;
            var activeElement = Polymer.dom(ownerRoot).activeElement;
            assert.equal(activeElement, menu.firstElementChild, 'menu.firstElementChild is focused');
            done();
          });
        });

        test('selected item gets focus when menu is focused', function(done) {
          var menu = fixture('basic');
          menu.selected = 1;
          MockInteractions.focus(menu);
          Polymer.Base.async(function() {
            var ownerRoot = Polymer.dom(menu.selectedItem).getOwnerRoot() || document;
            var activeElement = Polymer.dom(ownerRoot).activeElement;
            assert.equal(activeElement, menu.selectedItem, 'menu.selectedItem is focused');
            done();
          });
        });

        test('focusing on next item skips disabled items', function(done) {
          var menu = fixture('disabled');
          MockInteractions.focus(menu);
          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press down
            MockInteractions.keyDownOn(menu, 40);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[2], 'menu.items[2] is focused');
              done();
            });
          });
        });

        test('focusing on next item skips invisible items', function(done) {
          var menu = fixture('invisible');

          MockInteractions.focus(menu);
          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press down
            MockInteractions.keyDownOn(menu, 40);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[4], 'menu.items[4] is focused');
              done();
            });
          });
        });

        test('focusing on next item skips nested invisible items', function(done) {
          var nestedMenu = fixture('nested-invisible');
          var menu = nestedMenu.$.actualMenu;

          MockInteractions.focus(menu);
          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press down
            MockInteractions.keyDownOn(menu, 40);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[4], 'menu.items[4] is focused');
              done();
            });
          });
        });

        test('focusing on next item in empty menu', function(done) {
          var menu = fixture('empty');
          MockInteractions.focus(menu);
          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press down
            MockInteractions.keyDownOn(menu, 40);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, undefined, 'no focused item');
              done();
            });
          });
        });

        test('focusing on next item in all disabled menu', function(done) {
          var menu = fixture('only-disabled');
          MockInteractions.focus(menu);
          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press down
            MockInteractions.keyDownOn(menu, 40);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, undefined, 'no focused item');
              done();
            });
          });
        });

        test('focusing on previous item skips disabled items', function(done) {
          var menu = fixture('disabled');
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press up
            MockInteractions.keyDownOn(menu, 38);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[2], 'menu.items[2] is focused');
              done();
            });
          });
        });

        test('focusing on previous item skips invisible items', function(done) {
          var menu = fixture('invisible');
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press up
            MockInteractions.keyDownOn(menu, 38);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[4], 'menu.items[4] is focused');
              done();
            });
          });
        });

        test('focusing on previous item skips nested invisible items', function(done) {
          var nestedMenu = fixture('nested-invisible');
          var menu = nestedMenu.$.actualMenu;
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press up
            MockInteractions.keyDownOn(menu, 38);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[4], 'menu.items[4] is focused');
              done();
            });
          });
        });

        test('focusing on previous item in empty menu', function(done) {
          var menu = fixture('empty');
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press up
            MockInteractions.keyDownOn(menu, 38);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem,  undefined, 'no focused item');
              done();
            });
          });
        });

        test('focusing on previous item in all disabled menu', function(done) {
          var menu = fixture('only-disabled');
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press up
            MockInteractions.keyDownOn(menu, 38);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem,  undefined, 'no focused item');
              done();
            });
          });
        });

        test('focusing on item using key press skips disabled items', function(done) {
          var menu = fixture('disabled');
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press 'b'
            MockInteractions.keyDownOn(menu, 66);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[2], 'menu.items[2] is focused');
              done();
            });
          });
        });

        test('focusing on item using key press ignores disabled items', function(done) {
          var menu = fixture('disabled');
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press 'c'
            MockInteractions.keyDownOn(menu, 67);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[0], 'menu.items[0] is focused');
              done();
            });
          });
        });

        test('focusing on item using key press in all disabled items', function(done) {
          var menu = fixture('only-disabled');
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press 'c'
            MockInteractions.keyDownOn(menu, 67);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem,  undefined, 'no focused item');
              done();
            });
          });
        });

        test('focusing on item with multi-char, quick input', function(done) {
          var menu = fixture('countries');
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press 'u'
            MockInteractions.keyDownOn(menu, 85);

            // Key press 'g'
            MockInteractions.keyDownOn(menu, 71);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[1], 'menu.items[1] is focused');
              done();
            });
          });
        });

        test('focusing on item with bogus attr-for-item-title', function(done) {
          var menu = fixture('bogus-attr-for-item-title');
          MockInteractions.focus(menu);

          // Wait for async focus
          Polymer.Base.async(function() {
            // Key press 'i'
            MockInteractions.keyDownOn(menu, 73);

            Polymer.Base.async(function() {
              var focusedItem = Polymer.dom(menu).node.focusedItem;
              assert.equal(focusedItem, menu.items[0], 'menu.items[0] is still focused');
              done();
            });
          });

        });

        test('focusing non-item content does not auto-focus an item', function(done) {
          var menu = fixture('basic');
          menu.extraContent.focus();
          Polymer.Base.async(function() {
            var menuOwnerRoot = Polymer.dom(menu.extraContent).getOwnerRoot() || document;
            var menuActiveElement = Polymer.dom(menuOwnerRoot).activeElement;
            assert.equal(menuActiveElement, menu.extraContent, 'menu.extraContent is focused');
            assert.equal(Polymer.dom(document).activeElement, menu, 'menu is document.activeElement');
            done();
          });
        });

        test('last activated item in a multi select menu is focused', function(done) {
          var menu = fixture('multi');
          menu.selected = 0;
          menu.items[1].click();
          Polymer.Base.async(function() {
            var ownerRoot = Polymer.dom(menu.items[1]).getOwnerRoot() || document;
            var activeElement = Polymer.dom(ownerRoot).activeElement;
            assert.equal(activeElement, menu.items[1], 'menu.items[1] is focused');
            done();
          });
        });

        test('deselection in a multi select menu focuses deselected item', function(done) {
          var menu = fixture('multi');
          menu.selected = 0;
          menu.items[0].click();
          Polymer.Base.async(function() {
            var ownerRoot = Polymer.dom(menu.items[0]).getOwnerRoot() || document;
            var activeElement = Polymer.dom(ownerRoot).activeElement;
            assert.equal(activeElement, menu.items[0], 'menu.items[0] is focused');
            done();
          });
        });

        test('keyboard events should not bubble', function(done) {
          var menu = fixture('nested');
          var keyCounter = 0;

          menu.addEventListener('keydown', function(event) {
            if (menu.keyboardEventMatchesKeys(event, 'esc')) {
              keyCounter++;
            }
            if (menu.keyboardEventMatchesKeys(event, 'up')) {
              keyCounter++;
            }
            if (menu.keyboardEventMatchesKeys(event, 'down')) {
              keyCounter++;
            }
          });

          // up
          MockInteractions.keyDownOn(menu.firstElementChild, 38);
          // down
          MockInteractions.keyDownOn(menu.firstElementChild, 40);
          // esc
          MockInteractions.keyDownOn(menu.firstElementChild, 27);

          Polymer.Base.async(function() {
            assert.equal(menu.firstElementChild.tagName, 'TEST-MENU');
            assert.equal(keyCounter, 0);
            done();
          });
        });

        test('empty menus don\'t unfocus themselves', function(done) {
          var menu = fixture('empty');

          menu.focus();
          Polymer.Base.async(function() {
            assert.equal(Polymer.dom(document).activeElement, menu);
            done();
          });
        });

        test('`tabIndex` properties of all items are updated when items change', function(done) {
          var menu = fixture('basic');

          function assertTabIndexCounts(nodes, expected) {
            var tabIndexCounts = {};
            for (var i = 0; i < nodes.length; i++) {
              var tabIndex = nodes[i].tabIndex;
              if (tabIndexCounts[tabIndex]) {
                tabIndexCounts[tabIndex]++;
              } else {
                tabIndexCounts[tabIndex] = 1;
              }
            }

            assert.equal(Object.keys(tabIndexCounts).length, Object.keys(expected).length);
            Object.keys(expected).forEach(function(key) {
              assert.equal(tabIndexCounts[key], expected[key]);
            });
          }

          function divWithTabIndex(tabIndex) {
            var div = document.createElement('div');
            div.tabIndex = tabIndex;
            return div;
          }

          // Only the selected item will have tabIndex 0.
          menu.select(0);
          assertTabIndexCounts(menu.items, {"-1": 2, "0": 1});

          Polymer.dom(menu).appendChild(divWithTabIndex(1));
          Polymer.dom(menu).appendChild(divWithTabIndex(2));
          Polymer.dom(menu).appendChild(divWithTabIndex(3));

          // Async wait for `observeNodes`.
          Polymer.Base.async(function() {
            assertTabIndexCounts(menu.items, {"-1": 5, "0": 1});
            done();
          });
        });
      });
    