/***********************************************************************************************
*
* GPX time location extract class
*
* A library ignostic class for extracting location and date/time information from gpx files
* in Javascript.
* 
* Copyright (c) 2012 Eric Gelinas
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this 
* software and associated documentation files (the "Software"), to deal in the Software 
* without restriction, including without limitation the rights to use, copy, modify, merge, 
* publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
* to whom the Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies 
* or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
* BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
* DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
***********************************************************************************************/

/*
*  Create StandardPixel namespace, if not already there.
*/

SP = SP || {};

(function() {
	
	function GPXTimeLocationExtract(data, options) {
		
		/***
		*  Globals
		***/
		var registered_events;
		
		/***
		*  Utility functions
		***/
		
		/*
		*  Type checks
		*/
		function isObject(thing){
			return Object.prototype.toString.call(thing) === "[object Object]";
		};
		
		function isFunction(thing){
			return Object.prototype.toString.call(thing) === "[object Function]";
		};
		
		function isString(thing){
			return Object.prototype.toString.call(thing) === "[object String]";
		};
		
		/*
		*  Parses gpx string usig browser native xml parser
		*/
		function parseGPX(gpx_string) {
			
		    if (String(gpx_string)) {
		        return DOMParser ? (new DOMParser()).parseFromString(gpx_string, "text/xml") : ((new ActiveXObject("Microsoft.XMLDOM")).loadXML(gpx_string));
		    } else {
		    	return false;
		    }
			
		}
		
		/*
		*  Checks if an event has been passed to the constructor in the 
		*  options object
		*/
		function hasEvent(event) {
			
			var i;
			
			if(isObject(registered_events) && registered_events[event]) {
				return true;
			} else {
				
				if(isObject(options) && isObject(options.when)) {
				
					registered_events = {};
				
					for(var i in options.when) {
						if(isFunction(options.when[i])) {
							registered_events[i] = options.when[i];
						} else {
							return false;
						}
					}
					
					if(registered_events[i]) {
						return true;
					} else {
						registered_events = null;
					}
				}
				
				return false
			}

		}
		
		/*
		*  Fires events passed to constructor
		*/
		function triggerEvent(event) {
			
			if(hasEvent(event)) {
				if(isObject(registered_events) && registered_events[event]) {
						registered_events[event].apply(this, {
							name : event
						});
						
						return true;
				}
			}
			
			return false;

		}
		
		/*
		*  Pulls trkpt elements out of the xml parsed gpx doc
		*/
		function getRawTrackParts(gpx_data) {
			return gpx_data.getElementsByTagName('trkpt');
		}
		
		/*
		*  Make an object out of the raw trkpt data
		*/
	    function extractTimeLocationData(raw_track_parts) {
			var part,
			    l;
			
			parts = [];
			
			for(var i=0, l=raw_track_parts.length; l > i; i++) {
				part = raw_track_parts[i];
				
				parts.push({
					latitude  : parseFloat(part.getAttribute('lat'), 10),
					longitude : parseFloat(part.getAttribute('lon'), 10),
					time      : new Date(part.getElementsByTagName('time')[0].textContent)
				});
				
			}
			
			return parts;
	    };
		
		var track_parts, gpx_string;
		
		triggerEvent('parse_start');
		
		gpx_data = parseGPX( data );
		
		/*
		*  Make sure this is a gpx document
		*/
		if(gpx_data.getElementsByTagName('gpx').length) {
			track_parts = extractTimeLocationData( getRawTrackParts( gpx_data ) );
		} else {
			return false;
		}

		triggerEvent('parse_end');
		
		/***
		*  Public interface
		***/
		this.name = 'GPXTimeLocationExtract';
		
		/*
		*  Returns all points
		*/
		this.getTrackParts = function() {
			return track_parts;
		};
		
		/*
		*  Return first point
		*/
		this.getStartTime = function() {
			return track_parts[0].time;
		};
		
		/*
		*  Return last point
		*/
		this.getEndTime = function() {
			return track_parts[track_parts.length].time;
		};
	}
	
	/***
	*  Set constructor to StandardPixel namespace
	***/
	SP.GPXTimeLocationExtract = GPXTimeLocationExtract;
	
})();
