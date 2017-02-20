/** A recurrence that occurs once per week.
    
    Events:
        None
    
    Attributes:
        None
*/
af.WeeklyRecurrence = new JS.Class('WeeklyRecurrence', af.Recurrence, {
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
            dayOfWeek = data.dayOfWeek,
            itemDate,
            startTime = startDate.getTime(),
            endTime = endDate.getTime(),
            time;
        
        // Create initial itemDate and walk it forward by 1 day until it falls
        // on the correct day of the week.
        itemDate = new Date(startTime);
        while (itemDate.getDay() !== dayOfWeek) itemDate.setDate(itemDate.getDate() + 1);
        itemDate.setHours(data.hour);
        itemDate.setMinutes(data.minute);
        itemDate.setSeconds(data.second);
        time = itemDate.getTime();
        
        while (time >= startTime && time <= endTime) {
            accum.push([this, time, this.label, data.amount]);
            
            // Move forward by 1 week
            itemDate = new Date(time);
            itemDate.setDate(itemDate.getDate() + 7);
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
        recData.dayOfWeek = '' + recData.dayOfWeek;
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
        recData.dayOfWeek = Number(recData.dayOfWeek);
        recData.hour = Number(recData.hour);
        recData.minute = Number(recData.minute);
        recData.second = Number(recData.second);
        
        this.callSuper(data);
    }
});
