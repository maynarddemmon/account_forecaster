/** An item in the list.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        _recurrence:af.Recurrence subclass
        _dateView
        _labelView
        _amountView
        _innerBalanceBar
*/
af.ItemView = new JS.Class('ItemView', myt.SimpleButton, {
    include:[af.ItemMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        var self = this,
            AF = af,
            M = myt,
            T = M.Text,
            V = M.View,
            y = 5;
        
        attrs.height = AF.ITEM_HEIGHT;
        attrs.activeColor = '#eeeeee';
        attrs.hoverColor = '#f8f8f8';
        attrs.readyColor = '#ffffff';
        attrs.focusEmbellishment = false;
        
        this.callSuper(parent, attrs);
        
        self._dateView = new T(self, {x:10, y:y, width:155});
        (self._labelView = new T(self, {x:170, y:y, width:200})).enableEllipsis();
        self._amountView = new T(self, {x:375, y:y, width:100, textAlign:'right'});
        self._balanceView = new T(self, {x:480, y:y, width:100, textAlign:'right'});
        self._innerBalanceBar = new V(new V(self, {x:585, y:6, width:AF.BALANCE_BAR_WIDTH, height:12}), {height:12});
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    update: function(data, balance, min, max, width) {
        var self = this,
            balanceView = self._balanceView,
            amountView = self._amountView,
            ibb = self._innerBalanceBar,
            AF = af,
            amount = data[3],
            label = data[2],
            range = max - min,
            barWidth = (Math.abs(balance) / range) * AF.BALANCE_BAR_WIDTH;
        
        self._recurrence = data[0];
        
        self._dateView.setText(AF.formatItemDate(new Date(data[1])));
        self._labelView.setText(label);
        self.setTooltip(label.length > 30 ? label : '');
        amountView.setText(AF.formatCurrency(amount, true));
        balanceView.setText(AF.formatCurrency(balance, true));
        
        // Formatting for values
        amountView.setTextColor(amount >= 0 ? AF.CREDIT_COLOR : AF.DEBIT_COLOR);
        if (balance >= 0) {
            balanceView.setTextColor('');
            self.setReadyColor('#ffffff');
            
            ibb.setBgColor('#333333');
            ibb.setX(0 > min ? (-min / range) * AF.BALANCE_BAR_WIDTH : 0);
            ibb.setRoundedTopRightCorner(2);
            ibb.setRoundedBottomRightCorner(2);
            ibb.setRoundedTopLeftCorner(0);
            ibb.setRoundedBottomLeftCorner(0);
        } else {
            balanceView.setTextColor(AF.INSUFFICIENT_FUNDS_COLOR);
            self.setReadyColor(AF.INSUFFICIENT_FUNDS_BGCOLOR);
            
            ibb.setBgColor(AF.INSUFFICIENT_FUNDS_COLOR);
            ibb.setX(0 > min ? ((balance - min) / range) * AF.BALANCE_BAR_WIDTH : 0);
            ibb.setRoundedTopRightCorner(0);
            ibb.setRoundedBottomRightCorner(0);
            ibb.setRoundedTopLeftCorner(2);
            ibb.setRoundedBottomLeftCorner(2);
        }
        ibb.setWidth(barWidth);
        
        self.setVisible(true);
        self.setWidth(width);
    },
    
    clean: function() {
        delete this._recurrence;
        this.setVisible(false);
    }
});
