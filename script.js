!function() {

  var today = moment();

  var link = document.createElement("link");
      link.setAttribute("rel","stylesheet");
      link.setAttribute("href","/themes/main.css");

  function Calendar(selector, events) {
    this.el = document.querySelector(selector);
    this.events = events;
    this.current = moment().date(1);
    this.draw();
    var current = document.querySelector('.today');
    if(current) {
      var self = this;
      window.setTimeout(function() {
        self.openDay(current);
      }, 500);
    }
  }

  Calendar.prototype.draw = function() {
    //Create Header
    this.drawHeader();

    //Draw Month
    this.drawMonth();

    this.drawLegend();
  }

  Calendar.prototype.drawHeader = function() {
    var self = this;
    if(!this.header) {
      //Create the header elements
      this.header = createElement('div', 'header');
      this.header.className = 'header';

      this.title = createElement('h1');

      var right = createElement('div', 'right');
      right.addEventListener('click', function() { self.nextMonth(); });

      var left = createElement('div', 'left');
      left.addEventListener('click', function() { self.prevMonth(); });

      //Append the Elements
      this.header.appendChild(this.title); 
      this.header.appendChild(right);
      this.header.appendChild(left);
      this.el.appendChild(this.header);
    }

    this.title.innerHTML = this.current.format('MMMM YYYY');
  }

  Calendar.prototype.drawMonth = function() {
    var self = this;
    
    this.events.forEach(function(ev) {
     ev.date = self.current.clone().date(ev.day);
     ev.mon = self.current.clone().date(ev.month);
    });
    
    
    if(this.month) {
      this.oldMonth = this.month;
      this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
      this.oldMonth.addEventListener('webkitAnimationEnd', function() {
        self.oldMonth.parentNode.removeChild(self.oldMonth);
        self.month = createElement('div', 'month');
        self.backFill();
        self.currentMonth();
        self.fowardFill();
        self.el.appendChild(self.month);
        window.setTimeout(function() {
          self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
        }, 16);
      });
    } else {
        this.month = createElement('div', 'month');
        this.el.appendChild(this.month);
        this.backFill();
        this.currentMonth();
        this.fowardFill();
        this.month.className = 'month new';
    }
  }

  Calendar.prototype.backFill = function() {
    var clone = this.current.clone();
    var dayOfWeek = clone.day();

    if(!dayOfWeek) { return; }

    clone.subtract('days', dayOfWeek+1);

    for(var i = dayOfWeek; i > 0 ; i--) {
      this.drawDay(clone.add('days', 1));
    }
  }

  Calendar.prototype.fowardFill = function() {
    var clone = this.current.clone().add('months', 1).subtract('days', 1);
    var dayOfWeek = clone.day();

    if(dayOfWeek === 6) { return; }

    for(var i = dayOfWeek; i < 6 ; i++) {
      this.drawDay(clone.add('days', 1));
    }
  }

  Calendar.prototype.currentMonth = function() {
    var clone = this.current.clone();

    while(clone.month() === this.current.month()) {
      this.drawDay(clone);
      clone.add('days', 1);
    }
  }

  Calendar.prototype.getWeek = function(day) {
    if(!this.week || day.day() === 0) {
      this.week = createElement('div', 'week');
      this.month.appendChild(this.week);
    }
  }

  Calendar.prototype.drawDay = function(day) {
    var self = this;
    this.getWeek(day);

    //Outer Day
    var outer = createElement('div', this.getDayClass(day));
    outer.addEventListener('click', function() {
      self.openDay(this);
    });

    //Day Name
    var name = createElement('div', 'day-name', day.format('ddd'));

    //Day Number
    var number = createElement('div', 'day-number', day.format('DD'));


    //Events
    var events = createElement('div', 'day-events');
    this.drawEvents(day, events);

    outer.appendChild(name);
    outer.appendChild(number);
    outer.appendChild(events);
    this.week.appendChild(outer);
  }

  Calendar.prototype.drawEvents = function(day, element) {
    if(day.month() === this.current.month()) {
      var todaysEvents = this.events.reduce(function(memo, ev) {
        if(((ev.date.isSame(day, 'day'))
        &&(ev.month-1 == day.month())) &&(ev.year == day.year()) ) {
          memo.push(ev);
        }
        return memo;
      }, []);

      todaysEvents.forEach(function(ev) {
        var evSpan = createElement('span', ev.color);
        element.appendChild(evSpan);
      });
    }
  }

  Calendar.prototype.getDayClass = function(day) {
    classes = ['day'];
    if(day.month() !== this.current.month()) {
      classes.push('other');
    } else if (today.isSame(day, 'day')) {
      classes.push('today');
    }
    return classes.join(' ');
  }

  Calendar.prototype.openDay = function(el) {
    var details, arrow;
    var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
    var day = this.current.clone().date(dayNumber);

    var currentOpened = document.querySelector('.details');

    //Check to see if there is an open detais box on the current row
    if(currentOpened && currentOpened.parentNode === el.parentNode) {
      details = currentOpened;
      arrow = document.querySelector('.arrow');
    } else {
      //Close the open events on differnt week row
      //currentOpened && currentOpened.parentNode.removeChild(currentOpened);
      if(currentOpened) {
        currentOpened.addEventListener('webkitAnimationEnd', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.addEventListener('oanimationend', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.addEventListener('msAnimationEnd', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.addEventListener('animationend', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.className = 'details out';
      }

      //Create the Details Container
      details = createElement('div', 'details in');

      //Create the arrow
      var arrow = createElement('div', 'arrow');

      //Create the event wrapper

      details.appendChild(arrow);
      el.parentNode.appendChild(details);
    }

    var todaysEvents = this.events.reduce(function(memo, ev) {
      if(((ev.date.isSame(day, 'day'))
        &&(ev.month-1 == day.month())) &&(ev.year == day.year()) ) {
        memo.push(ev);
      }
      return memo;
    }, []);

    this.renderEvents(todaysEvents, details);

    arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
  }

  Calendar.prototype.renderEvents = function(events, ele) {
    //Remove any events in the current details element
    var currentWrapper = ele.querySelector('.events');
    var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

    events.forEach(function(ev) {
      //This is the event in the cal
      var div = createElement('div', 'event');
      var square = createElement('div', 'event-category ' + ev.color);
      var span = createElement('span', '', ' ' + ev.eventName);
      var a = createElement('a');
      var linkText = document.createTextNode(ev.eventName);

      
      a.appendChild(linkText);
      a.title = ev.eventName;
      a.href = ev.calendar;
      a.target = "_blank";
      
      a.className = "calLink";
      div.appendChild(link);

      div.appendChild(square);
      div.appendChild(a);
      wrapper.appendChild(div);
    });

    if(!events.length) {
      var div = createElement('div', 'event empty');
      var span = createElement('span', '', 'No Events');

      div.appendChild(span);
      wrapper.appendChild(div);
    }

    if(currentWrapper) {
      currentWrapper.className = 'events out';
      currentWrapper.addEventListener('webkitAnimationEnd', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
      currentWrapper.addEventListener('oanimationend', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
      currentWrapper.addEventListener('msAnimationEnd', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
      currentWrapper.addEventListener('animationend', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
    } else {
      ele.appendChild(wrapper);
    }
  }

  Calendar.prototype.drawLegend = function() {
  
  }

  Calendar.prototype.nextMonth = function() {
    this.current.add('months', 1);
    this.next = true;
    this.draw();
  }

  Calendar.prototype.prevMonth = function() {
    this.current.subtract('months', 1);
    this.next = false;
    this.draw();
  }

  window.Calendar = Calendar;

  function createElement(tagName, className, innerText) {
    var ele = document.createElement(tagName);
    if(className) {
      ele.className = className;
    }
    if(innerText) {
      ele.innderText = ele.textContent = innerText;
    }
    return ele;
  }
}();

!function() {
  var data = [


//Week of 8/6
{ eventName: 'Volleyball @ 7:00 pm at 401 W Regina Ave, Spokane, WA 99218', calendar: 'https://maps.app.goo.gl/S5s2WmPNZcPJT2Sp9', color: 'yellow', month: 08, day:07, year:2023 },
    
{ eventName: 'Car Maintenance @ 6:30 PM at Gathering Place', calendar: '/institute.html', color: 'green', month: 08, day:08, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 08, day:10, year:2023 },

{ eventName: 'Hang out at the Brauns @ 6:00 PM 4311 W Center Ln, Spokane, WA 99208', calendar: 'https://maps.app.goo.gl/zCaKYYefS21KbcRSA', color: 'yellow', month: 08, day:11, year:2023 },


//Week of 8/13
    { eventName: 'Talent Show @ 7:00 pm at 401 W Regina Ave, Spokane, WA 99218', calendar: 'https://maps.app.goo.gl/S5s2WmPNZcPJT2Sp9', color: 'yellow', month: 08, day:14, year:2023 },
    
{ eventName: 'Work Life Balance @ 6:30 PM at Gathering Place', calendar: '/institute.html', color: 'green', month: 08, day:15, year:2023 },

    { eventName: 'Temple Trip Meet @ 5:30 PM at Gathering Place', calendar: '/institute.html', color: 'green', month: 08, day:16, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 08, day:17, year:2023 },

{ eventName: 'Campout @ 5:30 PM - Meet at the Regina Building, 401 W Regina - Campout at 37121 N Lakeside Dr, Elk, WA 99009', calendar: 'https://goo.gl/maps/mBqZUTamVTVhqtwp8', color: 'yellow', month: 08, day:18, year:2023 },

//Week of 8/21
    { eventName: 'Feeding Homeless at 5 @ the gathering place. There will be games at 6:30', calendar: 'https://goo.gl/maps/4c1r2Ax7HGjsdTEb6', color: 'yellow', month: 08, day:21, year:2023 },
    
{ eventName: 'Dinner @ 6:30 PM at Indiana Building, then help with donations @ 7:00 at 2112 W Francis Ave', calendar: 'https://maps.app.goo.gl/a6yCYcWESuvvMPfWA', color: 'green', month: 08, day:22, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 08, day:24, year:2023 },

{ eventName: 'Hangout at the Schupps @ 6:00 PM', calendar: 'https://goo.gl/maps/FVAcSdwhtCgQBYwR9', color: 'yellow', month: 08, day:25, year:2023 },

    //Week of 8/27
    { eventName: 'Pool Party @ 6:00 PM at 7504 N Audubon St, Spokane, WA 99208', calendar: 'https://goo.gl/maps/ctRWBZbY7BS4WckD6', color: 'yellow', month: 08, day:28, year:2023 },
    
{ eventName: 'Battle of the Bands @ 6:30 PM at Gathering Place', calendar: '/institute.html', color: 'green', month: 08, day:29, year:2023 },

{ eventName: 'Temple Trip at 4:30', calendar: 'https://maps.app.goo.gl/GrHAsfBFnUGayjyE7', color: 'green', month: 08, day:30, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 08, day:31, year:2023 },

{ eventName: 'Movie Night at the Schupps @ 7:00 PM', calendar: 'https://goo.gl/maps/FVAcSdwhtCgQBYwR9', color: 'yellow', month: 09, day:01, year:2023 },


//Week of 91
    { eventName: 'Volleyball and Frisbee @ 6:30 PM at 403 W Regina', calendar: 'https://maps.app.goo.gl/6wg4Yyw7z5tbqfgf8', color: 'yellow', month: 09, day:04, year:2023 },
    
{ eventName: 'Pickelball @ 6:30 PM at Gathering Place', calendar: '/institute.html', color: 'green', month: 09, day:05, year:2023 },

{ eventName: 'Regional Choir', calendar: 'https://maps.app.goo.gl/8dBqAWc7FCPR4s8a8', color: 'green', month: 09, day:6, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 09, day:7, year:2023 },

{ eventName: 'Bible Study and Pillow Fight @ 6:30 PM at Bishop Schupp Place', calendar: 'https://goo.gl/maps/FVAcSdwhtCgQBYwR9', color: 'yellow', month: 09, day:08, year:2023 },

    //Week of 91
    { eventName: 'Game Night @ 6:30 PM at the Hardy Househald', calendar: 'https://goo.gl/maps/Udjtv7oy7MXeRrqm8', color: 'yellow', month: 09, day:11, year:2023 },
    
{ eventName: 'Self Reliance Class @ 6:30 PM at Gathering Place', calendar: '/institute.html', color: 'green', month: 09, day:12, year:2023 },

{ eventName: 'Regional Choir', calendar: 'https://maps.app.goo.gl/8dBqAWc7FCPR4s8a8', color: 'green', month: 09, day:13, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 09, day:14, year:2023 },

{ eventName: 'Sardines @ 7 PM at the Gathering Place', calendar: 'https://goo.gl/maps/9sqr9oa18VeVz7qE7', color: 'yellow', month: 09, day:15, year:2023 },

    //Week of 9 17
    { eventName: 'Art/Temple History @ 7:00 PM at the Gathering Place', calendar: 'https://goo.gl/maps/9sqr9oa18VeVz7qE7', color: 'yellow', month: 09, day:18, year:2023 },
    
{ eventName: 'Open House @ 6:30 PM at Gathering Place', calendar: '/institute.html', color: 'green', month: 09, day:19, year:2023 },

{ eventName: 'Regional Choir', calendar: 'https://maps.app.goo.gl/8dBqAWc7FCPR4s8a8', color: 'green', month: 09, day:20, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 09, day:21, year:2023 },

{ eventName: 'Swing Dance / Karaoke @ 6:30 PM place to be determined', calendar: '/institute.html', color: 'blue', month: 09, day:22, year:2023 },


    //Week of 9 24
    { eventName: 'Trivia Night @ 7:00 PM at 401 West Regina', calendar: 'https://maps.app.goo.gl/nm7HNY38yVMu9vCRA', color: 'yellow', month: 09, day:25, year:2023 },
    
{ eventName: 'Volleyball @ 6:30 PM at 1620 E 29th Ave', calendar: 'https://maps.app.goo.gl/uE5RmGqMiswhnkBy9', color: 'green', month: 09, day:26, year:2023 },

{ eventName: 'Regional Choir', calendar: 'https://maps.app.goo.gl/8dBqAWc7FCPR4s8a8', color: 'green', month: 09, day:27, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 09, day:28, year:2023 },

{ eventName: 'Temple Trip @ 5:45 PM', calendar: 'https://maps.app.goo.gl/FaKi4p5LiqSZeHbC7', color: 'blue', month: 09, day:29, year:2023 },

{ eventName: 'General Conference at Bishop Schupp', calendar: 'https://maps.app.goo.gl/jTnvY32KHjmDMsir5', color: 'blue', month: 09, day:30, year:2023 },

{ eventName: 'General Conference at Gathering Place', calendar: 'https://maps.app.goo.gl/fmtgVQbCkVenLxqW6', color: 'blue', month: 10, day:01, year:2023 },


//Week of 10 2
    { eventName: 'Trivia Night @ 7:00 PM at 401 West Regina', calendar: 'https://maps.app.goo.gl/nm7HNY38yVMu9vCRA', color: 'yellow', month: 10, day:2, year:2023 },

    { eventName: 'Regional Choir', calendar: 'https://maps.app.goo.gl/8dBqAWc7FCPR4s8a8', color: 'green', month: 10, day:04, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 10, day:05, year:2023 },

{ eventName: 'Video Game Night @ 6:30 PM at Bishop', calendar: 'https://maps.app.goo.gl/jTnvY32KHjmDMsir5', color: 'blue', month: 10, day:06, year:2023 },

    //Week of 10 2
{ eventName: 'Capture the flag @ 6:30 PM at 401 West Regina', calendar: 'https://maps.app.goo.gl/nm7HNY38yVMu9vCRA', color: 'yellow', month: 10, day:9, year:2023 },

{ eventName: 'Investing Class @ 6:30 PM at Gathering Place', calendar: 'https://maps.app.goo.gl/uE5RmGqMiswhnkBy9', color: 'green', month: 10, day:10, year:2023 },

{ eventName: 'Regional Choir', calendar: 'https://maps.app.goo.gl/8dBqAWc7FCPR4s8a8', color: 'green', month: 10, day:11, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 10, day:12, year:2023 },

{ eventName: 'Wings + Nerf Gun at the Chraddy Shack @ 6:30 PM', calendar: 'https://maps.app.goo.gl/8HD5Fz8amwbUaaEAA', color: 'blue', month: 10, day:13, year:2023 },

{ eventName: 'Relief Society: Halloween Crafts @ 7:00 PM at Regina Building', calendar: 'https://maps.app.goo.gl/nm7HNY38yVMu9vCRA', color: 'blue', month: 10, day:13, year:2023 },

{ eventName: 'Clean Church + Service Project @ 12:00 PM at Gathering Place', calendar: 'https://maps.app.goo.gl/GcPWFKWgXQ5YgsLG6', color: 'blue', month: 10, day:14, year:2023 },


    //Week of 10 15
{ eventName: 'Pumpkin Carving @ 7 PM at the gathering place', calendar: 'https://maps.app.goo.gl/B78GrX1aLz4ct4Yn7', color: 'yellow', month: 10, day:16, year:2023 },

{ eventName: 'Jamacian Cooking Class @ 6:30 PM at Gathering Place', calendar: 'https://maps.app.goo.gl/uE5RmGqMiswhnkBy9', color: 'green', month: 10, day:17, year:2023 },

{ eventName: 'Regional Choir', calendar: 'https://maps.app.goo.gl/8dBqAWc7FCPR4s8a8', color: 'green', month: 10, day:18, year:2023 },

{ eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'blue', month: 10, day:19, year:2023 },
    
  ];

  

  function addDate(ev) {

    
  }

  var calendar = new Calendar('#calendar', data);

}();
