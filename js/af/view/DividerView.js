/** A divider in the list.
    
    Events:
        None
    
    Attributes:
        None
*/
af.DividerView = new JS.Class('DividerView', myt.View, {
    include:[myt.Reusable],
    
    
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        HEIGHT:15
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        var DV = af.DividerView;
        attrs.height = DV.HEIGHT;
        
        this.callSuper(parent, attrs);
        
        this.labelView = new myt.Text(this, {x:5, y:1, width:200, fontWeight:'bold', fontSize:'10px'});
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
            labelView = this.labelView;
        
        if (type === 'month') {
            labelView.setText(moment.months()[value]);
            this.setBgColor('#eeeeee');
            labelView.setTextColor('#666666');
        } else if (type === 'year') {
            labelView.setText(value);
            this.setBgColor('#eeeeee');
            labelView.setTextColor('#666666');
        } else if (type === 'monthyear') {
            labelView.setText(moment.months()[value] + ' - ' + data[3]);
            this.setBgColor('#999999');
            labelView.setTextColor('#ffffff');
        }
        
        this.setVisible(true);
        this.setWidth(width);
    },
    
    clean: function() {
        this.setVisible(false);
    }
});
