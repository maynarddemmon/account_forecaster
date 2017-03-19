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
            headerHeight = 28;
        
        var headerView = this.headerView = new V(this, {
            height:headerHeight, bgColor:'#dddddd'
        });
        
        var addBtn = new B(headerView, {
            x:2, y:5, text:FA.makeTag(['plus']) + ' New Account', buttonType:'green', 
            width:102, inset:0, tooltip:'Create a new account.'
        }, [{
            doActivated: function() {self.newAccount();}
        }]);
        FA.registerForNotification(addBtn.textView);
        
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
    }
});
