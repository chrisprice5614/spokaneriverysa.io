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

    //Institue
    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 06, day:08, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 06, day:15, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 06, day:22, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 06, day:29, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 07, day:06, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 07, day:13, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 07, day:20, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 07, day:27, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 08, day:03, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 08, day:10, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 08, day:17, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 08, day:24, year:2023 },

    { eventName: 'Institute @ 6:30 PM', calendar: '/institute.html', color: 'yellow', month: 08, day:31, year:2023 },

    //Fhe
    { eventName: "Outdoor Games @ The Regina Building 6:00 | PM\n401 W Regina Ave", calendar: 'https://goo.gl/maps/LepMaEXaRrVoKGiPA', color: 'orange', month: 06, day:05, year:2023 },

    { eventName: "Crazy Fun Pool Party @ 5 Mile | 6:00 PM\n7504 N Audubon St", calendar: 'https://goo.gl/maps/iT6T4LocB8nptWUZ6', color: 'orange', month: 06, day:12, year:2023 },

    //Tuesday Night
    { eventName: "Self Defense Class @ Gathering Place | 7:00 PM\n732 W Indiana Ave", calendar: 'https://www.google.com/maps/place/732+W+Indiana+Ave,+Spokane,+WA+99205', color: 'green', month: 06, day:13, year:2023 },

    { eventName: "Self Defense Class @ Gathering Place | 7:00 PM\n732 W Indiana Ave", calendar: 'https://www.google.com/maps/place/732+W+Indiana+Ave,+Spokane,+WA+99205', color: 'green', month: 06, day:20, year:2023 },

    //Just throwing in all the church dates
    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 06, day:04, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 06, day:11, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 06, day:18, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 06, day:25, year:2023 },

    { eventName: "Fast and Testimony Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 07, day:2, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 07, day:9, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 07, day:16, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 07, day:23, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 07, day:30, year:2023 },

    { eventName: "Fast and Testimony Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 08, day:6, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 08, day:13, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 08, day:20, year:2023 },

    { eventName: "Sacrament Meeting @ 1:30 PM", calendar: '/visit.html', color: 'purple', month: 08, day:27, year:2023 },

    //Other events/Activities
    { eventName: "Boat Dance @ Coeur D'Alene 6:00 PM", calendar: '/posts/002Boat.html', color: 'blue', month: 06, day:23, year:2023 },

    { eventName: "Talent Show @ Time & Location TBA", calendar: '/posts/001talent_show.html', color: 'blue', month: 08, day:14, year:2023 },

{ eventName: "Pickle Ball Tournament @ 6:00 PM 5013 E Ballard Road", calendar: 'https://maps.app.goo.gl/76DjpupgweD2Ktii9', color: 'blue', month: 06, day:16, year:2023 },

    

  ];

  

  function addDate(ev) {

    
  }

  var calendar = new Calendar('#calendar', data);

}();