/** An item in the account list.
    
    Events:
        None
    
    Attributes:
        None
*/
af.AccountItemView = new JS.Class('AccountItemView', myt.View, {
    include:[af.BaseItemMixin],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        HEIGHT:72
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.height = af.AccountItemView.HEIGHT;
        attrs.bgColor = '#f8f8f8';
        attrs.tipAlign = 'right';
        
        this.callSuper(parent, attrs);
        
        var self = this,
            M = myt,
            FA = M.FontAwesome;
        
        var deleteBtn = new af.Button(self, {
            x:2, y:2, height:20, text:af.DELETE_TXT, buttonType:'red', 
            width:20, inset:5, tooltip:'Remove this account.'
        }, [{
            doActivated: function() {self.removeIt();}
        }]);
        FA.registerForNotification(deleteBtn.textView);
        
        var labelView = self.labelView = new M.InputText(self, {
            x:26, y:2, width:120, height:20, roundedCorners:2, bgColor:'#ffffff',
            maxLength:128, placeholder:'Enter Account Name'
        }, [{
            setValue: function(v) {
                this.callSuper(v);
                if (self._ready) {
                    if (self._account) self._account.setLabel(this.value);
                }
            }
        }]);
        labelView.deStyle.padding = '1px 4px 3px 4px';
        
        var colsView = self.colsView = new M.View(self, {x:150});
        new M.SpacedLayout(colsView, {spacing:1, collapseParent:true});
        
        self._ready = true;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    
    
    // Methods /////////////////////////////////////////////////////////////////
    update: function(account, width) {
        this._ready = false;
        this._account = account;
        
        this.labelView.setValue(account.label);
        
        this._ready = true;
        
        this.setVisible(true);
        this.setWidth(width);
    },
    
    notify: function(key, value) {
        this._ready = false;
        
        if (key === 'cols') {
            var colsView = this.colsView,
                svs = colsView.getSubviews();
            
            // Destroy Children
            while (svs.length > value) svs[svs.length - 1].destroy();
            
            // Make New Children if needed
            while (svs.length < value) new af.AccountItemViewCol(colsView, {itemView:this});
            
            // Update Data
            var data = this._account.data,
                len = svs.length,
                i = 0, sv;
            for (; len > i; i++) {
                sv = svs[i];
                sv.setValue(data[i] || 0);
                sv.setIdx(i);
            }
            
            this._updateBars();
        }
        
        this._ready = true;
    },
    
    _updateBars: function() {
        var model = this._account,
            range = model.getValueRange(),
            svs = this.colsView.getSubviews(),
            i = svs.length,
            sv;
        while (i) {
            sv = svs[--i];
            af.updateBar(range, model.getDatum(i), sv.height, sv.barView);
        }
    },
    
    clean: function() {
        delete this._account;
        this._ready = false;
        this.setVisible(false);
    },
    
    removeIt: function() {
        if (this._ready) {
            var account = this._account;
            myt.global.forecaster.dimmer.showConfirm(
                'Really remove the account item: ' + account.label + '?',
                function(action) {
                    switch(action) {
                        case 'confirmBtn':
                            account.removeIt();
                            break;
                    }
                }
            );
        }
    }
});

af.AccountItemViewCol = new JS.Class('AccountItemViewCol', myt.View, {
    include:[myt.MouseOver],
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.bgColor = '#eeeeee';
        attrs.width = 20;
        attrs.height = af.AccountItemView.HEIGHT;
        
        this.callSuper(parent, attrs);
        
        var self = this,
            itemView = self.itemView,
            model = itemView._account,
            M = myt;
        
        this.barView = new M.View(self, {width:20});
        
        var valueView = self.valueView = new M.InputText(self, {
            x:2, y:2, width:80, height:20, roundedCorners:2, bgColor:'#ffffff',
            maxLength:16, allowedChars:'0123456789,.-$', opacity:0, zIndex:1
        }, [{
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                this.attachToDom(this, 'handleKeyDown', 'keydown');
            },
            setValue: function(v) {
                this.callSuper(v);
                if (itemView._ready) {
                    if (model) {
                        model.setDatum(self.idx, v);
                        itemView._updateBars();
                    }
                }
            },
            handleKeyDown: function(event) {
                if (M.KeyObservable.getKeyCodeFromEvent(event) === 13) M.global.focus.next();
            },
            doFocus: function() {
                this.callSuper();
                this.setValue(af.formatCurrency(model.getDatum(self.idx) * 100, true, true));
                self.doMouseOver();
            },
            doBlur: function() {
                this.callSuper();
                self.doMouseOut();
            }
        }]);
        valueView.deStyle.padding = '1px 4px 3px 4px';
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setItemView: function(v) {this.itemView = v;},
    setIdx: function(v) {this.idx = v;},
    
    setValue: function(v) {
        this.value = v;
        if (!this.valueView.focused) this.valueView.setValue(v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doMouseOver: function() {
        var valueView = this.valueView;
        valueView.setZIndex(2);
        valueView.setOpacity(0.75);
        valueView.focus();
        this.barView.setOpacity(0.5);
    },
    
    doMouseOut: function() {
        var valueView = this.valueView;
        valueView.setZIndex(1);
        valueView.setOpacity(0);
        this.barView.setOpacity(1);
    }
});
