/** A recurrence that only occurs once.
    
    Events:
        None
    
    Attributes:
        None
*/
af.OneTimeRecurrence = new JS.Class('OneTimeRecurrence', af.Recurrence, {
    // Accessors ///////////////////////////////////////////////////////////////
    setRecurrenceData: function(v) {
        af.cleanDateProperty(v, 'date');
        af.cleanCurrency(v, 'amount');
        
        this.callSuper();
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    getItems: function(startDate, endDate, accum) {
        if (!Array.isArray(accum)) accum = [];
        var data = this.recurrenceData, itemDate = data.date;
        if (itemDate >= startDate.getTime() && itemDate <= endDate.getTime()) accum.push([this, itemDate, this.label, data.amount]);
        return accum;
    },
    
    getFormData: function() {
        var retval = this.callSuper(),
            recData = retval.recurrenceData;
        
        // Convert amount from cents to dollars and cents
        recData.amount /= 100;
        
        // Convert time into year/month/day/hour/minute/second
        var date = new Date(recData.date);
        delete recData.date;
        
        recData.year = '' + date.getFullYear();
        recData.month = '' + date.getMonth();
        recData.day = '' + date.getDate();
        recData.hour = '' + date.getHours();
        recData.minute = '' + date.getMinutes();
        recData.second = '' + date.getSeconds();
        
        return retval;
    },
    
    setFormData: function(data) {
        var recData = data.recurrenceData;
        
        // Convert amount from dollars and cents to cents
        recData.amount = af.convertToCents(recData.amount);
        
        // year/month/day/hour/minute/second into time
        var date = new Date(recData.year, recData.month, recData.day, recData.hour, recData.minute, recData.second);
        delete recData.year;
        delete recData.month;
        delete recData.day;
        delete recData.hour;
        delete recData.minute;
        delete recData.second;
        recData.date = date.getTime();
        
        this.callSuper(data);
    }
});
