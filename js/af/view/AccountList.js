/** The list of accounts view.
    
    Events:
        None
    
    Attributes:
        model:af.Account
    
    Private Attributes:
        _headerView
        _colsView
        _scrollView
        _containerView
*/
af.AccountList = new JS.Class('AccountList', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.bgColor = '#ffffff';
        
        this.callSuper(parent, attrs);
        
        var self = this,
            M = myt,
            V = M.View,
            FA = M.FontAwesome,
            B = af.Button,
            headerHeight = 74;
        
        var headerView = self._headerView = new V(self, {height:headerHeight, bgColor:'#dddddd'});
        var addBtn = new B(headerView, {
            x:2, y:53, text:FA.makeTag(['plus']) + ' New Account', buttonType:'green', 
            width:104, tooltip:'Create a new account.'
        }, [{doActivated: function() {self.model.addAccount();}}]);
        FA.registerForNotification(addBtn.textView);
        
        var colsView = self._colsView = new V(headerView, {x:150, y:1, height:72, bgColor:'#f8f8f8'});
        new M.SpacedLayout(colsView, {spacing:1, collapseParent:true});
        
        var scrollView = self._scrollView = new V(self, {
            y:headerHeight, height:this.height - headerHeight, overflow:'autoy'
        });
        self._containerView = new V(scrollView, {}, [{
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                this.pool = new M.TrackActivesPool(af.AccountItemView, this);
            },
            replicate: function(accounts) {
                var i = 0, len = accounts.length,
                    width = this.width,
                    pool = this.pool,
                    account,
                    sv, value = 1;;
                pool.putActives();
                
                for (; len > i; i++) {
                    account = accounts[i];
                    (sv = pool.getInstance()).update(account, width);
                    
                    sv.setY(value);
                    value += sv.height + 1;
                }
                
                this.setHeight(value);
            },
            setWidth: function(v, supressEvent) {
                this.callSuper(v, supressEvent);
                if (this.inited) {
                    var svs = this.getSubviews(), i = svs.length;
                    while (i) svs[--i].setWidth(v);
                }
            },
            
            notify: function(key, value) {
                var rows = this.pool.getActives(), i = rows.length;
                while (i) rows[--i].notify(key, value);
            }
        }]);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setModel: function(v) {this.model = v;},
    
    setWidth: function(v, supressEvent) {
        if (v > 0) {
            this.callSuper(v, supressEvent);
            if (this.inited) {
                v = this.width;
                this._headerView.setWidth(v);
                this._scrollView.setWidth(v);
                this._containerView.setWidth(v);
            }
        }
    },
    
    setHeight: function(v, supressEvent) {
        if (v > 0) {
            this.callSuper(v, supressEvent);
            if (this.inited) {
                v = this.height;
                var scrollView = this._scrollView;
                scrollView.setHeight(v - scrollView.y);
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    refresh: function() {
        var model = this.model;
        if (model.dataLoaded) this._containerView.replicate(model.getAccounts());
    },
    
    refreshCols: function(v) {
        var model = this.model;
        if (model.dataLoaded) this._containerView.notify('cols', model._accountCols);
    },
    
    updateTotals: function(totals) {
        var totalLen = totals.length,
            colsView = this._colsView,
            svs = colsView.getSubviews();
        
        // Destroy Children
        while (svs.length > totalLen) svs[svs.length - 1].destroy();
        
        // Make New Children if needed
        while (svs.length < totalLen) new af.ColTotalView(colsView);
        
        // Update Data
        var len = svs.length,
            i = 0;
        for (; len > i; i++) svs[i].setValue(totals[i] || 0);
        
        var range = af.getValueRange(totals), sv;
        i = svs.length;
        while (i) {
            sv = svs[--i];
            af.updateBar(range, sv.value, sv.height, sv.barView);
        }
    }
});

af.ColTotalView = new JS.Class('ColTotalView', myt.View, {
    include:[myt.MouseOver],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.bgColor = '#eeeeee';
        attrs.width = 20;
        attrs.height = af.ITEM_HEIGHT_ACCOUNT;
        
        this.callSuper(parent, attrs);
        
        var self = this,
            M = myt;
        
        self.barView = new M.View(self, {width:20});
        
        var labelView = self.labelView = new M.Text(self, {
            x:2, y:2, roundedCorners:2, bgColor:'#ffffff', opacity:0, zIndex:1
        });
        labelView.deStyle.padding = '2px 4px 2px 4px';
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValue: function(v) {
        this.value = v;
        this.labelView.setText('total: ' + af.formatCurrency(v * 100, true, true));
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doMouseOver: function() {
        this.labelView.setZIndex(2);
        this.labelView.setOpacity(0.75);
        this.barView.setOpacity(0.5);
    },
    
    doMouseOut: function() {
        this.labelView.setZIndex(1);
        this.labelView.setOpacity(0);
        this.barView.setOpacity(1);
    }
});
