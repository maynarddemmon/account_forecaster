/** A recurrence that occurs once per day.
    
    Events:
        None
    
    Attributes:
        None
*/
af.DailyRecurrence = new JS.Class('DailyRecurrence', af.Recurrence, {
    // Accessors ///////////////////////////////////////////////////////////////
    setRecurrenceData: function(v) {
        var R = af.Recurrence;
        R.cleanCurrency(v, 'amount');
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getItems: function(startDate, endDate, accum) {
        if (!Array.isArray(accum)) accum = [];
        var data = this.recurrenceData,
            itemDate,
            hour = data.hour,
            startTime = startDate.getTime(),
            endTime = endDate.getTime(),
            time;
        
        // Create initial itemDate and walk it forward by 1 hour until it falls
        // on the correct hour
        itemDate = new Date(startTime);
        while (itemDate.getHours() !== hour) itemDate.setHours(itemDate.getHours() + 1);
        itemDate.setMinutes(data.minute);
        itemDate.setSeconds(data.second);
        time = itemDate.getTime();
        
        while (time >= startTime && time <= endTime) {
            accum.push([this, time, this.label, data.amount]);
            
            // Move forward by 1 day
            itemDate = new Date(time);
            itemDate.setDate(itemDate.getDate() + 1);
            time = itemDate.getTime();
        }
        
        return accum;
    },
    
    getFormData: function() {
        var retval = this.callSuper(),
            recData = retval.recurrenceData;
        
        // Convert amount from cents to dollars and cents
        recData.amount /= 100;
        
        // Convert to strings for form use
        recData.hour = '' + recData.hour;
        recData.minute = '' + recData.minute;
        recData.second = '' + recData.second;
        
        return retval;
    },
    
    setFormData: function(data) {
        var recData = data.recurrenceData;
        
        // Convert amount from dollars and cents to cents
        recData.amount = af.Recurrence.convertToCents(recData.amount);
        
        // Convert back to numbers
        recData.hour = Number(recData.hour);
        recData.minute = Number(recData.minute);
        recData.second = Number(recData.second);
        
        this.callSuper(data);
    }
});
