/** Stores the recurrences
    
    Events:
        None
    
    Attributes:
        None
*/
af.Model = new JS.Class('Model', myt.Node, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        CLASSES_BY_TYPE: {
            once:af.OneTimeRecurrence,
            yearly:af.YearlyRecurrence,
            monthly:af.MonthlyRecurrence,
            weekly:af.WeeklyRecurrence,
            daily:af.DailyRecurrence
        }
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this._ready = false;
        this._idCounter = 0;
        this._data = {};
        this._accounts = [];
        this._accountCols = 1;
        
        this.openingBalance = 0;
        var startDate = this.startDate = new Date();
        var endDate = this.endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 2);
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setForecaster: function(v) {
        this.forecaster = v;
    },
    
    setAccountList: function(v) {
        this.accountList = v;
    },
    
    setOpeningBalance: function (v) {
        this.openingBalance = v;
        this.save();
    },
    
    setStartDate: function (v) {
        var startDate = new Date(v);
        
        // Invalid start date falls back to now
        if (isNaN(startDate.getTime())) startDate = new Date();
        
        // Start date is always at the beginning of the day.
        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);
        
        // Prevent really early/late years
        if (startDate.getFullYear() < 2010) startDate.setFullYear(2010);
        if (startDate.getFullYear() > 2030) startDate.setFullYear(2030);
        
        this.startDate = startDate;
        this.save();
    },
    
    setEndDate: function (v) {
        var endDate = new Date(v);
        
        // Invalid end date falls back to 2 months from now
        if (isNaN(endDate.getTime())) {
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 2);
        }
        
        // End date is always at the end of the day
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        
        // Prevent really early/late years
        if (endDate.getFullYear() < 2010) endDate.setFullYear(2010);
        if (endDate.getFullYear() > 2030) endDate.setFullYear(2030);
        
        this.endDate = endDate;
        this.save();
    },
    
    setAccountCols: function(v) {
        if (this._accountCols !== v) {
            this._accountCols = v;
            
            this.saveAccounts();
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    _newId: function() {
        return ++this._idCounter;
    },
    
    verifyColCount: function() {
        var accounts = this._accounts, i = accounts.length,
            accountData,
            j, datum
            maxIdx = 0;
        while (i) {
            accountData = accounts[--i].data;
            j = accountData.length;
            while (j) {
                datum = accountData[--j];
                if (datum) maxIdx = Math.max(maxIdx, j + 1);
            }
        }
        
        this.setAccountCols(maxIdx + 1);
    },
    
    // IO //
    deserialize: function(data) {
        var forecaster = this.forecaster;
        if (data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                forecaster.dimmer.showMessage("Failure to parse data.");
                return;
            }
            
            this._idCounter = data.idCounter;
            
            this.openingBalance = data.openingBalance;
            this.setStartDate(data.startDate);
            this.setEndDate(data.endDate);
            
            var recurrences = data.recurrences, len = recurrences.length, i = 0, datum;
            for (; len > i; i++) {
                datum = recurrences[i];
                this.add(datum[1], datum[2], datum[3], datum[0]);
            }
            
            var accounts = data.accounts;
            len = accounts.length;
            i = 0;
            for (; len > i; i++) {
                datum = accounts[i];
                this.addAccount(datum[1], datum[2], datum[0]);
            }
            
            this.setAccountCols(data.accountCols || 1);
        }
        
        forecaster.openingBalanceView.setValue((this.openingBalance / 100).toFixed(2));
        forecaster.startDateValueView.setValue(this.startDate.format('m/d/Y'));
        forecaster.endDateValueView.setValue(this.endDate.format('m/d/Y'));
        
        this._ready = true;
    },
    
    serialize: function() {
        var recurrences = [], data = this._data, key, recurrence;
        for (key in data) {
            recurrence = data[key];
            recurrences.push([recurrence.recurrenceId, recurrence.type, recurrence.label, recurrence.recurrenceData]);
        }
        
        var accountData = [],
            accounts = this._accounts, i = accounts.length, account;
        while (i) {
            account = accounts[--i];
            accountData.push([account.id, account.label, account.data]);
        }
        
        return JSON.stringify({
            idCounter:this._idCounter, 
            openingBalance:this.openingBalance,
            startDate:this.startDate.getTime(),
            endDate:this.endDate.getTime(),
            recurrences:recurrences,
            accounts:accountData,
            accountCols:this._accountCols
        });
    },
    
    save: function() {
        if (this._ready) {
            var forecaster = this.forecaster;
            this._save();
            forecaster.refreshItems();
            forecaster.refreshRecurrences();
        }
    },
    
    saveAccounts: function(noRefresh) {
        if (this._ready) {
            this._save();
            if (!noRefresh) {
                this.accountList.refresh();
                this.accountList.refreshCols();
            }
        }
    },
    
    /** @private */
    _save: function() {
        var self = this;
        if (self._saveTimerId) clearTimeout(self._saveTimerId);
        
        self._saveTimerId = setTimeout(function() {
            self.forecaster.saveData(self.serialize());
        }, 3000);
    },
    
    // CRUD //
    add: function(type, label, recurrenceData, recurrenceId) {
        if (!recurrenceId) recurrenceId = this._newId();
        var klass = af.Model.CLASSES_BY_TYPE[type];
        if (!klass) {
            console.warn('Unknown recurrence type provided to add: ' + type);
            return null;
        }
        var recurrence = this._data[recurrenceId] = new klass(this, {
            type:type, label:label, recurrenceData:recurrenceData, recurrenceId:recurrenceId
        });
        this.save();
        return recurrence;
    },
    
    get: function(recurrenceId) {
        return this._data[recurrenceId];
    },
    
    remove: function(recurrenceId) {
        var recurrence = this.get(recurrenceId);
        if (recurrence) delete this._data[recurrenceId];
        this.save();
        return recurrence;
    },
    
    // Accounts CRUD //
    addAccount: function(label, data, id) {
        if (!id) id = this._newId();
        var account = this.getAccount(id);
        if (account) {
            console.warn('Account already exists.');
            return null;
        }
        account = new af.Account(this, {label:label, data:data, id:id});
        this._accounts.push(account);
        this.saveAccounts();
        return account;
    },
    
    getAccount: function(id) {
        var accounts = this._accounts, i = accounts.length, account;
        while (i) {
            account = accounts[--i];
            if (account.id === id) return account;
        }
        return null;
    },
    
    removeAccount: function(id) {
        var accounts = this._accounts, i = accounts.length, account;
        while (i) {
            account = accounts[--i];
            if (account.id === id) {
                accounts.splice(i, 1);
                this.saveAccounts();
                return account;
            }
        }
        return null;
    },
    
    // Queries //
    getItems: function() {
        var startDate = this.startDate,
            endDate = this.endDate,
            items = [], 
            data = this._data, 
            key;
        
        // Add an opening balance item
        var openingBalanceDate = startDate.setSeconds(startDate.getSeconds() - 1);
        items.push([null, openingBalanceDate, 'Opening Balance', this.openingBalance]);
        
        // Add items for all recurrences
        for (key in data) data[key].getItems(startDate, endDate, items);
        
        // Sort by date
        items.sort(function(a, b) {return a[1] - b[1];});
        
        // Insert divider items
        var len = items.length;
        if (len > 0) {
            // FIXME: provide confiuration for these
            var yearDividers = true;
            var monthDividers = true;
            
            var i = len, lowerDate, upperDate;
            while (i) {
                upperDate = moment(items[--i][1]);
                
                if (i === 0) break;
                
                lowerDate = moment(items[i - 1][1]);
                
                this._addDivider(items, i, lowerDate, upperDate, monthDividers, yearDividers);
            }
            
            this._addDivider(items, i, null, upperDate, monthDividers, yearDividers);
        }
        
        return items;
    },
    
    _addDivider: function(items, i, lowerDate, upperDate, monthDividers, yearDividers) {
        if (monthDividers && yearDividers) {
            // year and month divider
            if (!lowerDate) {
                items.splice(i, 0, ['divider','monthyear', upperDate.month(), upperDate.year()]);
            } else if (lowerDate.month() !== upperDate.month() && lowerDate.year() === upperDate.year()) {
                items.splice(i, 0, ['divider','month', upperDate.month()]);
            } else if (lowerDate.year() !== upperDate.year()) {
                items.splice(i, 0, ['divider','monthyear', upperDate.month(), upperDate.year()]);
            }
        } else if (monthDividers) {
            // Insert month divider
            if (!lowerDate || lowerDate.month() !== upperDate.month() || lowerDate.year() !== upperDate.year()) {
                items.splice(i, 0, ['divider','month', upperDate.month()]);
            }
        } else if (yearDividers) {
            // insert year divider
            if (!lowerDate || lowerDate.year() !== upperDate.year()) {
                items.splice(i, 0, ['divider','year', upperDate.year()]);
            }
        }
    },
    
    getRecurrences: function() {
        var recurrences = [], data = this._data, key;
        for (key in data) recurrences.push(data[key]);
        
        // Sort by id
        recurrences.sort(function(a, b) {return a.recurrenceId - b.recurrenceId;});
        
        return recurrences;
    },
    
    getAccounts: function() {
        var retval = this._accounts;
        retval.sort(function(a, b) {return a.id - b.id;});
        return retval;
    }
});
