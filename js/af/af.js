/**
 * account_forecaster: A bank account balance forecaster that stores all
 * data using client side storage. 
 * http://github.com/maynarddemmon/account_forecaster
 * Copyright (c) 2017 Maynard Demmon
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
af = {
    DELETE_TXT:myt.FontAwesome.makeTag(['times']),
    EDIT_TXT:myt.FontAwesome.makeTag(['edit']),
    
    ITEM_HEIGHT_ACCOUNT:72,
    
    ITEM_HEIGHT_RECURRENCE:24,
    
    ITEM_HEIGHT:24,
    INSUFFICIENT_FUNDS_COLOR:'#aa0000',
    INSUFFICIENT_FUNDS_BGCOLOR:'#ffeeee',
    DEBIT_COLOR:'#aa0000',
    CREDIT_COLOR:'#00aa00',
    BALANCE_BAR_WIDTH:200,
    
    DIVIDER_HEIGHT:15,
    USE_YEAR_DIVIDERS:true,
    USE_MONTH_DIVIDERS:true,
    
    formatItemDate: function(v) {
        return v.format("m/d/Y - h:i:s A");
    },
    
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
    
    formatCurrency: function(v, withCommas, withSymbol) {
        // Convert from cents to dollars
        v /= 100;
        
        // Insert commas and currency symbol
        var symbol = withSymbol ? '$' : '';
        if (withCommas) {
            var isNeg = 0 > v,
                txt = '' + (isNeg ? -v : v).toFixed(2);
            return symbol + (isNeg ? '-' : '') + txt.replace(/./g, function(c, i, a) {return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;});
        } else {
            return symbol + v.toFixed(2);
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
    },
    
    FIELDS_BY_TYPE: {
        once:{
            dayOfWeek:false,
            year:true,
            month:true,
            day:true
        },
        yearly:{
            dayOfWeek:false,
            year:false,
            month:true,
            day:true
        },
        monthly:{
            dayOfWeek:false,
            year:false,
            month:false,
            day:true
        },
        daily:{
            dayOfWeek:false,
            year:false,
            month:false,
            day:false
        },
        weekly:{
            dayOfWeek:true,
            year:false,
            month:false,
            day:false
        }
    },
    
    getValueRange: function(data) {
        retval = {min:0, max:0};
        
        var i = data.length, datum;
        while (i) {
            datum = data[--i] || 0;
            retval.min = Math.min(retval.min, datum);
            retval.max = Math.max(retval.max, datum);
        }
        
        return retval;
    },
    
    updateBar: function(range, value, h, barView) {
        var min = range.min,
            max = range.max,
            zeroPoint,
            isPositive = value >= 0;
        
        if (min < 0 && max > 0) {
            range = max - min;
            zeroPoint = max * h / range;
        } else if (max > 0) {
            range = max;
            zeroPoint = h;
        } else {
            range = -min;
            zeroPoint = 0;
        }
        
        barView.setHeight(Math.abs(value) * h / range);
        
        if (isPositive) {
            barView.setBgColor('#333333');
            barView.setY(zeroPoint - barView.height);
        } else {
            barView.setBgColor('#aa0000');
            barView.setY(zeroPoint);
        }
    }
}

af.Button = new JS.Class('Button', myt.SimpleButton, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        ACTIVE_COLOR: '#0066dd',
        READY_COLOR: '#0066ee',
        HOVER_COLOR: '#0066ff',
        
        ACTIVE_SUBMIT_COLOR: '#007700',
        READY_SUBMIT_COLOR: '#008800',
        HOVER_SUBMIT_COLOR: '#009900',
        
        ACTIVE_CANCEL_COLOR: '#770000',
        READY_CANCEL_COLOR: '#880000',
        HOVER_CANCEL_COLOR: '#990000',
        
        TEXT_COLOR: '#ffffff'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        if (attrs.inset == null) attrs.inset = 6;
        if (attrs.outset == null) attrs.outset = 6;
        if (attrs.height == null) attrs.height = 19;
        if (attrs.textY == null) attrs.textY = 3;
        
        attrs.roundedCorners = 4;
        
        var shrinkToFit = attrs.shrinkToFit,
            text = attrs.text || '';
        delete attrs.shrinkToFit;
        delete attrs.text;
        
        var B = af.Button;
        attrs.textColor = B.TEXT_COLOR;
        switch (attrs.buttonType) {
            case 'green':
                attrs.activeColor = B.ACTIVE_SUBMIT_COLOR;
                attrs.readyColor = B.READY_SUBMIT_COLOR;
                attrs.hoverColor = B.HOVER_SUBMIT_COLOR;
                break;
            case 'red':
                attrs.activeColor = B.ACTIVE_CANCEL_COLOR;
                attrs.readyColor = B.READY_CANCEL_COLOR;
                attrs.hoverColor = B.HOVER_CANCEL_COLOR;
                break;
            case 'blue':
            default:
                attrs.activeColor = B.ACTIVE_COLOR;
                attrs.readyColor = B.READY_COLOR;
                attrs.hoverColor = B.HOVER_COLOR;
        }
        delete attrs.buttonType;
        
        this.callSuper(parent, attrs);
        
        var textView = this.textView = new myt.Text(this, {
            x:this.inset, 
            y:this.textY, 
            text:text,
            whiteSpace:'nowrap',
            domClass:'myt-Text mytButtonText'
        });
        if (shrinkToFit) this.applyConstraint('__update', [this, 'inset', this, 'outset', textView, 'width']);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setText: function(v) {
        if (this.inited) this.textView.setText(v);
    },
    
    setTooltip: function(v) {
        this.domElement.title = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __update: function(v) {
        if (!this.destroyed) {
            var inset = this.inset,
                textView = this.textView;
            textView.setX(inset);
            this.setWidth(inset + textView.width + this.outset);
        }
    }
})

af.BaseItemMixin = new JS.Module('BaseItemMixin', {
    include:[myt.Reusable],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides */
    setWidth: function(v, supressEvent) {
        if (v > 0) this.callSuper(v, supressEvent);
    },
    
    setTooltip: function(v) {
        this.domElement.title = v;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    drawHoverState: function() {
        this.callSuper();
        if (this.highlighted) this.setBgColor('#ddffdd');
    },
    
    drawActiveState: function() {
        this.callSuper();
        if (this.highlighted) this.setBgColor('#ddeedd');
    },
    
    drawReadyState: function() {
        this.callSuper();
        if (this.highlighted) this.setBgColor('#ddf8dd');
    }
})

af.ItemMixin = new JS.Module('ItemMixin', {
    include:[af.BaseItemMixin],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides */
    setMouseOver: function(v) {
        this.callSuper(v);
        
        if (this.inited) myt.global.forecaster.highlightViewsForRecurrence(this.mouseOver, this._recurrence);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    doActivated: function() {
        var recurrence = this._recurrence;
        if (recurrence) myt.global.forecaster.editRecurrence(recurrence);
    },
    
    highlight: function(highlighted) {
        this.highlighted = highlighted;
        this.updateUI();
    }
})
