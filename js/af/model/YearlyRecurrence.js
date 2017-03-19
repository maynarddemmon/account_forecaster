/** A recurrence that occurs once per year.
    
    Events:
        None
    
    Attributes:
        None
*/
af.YearlyRecurrence = new JS.Class('YearlyRecurrence', af.Recurrence, {
    // Accessors ///////////////////////////////////////////////////////////////
    setRecurrenceData: function(v) {
        af.cleanCurrency(v, 'amount');
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getItems: function(startDate, endDate, accum) {
        if (!Array.isArray(accum)) accum = [];
        var data = this.recurrenceData,
            day = data.day,
            month = data.month,
            startTime = startDate.getTime(),
            endTime = endDate.getTime(),
            itemDate,
            time;
        
        // Create initial itemDate
        var isEndOfFeb = month === 1 && day === 29;
        itemDate = moment([startDate.getFullYear(), month, day, data.hour, data.minute, data.second]);
        while (!itemDate.isValid()) {
            itemDate = moment([startDate.getFullYear(), month, --day, data.hour, data.minute, data.second]);
        }
        
        time = itemDate.valueOf();
        while (time <= endTime) {
            if (time >= startTime) accum.push([this, time, this.label, data.amount]);
            
            itemDate.add(1, 'y'); // Move forward by 1 year
            
            if (isEndOfFeb) itemDate.date(itemDate.isLeapYear() ? 29 : 28);
            
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
        recData.month = '' + recData.month;
        recData.day = '' + recData.day;
        recData.hour = '' + recData.hour;
        recData.minute = '' + recData.minute;
        recData.second = '' + recData.second;
        
        return retval;
    },
    
    setFormData: function(data) {
        var recData = data.recurrenceData;
        
        // Convert amount from dollars and cents to cents
        recData.amount = af.convertToCents(recData.amount);
        
        // Convert back to numbers
        recData.month = Number(recData.month);
        recData.day = Number(recData.day);
        recData.hour = Number(recData.hour);
        recData.minute = Number(recData.minute);
        recData.second = Number(recData.second);
        
        this.callSuper(data);
    }
});
