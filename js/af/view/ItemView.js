/** An item in the list.
    
    Events:
        None
    
    Attributes:
        None
*/
af.ItemView = new JS.Class('ItemView', myt.SimpleButton, {
    include:[af.ItemMixin],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        HEIGHT:24,
        INSUFFICIENT_FUNDS_COLOR:'#aa0000',
        INSUFFICIENT_FUNDS_BGCOLOR:'#ffeeee',
        DEBIT_COLOR:'#aa0000',
        CREDIT_COLOR:'#00aa00',
        BALANCE_BAR_WIDTH:200
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        var IV = af.ItemView;
        attrs.height = IV.HEIGHT;
        attrs.activeColor = '#eeeeee';
        attrs.hoverColor = '#f8f8f8';
        attrs.readyColor = '#ffffff';
        attrs.focusEmbellishment = false;
        
        this.callSuper(parent, attrs);
        
        var M = myt,
            T = M.Text,
            y = 5;
        
        this.dateView = new T(this, {x:10, y:y, width:155});
        var labelView = this.labelView = new T(this, {x:170, y:y, width:200});
        labelView.enableEllipsis();
        this.amountView = new T(this, {x:375, y:y, width:100, textAlign:'right'});
        this.balanceView = new T(this, {x:480, y:y, width:100, textAlign:'right'});
        var balanceBar = this.balanceBar = new M.View(this, {x:585, y:6, width:IV.BALANCE_BAR_WIDTH, height:12});
        this.innerBalanceBar = new M.View(balanceBar, {height:12});
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    
    
    // Methods /////////////////////////////////////////////////////////////////
    update: function(data, balance, min, max, width) {
        this._recurrence = data[0];
        
        var amount = data[3],
            label = data[2],
            IV = af.ItemView,
            ibb = this.innerBalanceBar,
            range = max - min,
            barWidth = (Math.abs(balance) / range) * IV.BALANCE_BAR_WIDTH;
        
        this.dateView.setText(af.formatItemDate(new Date(data[1])));
        this.labelView.setText(label);
        this.setTooltip(label.length > 30 ? label : '');
        this.amountView.setText(af.formatCurrency(amount, true));
        this.balanceView.setText(af.formatCurrency(balance, true));
        
        // Formatting for values
        this.amountView.setTextColor(amount >= 0 ? IV.CREDIT_COLOR : IV.DEBIT_COLOR);
        if (balance >= 0) {
            this.balanceView.setTextColor('');
            this.setReadyColor('#ffffff');
            
            ibb.setBgColor('#333333');
            ibb.setX(0 > min ? (-min / range) * IV.BALANCE_BAR_WIDTH : 0);
            ibb.setRoundedTopRightCorner(2);
            ibb.setRoundedBottomRightCorner(2);
            ibb.setRoundedTopLeftCorner(0);
            ibb.setRoundedBottomLeftCorner(0);
        } else {
            this.balanceView.setTextColor(IV.INSUFFICIENT_FUNDS_COLOR);
            this.setReadyColor(IV.INSUFFICIENT_FUNDS_BGCOLOR);
            
            ibb.setBgColor(IV.INSUFFICIENT_FUNDS_COLOR);
            ibb.setX(0 > min ? ((balance - min) / range) * IV.BALANCE_BAR_WIDTH : 0);
            ibb.setRoundedTopRightCorner(0);
            ibb.setRoundedBottomRightCorner(0);
            ibb.setRoundedTopLeftCorner(2);
            ibb.setRoundedBottomLeftCorner(2);
        }
        
        ibb.setWidth(barWidth);
        
        this.setVisible(true);
        this.setWidth(width);
    },
    
    clean: function() {
        delete this._recurrence;
        this.setVisible(false);
    }
});
