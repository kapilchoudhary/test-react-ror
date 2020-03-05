class Categories extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      categories: [],
      parent: null,
      selectedCategory: null,
      selectedProduct: null,
      editCategory: false,
      editProduct: false,
      addingCategory: false,
      addingProduct: false,
      filterType: '',
      filterValue: '',
      filters: []
    };
  }

  componentDidMount() {
    this.fetchCatgories();
  }

  fetchCatgories() {
    fetch("/api/v1/categories.json")
      .then(response => {
        return response.json();
      })
      .then(data => {
        const parent = data.find(cat => cat.category_id === null);
        this.setState({ categories: data, parent });
      });
  }

  handleClick(e, category) {
    e.preventDefault();
    this.setState({ selectedCategory: category });
    this.fetchProducts(category);
    this.fetchFilters(category);
  }

  fetchFilters(category) {
    fetch(`/api/v1/categories/${category.id}/get_filters.json`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.setState({ filters: data, filterType: data[0], filterValue: '' });
      });
  }

  handleChangeFilter(e){
    this.setState({[e.target.name]: e.target.value})
  }

  handleFilterSubmit(){
    const { selectedCategory, filterType, filterValue } = this.state
    const url = `/api/v1/products/filter_products?id=${selectedCategory.id}&filterType=${filterType}&filterValue=${filterValue}`
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.setState({ products: data });
      });
  }

  treeCategories(category) {
    const childCategories = this.state.categories.filter(
      cat => cat.category_id === category.id
    );
    return (
      <React.Fragment key={category.id}>
        <div>
          <a href="" onClick={e => this.handleClick(e, category)}>
            {category.name}
          </a>
        </div>
        {childCategories.map(child => {
          return this.treeCategories(child);
        })}
      </React.Fragment>
    );
  }

  render() {
    const {
      products,
      categories,
      parent,
      selectedCategory,
      editCategory,
      editProduct,
      selectedProduct
    } = this.state;
    return (
      <React.Fragment>
        {selectedCategory === null ? (
          <div className="categories">
            {categories && parent && this.treeCategories(parent)}
          </div>
        ) : editCategory ? (
          <CategoryForm
            backToProducts={() => this.backToProducts()}
            backToCategories={() => this.backToCategories()}
            category={selectedCategory}
            categories={categories}
            parent={parent}
          />
        ) : editProduct && selectedProduct ? (
          <ProductForm
            product={selectedProduct}
            backToProducts={() => this.backToProducts()}
            categories={categories}
            category={categories.find(
              c => c.id === selectedProduct.category_id
            )}
          />
        ) : (
          <div className="products">{products && this.renderProducts()}</div>
        )}
      </React.Fragment>
    );
  }

  fetchProducts(category) {
    fetch(`/api/v1/products?id=${category.id}`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.setState({ products: data });
      });
  }

  backToCategories() {
    this.setState({ selectedCategory: null });
    this.fetchCatgories();
  }

  backToProducts() {
    this.setState({
      editCategory: false,
      addingCategory: false,
      addingProduct: false,
      editProduct: false
    });
    this.fetchProducts(this.state.selectedCategory);
  }

  handleManageCategory() {
    this.setState({ editCategory: true });
  }

  addCategory() {
    this.setState({ addingCategory: true });
  }

  addProduct() {
    this.setState({ addingProduct: true });
  }

  handleEditProduct(selectedProduct) {
    this.setState({ editProduct: true, selectedProduct });
  }

  resetFilters(){
    this.setState({filterValue: '', filterType: this.state.filters[0]})
    this.fetchProducts(this.state.selectedCategory)
  }

  renderProducts() {
    const {
      filters,
      filterValue,
      filterType,
      products,
      selectedCategory,
      categories,
      parent,
      addingCategory,
      addingProduct
    } = this.state;
    const category = {
      name: "",
      properties: parent.properties,
      category_id: selectedCategory.id,
      inherited_categories: [parent.id.toString()]
    };
    const product = {
      name: "",
      properties: { price: 0.0 },
      category_id: selectedCategory.id
    };
    return (
      <React.Fragment>
        <div className="row mt-4">
          <div className={`col-md-${addingCategory || addingProduct ? 12 : 8}`}>
            <h3 className="text-center">{selectedCategory.name}</h3>
            {addingCategory ? (
              <CategoryForm
                backToProducts={() => this.backToProducts()}
                backToCategories={() => this.backToCategories()}
                category={category}
                categories={categories}
                parent={selectedCategory}
              />
            ) : addingProduct ? (
              <ProductForm
                product={product}
                backToProducts={() => this.backToProducts()}
                categories={categories}
                category={selectedCategory}
              />
            ) : (
              <div className="products-card card d-block">
                {products.map(p => {
                  return (
                    <div className="card-body">
                      <div className="card-title">Name: {p.name}</div>
                      <div className="card-subtitle">Properties: </div>
                      {Object.keys(p.properties).map(prop => {
                        return (
                          <p className="card-text ml-2" key={prop}>
                            {prop}: {p.properties[prop]}
                          </p>
                        );
                      })}
                      <button
                        onClick={() => this.handleEditProduct(p)}
                        className="btn btn-info"
                      >
                        Edit Product
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {addingCategory || addingProduct ? (
            <React.Fragment></React.Fragment>
          ) : (
            <div className="col-md-4">
              <h3 className="text-center">Actions</h3>
              <div className="form-group">
                <label>Filter By</label>
                <select value={filterType} name='filterType' onChange={(e) => this.handleChangeFilter(e)} className="form-control">
                  {filters.map(f => {
                    return (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Filter value</label>
                <input onChange={(e) => this.handleChangeFilter(e)} value={filterValue} name='filterValue' type="text" className="form-control" />
              </div>
              <button onClick={() => this.handleFilterSubmit()} className="btn btn-success">Submit</button>
              <button onClick={() => this.resetFilters()} className="btn btn-success float-right mr-4">Reset Filters</button>
              <br />
              <button
                onClick={() => this.handleManageCategory()}
                className="btn btn-primary mt-3"
              >
                Edit Category
              </button>
              <br />
              <button
                onClick={() => this.backToCategories()}
                className="btn btn-primary mt-3"
              >
                Back To Categories
              </button>
              <br />
              <button
                onClick={() => this.addProduct()}
                className="btn btn-primary mt-3"
              >
                Add Product
              </button>
              <br />
              <button
                onClick={() => this.addCategory()}
                className="btn btn-primary mt-3"
              >
                Add Category
              </button>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}
