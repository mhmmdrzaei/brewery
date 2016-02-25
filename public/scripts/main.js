'use strict';

var brewApp = {};
var brewAppApi = 'http://api.brewerydb.com/v2/';
var brewAppKey = 'c0470cea063039b23d49457fc0120cf0';
var brewAppGoogleKey = 'AIzaSyCPJiNp9WLhIaAVBYrpsPWqCluZWalWjj8';
var brewAppGoogleApi = 'https://maps.googleapis.com/maps/api/';
var city;
var breweryLocation = [];
// Add blank google map on page (default location of Toronto)
// Markers to be added after 'submit' of city
var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 43.6482644, lng: -79.4000474 },
		zoom: 8
	});
} //intitial loading map, might go away after design, we might do display none here

// Enable auto-complete for cities on text box

// Get results
// User enters city, save 'val' in variable
// *** CONTAINED WITHIN INIT ***

// A function to split the string into city and country (check for commas)
brewApp.separateVal = function (data) {
	var separatedUserInput = []; // where date is getting stored into eventuall
	if (data.indexOf(',') !== -1) {
		// if there is a comma, then split it by a comma
		separatedUserInput = data.split(", ");
	} else {
		separatedUserInput = data.split(" "); //if there is a space, then split wit with a comma
	}
	var userCity = separatedUserInput[0];
	var userCountry = separatedUserInput[1]; // seperating city and country with the one above it.
	brewApp.countryCodes(userCity, userCountry); // feeding into the next function.
};

// A function to change countries into country codes

// if there different methods of country are written, translate them into what the API complies to.
brewApp.countryCodes = function (inputCity, inputCountry) {
	var country = [];
	// could be changed to regex statement
	if (inputCountry === 'Canada' || inputCountry === 'canada' || inputCountry === 'ca' || inputCountry === 'CA' || inputCountry === 'Ca' || inputCountry === 'Up North') {
		country = 'CA';
	} else if (inputCountry === 'United States' || inputCountry === 'United States of America' || inputCountry === 'united states' || inputCountry === 'USA' || inputCountry === 'usa' || inputCountry === 'US' || inputCountry === 'us' || inputCountry === 'U.S.A.' || inputCountry === 'u.s.a.' || inputCountry === 'Giddy\' Up') {
		country = 'US';
	}
	city = inputCity;
	console.log(city);
	console.log(country);

	brewApp.getInfo(city, country); //feed into next function
};

// Use variable to make AJAX request to brewery API for all breweries in that city (using HackerYou Proxy)

brewApp.getInfo = function (userCity, userCountry) {
	$.ajax({
		url: 'http://proxy.hackeryou.com',
		dataType: 'json',
		method: 'GET',
		data: {
			reqUrl: brewAppApi + 'locations',
			params: {
				key: brewAppKey,
				locality: userCity,
				countryIsoCode: userCountry
			}
		}
	}).then(function (res) {
		// Save the results in an array

		var userResults = res.data; // go inside the results that ajax call gave us from API and give us just the array featuring data.
		brewApp.filterArray(userResults);
		console.log(userResults);
	});
	// Add in a message if no results
};

// Add locations to google Maps

// Using a each or for loop, plot a marker on the map for each location
// Add a label to each Marker with the name of the brewery

// Filter the array of results into a new array with just Name, Lat & Lon
brewApp.filterArray = function (breweryResults) {
	breweryResults.forEach(function (brewery) {
		var name = brewery.brewery.name;
		var lat = brewery.latitude;
		var lng = brewery.longitude;

		var arrayResults = [name, lat, lng];
		breweryLocation.push(arrayResults);
	});
	console.log(breweryLocation);
	brewApp.getlocation(city);
};
//getting the lat lng of the city that the user input into the input field
brewApp.getlocation = function (query) {
	$.ajax({
		url: 'https://maps.googleapis.com/maps/api/geocode/json',
		type: 'GET',
		dataType: 'json',
		data: {
			address: query
		}
	}).then(function (result) {
		var lat = result.results[0].geometry.location.lat;
		var lng = result.results[0].geometry.location.lng;
		console.log(lat, lng);
		brewApp.updateMap(lat, lng);
		// var origin1 = new google.maps.LatLng(lat, lng);
	});
};
//update map with the lat long information that was grabbed and translated from user input and place on map using google API
brewApp.updateMap = function (query1, query2) {
	map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: query1, lng: query2 },
		zoom: 8
	});
	brewApp.googleMarkers(breweryLocation);
};
// this is the markers on the map locating the breweries in each city
brewApp.googleMarkers = function (markers) {
	function setMarkers(map) {
		markers.forEach(function (markersBrew) {
			// for each array go through it and feed a result to the map
			//make a container for each and in the results array 0 is the name and make that name show up in container.
			var contentString = '<div>' + '<h1 class="firstHeading">' + markersBrew[0] + '</h1>' + '</div>';

			//weird google map thing that is unclear but needs to be there.
			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});

			//plot a marker on the map using the marker google thing.
			var marker = new google.maps.Marker({
				position: { lat: markersBrew[1], lng: markersBrew[2] },
				map: map,
				// icon: image,
				// shape: shape,
				title: markersBrew[0]
			});
			//listen for click on the marker and show the info window that we made up above
			marker.addListener('click', function () {
				infowindow.open(map, marker);
			});
		});
	};
	setMarkers(map);
};

// console.log(origin1);

// Add listing of breweries on left side
// 	Shuffle the array of results
// Add the first 3 results to featured
// Build a handlebar template in our HTML
// Some information should be 'IF' in case note each brewery has that information available (ex. logo, established date)
// Using a for loop, run the first 3 results through the handlebar templates
// Add the remaining results to the list on the left side of the screen
// Build a handlebar template in our HTML
// Using a for loop (starting at i = 3), run the results through the handlebar templates

// Using jquery add slideToggle functionality to each result
// When slideToggle is down, add a class to make beer bottle tip over

// Add a button to refresh the results (below search bar)

// BREW APP INIT
brewApp.init = function () {
	$('#userLocation').on('submit', function (event) {
		event.preventDefault();
		var userInput = $('#location').val();
		console.log(userInput);
		brewApp.separateVal(userInput);
	});
};

// DOCUMENT READY
$(function () {
	brewApp.init();
});