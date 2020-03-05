class ProductForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      product: this.props.product
    };
  }

  componentDidMount() {
    const { category } = this.props;
    const { product } = this.state;
    const properties = category.properties;
    if (!product.id){
      for (const key in properties) {
        product.properties[key] = this.getDefaultValue(properties[key]);
      }
    }
    this.setState({ product });
  }

  getDefaultValue(type) {
    switch (type.toLowerCase()) {
      case "string" || "text":
        return "";
      case "integer":
        return "0";
      case "decimal":
        return "0.00";
      default:
        return "";
    }
  }

  handleChangeName(e) {
    const product = this.state.product;
    product.name = e.target.value;
    this.setState({ product });
  }

  handleChange(e) {
    const { product } = this.state
    product.properties[e.target.name] = e.target.value
    this.setState({ product });
  }


  handleDeleteProduct() {
    const product = this.props.product;
    fetch(`/api/v1/products/${this.props.product.id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.status === "OK") {
          this.props.backToProducts();
        }
      });
  }

  handleSubmit() {
    const product = this.state.product
    let url = "";
    let method = "";
    if (product.id) {
      url = `/api/v1/products/${product.id}`;
      method = "PUT";
    } else {
      url = `/api/v1/products`;
      method = "POST";
    }
    fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ product })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.setState({
          product: data
        });
      });
  }

  render() {
    const { product } = this.state;
    const { properties } = product
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-6 offset-2">
            <h3 className="text-center">Add Product</h3>
            <div className="form-group">
              <label>NAME</label>
              <input
                type="text"
                name="name"
                onChange={(e) => this.handleChangeName(e)}
                value={product.name}
                className="form-control"
              />
            </div>
            {properties &&
              Object.keys(properties).map(p => {
                return (
                  <div className="form-group">
                    <label>{p.toUpperCase()}</label>
                    <input
                      type="text"
                      name={p}
                      onChange={(e) => this.handleChange(e)}
                      value={properties[p]}
                      className="form-control"
                    />
                  </div>
                );
              })}
          </div>
          <div className="col-md-4">
            <h3 className="text-center">Actions</h3>
            <div className="mt-3">
              <button
                onClick={() => this.handleSubmit()}
                className="btn btn-success"
              >
                Save
              </button>
              <br />
              {product.id && (
                <React.Fragment>
                  <button
                    onClick={() => this.handleDeleteProduct()}
                    className="btn btn-danger mt-2"
                  >
                    Delete Product
                  </button>
                  <br />
                </React.Fragment>
              )}

              <button
                onClick={() => this.props.backToProducts()}
                className="btn btn-info mt-2"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
