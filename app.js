	// Get the latest exchange rates from openexchangerates.org:
		$.ajax({
			//url: 'http://openexchangerates.org/api/latest.json?app_id=[YOUR_APP_ID]',
			url: 'http://openexchangerates.org/api/latest.json?app_id=1adec3fc95e54c408b5adcde1c7134cd',		
			dataType: 'jsonp',
			success: function(data) {
			    fx.rates = data.rates;
			    fx.base = data.base;
		    }
		});


		// Get the list of currencies too, and create an extra group in the drop-down:
		$.ajax({
			url: 'http://openexchangerates.org/currencies.json',
			dataType: 'jsonp',
			success: function(data) {
			    var $optgroup = $('<optgroup label="All Currencies"/>');
			    _.each(data, function(name, code) {
			        $optgroup.append('<option value="' + code + '">' + name + ' (' + code + ')</option>');
			    });
			    $optgroup.appendTo('#currency');
		    }
		});

		// Handy callback function to run accounting.js formatting on cells:
		function formatCell(value, type) {
		    return type === 'number' ? accounting.formatNumber(value)
		         : type === 'money' ? accounting.formatNumber(value, 2)
		         : value;
		}

		// On ready:
		jQuery(document).ready(function($) {

		    // The columns in the table:
		    var columns = [
		        { title: 'Product',       key: 'name' },
		        { title: 'Units Sold',    key: 'sold',    type: 'number' },
		        { title: 'Currency',      key: 'fx',      type: 'fx' },
		        { title: 'Unit Price',    key: 'price',   type: 'money' },
		        { title: 'Gross Revenue', key: 'revenue', type: 'money' }
		    ];

		    // The rows of data (corresponding to columns):
		    var rows = [
		        [ 'His &amp; Hers Prophylactics', 24965, 'USD', 12.99, 324295.35 ],
				[ 'Christmas Stockings, Fishnet', 12600, 'GBP', 16.8, 211680 ],
		        [ 'Candy Underwear, Gummy', 8965, 'SEK', 80.5, 721682.5 ],
		        [ 'Santa Hat and Santa Suit, Crotchless', 13543, 'EUR', 10.5, 142201.5 ],
		        [ 'Vibrating Christmas Crackers x 6', 9954, 'HKD', 108,  1075032 ]
		    ];

		    // Handy underscore.js template that builds a table from data like the above:
		    // (See script tag with template, above)
		    var template = _.template( $('#tableTemplate').html() );

		    // Template the table's HTML using our data:
		    $('#table').html( template({
		        tplColumns: columns,
		        tplRows: rows
		    }));

		    // Convert the data:
		    $('#currency').change(function() {
		        var targetFx = $(this).find(':selected').val();
		        var currentFx;

		        if ( !targetFx ) return false;
		        // Now we're gonna use underscore.js to confapulate the data:
		        var newRows = _.map(rows, function(row) {
		            // Keeps the original `rows` intact. Doesn't seem to work anywhere else :/
		            row = _.clone(row);

		            // Get the 'from' currency:
		            currentFx = row[2];

		            // Update the row's currency with the 'target':
		            row[2] = targetFx;

		            // Convert the numbers yo:
		            row[3] = fx.convert(row[3], { from: currentFx, to: targetFx });
		            row[4] = fx.convert(row[4], { from: currentFx, to: targetFx });

		            return row;
		        });

		        // Now template the data:
		        $('#table').html(template({
		            tplColumns: columns,
		            tplRows: newRows
		        }));

		        return false;
		    });

		    // Reset to original data:
		    $('#reset').click(function() {
		        // Template the original data:
		        $('#table').html( template({
		            tplColumns: columns,
		            tplRows: rows
		        }));
		    });

		    // Display certain parts if iframe is viewed:
		    if (window.parent === window.self) {
			    $('.hideForDemo').show();
			}
		});