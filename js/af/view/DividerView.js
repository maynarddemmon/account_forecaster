/** A divider in the list.
    
    Events:
        None
    
    Attributes:
        None
    
    Private Attributes:
        _labelView
*/
af.DividerView = new JS.Class('DividerView', myt.View, {
    include:[myt.Reusable],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        attrs.height = af.DIVIDER_HEIGHT;
        
        this.callSuper(parent, attrs);
        
        this._labelView = new myt.Text(this, {x:5, y:1, width:200, fontWeight:'bold', fontSize:'10px'});
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides */
    setWidth: function(v, supressEvent) {
        if (v > 0) this.callSuper(v, supressEvent);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    update: function(data, width) {
        var type = data[1],
            value = data[2],
            labelView = this._labelView,
            txt, bgColor, txtColor;
        
        if (type === 'month') {
            txt = moment.months()[value];
            bgColor = '#eeeeee';
            txtColor = '#666666';
        } else if (type === 'year') {
            txt = value;
            bgColor = '#eeeeee';
            txtColor = '#666666';
        } else if (type === 'monthyear') {
            txt = moment.months()[value] + ' - ' + data[3];
            bgColor = '#999999';
            txtColor = '#ffffff';
        }
        labelView.setText(txt);
        this.setBgColor(bgColor);
        labelView.setTextColor(txtColor);
        
        this.setVisible(true);
        this.setWidth(width);
    },
    
    clean: function() {
        this.setVisible(false);
    }
});
