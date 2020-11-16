/** An item in the account list.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        _account:af.Account
        _labelView
        _colsView
*/
af.AccountItemView = new JS.Class('AccountItemView', myt.View, {
    include:[af.BaseItemMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.height = af.ITEM_HEIGHT_ACCOUNT;
        attrs.bgColor = '#f8f8f8';
        
        this.callSuper(parent, attrs);
        
        var self = this,
            M = myt,
            FA = M.FontAwesome;
        
        var deleteBtn = new af.Button(self, {
            x:2, y:2, height:20, text:af.DELETE_TXT, buttonType:'red', 
            width:20, inset:5, tooltip:'Remove this account.'
        }, [{doActivated: function() {self._removeIt();}}]);
        FA.registerForNotification(deleteBtn.textView);
        
        var labelView = self._labelView = new M.InputText(self, {
            x:26, y:2, width:120, height:20, roundedCorners:2, bgColor:'#ffffff',
            maxLength:128, placeholder:'Enter Account Name'
        }, [{
            setValue: function(v, noUpdate) {
                this.callSuper(v);
                if (!noUpdate) {
                    var account = self._account;
                    if (account) account.setLabel(this.value);
                }
            }
        }]);
        labelView.deStyle.padding = '1px 4px 3px 4px';
        
        var colsView = self._colsView = new M.View(self, {x:150});
        new M.SpacedLayout(colsView, {spacing:1, collapseParent:true});
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    update: function(account, width) {
        this._account = account;
        this._labelView.setValue(account.label, true);
        this.setVisible(true);
        this.setWidth(width);
    },
    
    notify: function(key, value) {
        if (key === 'cols') {
            var colsView = this._colsView,
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
    },
    
    _updateBars: function() {
        var model = this._account,
            range = model.getValueRange(),
            svs = this._colsView.getSubviews(),
            i = svs.length,
            sv;
        while (i) {
            sv = svs[--i];
            af.updateBar(range, model.getDatum(i), sv.height, sv.barView);
        }
    },
    
    clean: function() {
        delete this._account;
        this.setVisible(false);
    },
    
    _removeIt: function() {
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
});

af.AccountItemViewCol = new JS.Class('AccountItemViewCol', myt.View, {
    include:[myt.MouseOverAndDown],
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.bgColor = '#eeeeee';
        attrs.width = 10;
        attrs.height = af.ITEM_HEIGHT_ACCOUNT;
        
        this.callSuper(parent, attrs);
        
        var self = this,
            itemView = self.itemView,
            model = itemView._account,
            M = myt;
        
        self.barView = new M.View(self, {width:10});
        
        var valueView = self._valueView = new M.InputText(self, {
            x:2, y:2, width:90, height:20, roundedCorners:2, bgColor:'#ffffff',
            maxLength:16, allowedChars:'0123456789,.-$', opacity:0, zIndex:1
        }, [{
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                this.attachToDom(this, 'handleKeyDown', 'keydown');
            },
            setValue: function(v, noUpdate) {
                this.callSuper(v);
                if (!noUpdate) {
                    model.setDatum(self.idx, v);
                    itemView._updateBars();
                }
            },
            handleKeyDown: function(event) {
                if (M.KeyObservable.getKeyCodeFromEvent(event) === 13) M.global.focus.next();
            },
            doFocus: function() {
                this.callSuper();
                this.setValue(af.formatCurrency(model.getDatum(self.idx) * 100, true, true), true);
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
        var valueView = this._valueView;
        if (!valueView.focused) valueView.setValue(v, true);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doMouseDown: function(event) {
        this.callSuper(event);
        
        // Don't interfere with mouse behavior in the InputText
        if (event.value.srcElement === this._valueView.domElement) return true;
    },
    
    doMouseOver: function(event) {
        this.callSuper(event);
        
        var valueView = this._valueView;
        valueView.setZIndex(2);
        valueView.setOpacity(0.75);
        valueView.focus();
        this.barView.setOpacity(0.5);
    },
    
    doMouseOut: function(event) {
        this.callSuper(event);
        
        var valueView = this._valueView;
        valueView.setZIndex(1);
        valueView.setOpacity(0);
        this.barView.setOpacity(1);
    }
});
