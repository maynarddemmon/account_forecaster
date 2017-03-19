/** A single account
    
    Events:
        None
    
    Attributes:
        None
*/
af.Account = new JS.Class('Account', myt.Node, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.data = [];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setId: function(v) {
        this.id = v;
    },
    
    setLabel: function(v) {
        this.label = v || '';
        
        if (this.inited) this.parent.saveAccounts(true);
    },
    
    setData: function(v) {
        this.data = v || [];
        
        if (this.inited) this.parent.saveAccounts(true);
    },
    
    getValueRange: function() {
        retval = {min:0, max:0};
        
        var data = this.data, i = data.length, datum;
        while (i) {
            datum = data[--i] || 0;
            retval.min = Math.min(retval.min, datum);
            retval.max = Math.max(retval.max, datum);
        }
        
        return retval;
    },
    
    // Methods /////////////////////////////////////////////////////////////////
    setDatum: function(idx, value) {
        if (typeof value === 'string') {
            value = value.trim();
            
            // Remove all commas
            value = value.split(',').join('');
            
            // Remove too many decimals
            var parts = value.split('.');
            value = parts[0] + (parts[1] ? '.' + parts[1] : '');
            
            // Remove too many minus signs
            if (value.startsWith('-')) value = '-' + value.split('-').join('');
            
            value = Number(value);
        }
        this.data[idx] = value;
        
        this.parent.verifyColCount();
        this.parent.sumCols();
        
        if (this.inited) this.parent.saveAccounts(true);
    },
    
    getDatum: function(idx) {
        return this.data[idx] || 0;
    },
    
    removeIt: function() {
        this.parent.removeAccount(this.id);
    }
});
