/** An item in the recurrence list.
    
    Events:
        None
    
    Attributes:
        None
*/
af.RecurrenceItemView = new JS.Class('RecurrenceItemView', myt.SimpleButton, {
    include:[af.ItemMixin],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        HEIGHT:24
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.height = af.RecurrenceItemView.HEIGHT;
        attrs.activeColor = '#e8e8e8';
        attrs.hoverColor = '#eeeeee';
        attrs.readyColor = '#f8f8f8';
        attrs.tipAlign = 'right';
        attrs.focusEmbellishment = false;
        
        this.callSuper(parent, attrs);
        
        var self = this,
            M = myt,
            FA = M.FontAwesome;
        
        var editBtn = new af.Button(this, {
            x:2, y:2, height:20, text:af.EDIT_TXT, buttonType:'green', 
            width:20, inset:5, textY:4, tooltip:'Edit this recurrence.'
        }, [{
            doActivated: function() {self.doActivated();}
        }]);
        FA.registerForNotification(editBtn.textView);
        
        var labelView = this.labelView = new M.Text(this, {x:26, y:5, width:148});
        labelView.enableEllipsis();
        
        var deleteBtn = new af.Button(this, {
            x:178, y:2, height:20, text:af.DELETE_TXT, buttonType:'red', 
            width:20, inset:5, tooltip:'Remove this recurrence.'
        }, [{
            doActivated: function() {self.removeIt();}
        }]);
        FA.registerForNotification(deleteBtn.textView);
        
        this._ready = true;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    
    
    // Methods /////////////////////////////////////////////////////////////////
    update: function(recurrence, width) {
        this._ready = false;
        this._recurrence = recurrence;
        
        var label = recurrence.label, labelView = this.labelView;
        labelView.setText(label);
        this.setTooltip(recurrence.type + ' : ' + label);
        
        this._ready = true;
        
        this.setVisible(true);
        this.setWidth(width);
    },
    
    clean: function() {
        delete this._recurrence;
        this._ready = false;
        this.setVisible(false);
    },
    
    removeIt: function() {
        if (this._ready) {
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
    }
});
