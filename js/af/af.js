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
/*
  TODO:
    - Click to select item, double click to edit.
    - Show minimum and maximum balance during time period
    - Warning thresholds?
    - Make Year and month, dividers configurable?
*/
af = {
    formatItemDate: function(v) {
        return v.format("m/d/Y - h:i:s A");
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
    }
}

af.Button = new JS.Class('af.Button', myt.SimpleIconTextButton, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        ACTIVE_COLOR: '#0099dd',
        READY_COLOR: '#0099ee',
        HOVER_COLOR: '#0099ff',
        
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
        var B = af.Button;
        
        if (attrs.height === undefined) attrs.height = 19;
        attrs.roundedCorners = 4;
        if (attrs.textY === undefined) attrs.textY = 3;
        
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
    }
})

af.BaseItemMixin = new JS.Module('BaseItemMixin', {
    include:[myt.Reusable, myt.TooltipMixin],
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** @overrides */
    setWidth: function(v, supressEvent) {
        if (v > 0) this.callSuper(v, supressEvent);
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
