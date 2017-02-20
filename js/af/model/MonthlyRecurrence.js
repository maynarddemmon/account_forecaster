/** A recurrence that occurs once per month.
    
    Events:
        None
    
    Attributes:
        None
*/
af.MonthlyRecurrence = new JS.Class('MonthlyRecurrence', af.Recurrence, {
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
            origDate,
            itemDate,
            day = data.day,
            startTime = startDate.getTime(),
            endTime = endDate.getTime(),
            time,
            incr = 0;
        
        // Create initial itemDate
        origDate = moment([startDate.getFullYear(), startDate.getMonth(), day, data.hour, data.minute, data.second]);
        while (!origDate.isValid()) {
            origDate = moment([startDate.getFullYear(), startDate.getMonth(), --day, data.hour, data.minute, data.second]);
        }
        
        time = origDate.valueOf();
        while (time <= endTime) {
            if (time >= startTime) accum.push([this, time, this.label, data.amount]);
            itemDate = moment(origDate).add(++incr, 'M'); // Move forward by incr months
            time = itemDate.valueOf();
        }
        
        return accum;
    },
    
    getFormData: function() {
        var retval = this.callSuper(),
            recData = retval.recurrenceData;
        
        // Convert amount from cents to dollars and cents
        recData.amount /= 100;
        
        // Convert to strings for form use
        recData.day = '' + recData.day;
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
        recData.day = Number(recData.day);
        recData.hour = Number(recData.hour);
        recData.minute = Number(recData.minute);
        recData.second = Number(recData.second);
        
        this.callSuper(data);
    }
});
