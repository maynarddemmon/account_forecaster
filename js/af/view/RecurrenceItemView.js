/** An item in the recurrence list.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        _recurrence:af.Recurrence subclass
        _labelView
*/
af.RecurrenceItemView = new JS.Class('RecurrenceItemView', myt.SimpleButton, {
    include:[af.ItemMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        var self = this,
            AF = af,
            B = AF.Button,
            M = myt,
            FA = M.FontAwesome;
        
        attrs.height = AF.ITEM_HEIGHT_RECURRENCE;
        attrs.activeColor = '#e8e8e8';
        attrs.hoverColor = '#eeeeee';
        attrs.readyColor = '#f8f8f8';
        attrs.focusEmbellishment = false;
        
        this.callSuper(parent, attrs);
        
        var editBtn = new B(self, {
            x:2, y:2, height:20, text:AF.EDIT_TXT, buttonType:'green', 
            width:20, inset:5, textY:4, tooltip:'Edit this recurrence.'
        }, [{doActivated: function() {self.doActivated();}}]);
        FA.registerForNotification(editBtn.textView);
        
        (self._labelView = new M.Text(self, {x:26, y:5, width:148})).enableEllipsis();
        
        var deleteBtn = new B(self, {
            x:178, y:2, height:20, text:AF.DELETE_TXT, buttonType:'red', 
            width:20, inset:5, tooltip:'Remove this recurrence.'
        }, [{doActivated: function() {self._removeIt();}}]);
        FA.registerForNotification(deleteBtn.textView);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    update: function(recurrence, width) {
        this._recurrence = recurrence;
        
        var label = recurrence.label;
        this._labelView.setText(label);
        this.setTooltip(recurrence.type + ' : ' + label);
        
        this.setVisible(true);
        this.setWidth(width);
    },
    
    clean: function() {
        delete this._recurrence;
        this.setVisible(false);
    },
    
    _removeIt: function() {
        var recurrence = this._recurrence;
        myt.global.forecaster.dimmer.showConfirm(
            'Really remove the recurrence item: ' + recurrence.label + '?',
            function(action) {
                switch(action) {
                    case 'confirmBtn':
                        recurrence.removeIt();
                        break;
                }
            }
        );
    }
});
