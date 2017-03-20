/** The root view for the account forecaster
    
    Events:
        None
    
    Attributes:
*/
af.AccountForecaster = new JS.Class('AccountForecaster', myt.View, {
    include: [myt.SizeToWindow],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var self = this,
            M = myt,
            V = M.View,
            T = M.Text,
            FIT = M.FormInputText,
            FA = M.FontAwesome,
            B = af.Button,
            accountHeight = 300,
            headerHeight = 28,
            middleHeaderHeight = 28,
            leftWidth = 200;
        
        attrs.bgColor = '#eeeeee';
        attrs.minWidth = 1000;
        attrs.minHeight = 500;
        
        this.callSuper(parent, attrs);
        
        // Build UI
        var dimmer = this.dimmer = new M.Dialog(this);
        
        var accountList = this.accountList = new af.AccountList(this, {height:accountHeight});
        
        this.divider = new M.VerticalDivider(this, {
            x:0, height:8, minValue:72, limitToParent:55, zIndex:1,
            value:myt.LocalStorage.getDatum('divider', 'af') || accountHeight - 4
        }, [{
            setValue: function(v, restoreValueAlso) {
                this.callSuper(v, restoreValueAlso);
                myt.LocalStorage.setDatum('divider', this.value, 'af', 100);
                if (self.uiReady) self._updateHeight();
            }
        }]);
        
        var headerView = this.headerView = new V(this, {
            y:accountHeight, height:headerHeight, bgColor:'#dddddd'
        }, [M.RootForm]); // Something permanent has to be the form for the recurrence dialog
        var centerView = new V(headerView, {align:'center', y:6});
        
        // Opening Balance
        new T(centerView, {y:2, text:'Opening Balance $', textColor:'#666666', fontSize:'12px'});
        var openingBalanceView = this.openingBalanceView = new FIT(centerView, {
            width:150, roundedCorners:2, allowedChars:'-0123456789.', maxLength:11, value:0
        }, [{
            setValue: function(v) {
                var retval = this.callSuper(v);
                
                var openingBalance = Number(v);
                if (isNaN(openingBalance)) openingBalance = 0;
                if (self.model) self.model.setOpeningBalance(openingBalance * 100);
                
                return retval;
            }
        }]);
        
        // Date Range Picker
        new T(centerView, {y:2, text:'Start Date', textColor:'#666666', fontSize:'12px'});
        var startDateValueView = this.startDateValueView = new FIT(centerView, {
            width:150, roundedCorners:2, allowedChars:'0123456789/', placeholder:'mm/dd/yyyy', maxLength:10
        }, [{
            setValue: function(v) {
                var retval = this.callSuper(v);
                if (self.model && retval.length === 10) self.model.setStartDate(v);
                return retval;
            }
        }]);
        new B(centerView, {y:-1, width:68, text:'Pick Date', tooltip:'Pick a start date.'}, [{
            doActivated: function() {
                var curValue = startDateValueView.getValue();
                dimmer.showDatePicker(
                    function(action, dateTime) {
                        switch(action) {
                            case 'closeBtn': case 'cancelBtn': break;
                            case 'confirmBtn':
                                startDateValueView.setValue(dateTime.format("m/d/Y"));
                                break;
                        }
                    },{
                        initialDate:curValue ? new Date(curValue) : new Date(),
                        dateOnly:true
                    }
                );
            }
        }]);
        
        new T(centerView, {y:2, text:'End Date', textColor:'#666666', fontSize:'12px'});
        var endDateValueView = this.endDateValueView = new M.FormInputText(centerView, {
            width:150, roundedCorners:2, allowedChars:'0123456789/', placeholder:'mm/dd/yyyy', maxLength:10
        }, [{
            setValue: function(v) {
                var retval = this.callSuper(v);
                if (self.model && retval.length === 10) self.model.setEndDate(v);
                return retval;
            }
        }]);
        new B(centerView, {y:-1, width:68, text:'Pick Date', tooltip:'Pick an end date.'}, [{
            doActivated: function() {
                var curValue = endDateValueView.getValue();
                
                dimmer.showDatePicker(
                    function(action, dateTime) {
                        switch(action) {
                            case 'closeBtn': case 'cancelBtn': break;
                            case 'confirmBtn':
                                endDateValueView.setValue(dateTime.format("m/d/Y"));
                                break;
                        }
                    },{
                        initialDate:curValue ? new Date(curValue) : new Date(),
                        dateOnly:true
                    }
                );
            }
        }]);
        
        new M.SpacedLayout(centerView, {axis:'x', spacing:4, collapseParent:true});
        
        // Recurrences List
        var leftMiddleHeaderView = this.leftMiddleHeaderView = new V(this, {
            y:accountHeight + headerHeight, width:leftWidth, height:middleHeaderHeight
        });
        var addBtn = new B(leftMiddleHeaderView, {
            x:2, y:5, text:FA.makeTag(['plus']) + ' New', buttonType:'green', 
            width:52, tooltip:'Create a new recurrence.'
        }, [{
            doActivated: function() {self.newRecurrence();}
        }]);
        FA.registerForNotification(addBtn.textView);
        new T(leftMiddleHeaderView, {y:8, align:'center', text:'Recurrences', fontWeight:'bold'});
        
        var leftMiddleView = this.leftMiddleView = new V(this, {
            y:accountHeight + headerHeight + middleHeaderHeight, 
            width:leftWidth, overflow:'autoy'
        });
        this.recurrenceContainerView = new V(leftMiddleView, {width:leftWidth}, [{
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                this.pool = new M.TrackActivesPool(af.RecurrenceItemView, this);
            },
            replicate: function(recurrences) {
                var i = 0, len = recurrences.length,
                    width = this.width,
                    pool = this.pool,
                    recurrence,
                    sv, value = 1;;
                pool.putActives();
                
                for (; len > i; i++) {
                    recurrence = recurrences[i];
                    (sv = pool.getInstance()).update(recurrence, width);
                    
                    sv.setY(value);
                    value += sv.height + 1;
                }
                
                this.setHeight(value);
            },
            setWidth: function(v, supressEvent) {
                this.callSuper(v, supressEvent);
                if (this.inited) {
                    var svs = this.getSubviews(), i = svs.length;
                    while (i) svs[--i].setWidth(v);
                }
            },
            getItemsForRecurrence: function(recurrence, accum) {
                var svs = this.getSubviews(), i = svs.length, sv;
                while (i) {
                    sv = svs[--i];
                    if (sv.visible && sv._recurrence === recurrence) accum.push(sv);
                }
            }
        }]);
        
        // Items List
        var rightMiddleHeaderView = this.rightMiddleHeaderView = new V(this, {
            x:leftWidth + 1, y:accountHeight + headerHeight, height:middleHeaderHeight
        });
        new T(rightMiddleHeaderView, {y:8, align:'center', text:'Balance Projection', fontWeight:'bold'});
        
        var rightMiddleView = this.rightMiddleView = new V(this, {
            x:leftWidth + 1, y:accountHeight + headerHeight + middleHeaderHeight, overflow:'auto'
        });
        this.itemContainerView = new V(rightMiddleView, {}, [{
            initNode: function(parent, attrs) {
                this.callSuper(parent, attrs);
                this.pool = new M.TrackActivesPool(af.ItemView, this);
                this.dividerPool = new M.TrackActivesPool(af.DividerView, this);
            },
            replicate: function(items) {
                var i = 0, len = items.length,
                    width = this.width,
                    pool = this.pool,
                    dividerPool = this.dividerPool,
                    datum,
                    sv, value = 1;
                pool.putActives();
                dividerPool.putActives();
                
                // Compute max and min
                var runningTotal = 0,
                    maxBalance, 
                    minBalance,
                    barMin, barMax;
                for (; len > i; i++) {
                    datum = items[i];
                    
                    if (datum[0] === 'divider') continue;
                    
                    runningTotal += datum[3];
                    if (runningTotal > maxBalance || maxBalance === undefined) maxBalance = runningTotal;
                    if (minBalance > runningTotal || minBalance === undefined) minBalance = runningTotal;
                }
                barMin = Math.min(minBalance, 0);
                barMax = Math.max(maxBalance, 0);
                
                // Update items using a timer so long lists don't freeze up
                if (this._updateTimerId) clearTimeout(this._updateTimerId);
                this._updateItems(0, 0, items, barMin, barMax, width, 1, 50);
            },
            _updateItems: function(runningTotal, i, items, barMin, barMax, width, height, countLimit) {
                var datum, 
                    sv,
                    pool = this.pool,
                    dividerPool = this.dividerPool,
                    len = items.length,
                    count = 0;
                for (; len > i; i++) {
                    datum = items[i];
                    
                    if (datum[0] === 'divider') {
                        (sv = dividerPool.getInstance()).update(datum, width);
                    } else {
                        runningTotal += datum[3];
                        (sv = pool.getInstance()).update(datum, runningTotal, barMin, barMax, width);
                    }
                    
                    sv.setY(height);
                    height += sv.height + 1;
                    
                    count++;
                    if (count === countLimit) {
                        var self = this;
                        this._updateTimerId = setTimeout(function() {
                            self._updateItems(runningTotal, i + 1, items, barMin, barMax, width, height, 100);
                        }, 50);
                        break;
                    }
                }
                
                this.setHeight(height);
            },
            setWidth: function(v, supressEvent) {
                this.callSuper(v, supressEvent);
                if (this.inited) {
                    var svs = this.getSubviews(), i = svs.length;
                    while (i) svs[--i].setWidth(v);
                }
            },
            getItemsForRecurrence: function(recurrence, accum) {
                var svs = this.getSubviews(), i = svs.length, sv;
                while (i) {
                    sv = svs[--i];
                    if (sv.visible && sv._recurrence === recurrence) accum.push(sv);
                }
            }
        }]);
        
        // Pull data from local storage and populate the model with it.
        var model = this.model = new af.Model(this, {forecaster:this, accountList:accountList});
        accountList.setModel(model);
        this.loadData(function(data) {
            model.deserialize(data);
            self.refreshItems();
            self.refreshRecurrences();
            accountList.refresh();
            accountList.refreshCols();
            hideSpinner();
        });
        
        // Refresh width and height so UI lays out
        this._updateWidth();
        this._updateHeight();
        
        M.global.register('forecaster', this);
        
        this.uiReady = true;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setWidth: function(v, supressEvent) {
        if (v > 0) {
            this.callSuper(v, supressEvent);
            if (this.inited) this._updateWidth();
        }
    },
    
    _updateWidth: function() {
        var v = this.width;
        this.accountList.setWidth(v);
        this.divider.setWidth(v);
        this.headerView.setWidth(v);
        v -= this.rightMiddleView.x;
        this.rightMiddleView.setWidth(v);
        this.rightMiddleHeaderView.setWidth(v);
        v = Math.max(v, 740);
        this.itemContainerView.setWidth(v);
    },
    
    setHeight: function(v, supressEvent) {
        if (v > 0) {
            this.callSuper(v, supressEvent);
            if (this.inited) this._updateHeight();
        }
    },
    
    _updateHeight: function() {
        var lmv = this.leftMiddleView,
            rmv = this.rightMiddleView,
            hv = this.headerView,
            lmhv = this.leftMiddleHeaderView,
            y = this.divider.y + 4;
        
        this.accountList.setHeight(y);
        
        hv.setY(y);
        
        y += hv.height;
        
        lmhv.setY(y);
        this.rightMiddleHeaderView.setY(y);
        
        y += lmhv.height;
        
        lmv.setY(y);
        rmv.setY(y);
        
        var h = this.height - y
        lmv.setHeight(h);
        rmv.setHeight(h);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    loadData: function(callback) {
        if (callback) callback(myt.LocalStorage.getItem('data'));
    },
    
    saveData: function(data, callback) {
        myt.LocalStorage.setItem('data', data ? data : '');
        this.showTemporaryMessage("Saved your data.");
        if (callback) callback(true);
    },
    
    refreshItems: function() {
        if (!this.model.dataLoaded) return;
        
        var self = this;
        if (this._refreshItemsTimerId) clearTimeout(this._refreshItemsTimerId);
        this._refreshItemsTimerId = setTimeout(function() {self._refreshItems();}, 300);
    },
    
    _refreshItems: function() {
        var items = this.model.getItems();
        this.itemContainerView.replicate(items);
    },
    
    refreshRecurrences: function() {
        if (!this.model.dataLoaded) return;
        
        var recurrences = this.model.getRecurrences();
        this.recurrenceContainerView.replicate(recurrences);
    },
    
    newRecurrence: function() {
        this._showRecurrenceDialog();
    },
    
    editRecurrence: function(recurrence) {
        this._showRecurrenceDialog(recurrence);
    },
    
    _getItemViewsForRecurrence: function(recurrence) {
        var items = [];
        this.itemContainerView.getItemsForRecurrence(recurrence, items);
        this.recurrenceContainerView.getItemsForRecurrence(recurrence, items);
        return items;
    },
    
    highlightViewsForRecurrence: function(isOver, recurrence) {
        var items = this._getItemViewsForRecurrence(recurrence), i = items.length;
        while (i) items[--i].highlight(isOver);
        
    },
    
    _getRecurrenceFormData: function(recurrence) {
        var formData;
        if (recurrence) {
            formData = recurrence.getFormData();
        } else {
            formData = {label:'', type:'once', recurrenceData:{
                amount:0,
                second:'0'
            }};
        }
        
        var now = new Date(), recurrenceData = formData.recurrenceData;
        if (recurrenceData.year == null) recurrenceData.year = '' + now.getFullYear();
        if (recurrenceData.month == null) recurrenceData.month = '' + now.getMonth();
        if (recurrenceData.day == null) recurrenceData.day = '' + now.getDate();
        if (recurrenceData.hour == null) recurrenceData.hour = '' + now.getHours();
        if (recurrenceData.minute == null) recurrenceData.minute = '' + now.getMinutes();
        
        return formData;
    },
    
    showTemporaryMessage: function(msg) {
        var msgView = this._msgView;
        if (!msgView) {
            msgView = new myt.Text(this, {x:4, y:4, bgColor:'#ffffff', roundedCorners:2, opacity:0});
            msgView.deStyle.padding = '3px 4px 3px 4px';
            this._msgView = msgView;
        }
        
        msgView.setText(msg);
        msgView.stopActiveAnimators('opacity');
        msgView.animate({attribute:'opacity', to:0.75, from:0, duration:250}).next(function(success) {
            msgView.animate({attribute:'opacity', to:0, from:0.75, duration:2000});
        });
    },
    
    _showRecurrenceDialog: function(recurrence) {
        var isNew = recurrence == null,
            self = this,
            form = this.headerView,
            M = myt, 
            V = M.View, 
            T = M.Text,
            FIT = M.FormInputText,
            FIS = M.FormInputSelect,
            B = af.Button, 
            formWidth = 400, 
            labelWidth = 140,
            inputX = 146,
            inputWidth = 250,
            rowHeight = 20;
        this.dimmer.showContentConfirm(
            function(container) {
                var ready = false;
                
                container.setOverflow('autoy');
                
                var labelView = new V(container, {width:formWidth, height:rowHeight});
                new T(labelView, {y:2, width:labelWidth, textAlign:'right', text:'label'});
                container.initialFocus = new FIT(labelView, {
                    id:'label', form:form,
                    x:inputX, width:inputWidth, roundedCorners:2,
                    maxLength:100, placeholder:'Enter label'
                });
                
                var typeView = new V(container, {width:formWidth, height:rowHeight});
                new T(typeView, {width:labelWidth, textAlign:'right', text:'type'});
                new FIS(typeView, {
                    id:'type', form:form,
                    x:inputX, width:inputWidth, 
                    options:[
                        {label:'Once', value:'once'},
                        {label:'Daily', value:'daily'},
                        {label:'Weekly', value:'weekly'},
                        {label:'Monthly', value:'monthly'},
                        {label:'Yearly', value:'yearly'}
                    ]
                }, [{
                    doChanged: function() {
                        if (ready) {
                            // update subform
                            var fields = af.FIELDS_BY_TYPE[this.getValue()];
                            for (var key in fields) {
                                subform[key + 'View'].setVisible(fields[key]);
                            }
                        }
                    },
                    showFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow(M.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
                    },
                    hideFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow();
                    }
                }]);
                
                // Subform for recurrence data
                var subform = new V(container, {
                    id:'recurrenceData', form:form,
                    height:5 * (20 + 4) - 4
                }, [M.Form]);
                
                // Amount
                var amountView = subform.amountView = new V(subform, {width:formWidth, height:rowHeight});
                new T(amountView, {y:2, width:labelWidth, textAlign:'right', text:'amount'});
                new FIT(amountView, {
                    id:'amount', form:subform,
                    allowedCharacters:'-0123456789.,',
                    x:inputX, width:inputWidth, roundedCorners:2,
                    maxLength:12, placeholder:'Enter amount'
                });
                
                // Year
                var yearOptions = [];
                for (var i = 2010; 2030 >= i; i++) yearOptions.push({label:'' + i, value:'' + i});
                
                var yearView = subform.yearView = new V(subform, {width:formWidth, height:rowHeight}, [{
                    setVisible: function(v) {
                        if (this.visible !== v) {
                            this.callSuper(v);
                            if (ready) dayFormView.updateOptions();
                        }
                    }
                }]);
                new T(yearView, {width:labelWidth, textAlign:'right', text:'year'});
                var yearFormView = new FIS(yearView, {
                    id:'year', form:subform,
                    x:inputX, width:inputWidth, y:-2,
                    options:yearOptions
                }, [{
                    doChanged: function() {
                        if (ready) dayFormView.updateOptions();
                    },
                    showFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow(M.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
                    },
                    hideFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow();
                    }
                }]);
                
                // Month
                var monthView = subform.monthView = new V(subform, {width:formWidth, height:rowHeight}, [{
                    setVisible: function(v) {
                        if (this.visible !== v) {
                            this.callSuper(v);
                            if (ready) dayFormView.updateOptions();
                        }
                    }
                }]);
                new T(monthView, {width:labelWidth, textAlign:'right', text:'month'});
                var monthFormView = new FIS(monthView, {
                    id:'month', form:subform,
                    x:inputX, width:inputWidth, y:-2,
                    options:[
                        {label:'January', value:'0'},
                        {label:'February', value:'1'},
                        {label:'March', value:'2'},
                        {label:'April', value:'3'},
                        {label:'May', value:'4'},
                        {label:'June', value:'5'},
                        {label:'July', value:'6'},
                        {label:'August', value:'7'},
                        {label:'September', value:'8'},
                        {label:'October', value:'9'},
                        {label:'November', value:'10'},
                        {label:'December', value:'11'}
                    ]
                }, [{
                    doChanged: function() {
                        if (ready) dayFormView.updateOptions();
                    },
                    showFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow(M.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
                    },
                    hideFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow();
                    }
                }]);
                
                // Day of month
                var dayOptions = [];
                for (i = 1; 31 >= i; i++) dayOptions.push({label:'' + i, value:'' + i});
                dayOptions[dayOptions.length - 1].label += ' (last day)';
                
                var dayView = subform.dayView = new V(subform, {width:formWidth, height:rowHeight});
                new T(dayView, {width:labelWidth, textAlign:'right', text:'day'});
                var dayFormView = new FIS(dayView, {
                    id:'day', form:subform,
                    x:inputX, width:inputWidth, y:-2,
                    options:dayOptions
                }, [{
                    updateOptions: function() {
                        var month = monthView.visible ? Number(monthFormView.getValue()) : 0,
                            yearViewVisible = yearView.visible,
                            year = yearViewVisible ? Number(yearFormView.getValue()) : 2015,
                            options = [], 
                            i = 1, 
                            febDayCount = yearViewVisible ? (moment([year]).isLeapYear() ? 29 : 28) : 29;
                            limit = [31,febDayCount,31,30,31,30,31,31,30,31,30,31][month],
                            value = Number(this.getValue());
                        for (; limit >= i; i++) options.push({label:'' + i, value:'' + i});
                        options[options.length - 1].label += ' (last day)';
                        this.setOptions(options);
                        if (value > limit) value = limit;
                        this.selectValue('' + value);
                    },
                    showFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow(M.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
                    },
                    hideFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow();
                    }
                }]);
                
                
                // Day of week
                var dayOfWeekView = subform.dayOfWeekView = new V(subform, {width:formWidth, height:rowHeight});
                new T(dayOfWeekView, {width:labelWidth, textAlign:'right', text:'day of the week'});
                new FIS(dayOfWeekView, {
                    id:'dayOfWeek', form:subform,
                    x:inputX, width:inputWidth, y:-2,
                    options:[
                        {label:'Monday', value:'0'},
                        {label:'Tuesday', value:'1'},
                        {label:'Wednesday', value:'2'},
                        {label:'Thursday', value:'3'},
                        {label:'Friday', value:'4'},
                        {label:'Saturday', value:'5'},
                        {label:'Sunday', value:'6'}
                    ]
                }, [{
                    showFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow(M.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
                    },
                    hideFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow();
                    }
                }]);
                
                // Time
                var hourOptions = [{label:'00 (midnight)', value:'0'}];
                for (i = 1; 9 >= i; i++) hourOptions.push({label:'0' + i + ' (' + i + 'am)', value:'' + i});
                hourOptions.push({label:'10 (10 am)', value:'10'});
                hourOptions.push({label:'11 (11 am)', value:'11'});
                hourOptions.push({label:'12 (noon)', value:'12'});
                for (i = 13; 23 >= i; i++) hourOptions.push({label:'' + i + ' (' + (i - 12) + 'pm)', value:'' + i});
                
                var timeView = subform.timeView = new V(subform, {width:formWidth, height:rowHeight});
                new T(timeView, {width:labelWidth, textAlign:'right', text:'hour / minute / second'});
                new FIS(timeView, {
                    id:'hour', form:subform,
                    x:inputX, width:120, y:-2,
                    options:hourOptions
                }, [{
                    showFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow(M.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
                    },
                    hideFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow();
                    }
                }]);
                
                var minSecOptions = [];
                for (i = 0; 9 >= i; i++) minSecOptions.push({label:'0' + i, value:'' + i});
                for (i = 10; 59 >= i; i++) minSecOptions.push({label:'' + i, value:'' + i});
                
                new FIS(timeView, {
                    id:'minute', form:subform,
                    x:inputX + 122, width:63, y:-2,
                    options:minSecOptions
                }, [{
                    showFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow(M.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
                    },
                    hideFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow();
                    }
                }]);
                
                new FIS(timeView, {
                    id:'second', form:subform,
                    x:inputX + 187, width:63, y:-2,
                    options:minSecOptions
                }, [{
                    showFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow(M.Button.DEFAULT_FOCUS_SHADOW_PROPERTY_VALUE);
                    },
                    hideFocusEmbellishment: function() {
                        this.hideDefaultFocusEmbellishment();
                        this.setBoxShadow();
                    }
                }]);
                
                new M.SpacedLayout(subform, {axis:'y', spacing:4});
                new M.SpacedLayout(container, {axis:'y', spacing:4, inset:7});
                
                ready = true;
                
                var formData = self._getRecurrenceFormData(recurrence);
                form.setup(formData, formData, formData);
                form.doValidation();
            },
            function(action) {
                if (action === 'confirmBtn') {
                    if (form.isValid) {
                        var value = form.getValue();
                        
                        // Remove hidden form fields
                        var fields = af.FIELDS_BY_TYPE[value.type];
                        for (var key in fields) if (!fields[key]) delete value.recurrenceData[key];
                        
                        if (isNew) {
                            recurrence = self.model.add(value.type, value.label);
                            recurrence.setFormData(value);
                        } else {
                            if (recurrence.type !== value.type) {
                                // Type has changed we need to make a new recurrence
                                self.model.remove(recurrence.id);
                                recurrence.destroy();
                                recurrence = self.model.add(value.type, value.label);
                                recurrence.setFormData(value);
                            } else {
                                recurrence.setFormData(value);
                            }
                        }
                        
                        return false;
                    }
                    return true;
                }
            },{
                confirmTxt:'Save',
                titleText:isNew ? 'New Recurrence' : 'Update Recurrence',
                activeColor:B.ACTIVE_CANCEL_COLOR,
                readyColor:B.READY_CANCEL_COLOR,
                hoverColor:B.HOVER_CANCEL_COLOR,
                activeColorConfirm:B.ACTIVE_SUBMIT_COLOR,
                readyColorConfirm:B.READY_SUBMIT_COLOR,
                hoverColorConfirm:B.HOVER_SUBMIT_COLOR,
                textColor:B.TEXT_COLOR
            }
        );
    }
});
