// var io  = require('socket.io-client');
var fs = require('fs');
var performanceNow = require('performance-now');
var Canvas = require('canvas');
var Image = Canvas.Image;

// Font data 
var glyphsData = [
    ['A', 5],
    ['B', 5],
    ['C', 5],
    ['D', 5],
    ['E', 5],
    ['F', 5],
    ['G', 5],
    ['H', 5],
    ['I', 3],
    ['J', 5],
    ['K', 5],
    ['L', 5],
    ['M', 5],
    ['N', 5],
    ['O', 5],
    ['P', 5],
    ['Q', 5],
    ['R', 5],
    ['S', 5],
    ['T', 5],
    ['U', 5],
    ['V', 5],
    ['W', 5],
    ['X', 5],
    ['Y', 5],
    ['Z', 5],
    ['a', 5],
    ['b', 5],
    ['c', 5],
    ['d', 5],
    ['e', 5],
    ['f', 4],
    ['g', 5],
    ['h', 5],
    ['i', 1],
    ['j', 5],
    ['k', 4],
    ['l', 2],
    ['m', 5],
    ['n', 5],
    ['o', 5],
    ['p', 5],
    ['q', 5],
    ['r', 5],
    ['s', 5],
    ['t', 3],
    ['u', 5],
    ['v', 5],
    ['w', 5],
    ['x', 5],
    ['y', 5],
    ['z', 5],
    ['0', 5],
    ['1', 5],
    ['2', 5],
    ['3', 5],
    ['4', 5],
    ['5', 5],
    ['6', 5],
    ['7', 5],
    ['8', 5],
    ['9', 5],
    ['$', 5],
    ['+', 5],
    ['-', 5],
    ['*', 4],
    ['/', 5],
    ['=', 5],
    ['%', 5],
    ['"', 3],
    ['\'', 1],
    ['#', 5],
    ['@', 6],
    ['&', 5],
    ['_', 5],
    ['(', 4],
    [')', 4],
    [',', 1],
    ['.', 1],
    [';', 1],
    [':', 1],
    ['?', 5],
    ['!', 1],
    ['\\', 5],
    ['|', 1],
    ['{', 4],
    ['}', 4],
    ['<', 4],
    ['>', 4],
    ['[', 3],
    [']', 3],
    ['^', 5],
    ['~', 6],
    ['©', 7]
];



/**
 * Class helpers
 */
Function.prototype.inherits = function(Parent) {
    function F() {}
    F.prototype = Parent.prototype;
    this.prototype = new F();
};

Function.prototype.extends = function(Parent) {
    this.inherits(Parent);
    this.prototype.constructor = this;
    this.prototype.parent = Parent.prototype;
    
    return this;
};



/**
 * Helpers
 */
var Helpers = {
    
    secsToTime: function(delta) {
        var days = Math.floor(delta / 86400);
        delta -= days * 86400;

        var hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;

        var minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;

        var seconds = delta % 60; 

        var result = days
            result += 'd ' + (hours < 10 ? '0' + hours : hours);
            result += 'h ' + (minutes < 10 ? '0' + minutes : minutes);
            result += 'm ' + (seconds  < 10 ? '0' + seconds : seconds);
            result += 's';
            
        return result;
    },
    
    groupThousands: function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    round10: function(val) {
        return Math.round(val * 100) / 100;
    }

};



/**
 * Font
 */
function Font(src, height, data){
    this.sprite = new Image();
    this.sprite.src = src;
    
    this.height = height;
    this.glyphs = this._initGlyphs(data);
}

Font.prototype._initGlyphs = function(data) {
    var glyphs = {};
    var pos = 0;
    
    for (var i = 0, len = data.length; i < len; i++) {
        var w = data[i][1];
        glyphs[data[i][0]] = [pos, w];
        pos += w + 1;
    }
    
    return glyphs;
}



/**
 * Textline
 * TODO: Color, fonts, multiline?, static?
 * TODO: Get dimensions, move to constructor?
 */
function Textline() {
    // TODO: Better dimensions interface
    this.height = 0;
    this.width = 0;
}

Textline.prototype.write = function(s, font, spacing) {
    var canvas = new Canvas(300, 150);
    var ctx = canvas.getContext('2d');
    
    var pos = 0;
    for (var i = 0, len = s.length; i < len; i++) {
        if (s[i] == ' ') {
            pos += spacing * 4;
            continue;
        }
        
        var glyph = font.glyphs[s[i]];
        
        if (!glyph) continue;
        
        var w = glyph[1]
        
        ctx.drawImage(font.sprite, glyph[0], 0, w, font.height, pos, 0, w, font.height);
        pos += w + spacing;
    }
    
    this.height = font.height;
    this.width = pos - spacing;
    // this.width = pos;
    
    return canvas;
}



/**
 * Panel
 */
function Panel(width, height, ctx) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.elems = [];
}

Panel.prototype.render = function(dt) {
    // Reset
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (var i = 0, len = this.elems.length; i < len; i++) {
        this.elems[i].render(dt);
    }
};



/**
 * Panel Element
 */
function PanelElement(ctx) {
    this.ctx = ctx;
    
    // Shorthands
    this.panelWidth = ctx.canvas.width;
    this.panelHeight = ctx.canvas.height;
}

PanelElement.prototype.render = function(dt) { }; 



/**
 * Element: Counter
 */
CounterElement.extends(PanelElement);

function CounterElement(ctx, data) {
    this.parent.constructor.call(this, ctx);
    this.data = data;
    this.x = 0;
    this.y = 0;
}

CounterElement.prototype.render = function(dt) {
    var textline = new Textline();
    var count = ('0000000000000' + Math.round(this.data.count)).substr(-13, 13);
    
    this.ctx.drawImage(textline.write(Helpers.groupThousands(count), font_white, 1), 3, 4);
};



/**
 * Element: Markee
 * TODO: Figure out real infinite markee
 */
MarkeeElement.extends(PanelElement);

function MarkeeElement(ctx, data, objective) {
    this.parent.constructor.call(this, ctx);
    this.data = data;
    this.objective = objective;
    this.x = this.panelWidth;
    // this.x = 0;
    this.x2 = this.panelWidth + 260;
}

MarkeeElement.prototype.render = function(dt) {
    var pos = this.x;
    var textline = new Textline();
    
    this.ctx.drawImage(textline.write('SPEED: ', font_yellow, 2), pos, 17);
    this.ctx.drawImage(textline.write('SPEED: ', font_yellow, 2), pos + 1, 17);
    pos += textline.width;
    
    this.ctx.drawImage(textline.write(Math.round(this.data.speed) + '/s', font_white, 1), pos, 17);
    pos += textline.width;
    
    this.ctx.drawImage(textline.write('  TTC: ', font_yellow, 2), pos, 17);
    this.ctx.drawImage(textline.write('  TTC: ', font_yellow, 2), pos + 1, 17);
    pos += textline.width;
    
    var ttc = Math.round((this.objective - this.data.count) / this.data.speed);
    
    this.ctx.drawImage(textline.write(Helpers.secsToTime(ttc), font_white, 1), pos, 17);
    pos += textline.width;           
    
    this.x -= 1.0;
    
    if (this.x <= -pos + this.x) this.x = this.panelWidth + 160;
    // if (this.x <= -pos + this.x) this.x = this.panelWidth;
    
    // SECOND
    
    var pos2 = this.x2;
    var textline2 = new Textline();
    
    this.ctx.drawImage(textline2.write('SPEED: ', font_yellow, 2), pos2, 17);
    this.ctx.drawImage(textline2.write('SPEED: ', font_yellow, 2), pos2 + 1, 17);
    pos2 += textline2.width;
    
    this.ctx.drawImage(textline2.write(Math.round(this.data.speed) + '/s', font_white, 1), pos2, 17);
    pos2 += textline2.width;
    
    this.ctx.drawImage(textline2.write('  TTC: ', font_yellow, 2), pos2, 17);
    this.ctx.drawImage(textline2.write('  TTC: ', font_yellow, 2), pos2 + 1, 17);
    pos2 += textline2.width;
    
    this.ctx.drawImage(textline2.write(Helpers.secsToTime(ttc), font_white, 1), pos2, 17);
    pos2 += textline2.width;
    
    
    this.x2 -= 1.0;
    
    if (this.x2 <= -pos2 + this.x2) this.x2 = this.panelWidth + 160;
};



/**
 * Element: Percentage bar
 */
PercentageBarElement.extends(PanelElement);

function PercentageBarElement(ctx, data, objective) {
    this.parent.constructor.call(this, ctx);
    this.data = data;
    this.objective = objective;
}

PercentageBarElement.prototype.render = function(dt) {
    var width = this.data.count / this.objective * this.panelWidth;
    var height = 3;
    
    ctx.fillStyle = '#ffcc33';
    ctx.fillRect(0, this.panelHeight - height, Math.floor(width), height);
};



/**
 * Element: Percentage label
 */
PercentageLabelElement.extends(PanelElement);

function PercentageLabelElement(ctx, data, objective) {
    this.parent.constructor.call(this, ctx);
    this.data = data;
    this.objective = objective;
}

PercentageLabelElement.prototype.render = function(dt) {
    var width = 32;
    var height = 11;
    ctx.fillStyle = '#ffcc33';
    ctx.fillRect(this.panelWidth - width, 2, width, height);
    
    var perc = Math.min(Helpers.round10(this.data.count / this.objective * 100), 100);
    
    var textline = new Textline();
    var line = textline.write(perc.toFixed(1) + '%', font_black, 2);

    // TODO: Fix bold hack
    this.ctx.drawImage(line, Math.round(this.panelWidth - (textline.width + 1 + width) / 2), 4);
    this.ctx.drawImage(line, Math.round(this.panelWidth - (textline.width + 1 + width) / 2) + 1, 4);
};



/**
 * Element: Test
 */
TestElement.extends(PanelElement);

function TestElement(ctx) {
    this.parent.constructor.call(this, ctx);
}

TestElement.prototype.render = function(dt) {

};



/**
 * Cobbler Panel
 */
CobblerPanel.extends(Panel);

function CobblerPanel(width, height, ctx) {
    this.parent.constructor.call(this, width, height, ctx);
    
    var self = this;
    
    // Data
    this.objective = 1000000000000;
    this.data = {
        count: 65028169838,
        speed: 55952.121
    }
    
    // Panel elements
    var counter = new CounterElement(this.ctx, this.data);
    var markee = new MarkeeElement(this.ctx, this.data, this.objective);
    var percentageBar = new PercentageBarElement(this.ctx, this.data, this.objective);
    var percentageLabel = new PercentageLabelElement(this.ctx, this.data, this.objective);
    var test = new TestElement(this.ctx);
    
    this.elems.push(counter);
    this.elems.push(markee);
    this.elems.push(percentageBar);
    this.elems.push(percentageLabel);
    this.elems.push(test);
    
    // Render loop
    this.fps = 30;
    this.interval = 1000 / this.fps;
    // this.requestId;
    this.last;
    
    this.io = require('socket.io')(9099, {
        
    });
    
    this.io.on('connection', function (socket) {
        console.log('new connection');
    });
    
    self.start()
}

CobblerPanel.prototype.render = function(dt) {
    this.data.count += this.data.speed * dt;
    this.parent.render.call(this, dt);    
    
    var self = this;
    
    this.ctx.canvas.toBuffer(function(err, buffer) {
        self.io.emit('frame', buffer);
    });
}

CobblerPanel.prototype.start = function() {
    // if (!this.requestId) {
        this.last = performanceNow();
        this.frame();
    // }
}

CobblerPanel.prototype.stop = function() {
    // if (this.requestId) {
        // cancelAnimationFrame(this.requestId);
        // this.requestId = undefined;
    // }
}

CobblerPanel.prototype.frame = function() {    
    var self = this;
    var now = performanceNow();
    var dt = now - this.last;
    
    if (dt > this.interval) {
        this.render(dt / 1000);
        this.last = now - (dt % this.interval);
    }
    
    setImmediate(function() {
        self.frame();
    });
}



// APP ----------

// TODO: Auto colors
var font_white = new Font('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgEAAAAICAYAAABgdiyAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhJREFUeNrsW9Fu2zAM5AH5/1/mhiErOsMi70gqdpbqoUUVR6ao45E8u3B3+z3+/HgOPH9/n/s+r15/nP/72Wp+tZaf2ICFLba4DsT88XN2nd1+jPxior92z1uwh8zP6mC/7w1bXMTWxL6uGne3O4r31TmwsbfCS4ZpJzmvas9kjKgYZ/nwLBYirrDB/Z6dFQZwVckRrB0Zd6w4HiTekeSnr/UeSVJTkyAzb0TwKQeIImggXOck2ez048pmDBEF49+jjat5CwL+HRMbxPl3HX7zQoAtwDuFvNJgGBGXkV+VxsIbmMuS0i7+ZL/LFA7segwfRoXLak21SAK539XaSArIqOjKioF/bHkkRO1DROhJgoBQmU2QHMTgwaI6g3hf1V92ApYrElAEVBcIMut22O4ow5MRJMooLpXuKavOvakSIfHVqjtjVCUkXeOd1CRGFatwlot8hCInTiTbSqJk1rQFNiJfIok7J2O4UwBU13kll3pzz1ERAQHjX9c8ROKtOqsSjIp8ptqh7CUDmW0Amaq0vAq4VaBm+2IlxCiJrq5nO78KYVZJqaMSZb7ywS5rt5qk4p8pFjpNCJvUneCniLCzAt+GC3+Qe2HuoSTWKm/s5jgUVBHlsUDFD52ipcVRD/vMMUWEChHdce+VxxreIApvFEkg/O+DBDHdtU0TGItJXKAqTXQ7itLSKczM8scK1YJF+VtpxDxQgCZUj4nrMyUgSvpu1zySyu5ZUURZ/nwlf5wqATsdZzc7yDuOTmLd1fFP7yV7OWjCRygEwpQNIElk4ozYTrLTbU93edF7JYqvsQGLligFV6huZzGCRLmYxhercFQwgoH4ZJMq8xJjt8PuNKBXKHO0EqA+m2alewUAIG08yr/KQfrA4av3ha2fFU+vf9YRRoE5UQgc180In8UZK50yOJtUEI5+7ahNTDff2U/kJwSxlJEZTjrArBtC0j1GGFo9FrIkkU7F0mRMenDWO5KEWmRN2RDFr8qJKx6tcjiTnDM1gLGDKaIzhWfM73j+i+DP+BmfNDpF31UvZypE/C5q2ETx/TM+L167itBUfPj/gNlfAgwAwDPLiNDFOQ8AAAAASUVORK5CYII=', 8, glyphsData);
var font_yellow = new Font('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgEAAAAICAYAAABgdiyAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2pJREFUeNrkW9Fu5DAIZKT9o97/f0H7TfSk67VVFMMM4E2q+qWq13EAwwDjXfjri/0dbl8DH3+/z32fV9cf5/9/tppf7eUnMmAhiy3WgZg/fs7us9uOkV1MtNfueQt0yOysDvZ5b8jiom9N6HXVuLvcUbyvzoGNvZW/ZD7tJOZV5ZmMEdXHWTw8i4UIK2xQ37OzwoBfVXIEK0eGHSuMB+nvSPLTv/HyikeS1NQkyMwbEXzKAaLoNBDWOQk2O+24khlDQMHY9yjjat6CgP+JiQ3i/E8dfvNCgC3AO4W80mAYEZeRXZXGwhs+lyWlXfjJPssUDux+DB5GhctqT7VIAqnvam8kBWRUdGXFwNd4++OPBKh9CAg9SRAQKrMJkIMYPFhUZxDfq9rLTpzligQUOaoLAJl1O2x3lPmTESDKMC6V7imrzr3JEiGx1ao7Y1glJF3jndgkhhWrYJaLeIQiJk4k20qiZPa0hW9EtkQSd07GcKcAqO7zTCz1ps5REQHBxz/XPETgrRqrEowKfabKoeiSOZltcDKVaXmW41YdNdOLpRCjJLpaz3Z+FcCsglKHJcps5YNd1m42SfV/pljoNCFsUncCnyLAzgp8Gy78QerCvENJrFXc2I1xKLAiyrVAxQ6doqWFUQ/7nWMKCBUguqPulWsNbwCFN4okEPb3QYCY7tqmAYz1SVzAKk10OwrT0inMzPJrhWrBovyvNGIeMEATrMfE+owJiJK+2zVXUtk7K4woi5/PxI9TJmCn4exmB3nH0Umsuzr+aV2yLwdN2AiFQJiSASSITJwR20l2uu3pLi/6Xolia2zwRUuYgitYt7MYQcJcTPsXy3BUfAQD8ckmVeZLjN0Ou9OAXsHM0UyAejfNUveKA4CU8Uj/KgfpA4evvhe2viue3v+sI4wCc6IQOO6bAT7rZyx1yvjZJINwtGuHbWK6+Y4+kZ0QxFIGZjjpALNuCEn3GPnQ6lrIkkQ6FUuTMenBWe9IEmqRNSVDFL8qJq5wtIrhTHLO2ABGDqaIzhieGbt//DoASbXJdjTqvX93f4iyqHqy61G0y+pZdf+Jd1f1VatnDPjBxLyLujKFSeVMq2ddqvjFZDV5nis9/SLsYe2LJ+DYjjjo+EYVL6JnqhjB/OSy469VLEMzbtT8NVUAnu7zLsAAcWXF7o8TVqEAAAAASUVORK5CYII=', 8, glyphsData);
var font_black = new Font('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgEAAAAICAYAAABgdiyAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFJREFUeNrsW9tuKzEIBCn//8tzWvU8bCMDw8VOVo2lPtTLshiGqxWRn4XLnyz2rvtZehjPkHhHDBnEkXFFx+xLkh5FvXTpQei3o4fOPgi7SKB/diFBV5Uli62Jc71q4QbyIaHzjO9ZeAHpl5KMbZ1zVW2Kot2jOADnW0wc65x3ZasJXFVyBCsHEpj1MCMEFk1cfq2XJAsZ2gcJGgT0SAILCaCf0COjn853u7K9QxGAQV7se3csAtjC7V0KFARFXgXrUWKr2L7rexN2YRqlSiGRLQJA8u76bCYnMHZBQidVfGR4MXmNku+R+KgaNJowlJL71renEoaS9Pr/HV3IgwQfFPV1pdcCn6llnTfSw/MzT/6VbSz6CE8rzCDAkscfDkaV3Fvpi5FhJQcCmWFgV52goIZ8ujjbif0ozsDAojRjFpLxSIsxkY0b2ni+omN4ioENT5ca+B1IH9biuaTB52QsRfPMzzyu72oC479odnX2U5OATKc6PQlg+Jy8buhUkzsmAdVKXIYmKyjiA01ZMl2QR1e9asnoJNtl4SCG2PFmtoNju2AU5FnZA5IfGbMj8p3XBBUeKNAiwDLr09UYUz1fNabKJjoM2BnWJOCvrWzlFfG569mZTtaqOisVOhqVuBL6x5B+dnRtk/bLYFJfMFWa6HYyk5ZOtyjBdCZjDzT+ZydgFubZCcouXTIFchQTruc75U+Z81Umomz8PBk/fk0CHgcUJ29myHdcncS6Qw5sOIt3NTClIy04wpQMSgaRyc5NG+fRBraiQjLCFiP3xKg9G3DVSWT6glhgXW9Yo/1pfHl8MwnTSpxd/2STKsS+JvP0t8PmShSHRxuJx0DAydzhVgCgpIzXe5HOHXzV+Nnvqth3xdP8Vx2h55gThcAz3yjgszjzOp4sziYnCM967UybmG6+cx5PT+r4UhTMVOwRr9UNadA9ehhS41sSJNIpX5r0STi23pEkskXWlAye/2ZjohVHqzGcSc7RNICRgymiownPiN4B6N065s/6rKkA2Okud3YKE9Ogu0zDJorvz/p7/tqdCE35B+6O2e+fCP4TYAA/fpu+TSxqvwAAAABJRU5ErkJggg==', 8, glyphsData);

var canvas = new Canvas(128, 32);
var ctx = canvas.getContext('2d');

var cobblerPanel = new CobblerPanel(128, 32, ctx);
