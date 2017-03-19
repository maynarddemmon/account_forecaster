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
        HEIGHT:60,
        DELETE_TXT:myt.FontAwesome.makeTag(['times'])
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        var AIV = af.AccountItemView;
        attrs.height = AIV.HEIGHT;
        attrs.bgColor = '#f8f8f8';
        attrs.tipAlign = 'right';
        
        this.callSuper(parent, attrs);
        
        var self = this,
            M = myt,
            FA = M.FontAwesome;
        
        var deleteBtn = new af.Button(this, {
            x:2, y:2, height:20, text:AIV.DELETE_TXT, buttonType:'red', 
            width:20, inset:0, tooltip:'Remove this account.'
        }, [{
            doActivated: function() {self.removeIt();}
        }]);
        FA.registerForNotification(deleteBtn.textView);
        
        var labelView = this.labelView = new M.InputText(this, {
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
        
        var colsView = this.colsView = new M.View(this, {x:150});
        new M.SpacedLayout(colsView, {spacing:1, collapseParent:true});
        
        this._ready = true;
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
        var range = this._account.getValueRange(),
            colsView = this.colsView,
            svs = colsView.getSubviews(),
            i = svs.length;
        while (i) svs[--i].updateBar(range);
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
            itemView = this.itemView,
            M = myt;
        
        this.barView = new M.View(this, {width:20});
        
        var valueView = this.valueView = new M.InputText(this, {
            x:2, y:2, width:56, height:20, roundedCorners:2, bgColor:'#ffffff',
            maxLength:16, allowedChars:'0123456789,.-',
            opacity:0, zIndex:1,
            value:self.value
        }, [{
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                this.attachToDom(this, 'handleKeyDown', 'keydown');
            },
            setValue: function(v) {
                this.callSuper(v);
                if (self._ready && itemView._ready) {
                    if (itemView._account) {
                        itemView._account.setDatum(self.idx, this.value);
                        itemView._updateBars();
                    }
                }
            },
            handleKeyDown: function(event) {
                if (M.KeyObservable.getKeyCodeFromEvent(event) === 13) myt.global.focus.next();
            },
            doFocus: function() {
                this.callSuper();
                self.doMouseOver();
            },
            doBlur: function() {
                this.callSuper();
                self.doMouseOut();
            }
        }]);
        valueView.deStyle.padding = '1px 4px 3px 4px';
        
        this._ready = true;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setItemView: function(v) {
        this.itemView = v;
    },
    
    setIdx: function(v) {
        this.idx = v;
    },
    
    setValue: function(v) {
        this.value = v;
        
        if (this._ready) {
            if (!this.valueView.focused) this.valueView.setValue(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    updateBar: function(range) {
        var h = this.height,
            min = range.min,
            max = range.max,
            scale, range, zeroPoint
            value = this.itemView._account.getDatum(this.idx),
            barView = this.barView,
            isPositive = value >= 0;
        
        if (min < 0 && max > 0) {
            range = max - min;
            zeroPoint = max * h / range;
        } else if (max > 0) {
            range = max;
            zeroPoint = h;
        } else {
            range = -min;
            zeroPoint = 0;
        }
        scale = h / range;
        
        barView.setHeight(Math.abs(value) * scale);
        
        if (isPositive) {
            barView.setBgColor('#333333');
            barView.setY(zeroPoint - barView.height);
        } else {
            barView.setBgColor(af.ItemView.INSUFFICIENT_FUNDS_COLOR);
            barView.setY(zeroPoint);
        }
    },
    
    doMouseOver: function() {
        this.valueView.setOpacity(0.75);
        this.valueView.focus();
        this.barView.setOpacity(0.25);
    },
    
    doMouseOut: function() {
        this.valueView.setOpacity(0);
        this.barView.setOpacity(1);
    }
});
