/** A single recurrence
    
    Events:
        None
    
    Attributes:
        None
*/
af.Recurrence = new JS.Class('Recurrence', myt.Node, {
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
    setType: function(v) {this.type = v;},
    setId: function(v) {this.id = v;},
    
    setLabel: function(v) {
        this.label = v || '';
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
        this.parent.remove(this.id);
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
