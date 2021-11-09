class APIFeatures {
  constructor(mongooseQueryObject, expressQueryString) {
    this.query = mongooseQueryObject;
    this.queryString = expressQueryString;
  }

  filter() {
    // 1A. BUILD QUERY
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((element) => delete queryObj[element]);

    // 1B. ADVANCED FILTERING
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchedTerm) => `$${matchedTerm}`
    );

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    // 2. SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3. FIELD LIMITING
    if (this.queryString.fields) {
      // create a string of selected fields and process it
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // exclude the v field
      this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4. PAGINATION
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // 1-10 page 1, 11-20 page 2, 21-30 page 3 etc etc
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
