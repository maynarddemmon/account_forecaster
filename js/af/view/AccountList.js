/** The list of accounts view.
    
    Events:
        None
    
    Attributes:
        None
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
        
        var headerView = this.headerView = new V(this, {
            height:headerHeight, bgColor:'#dddddd'
        });
        
        var addBtn = new B(headerView, {
            ignoreLayout:true,
            x:2, y:53, text:FA.makeTag(['plus']) + ' New Account', buttonType:'green', 
            width:105, contentAlign:'left', inset:6, tooltip:'Create a new account.'
        }, [{
            doActivated: function() {self.newAccount();}
        }]);
        FA.registerForNotification(addBtn.textView);
        
        var colsView = this.colsView = new V(headerView, {x:150, y:1, height:72, bgColor:'#f8f8f8'});
        new M.SpacedLayout(colsView, {spacing:1, collapseParent:true});
        
        var scrollView = this.scrollView = new V(this, {
            y:headerHeight, height:this.height - headerHeight, overflow:'autoy'
        });
        this.containerView = new V(scrollView, {}, [{
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
            if (this.inited) this._updateWidth();
        }
    },
    
    _updateWidth: function() {
        var v = this.width;
        this.headerView.setWidth(v);
        this.scrollView.setWidth(v);
        this.containerView.setWidth(v);
        this.colsView.setWidth(v - this.colsView.x);
    },
    
    setHeight: function(v, supressEvent) {
        if (v > 0) {
            this.callSuper(v, supressEvent);
            if (this.inited) this._updateHeight();
        }
    },
    
    _updateHeight: function() {
        var scrollView = this.scrollView;
        scrollView.setHeight(this.height - scrollView.y);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    newAccount: function() {
        this.model.addAccount();
    },
    
    refresh: function() {
        if (!this.model.dataLoaded) return;
        
        var accounts = this.model.getAccounts();
        this.containerView.replicate(accounts);
    },
    
    refreshCols: function(v) {
        if (!this.model.dataLoaded) return;
        this.containerView.notify('cols', this.model._accountCols);
    },
    
    updateTotals: function(totals) {
        var totalLen = totals.length,
            colsView = this.colsView,
            svs = colsView.getSubviews();
        
        // Destroy Children
        while (svs.length > totalLen) svs[svs.length - 1].destroy();
        
        // Make New Children if needed
        while (svs.length < totalLen) new af.ColTotalView(colsView);
        
        // Update Data
        var len = svs.length,
            i = 0;
        for (; len > i; i++) svs[i].setValue(totals[i] || 0);
        
        var range = af.getValueRange(totals),
            i = svs.length;
        while (i) svs[--i].updateBar(range);
    }
});

af.ColTotalView = new JS.Class('ColTotalView', myt.View, {
    include:[myt.MouseOver],
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.bgColor = '#eeeeee';
        attrs.width = 20;
        attrs.height = af.AccountItemView.HEIGHT;
        
        this.callSuper(parent, attrs);
        
        var self = this,
            M = myt;
        
        this.barView = new M.View(this, {width:20});
        
        var labelView = this.labelView = new M.Text(this, {
            x:2, y:2, roundedCorners:2, bgColor:'#ffffff',
            opacity:0, zIndex:1,
            text:self.value
        });
        labelView.deStyle.padding = '2px 4px 2px 4px';
        
        this._ready = true;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setValue: function(v) {
        this.value = v;
        
        if (this._ready) this.labelView.setText('total: ' + af.formatCurrency(v * 100, true, true));
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    updateBar: function(range) {
        var h = this.height,
            min = range.min,
            max = range.max,
            scale, range, zeroPoint
            value = this.value,
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
        this.labelView.setZIndex(2);
        this.labelView.setOpacity(0.75);
        this.barView.setOpacity(0.25);
    },
    
    doMouseOut: function() {
        this.labelView.setZIndex(1);
        this.labelView.setOpacity(0);
        this.barView.setOpacity(1);
    }
});
