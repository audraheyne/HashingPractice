class SimpleHashNode {
	constructor(key, value) {
		this.key = key;
		this.value = value;
	}
}

class SimpleHashTable {
	/*
		Creates a simple hash table.
		max_density: a value between 0 and 1 indicating how densely poplulated the hash table will be
		hash_f: a hash function that accepts a key and the array size and returns a hash index
		collision_f: a function that accepts a key, the array size, and the previous index and returns
					 a new hash index
	*/
	constructor(max_density, hash_f, collision_f, metric_f) {
		this.max_density = max_density;
		this.hash_f = hash_f;
		this.collision_f = collision_f;

		this.elements = new Array(16).fill(undefined);
		this.element_count = 0;

		this.deleted_element = new SimpleHashNode(undefined, 'DELETED')
	}

	/*
		Inserts a key/value pair into the hash table.
		key: a key in the format accepted by the table's hash_f
		value: the value associated with the key
	*/
	insert(key, value) {
		// will inserting the new element push the array past the fill factor?
		if (this._getDensity() >= this.max_density) {
			this._grow();
		}

		// perform the insert
		let insert_index = this.hash_f(key, this.elements.length);
		while (this._isOccupied(insert_index)) {
			insert_index = this.collision_f(key, insert_index, this.elements.length);
		}
		this.elements[insert_index] = new SimpleHashNode(key, value);
		this.element_count++;
	}

	/*
		Deletes a key/value pair into the hash table.
		key: a key in the format accepted by the table's hash_f
		returns: the value associated with that key if the key is in the table
				 undefined otherwise.
	*/
	delete(key) {
		let delete_index = this._search(key);
		console.log(delete_index);
		if (delete_index >= 0) {
			let deleted_node = this.elements[delete_index];
			this.elements[delete_index] = this.deleted_element;
			this.element_count--;
			return deleted_node.value;
		}
		return undefined;
	}

	/*
		Finds and returns the value associated with a key
		key: a key in the format accepted by the table's hash_f
		returns: the value associated with that key if the key is in the table
				 undefined otherwise.
	*/
	get(key) {
		let search_index = this._search(key);
		if (search_index >= 0) {
			let search_node = this.elements[search_index];
			return search_node.value;
		}
		return undefined;
	}

	/*
		Finds and returns the index of the element defined by the key
		key: a key in the format accepted by the table's hash_f
		returns: the index of the key's element if the key is in the table
				 -1 otherwise.
	*/
	_search(key) {
		let search_index = this.hash_f(key, this.elements.length);
		console.log(search_index);
		while (!this._isEmpty(search_index) &&
			this.elements[search_index].key !== key) {
			search_index = this.collision_f(key, search_index, this.elements.length);
		}
		if (this._isOccupied(search_index))
			return search_index;
		else {
			return -1;
		}
	}

	/*
		Private function to expand the size of the array. Its growth is
		logarithmic (it increases by a factor of  2 each time it grows).
	*/
	_grow() {
		const temp = this.elements;
		this.elements = new Array(temp.length * 2);
		this.element_count = 0;
		for(let item in temp) {
			this.insert(item.key, item.value)
		}
	}

	/*
		Private function to determine whether a given index has a non-deleted
		element stored within it.
		index: an index into the underlying array (this.elements)
		returns: true if there is no undeleted element stored at the index
				 false otherwise
	*/
	_isOccupied(index) {
		if (index < this.elements.length &&
			this.elements[index] !== undefined &&
			this.elements[index] !== this.deleted_element) {
			return true;
		}
		return false;
	}

	/*
		Private function to determine whether a given index has no element
		stored within it
		index: an index into the underlying array (this.elements)
		returns: true if there is no element stored at the index
				 false otherwise
	*/
	_isEmpty(index) {
		if (index < this.elements.length &&
			this.elements[index] === undefined) {
			return true;
		}
		return false;
	}

	/*
		Private function to calculate the hash table's density: the proportion
		of stored elements to the size of the array.
		returns: the density of the hash table (num elements/array size)
	*/
	_getDensity() {
		let density = this.element_count / this.elements.length;
		return density;
	}
}
