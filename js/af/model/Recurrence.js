/** A single recurrence
    
    Events:
        None
    
    Attributes:
        None
*/
af.Recurrence = new JS.Class('Recurrence', myt.Node, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        cleanDateProperty: function(obj, key) {
            // Make sure all Date objects are actually numbers in millis
            var date = obj[key];
            if (typeof date !== 'number') {
                if (date !== null && typeof date === 'object' && typeof date.getTime === 'function') {
                    obj[key] = date.getTime();
                } else {
                    console.warn('Date was not provided as millis so converting to now.');
                    obj[key] = Date.now();
                }
            }
        },
        
        cleanCurrency: function(obj, key) {
            var amt = obj[key];
            
            if (typeof amt !== 'number') {
                console.warn('Convert non number type to 0.');
                obj[key] = 0;
                return;
            }
            
            if (amt == null) {
                console.warn('Convert null/undefined amount to 0.');
                obj[key] = 0;
                return;
            }
            
            if (isNaN(amt)) {
                console.warn('Convert NaN amount to 0.');
                obj[key] = 0;
                return;
            }
            
            // Make sure currency has no decimal value
            var truncated = Math.trunc(amt);
            if (truncated !== amt) {
                console.warn('Currency had a decimal so truncating.');
                obj[key] = truncated;
                return;
            }
        },
        
        convertToCents: function(v) {
            if (v && typeof v === 'string') v = v.split(',').join('');
            return v * 100;
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var recurrenceData = attrs.recurrenceData;
        delete attrs.recurrenceData;
        
        this.callSuper(parent, attrs);
        
        // Set after since the setter may need to access other
        // properties of this recurrence.
        if (recurrenceData) this.setRecurrenceData(recurrenceData);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setType: function(v) {
        this.type = v;
    },
    
    setRecurrenceId: function(v) {
        this.recurrenceId = v;
    },
    
    setLabel: function(v) {
        this.label = v;
        
        if (this.inited) this.parent.save();
    },
    
    setRecurrenceData: function(v) {
        this.recurrenceData = v;
        
        if (this.inited) this.parent.save();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getItems: function(startDate, endDate, accum) {
        // Subclasses must implement
    },
    
    removeIt: function() {
        this.parent.remove(this.recurrenceId);
    },
    
    getFormData: function() {
        return {
            label:this.label,
            type:this.type,
            recurrenceData:JSON.parse(JSON.stringify(this.recurrenceData))
        };
    },
    
    setFormData: function(data) {
        this.setLabel(data.label);
        this.setType(data.type);
        this.setRecurrenceData(data.recurrenceData);
    }
});
