/** A single account
    
    Events:
        None
    
    Attributes:
        id:number
        label:string
        data:array
*/
af.Account = new JS.Class('Account', myt.Node, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.data = [];
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setId: function(v) {this.id = v;},
    
    setLabel: function(v) {
        this.label = v || '';
        if (this.inited) this.parent.saveAccounts(true);
    },
    
    setData: function(v) {
        this.data = v || [];
        if (this.inited) this.parent.saveAccounts(true);
    },
    
    getValueRange: function() {
        return af.getValueRange(this.data);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    setDatum: function(idx, value) {
        if (typeof value === 'string') {
            value = value.trim();
            
            // Remove all commas
            value = value.split(',').join('');
            
            // Remove all dollar signs
            value = value.split('$').join('');
            
            // Remove too many decimals
            var parts = value.split('.');
            value = parts[0] + (parts[1] ? '.' + parts[1] : '');
            
            // Remove too many minus signs
            if (value.startsWith('-')) value = '-' + value.split('-').join('');
            
            value = Number(value);
        }
        this.data[idx] = value;
        
        var model = this.parent;
        model.verifyColCount();
        model.sumCols();
        
        if (this.inited) model.saveAccounts(true);
    },
    
    getDatum: function(idx) {
        return this.data[idx] || 0;
    },
    
    removeIt: function() {
        this.parent.removeAccount(this.id);
    }
});
