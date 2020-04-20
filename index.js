let hashSimpleModulus = (key, array_size) => {
	return key % array_size;
}

let collisionLinearProbing = (key, prev_index, array_size) => {
	return (prev_index + 1) % array_size;
}

let multiplicative = (key, array_size) => {
	return (key * 7) % array_size;
}

let squared = (key, array_size) => {
	return key * key % array_size;
}

let charCodes = (key, array_size) => {
	return new String(key).toString().split("").reduce((a, b) => a + b.charCodeAt(0), 0) % array_size;
}

let patrick = (key, array_size) => {
	return "Patrick Murphy".split("").reduce((a, b) => a + b.charCodeAt(0), 0) * key % array_size;
}

let folding = (key, array_size) => {
	const folds = getFolds(key, 1);
	var sum = folds.reduce(function(a, b){
		return a + b;
		}, 0);
	return sum % array_size;
}

let getFolds = (number, fold_length) => {
	mod = Math.pow(10, fold_length);
	folds = [];
	while (number > 0) {
		folds.unshift(number % mod);
		number = Math.floor(number / mod);
	}
	return folds;
}

let updateTable = (results) => {
	results.sort(function (a, b) {
		return a['total_score'] - b['total_score'];
	});

	let table = '<table>\
					<tr>\
						<th>HASHING FUNCTION</th>\
						<th>COLLISION FUNCTION</th>\
						<th>MAX DENSITY</th>\
						<th>TOTAL COLLISIONS</th>\
						<th>MAX COLLISIONS</th>\
						<th>FINAL ARRAY SIZE</th>\
						<th>TOTAL SCORE</th>\
					</tr>';
	for (index in results) {
		result = results[index];
		let row = "<tr>";
		row += '<td class="desc">' + result['hashing_desc'] + '</td>';
		row += '<td class="desc">' + result['collision_desc'] + '</td>';
		row += '<td class="desc">' + result['max_density'] + '</td>';
		row += '<td class="result">' + result['total_collisions'] + '</td>';
		row += '<td class="result">' + result['max_collisions'] + '</td>';
		row += '<td class="result">' + result['final_size'] + '</td>';
		row += '<td class="result">' + result['total_score'].toLocaleString() + '</td>';
		row += '</tr>'
		table += row;
	}
	table += "</table>"

	$('#results_div').html(table);
}


let runExperiment = (hashing_function, hashing_desc, collision_function, collision_desc, max_density) => {
	// initialize logging values
	let total_collisions = 0;
	let max_collisions_count = 0;
	let last_collisions_count = 0;
	let last_element_key = undefined;

	// wrap the collision function in a function that performs logging
	let measurableCollisionFunction = (key, prev_index, array_size) => {
		if (key != last_element_key) {
			last_element_key = key;
			last_collisions_count = 0;
		}
		total_collisions++;
		last_collisions_count++;
		if (last_collisions_count > max_collisions_count) {
			max_collisions_count = last_collisions_count;
		}
		return collision_function(key, prev_index, array_size);
	}

	// initialize hash table
	let hash_table = new SimpleHashTable(max_density, hashing_function, measurableCollisionFunction);

	// insert some elements
	for (index in data) {
		//if (index < 5) {
			key = data[index]['id'];
			value = data[index];

			// store for logging purposes
			last_collisions_count = 0;

			// perform the insert
			hash_table.insert(key, value);
		//}
	}

	let results = {};
	results["hashing_desc"] = hashing_desc;
	results['collision_desc'] = collision_desc;
	results['max_density'] = max_density;
	results['total_collisions'] = total_collisions;
	results['max_collisions'] = max_collisions_count;
	results['final_size'] = hash_table.elements.length;
	results['total_score'] = Math.floor(total_collisions * max_collisions_count * Math.pow(hash_table.elements.length, 2));

	return results;
}

/*
	The "main" function
*/
$(document).ready(function () {
	data = JSON.parse(data);

	let results = [];
	results.push(runExperiment(hashSimpleModulus, "simple modulus", collisionLinearProbing, "linear probing", .95));
	results.push(runExperiment(hashSimpleModulus, "simple modulus", collisionLinearProbing, "linear probing", .5));
	results.push(runExperiment(hashSimpleModulus, "simple modulus", collisionLinearProbing, "linear probing", .3));
	results.push(runExperiment(hashSimpleModulus, "simple modulus", collisionLinearProbing, "linear probing", .1));
	results.push(runExperiment(multiplicative, "multiplicative", collisionLinearProbing, "linear probing", .5));
	results.push(runExperiment(folding, "folding", collisionLinearProbing, "linear probing", .5));
	results.push(runExperiment(squared, "squared", collisionLinearProbing, "linear probing", .5));
	results.push(runExperiment(charCodes, "char codes", collisionLinearProbing, "linear probing", .5));
	results.push(runExperiment(patrick, "patrick", collisionLinearProbing, "linear probing", .5));

	updateTable(results);
});
